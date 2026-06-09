import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe-server';
import { createTransporter } from '@/lib/mailer';
import { getSettingOrEnv } from '@/lib/settings';
import { createAdminClient } from '@/lib/supabase/admin';

interface BookingPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  visaType: string;
  travelDate: string;
  message?: string;
  paymentIntentId: string;
  amountDisplay: string;
}

/* ──────────────────────────────────────────────
   Customer confirmation email
   ────────────────────────────────────────────── */
function customerEmailHtml(d: BookingPayload, ref: string): string {
  const dateLabel = d.travelDate
    ? new Date(d.travelDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  const row = (label: string, value: string, accent = false) => `
    <tr>
      <td style="padding:12px 24px;border-bottom:1px solid #eef2f7;font-size:13px;color:#9ca3af;width:40%;">${label}</td>
      <td style="padding:12px 24px;border-bottom:1px solid #eef2f7;font-size:13px;font-weight:600;color:${accent ? '#da6d3f' : '#0A385A'};">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Application Received – Saudi Visa Service</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="padding:48px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(10,56,90,0.12);">

  <!-- ▸ Header -->
  <tr>
    <td bgcolor="#0A385A" style="background:linear-gradient(135deg,#3CA5D4 0%,#0E3254 100%);padding:48px 40px 40px;text-align:center;">
      <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:12px;">Professional Visa Assistance</div>
      <div style="font-size:30px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1;">Saudi Visa Service</div>
      <div style="width:40px;height:3px;background:#da6d3f;margin:16px auto 0;border-radius:2px;"></div>
    </td>
  </tr>

  <!-- ▸ Success badge -->
  <tr>
    <td style="padding:40px 40px 0;text-align:center;">
      <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#3CA5D4,#0E3254);border-radius:50%;text-align:center;line-height:72px;font-size:36px;color:#ffffff;box-shadow:0 8px 24px rgba(10,56,90,0.25);">&#10003;</div>
      <h1 style="font-size:26px;font-weight:800;color:#0A385A;margin:20px 0 8px;letter-spacing:-0.5px;">Application Received!</h1>
      <p style="font-size:14px;color:#6b7280;margin:0;line-height:1.5;">Your payment has been processed and your application is confirmed.</p>
    </td>
  </tr>

  <!-- ▸ Greeting -->
  <tr>
    <td style="padding:32px 40px 0;">
      <p style="font-size:15px;color:#0A385A;margin:0 0 12px;font-weight:600;">Dear ${d.fullName},</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.8;margin:0;">
        Thank you for choosing <strong style="color:#0A385A;">Saudi Visa Service</strong>. We have received your
        <strong style="color:#da6d3f;"> ${d.visaType}</strong> application along with your service fee.
        Our dedicated team of visa consultants will review your details and get in touch with you <strong style="color:#0A385A;">within 24 hours</strong>.
      </p>
    </td>
  </tr>

  <!-- ▸ Summary card -->
  <tr>
    <td style="padding:28px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #eef2f7;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
        <tr>
          <td colspan="2" style="background:#f8fbff;padding:16px 24px;border-bottom:2px solid #da6d3f;">
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#da6d3f;font-weight:800;">Application Summary</span>
          </td>
        </tr>
        ${row('Visa Type', d.visaType)}
        ${row('Travel Date', dateLabel)}
        ${row('Country', d.country)}
        ${row('Service Fee Paid', d.amountDisplay, true)}
      </table>
    </td>
  </tr>

  <!-- ▸ Reference number -->
  <tr>
    <td style="padding:28px 40px 0;text-align:center;">
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;font-weight:700;">Application Reference Number</p>
      <div style="display:inline-block;background:#0A385A;color:#ffffff;font-family:Courier New,monospace;font-size:18px;font-weight:700;padding:14px 28px;border-radius:10px;letter-spacing:2px;box-shadow:0 4px 16px rgba(10,56,90,0.3);">${ref}</div>
      <p style="font-size:12px;color:#9ca3af;margin:12px 0 0;">Please keep this reference number for your records.</p>
    </td>
  </tr>

  <!-- ▸ Next steps callout -->
  <tr>
    <td style="padding:28px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbff;border-left:4px solid #da6d3f;border-radius:0 10px 10px 0;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="font-size:11px;font-weight:800;color:#da6d3f;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">&#128338; What Happens Next?</div>
            <p style="font-size:13px;color:#6b7280;line-height:1.7;margin:0;">
              Our visa consultant will contact you at <strong style="color:#0A385A;">${d.email}</strong> or
              <strong style="color:#0A385A;"> ${d.phone}</strong> within 24 hours to guide you through
              the required documents and complete your application.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ▸ Divider -->
  <tr><td style="padding:36px 40px 0;"><div style="height:1px;background:#eef2f7;"></div></td></tr>

  <!-- ▸ Footer -->
  <tr>
    <td style="padding:28px 40px 36px;text-align:center;">
      <div style="font-size:18px;font-weight:800;color:#0A385A;margin-bottom:10px;letter-spacing:-0.3px;">Saudi Visa Service</div>
      <div style="font-size:12px;color:#9ca3af;line-height:2;">
        info@saudivisaservice.com &nbsp;&#183;&nbsp; +44 20 1234 5678<br/>
        Visa Operations Center &nbsp;&#183;&nbsp; Jeddah, Saudi Arabia
      </div>
      <div style="margin-top:16px;font-size:11px;color:#d1d5db;">&#169; 2026 Saudi Visa Service. All rights reserved.</div>
      <div style="margin-top:8px;font-size:11px;color:#d1d5db;">This email was sent because you submitted an application at saudivisaservice.com</div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ──────────────────────────────────────────────
   Admin notification email
   ────────────────────────────────────────────── */
function adminEmailHtml(d: BookingPayload, ref: string): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:11px 20px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;width:38%;vertical-align:top;">${label}</td>
      <td style="padding:11px 20px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${value || '—'}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(10,56,90,0.12);">

  <!-- Header -->
  <tr>
    <td bgcolor="#0A385A" style="background:#0A385A;padding:32px 40px;text-align:left;">
      <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Saudi Visa Service</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">Admin Notification</div>
    </td>
    <td bgcolor="#0A385A" style="background:#0A385A;padding:32px 40px;text-align:right;vertical-align:middle;">
      <div style="display:inline-block;background:#da6d3f;color:#ffffff;font-size:11px;font-weight:800;padding:6px 14px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.12em;">New Booking</div>
    </td>
  </tr>

  <!-- Amount banner -->
  <tr>
    <td colspan="2" style="background:linear-gradient(135deg,rgba(218,109,63,0.08),rgba(60,165,212,0.06));padding:24px 40px;border-bottom:3px solid #da6d3f;">
      <div style="font-size:13px;color:#9ca3af;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Payment Received</div>
      <div style="font-size:36px;font-weight:800;color:#da6d3f;line-height:1;">${d.amountDisplay}</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:6px;font-family:monospace;">PI: ${d.paymentIntentId}</div>
    </td>
  </tr>

  <!-- Details -->
  <tr>
    <td colspan="2" style="padding:0 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr><td colspan="2" style="padding:10px 20px 6px;"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#da6d3f;font-weight:800;">Applicant Details</span></td></tr>
        ${row('Reference', ref)}
        ${row('Full Name', d.fullName)}
        ${row('Email', d.email)}
        ${row('Phone', d.phone)}
        ${row('Country', d.country)}
        ${row('Visa Type', d.visaType)}
        ${row('Travel Date', d.travelDate)}
        ${row('Message', d.message || '')}
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td colspan="2" style="padding:28px 40px 32px;text-align:center;border-top:1px solid #eef2f7;">
      <div style="font-size:11px;color:#d1d5db;">&#169; 2026 Saudi Visa Service &nbsp;&#183;&nbsp; Admin Panel Notification</div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ──────────────────────────────────────────────
   Route handler
   ────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const payload: BookingPayload = await request.json();
    const { fullName, email, phone, country, visaType, travelDate, message, paymentIntentId, amountDisplay } = payload;

    if (!fullName || !email || !phone || !country || !visaType || !paymentIntentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify payment with Stripe (key from DB, falls back to env)
    const stripe = await getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    // Map display visa type to DB enum value
    const visaTypeMap: Record<string, string> = {
      'Umrah Visa': 'umrah',
      'Tourist Visa': 'tourist',
      'Hajj Visa': 'hajj',
      'Business Visa': 'business',
      'Family Visa': 'family',
    };
    const visaTypeEnum = visaTypeMap[visaType] ?? 'tourist';

    // 2. Save to Supabase (service role bypasses RLS)
    const supabase = createAdminClient();
    const { data: appRecord, error: dbError } = await supabase
      .from('visa_applications')
      .insert({
        full_name: fullName,
        email,
        phone,
        country,
        visa_type: visaTypeEnum,
        travel_date: travelDate || null,
        message: message || null,
        status: 'pending',
        consultant_notes: `Stripe: ${paymentIntentId} | ${amountDisplay}`,
      })
      .select('reference_number')
      .single();

    const referenceNumber: string =
      dbError || !appRecord ? `SVS-${Date.now()}` : appRecord.reference_number;

    if (dbError) {
      console.error('[complete-booking] DB error:', dbError.message);
    }

    // 3. Send emails (non-fatal — don't block the response if mail fails)
    try {
      const fromName = (await getSettingOrEnv('smtp_from_name', 'MAIL_FROM_NAME')) || 'Saudi Visa Service';
      const fromUser = await getSettingOrEnv('smtp_username', 'MAIL_USERNAME');
      const adminEmail = (await getSettingOrEnv('admin_email', 'ADMIN_EMAIL')) || fromUser;
      const fromLine = `"${fromName}" <${fromUser}>`;
      const mailTransporter = await createTransporter();

      await Promise.all([
        mailTransporter.sendMail({
          from: fromLine,
          to: email,
          subject: `✓ Application Confirmed – ${visaType} | Saudi Visa Service`,
          html: customerEmailHtml(payload, referenceNumber),
        }),
        mailTransporter.sendMail({
          from: fromLine,
          to: adminEmail,
          subject: `🆕 New Booking: ${fullName} – ${visaType} (${amountDisplay})`,
          html: adminEmailHtml(payload, referenceNumber),
        }),
      ]);
    } catch (mailErr) {
      console.error('[complete-booking] Mail error:', mailErr);
    }

    return NextResponse.json({ success: true, referenceNumber });
  } catch (err) {
    console.error('[complete-booking]', err);
    return NextResponse.json({ error: 'Booking completion failed' }, { status: 500 });
  }
}
