'use server'

import { createClient } from '@/lib/supabase/server'
import { createTransporter } from '@/lib/mailer'
import { getSettingOrEnv } from '@/lib/settings'

export type ContactFormData = {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

export type SubmitContactResult =
  | { success: true }
  | { success: false; error: string }

async function notifyAdmin(data: ContactFormData) {
  const fromName = (await getSettingOrEnv('smtp_from_name', 'MAIL_FROM_NAME')) || 'Saudi Visa Service'
  const fromUser = await getSettingOrEnv('smtp_username', 'MAIL_USERNAME')
  const adminEmail = (await getSettingOrEnv('admin_email', 'ADMIN_EMAIL')) || fromUser
  if (!adminEmail || !fromUser) return

  const fromLine = `"${fromName}" <${fromUser}>`
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
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">New Contact Form Submission</div>
    </td>
  </tr>
  <tr>
    <td style="padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;width:32%;">Name</td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${data.name}</td></tr>
        <tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Email</td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${data.email}</td></tr>
        <tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Phone</td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${data.phone || '—'}</td></tr>
        <tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Subject</td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${data.subject || 'General Enquiry'}</td></tr>
      </table>
      <div style="margin-top:20px;background:#f8fbff;border-left:4px solid #3CA5D4;padding:20px 24px;border-radius:0 12px 12px 0;">
        <p style="font-size:14px;color:#374151;line-height:1.8;margin:0;">${data.message.replace(/\n/g, '<br/>')}</p>
      </div>
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
</html>`

  const transporter = await createTransporter()
  await transporter.sendMail({
    from: fromLine,
    to: adminEmail,
    replyTo: data.email,
    subject: `New Contact Form Enquiry from ${data.name}`,
    html,
  })
}

export async function submitContact(
  data: ContactFormData
): Promise<SubmitContactResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    })

    if (error) {
      return { success: false, error: 'Failed to send message. Please try again.' }
    }

    try {
      await notifyAdmin(data)
    } catch (mailErr) {
      console.error('[submitContact] admin notification failed', mailErr)
    }

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
