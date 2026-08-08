import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')?.trim().toUpperCase();
  if (!ref) return NextResponse.json({ error: 'Reference number required' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('visa_applications')
    .select(
      'reference_number, status, full_name, first_name, last_name, email, visa_type, travel_date, num_travelers, departure_city, amount_usd, consultant_notes, created_at, updated_at'
    )
    .eq('reference_number', ref)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'No booking found with that reference number.' }, { status: 404 });
  }

  return NextResponse.json({ booking: data });
}
