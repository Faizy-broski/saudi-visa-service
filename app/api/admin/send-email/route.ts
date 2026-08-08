import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '@/lib/mailer';
import { getSettingOrEnv } from '@/lib/settings';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const { applicationId, message, toEmail, toName } = await request.json();

  if (!applicationId || !message || !toEmail || !toName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: app } = await supabase
    .from('visa_applications')
    .select('reference_number, visa_type, status')
    .eq('id', applicationId)
    .single();

  const fromName = (await getSettingOrEnv('smtp_from_name', 'MAIL_FROM_NAME')) || 'Saudi Visa Service';
  const fromUser = await getSettingOrEnv('smtp_username', 'MAIL_USERNAME');
  const fromLine = `"${fromName}" <${fromUser}>`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(10,56,90,0.12);">
  <tr>
    <td style="background:linear-gradient(135deg,#3CA5D4,#0E3254);padding:36px 40px;text-align:center;">
      <div style="font-size:22px;font-weight:800;color:#ffffff;">Saudi Visa Service</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">Application Update</div>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 40px;">
      <p style="font-size:15px;color:#0A385A;font-weight:600;margin:0 0 12px;">Dear ${toName},</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">${message.replace(/\n/g, '<br/>')}</p>
      ${app ? `<div style="background:#f8fbff;border-left:4px solid #da6d3f;padding:16px 20px;border-radius:0 10px 10px 0;margin-top:20px;">
        <div style="font-size:11px;font-weight:800;color:#da6d3f;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px;">Application Reference</div>
        <div style="font-family:Courier New,monospace;font-weight:700;color:#0A385A;font-size:16px;">${app.reference_number}</div>
      </div>` : ''}
    </td>
  </tr>
  <tr>
    <td style="padding:24px 40px;border-top:1px solid #eef2f7;text-align:center;">
      <div style="font-size:11px;color:#d1d5db;">© 2026 Saudi Visa Service. All rights reserved.</div>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: fromLine,
      to: toEmail,
      subject: `Update on Your Saudi Visa Application – Saudi Visa Service`,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[send-email]', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
