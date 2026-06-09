import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact', head: true });
    return NextResponse.json({ hasAdmin: (count ?? 0) > 0 });
  } catch {
    return NextResponse.json({ hasAdmin: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Prevent creating a second admin via this endpoint
    const { count } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact', head: true });

    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: 'Admin account already exists' }, { status: 403 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { error } = await supabase.from('admin_users').insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/setup]', err);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
