import { createAdminClient } from './supabase/admin';

export async function getSetting(key: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .single();
    return data?.value ?? null;
  } catch {
    return null;
  }
}

export async function getSettingOrEnv(key: string, envVar: string): Promise<string> {
  const dbVal = await getSetting(key);
  return (dbVal && dbVal.trim()) ? dbVal.trim() : (process.env[envVar] ?? '');
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('admin_settings').select('key, value');
    if (!data) return {};
    return Object.fromEntries(data.map((r) => [r.key, r.value ?? '']));
  } catch {
    return {};
  }
}

export async function getActiveStripeKeys(): Promise<{
  secretKey: string;
  publishableKey: string;
  mode: 'test' | 'live';
}> {
  const mode = ((await getSetting('stripe_mode')) || 'test') as 'test' | 'live';

  if (mode === 'live') {
    const secretKey = (await getSetting('stripe_live_secret_key')) || '';
    const publishableKey = (await getSetting('stripe_live_publishable_key')) || '';
    return { secretKey, publishableKey, mode };
  }

  // test mode — fall back to legacy single-key fields so existing configs keep working
  const secretKey =
    (await getSetting('stripe_test_secret_key')) ||
    (await getSettingOrEnv('stripe_secret_key', 'STRIPE_SECRET_KEY'));
  const publishableKey =
    (await getSetting('stripe_test_publishable_key')) ||
    (await getSettingOrEnv('stripe_publishable_key', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'));

  return { secretKey, publishableKey, mode };
}
