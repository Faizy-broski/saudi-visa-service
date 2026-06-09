import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettingOrEnv, getActiveStripeKeys } from '@/lib/settings';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const get = (k: string) => (formData.get(k) as string) ?? '';
    const getFile = (k: string) => formData.get(k) as File | null;

    const paymentIntentId = get('paymentIntentId');
    const serviceId = get('serviceId');
    const firstName = get('firstName');
    const lastName = get('lastName');
    const email = get('email');
    const phone = get('phone');
    const dateOfBirth = get('dateOfBirth') || null;
    const nationality = get('nationality');
    const passportNumber = get('passportNumber');
    const passportExpiry = get('passportExpiry') || null;
    const travelDate = get('travelDate') || null;
    const numTravelers = parseInt(get('numTravelers')) || 1;
    const departureCity = get('departureCity') || null;
    const specialRequirements = get('specialRequirements') || null;
    const amountUsd = parseFloat(get('amountUsd')) || 0;
    const serviceName = get('serviceName');

    if (!paymentIntentId || !email || !firstName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Stripe payment (key from DB mode setting)
    const { secretKey: stripeSecretKey } = await getActiveStripeKeys();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(stripeSecretKey, {} as any);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    // 2. Upload documents to Supabase Storage
    const supabase = createAdminClient();
    const refId = `SVS-${Date.now()}`;

    const uploadFile = async (file: File | null, name: string): Promise<string | null> => {
      if (!file || file.size === 0) return null;
      try {
        const ext = file.name.split('.').pop() ?? 'bin';
        const path = `${refId}/${name}.${ext}`;
        const ab = await file.arrayBuffer();

        // Ensure bucket exists
        await supabase.storage.createBucket('booking-documents', {
          public: false, fileSizeLimit: 10485760,
        }).catch(() => {});

        const { error } = await supabase.storage
          .from('booking-documents')
          .upload(path, Buffer.from(ab), { contentType: file.type, upsert: true });

        if (error) { console.error('[upload]', error.message); return null; }
        return path; // Store the path; use signed URL when viewing
      } catch (e) {
        console.error('[upload error]', e);
        return null;
      }
    };

    const passportPath = await uploadFile(getFile('passportFile'), 'passport');
    const idCardPath = await uploadFile(getFile('idCardFile'), 'id-card');
    const photoPath = await uploadFile(getFile('photoFile'), 'photo');

    // 3. Create booking record
    const { data: booking, error: dbErr } = await supabase
      .from('visa_applications')
      .insert({
        full_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        date_of_birth: dateOfBirth,
        nationality,
        passport_number: passportNumber,
        passport_expiry: passportExpiry,
        country: nationality,
        visa_type: 'tourist',
        service_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId) ? serviceId : null,
        travel_date: travelDate,
        num_travelers: numTravelers,
        departure_city: departureCity,
        message: specialRequirements,
        status: 'pending',
        passport_url: passportPath,
        id_card_url: idCardPath,
        photo_url: photoPath,
        amount_usd: amountUsd,
        stripe_payment_intent_id: paymentIntentId,
        consultant_notes: `Service: ${serviceName} | PI: ${paymentIntentId}`,
      })
      .select('reference_number')
      .single();

    const referenceNumber = dbErr || !booking ? refId : booking.reference_number;
    if (dbErr) console.error('[db]', dbErr.message);

    // 4. Send confirmation emails
    try {
      const smtpHost = await getSettingOrEnv('smtp_host', 'MAIL_HOST');
      const smtpPort = parseInt(await getSettingOrEnv('smtp_port', 'MAIL_PORT')) || 587;
      const smtpUser = await getSettingOrEnv('smtp_username', 'MAIL_USERNAME');
      const smtpPass = await getSettingOrEnv('smtp_password', 'MAIL_PASSWORD');
      const fromName = await getSettingOrEnv('smtp_from_name', 'MAIL_FROM_NAME');
      const adminEmail = await getSettingOrEnv('admin_email', 'ADMIN_EMAIL');

      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: smtpPort,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
      });

      const fromLine = `"${fromName || 'Saudi Visa Service'}" <${smtpUser}>`;
      const travelDateLabel = travelDate ? new Date(travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

      const customerHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="padding:48px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(10,56,90,0.12);">
  <tr><td style="background:linear-gradient(135deg,#3CA5D4,#0E3254);padding:48px 40px;text-align:center;">
    <div style="font-size:30px;font-weight:800;color:#ffffff;">Saudi Visa Service</div>
    <div style="width:40px;height:3px;background:#da6d3f;margin:16px auto 0;border-radius:2px;"></div>
  </td></tr>
  <tr><td style="padding:40px 40px 0;text-align:center;">
    <div style="width:72px;height:72px;background:linear-gradient(135deg,#3CA5D4,#0E3254);border-radius:50%;margin:0 auto;line-height:72px;font-size:36px;color:#fff;">&#10003;</div>
    <h1 style="font-size:24px;font-weight:800;color:#0A385A;margin:20px 0 8px;">Application Confirmed!</h1>
    <p style="font-size:14px;color:#6b7280;margin:0;">Your payment was successful and your application has been submitted.</p>
  </td></tr>
  <tr><td style="padding:28px 40px 0;">
    <p style="font-size:15px;color:#0A385A;font-weight:600;margin:0 0 10px;">Dear ${firstName},</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.8;margin:0;">Thank you for choosing <strong>Saudi Visa Service</strong> for your <strong style="color:#da6d3f;">${serviceName}</strong>. Our team will review your application within 24 hours.</p>
  </td></tr>
  <tr><td style="padding:24px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #eef2f7;">
      <tr><td colspan="2" style="background:#f8fbff;padding:14px 20px;border-bottom:2px solid #da6d3f;">
        <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#da6d3f;font-weight:800;">Application Details</span>
      </td></tr>
      <tr><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;color:#9ca3af;width:40%;">Service</td><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;font-weight:600;color:#0A385A;">${serviceName}</td></tr>
      <tr><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;color:#9ca3af;">Passport No.</td><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;font-weight:600;color:#0A385A;">${passportNumber}</td></tr>
      <tr><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;color:#9ca3af;">Nationality</td><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;font-weight:600;color:#0A385A;">${nationality}</td></tr>
      <tr><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;color:#9ca3af;">Travel Date</td><td style="padding:10px 20px;border-bottom:1px solid #eef2f7;font-size:13px;font-weight:600;color:#0A385A;">${travelDateLabel}</td></tr>
      <tr><td style="padding:10px 20px;font-size:13px;color:#9ca3af;">Amount Paid</td><td style="padding:10px 20px;font-size:13px;font-weight:700;color:#da6d3f;">$${amountUsd.toFixed(2)}</td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:24px 40px 0;text-align:center;">
    <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;font-weight:700;">Reference Number</p>
    <div style="display:inline-block;background:#0A385A;color:#fff;font-family:Courier New,monospace;font-size:18px;font-weight:700;padding:14px 28px;border-radius:10px;letter-spacing:2px;">${referenceNumber}</div>
  </td></tr>
  <tr><td style="padding:28px 40px 36px;text-align:center;border-top:1px solid #eef2f7;margin-top:28px;">
    <div style="font-size:12px;color:#9ca3af;line-height:2;">&#169; 2026 Saudi Visa Service. All rights reserved.</div>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

      const adminHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(10,56,90,0.12);">
  <tr>
    <td style="background:#0A385A;padding:28px 40px;"><div style="font-size:20px;font-weight:800;color:#fff;">Saudi Visa Service</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">New Booking Received</div></td>
    <td style="background:#0A385A;padding:28px 40px;text-align:right;vertical-align:middle;"><div style="display:inline-block;background:#da6d3f;color:#fff;font-size:11px;font-weight:800;padding:6px 14px;border-radius:9999px;">New Booking</div></td>
  </tr>
  <tr><td colspan="2" style="background:linear-gradient(135deg,rgba(218,109,63,0.06),rgba(60,165,212,0.04));padding:20px 40px;border-bottom:3px solid #da6d3f;">
    <div style="font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Payment Received</div>
    <div style="font-size:32px;font-weight:800;color:#da6d3f;">$${amountUsd.toFixed(2)}</div>
    <div style="font-size:11px;color:#9ca3af;font-family:monospace;margin-top:4px;">PI: ${paymentIntentId}</div>
  </td></tr>
  <tr><td colspan="2" style="padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td colspan="2" style="padding:8px 16px 6px;"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#da6d3f;font-weight:800;">Applicant Details</span></td></tr>
      <tr><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;width:38%;">Reference</td><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;font-family:monospace;">${referenceNumber}</td></tr>
      <tr><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Full Name</td><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Email</td><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${email}</td></tr>
      <tr><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Phone</td><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${phone}</td></tr>
      <tr><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Nationality</td><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${nationality}</td></tr>
      <tr><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Passport No.</td><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;font-family:monospace;">${passportNumber}</td></tr>
      <tr><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#9ca3af;">Service</td><td style="padding:9px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#0A385A;">${serviceName}</td></tr>
      <tr><td style="padding:9px 16px;font-size:13px;color:#9ca3af;">Travel Date</td><td style="padding:9px 16px;font-size:13px;font-weight:600;color:#0A385A;">${travelDateLabel}</td></tr>
    </table>
  </td></tr>
  <tr><td colspan="2" style="padding:20px 40px 28px;text-align:center;border-top:1px solid #eef2f7;">
    <div style="font-size:11px;color:#d1d5db;">&#169; 2026 Saudi Visa Service Admin Notification</div>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

      await Promise.all([
        transporter.sendMail({ from: fromLine, to: email, subject: `✓ Booking Confirmed – ${serviceName} | Saudi Visa Service`, html: customerHtml }),
        transporter.sendMail({ from: fromLine, to: adminEmail || smtpUser, subject: `🆕 New Booking: ${firstName} ${lastName} – ${serviceName} ($${amountUsd})`, html: adminHtml }),
      ]);
    } catch (mailErr) {
      console.error('[mail]', mailErr);
    }

    return NextResponse.json({ success: true, referenceNumber });
  } catch (err) {
    console.error('[booking/create]', err);
    return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 });
  }
}
