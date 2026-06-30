'use client';

import { useState, useTransition } from 'react';
import { submitContact } from '@/lib/actions/submitContact';

const VISA_INTERESTS = [
  'Umrah Visa', 'Tourist Visa', /* 'Hajj Visa', */ 'General Enquiry', 'Other',
];

const INFO_ITEMS = [
  {
    title: 'Email',
    value: 'info@saudivisaservice.co.uk',
    iconBg: '#e0e7ff',
    iconColor: '#4f46e5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    title: 'WhatsApp',
    value: '+44 20 1234 5678',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    title: 'Phone',
    value: '+966 12 000 0000',
    iconBg: '#d1fae5',
    iconColor: '#059669',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/>
      </svg>
    ),
  },
  {
    title: 'Hours',
    value: 'Open 24/7, 365 days a year',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

function inputCls(err?: boolean) {
  return [
    'w-full rounded-lg border text-sm px-4 py-3 bg-white focus:outline-none transition-colors',
    err ? 'border-red-400' : 'border-gray-200 focus:border-[#3CA5D4]',
  ].join(' ');
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', interest: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isPending, startTransition] = useTransition();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.message.trim() || form.message.trim().length < 5) e.message = 'Message is required.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setServerError('');
    startTransition(async () => {
      const res = await submitContact({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.interest || 'General Enquiry',
        message: form.message,
      });
      if (res.success) setSubmitted(true);
      else setServerError(res.error);
    });
  };

  return (
    <section className="py-16 md:py-24" style={{ background: '#f8fbff' }}>
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="grid md:grid-cols-[1fr_360px] gap-6 md:gap-8 items-start">

          {/* ── Left: Form card ── */}
          <div
            className="bg-white rounded-2xl p-7 md:p-10"
            style={{ border: '1.5px solid #b2e3f5', boxShadow: '0 2px 24px rgba(60,165,212,0.07)' }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-8 h-8">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#0A385A' }}>Message Received!</h3>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#6b7280' }}>
                  Thank you for reaching out. Our team will respond within a few hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', interest: '', message: '' }); }}
                  className="px-6 py-3 rounded-full font-bold text-sm text-white"
                  style={{ background: '#3CA5D4' }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-6" style={{ color: '#0A385A' }}>Send us a message</h2>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm" style={{ color: '#374151' }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Your full name"
                      className={inputCls(!!errors.name)}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  {/* Email + Phone — 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm" style={{ color: '#374151' }}>
                        Email <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@email.com"
                        className={inputCls(!!errors.email)}
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm" style={{ color: '#374151' }}>Phone (optional)</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="+44 7700 000000"
                        className={inputCls()}
                      />
                    </div>
                  </div>

                  {/* Service Interest */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm" style={{ color: '#374151' }}>Service Interest</label>
                    <select
                      value={form.interest}
                      onChange={set('interest')}
                      className={inputCls() + ' cursor-pointer'}
                    >
                      <option value="">Select a topic</option>
                      {VISA_INTERESTS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm" style={{ color: '#374151' }}>
                      Message <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={set('message')}
                      rows={4}
                      placeholder="Tell us how we can help..."
                      className={inputCls(!!errors.message) + ' resize-none'}
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  {serverError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                      {serverError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 rounded-lg font-bold text-sm text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                    style={{ background: '#3CA5D4' }}
                  >
                    {isPending ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── Right: Info cards ── */}
          <div className="flex flex-col gap-4">
            {INFO_ITEMS.map(({ title, value, icon, iconBg, iconColor }) => (
              <div
                key={title}
                className="bg-white rounded-xl px-5 py-4 flex items-center gap-4"
                style={{ border: '1px solid #eef2f7', boxShadow: '0 1px 8px rgba(10,56,90,0.04)' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: iconBg, color: iconColor }}
                >
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#0A385A' }}>{title}</div>
                  <div className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
