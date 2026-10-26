import { NextRequest, NextResponse, after } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveStripeKeys } from '@/lib/settings';
import { ORPHAN_AFTER_MS, alertOrphanPayments, findBookingForPayment, isOwnPayment } from '@/lib/stripe-payments';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  const { secretKey, webhookSecret } = await getActiveStripeKeys();
  if (!secretKey || !webhookSecret) {
    console.error('[stripe/webhook] Stripe secret key or webhook secret not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(secretKey, {} as any);
  const signature = request.headers.get('stripe-signature') ?? '';
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        // Payments from the other sites on this Stripe account: acknowledge and ignore.
        if (!isOwnPayment(pi)) break;
        const succeeded = event.type === 'payment_intent.succeeded';
        const bookingRef = succeeded ? await findBookingForPayment(pi.id) : null;

        const { error } = await supabase.from('stripe_payments').upsert(
          {
            payment_intent_id: pi.id,
            status: succeeded ? 'succeeded' : 'failed',
            amount_pence: pi.amount,
            currency: pi.currency,
            customer_email: pi.metadata?.customerEmail || pi.receipt_email || null,
            customer_name: pi.metadata?.customerName || null,
            service_name: pi.metadata?.serviceName || null,
            num_travelers: parseInt(pi.metadata?.numTravelers ?? '') || null,
            booking_reference: bookingRef,
            created_at: new Date(pi.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          // A late-arriving failure (from an earlier card attempt) must not overwrite a success.
          { onConflict: 'payment_intent_id', ignoreDuplicates: !succeeded },
        );
        if (error) throw error;

        // The booking form normally saves the booking a few seconds after payment.
        // Check back once the grace period has passed and alert the admin if it never arrived.
        if (succeeded && !bookingRef) {
          after(async () => {
            await sleep(ORPHAN_AFTER_MS + 30_000);
            await alertOrphanPayments();
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (piId) {
          await supabase
            .from('stripe_payments')
            .update({ status: charge.refunded ? 'refunded' : 'partially_refunded', updated_at: new Date().toISOString() })
            .eq('payment_intent_id', piId);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[stripe/webhook] Failed to handle ${event.type}`, err);
    // Non-2xx makes Stripe retry the event later.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  // Also pick up any older orphans missed while the server was restarting.
  after(() => alertOrphanPayments());

  return NextResponse.json({ received: true });
}
