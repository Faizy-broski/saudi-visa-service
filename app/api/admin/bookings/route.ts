import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const id = new URL(request.url).searchParams.get('id');

  if (id) {
    const { data, error } = await supabase.from('visa_applications').select('*').eq('id', id).single();
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Generate signed URLs for private documents (1 hour expiry)
    const signed: Record<string, string | null> = { passport_url: null, id_card_url: null, photo_url: null };
    for (const key of ['passport_url', 'id_card_url', 'photo_url'] as const) {
      const path = data[key];
      if (path && !path.startsWith('http')) {
        const { data: s } = await supabase.storage.from('booking-documents').createSignedUrl(path, 3600);
        signed[key] = s?.signedUrl ?? null;
      } else if (path) {
        signed[key] = path;
      }
    }

    return NextResponse.json({ booking: { ...data, ...signed } });
  }

  const { data, error } = await supabase
    .from('visa_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  return NextResponse.json({ bookings: data });
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase.from('visa_applications').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/bookings DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
