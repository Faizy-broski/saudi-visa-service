import type Stripe from 'stripe';
import { createAdminClient } from './supabase/admin';
import { createTransporter } from './mailer';
import { getSettingOrEnv } from './settings';

// A payment with no booking after this long is treated as orphaned.
export const ORPHAN_AFTER_MS = 10 * 60 * 1000;

/**
 * Checks that a PaymentIntent really paid for the booking being submitted.
 * create-payment-intent sets the amount and metadata server-side, so matching
 * the metadata means the amount was computed for this service and traveller count.
 */
export function paymentMismatch(
  pi: Stripe.PaymentIntent,
  expected: { serviceId: string; numTravelers: number },
): string | null {
  if (pi.status !== 'succeeded') return 'Payment not confirmed';
  if (pi.currency !== 'gbp') return 'Unexpected payment currency';
  if (pi.metadata?.serviceId !== expected.serviceId) return 'Payment does not match the selected service';
  if (pi.metadata?.numTravelers !== String(expected.numTravelers)) return 'Payment does not match the number of travellers';
  return null;
}

/** Reference number of the booking already saved for this payment, if any. */
export async function findBookingForPayment(paymentIntentId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('visa_applications')
    .select('reference_number')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
  return data?.reference_number ?? null;
}

/** Marks the webhook ledger row (if the webhook has already arrived) as having a booking. */
export async function linkPaymentToBooking(paymentIntentId: string, referenceNumber: string) {
  const supabase = createAdminClient();
  await supabase
    .from('stripe_payments')
    .update({ booking_reference: referenceNumber, updated_at: new Date().toISOString() })
    .eq('payment_intent_id', paymentIntentId);
}

/**
 * Emails the admin about successful payments that still have no booking
 * after ORPHAN_AFTER_MS. Each payment is alerted at most once.
 */
export async function alertOrphanPayments() {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - ORPHAN_AFTER_MS).toISOString();
  const { data: rows } = await supabase
    .from('stripe_payments')
    .select('*')
    .eq('status', 'succeeded')
    .is('booking_reference', null)
    .is('orphan_alerted_at', null)
    .lt('created_at', cutoff);
  if (!rows?.length) return;

  const orphans = [];
  for (const row of rows) {
    const ref = await findBookingForPayment(row.payment_intent_id);
    if (ref) await linkPaymentToBooking(row.payment_intent_id, ref);
    else orphans.push(row);
  }
  if (!orphans.length) return;

  const fromName = (await getSettingOrEnv('smtp_from_name', 'MAIL_FROM_NAME')) || 'Saudi Visa Service';
  const smtpUser = await getSettingOrEnv('smtp_username', 'MAIL_USERNAME');
  const fromAddress = (await getSettingOrEnv('smtp_from_address', 'MAIL_FROM_ADDRESS')) || smtpUser;
  const adminEmail = (await getSettingOrEnv('admin_email', 'ADMIN_EMAIL')) || smtpUser;

  const rowsHtml = orphans.map((o) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;font-family:monospace;font-size:12px;">${o.payment_intent_id}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;font-size:13px;">${o.customer_name ?? '—'}<br/><span style="color:#6b7280;">${o.customer_email ?? '—'}</span></td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;font-size:13px;">${o.service_name ?? '—'} × ${o.num_travelers ?? 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;font-size:13px;font-weight:700;">£${(o.amount_pence / 100).toFixed(2)}</td>
    </tr>`).join('');

  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: adminEmail,
      subject: `⚠ ${orphans.length} payment(s) received with no booking saved`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#0A385A;">
        <h2 style="margin:0 0 8px;">Payment received, booking missing</h2>
        <p style="font-size:14px;color:#374151;">Stripe charged the customer(s) below, but no booking was saved — usually the customer closed the page before the form finished submitting. Contact them to collect their details and documents, or refund the payment in Stripe.</p>
        <table cellpadding="0" cellspacing="0" style="border:1px solid #eef2f7;border-collapse:collapse;">
          <tr style="background:#f8fbff;font-size:11px;text-transform:uppercase;color:#6b7280;">
            <th align="left" style="padding:8px 12px;">Payment</th><th align="left" style="padding:8px 12px;">Customer</th>
            <th align="left" style="padding:8px 12px;">Service</th><th align="left" style="padding:8px 12px;">Amount</th>
          </tr>${rowsHtml}
        </table>
      </div>`,
    });
  } catch (err) {
    // Leave orphan_alerted_at empty so the next sweep retries the email.
    console.error('[orphan-payments] alert email failed', err);
    return;
  }

  await supabase
    .from('stripe_payments')
    .update({ orphan_alerted_at: new Date().toISOString() })
    .in('payment_intent_id', orphans.map((o) => o.payment_intent_id));
}
