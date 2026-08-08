import Stripe from 'stripe';
import { getActiveStripeKeys } from './settings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStripe(): Promise<Stripe> {
  const { secretKey } = await getActiveStripeKeys();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Stripe(secretKey!, {} as any);
}
