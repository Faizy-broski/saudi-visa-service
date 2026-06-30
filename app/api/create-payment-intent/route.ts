import { NextRequest, NextResponse } from 'next/server';
import { getActiveStripeKeys } from '@/lib/settings';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const FALLBACK_SERVICES: Record<string, { name: string; price_usd: number }> = {
  umrah:   { name: 'Umrah Visa',   price_usd: 199 },
  tourist: { name: 'Tourist Visa', price_usd: 149 },
  // hajj:    { name: 'Hajj Visa',    price_usd: 249 },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const { serviceId, customerName, customerEmail } = await request.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    let service: { name: string; price_usd: number } | null = null;

    // 1. Try DB lookup by UUID
    if (UUID_RE.test(serviceId)) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from('visa_services')
        .select('name, price_usd')
        .eq('id', serviceId)
        .single();
      if (data) service = data;
    }

    // 2. Try DB lookup by slug (in case ID is a slug string)
    if (!service) {
      try {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from('visa_services')
          .select('name, price_usd')
          .eq('slug', serviceId.toLowerCase())
          .single();
        if (data) service = data;
      } catch { /* ignore */ }
    }

    // 3. Use hardcoded fallback
    if (!service) {
      service = FALLBACK_SERVICES[serviceId.toLowerCase()] ?? null;
    }

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const { secretKey, publishableKey, mode } = await getActiveStripeKeys();
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(secretKey, {} as any);

    const amountCents = Math.round(service.price_usd * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'gbp',
      metadata: {
        serviceId,
        serviceName: service.name,
        customerEmail: customerEmail ?? '',
        customerName: customerName ?? '',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountCents,
      display: `£${service.price_usd.toFixed(2)}`,
      label: service.name,
      publishableKey,
      stripeMode: mode,
    });
  } catch (err) {
    console.error('[create-payment-intent]', err);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
