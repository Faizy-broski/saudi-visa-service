import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAllSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[admin/settings GET]', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const entries = Object.entries(body as Record<string, string>);
    if (entries.length === 0) return NextResponse.json({ success: true });

    const upserts = entries.map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('admin_settings')
      .upsert(upserts, { onConflict: 'key' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/settings PUT]', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
