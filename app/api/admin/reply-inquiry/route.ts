import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '@/lib/mailer';
import { getSettingOrEnv } from '@/lib/settings';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const { inquiryId, message, toEmail, toName, serviceInterest } = await request.json();

  if (!inquiryId || !message?.trim() || !toEmail || !toName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const fromName = (await getSettingOrEnv('smtp_from_name', 'MAIL_FROM_NAME')) || 'Saudi Visa Service';
  const fromUser = await getSettingOrEnv('smtp_username', 'MAIL_USERNAME');
  const fromLine = `"${fromName}" <${fromUser}>`;
  const subject = serviceInterest
    ? `Re: Your Inquiry About ${serviceInterest} – Saudi Visa Service`
    : `Re: Your Inquiry – Saudi Visa Service`;

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
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">Reply to Your Inquiry</div>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 40px;">
      <p style="font-size:15px;color:#0A385A;font-weight:600;margin:0 0 16px;">Dear ${toName},</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">Thank you for reaching out to Saudi Visa Service. Here is our response to your inquiry:</p>
      <div style="background:#f8fbff;border-left:4px solid #3CA5D4;padding:20px 24px;border-radius:0 12px 12px 0;margin-bottom:24px;">
        <p style="font-size:14px;color:#374151;line-height:1.8;margin:0;">${message.replace(/\n/g, '<br/>')}</p>
      </div>
      <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">If you have further questions, feel free to contact us again. We're happy to help.</p>
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
    await transporter.sendMail({ from: fromLine, to: toEmail, subject, html });

    // Mark inquiry as replied
    const supabase = createAdminClient();
    await supabase
      .from('contact_messages')
      .update({ replied: true, reply_sent_at: new Date().toISOString() })
      .eq('id', inquiryId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reply-inquiry]', err);
    return NextResponse.json({ error: 'Failed to send reply email' }, { status: 500 });
  }
}
