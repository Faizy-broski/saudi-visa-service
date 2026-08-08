import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, name, email, created_at')
    .limit(1)
    .single();
  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body;

  const supabase = createAdminClient();
  const { data: admin } = await supabase.from('admin_users').select('*').limit(1).single();
  if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

  const updates: Record<string, string> = {};
  if (name?.trim()) updates.name = name.trim();
  if (email?.trim()) updates.email = email.trim();

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    updates.password_hash = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const { error } = await supabase.from('admin_users').update(updates).eq('id', admin.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
