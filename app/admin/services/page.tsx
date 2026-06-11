import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

type SupabaseClient = ReturnType<typeof createAdminClient>;

/* Strip unknown columns and retry until the query succeeds (max 6 passes) */
async function safeInsert(supabase: SupabaseClient, payload: Record<string, unknown>) {
  let p = { ...payload };
  for (let i = 0; i < 6; i++) {
    const { data, error } = await supabase.from('visa_services').insert(p).select().single();
    if (!error) return { data, error: null };
    const col = extractMissingCol(error.message);
    if (!col) return { data: null, error };
    console.warn(`[services POST] column "${col}" missing — skipping`);
    delete p[col];
  }
  return { data: null, error: new Error('Too many missing columns') };
}

async function safeUpdate(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  let p = { ...payload };
  for (let i = 0; i < 6; i++) {
    const { data, error } = await supabase.from('visa_services').update(p).eq('id', id).select().single();
    if (!error) return { data, error: null };
    const col = extractMissingCol(error.message);
    if (!col) return { data: null, error };
    console.warn(`[services PATCH] column "${col}" missing — skipping`);
    delete p[col];
  }
  return { data: null, error: new Error('Too many missing columns') };
}

function extractMissingCol(msg: string): string | null {
  const m = msg?.match(/column ['"]?(\w+)['"]? of ['"]?\w+['"]? in the schema cache/i)
    ?? msg?.match(/Could not find the ['"]?(\w+)['"]? column/i);
  return m?.[1] ?? null;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('visa_services')
      .select('*')
      .order('display_order');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ services: data ?? [] });
  } catch (err) {
    console.error('[admin/services GET]', err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await safeInsert(supabase, {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      tagline: body.tagline || null,
      description: body.description || null,
      price_usd: parseFloat(body.price_usd) || 0,
      duration: body.duration || null,
      processing_time: body.processing_time || null,
      features: body.features || [],
      requirements: body.requirements || [],
      accent_color: body.accent_color || '#0A385A',
      image_url: body.image_url || null,
      active: body.active ?? true,
      display_order: body.display_order ?? 99,
      booking_form_config: body.booking_form_config ?? null,
    });

    if (error) return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    return NextResponse.json({ service: data });
  } catch (err) {
    console.error('[admin/services POST]', err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = createAdminClient();
    const update: Record<string, unknown> = {};

    if ('name' in fields) update.name = fields.name;
    if ('tagline' in fields) update.tagline = fields.tagline;
    if ('description' in fields) update.description = fields.description;
    if ('price_usd' in fields) update.price_usd = parseFloat(fields.price_usd as string) || 0;
    if ('duration' in fields) update.duration = fields.duration;
    if ('processing_time' in fields) update.processing_time = fields.processing_time;
    if ('features' in fields) update.features = fields.features;
    if ('requirements' in fields) update.requirements = fields.requirements;
    if ('accent_color' in fields) update.accent_color = fields.accent_color;
    if ('image_url' in fields) update.image_url = fields.image_url;
    if ('active' in fields) update.active = Boolean(fields.active);
    if ('display_order' in fields) update.display_order = parseInt(fields.display_order as string);
    if ('booking_form_config' in fields) update.booking_form_config = fields.booking_form_config ?? null;

    const { data, error } = await safeUpdate(supabase, id, update);

    if (error) return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    return NextResponse.json({ service: data });
  } catch (err) {
    console.error('[admin/services PATCH]', err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = createAdminClient();

    // Detach this service from any bookings that reference it before deleting
    await supabase
      .from('visa_applications')
      .update({ service_id: null })
      .eq('service_id', id);

    const { error } = await supabase.from('visa_services').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/services DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
