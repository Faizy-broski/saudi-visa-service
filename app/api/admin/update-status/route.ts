import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status, consultant_notes } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (consultant_notes !== undefined) updates.consultant_notes = consultant_notes;

  const supabase = createAdminClient();
  const { error } = await supabase.from('visa_applications').update(updates).eq('id', id);

  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  return NextResponse.json({ success: true });
}
