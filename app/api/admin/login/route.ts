import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, name')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !adminUser) {
      // Timing-safe: still run bcrypt compare even if user not found
      await bcrypt.compare(password, '$2b$12$placeholder.hash.to.prevent.timing.attack.only');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, adminUser.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = process.env.ADMIN_SECRET ?? 'svs-admin-secret-token-2026';
    const response = NextResponse.json({ success: true, name: adminUser.name });
    response.cookies.set('admin_token', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[admin/login]', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
