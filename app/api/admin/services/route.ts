import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const { data, error } = await supabase
      .from('visa_services')
      .insert({
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
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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

    const { data, error } = await supabase
      .from('visa_services')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { error } = await supabase.from('visa_services').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/services DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
