'use client';

import { useState, useTransition } from 'react';
import { submitContact } from '@/lib/actions/submitContact';
import Link from 'next/link';

const VISA_INTERESTS = [
  'Umrah Visa', 'Tourist Visa', 'Hajj Visa', 'General Enquiry', 'Other',
];

function inputCls(hasError?: boolean) {
  return [
    'w-full rounded-xl border text-sm p-3 bg-white focus:outline-none transition-colors',
    hasError ? 'border-red-400' : 'border-gray-200 focus:border-[#3CA5D4]',
  ].join(' ');
}

function Field({
  label, error, required, className = '', children,
}: {
  label: string; error?: string; required?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: '#0A385A', opacity: 0.5 }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs px-1">{error}</p>}
    </div>
  );
}

export default function ContactForm() {
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
    <section className="py-16 md:py-24 bg-white" id="application">
      <div className="container mx-auto px-4 md:px-6">
        <div className="rounded-2xl md:rounded-[32px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-gray-100">

          {/* Sidebar */}
          <div
            className="lg:w-[38%] p-7 md:p-10 text-white relative flex flex-col justify-between overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #3CA5D4 0%, #0E3254 100%)' }}
          >
            <div className="absolute right-0 bottom-0 pointer-events-none" style={{ opacity: 0.08, width: '80%' }}>
              <img src="/images/airplane-front.png" alt="" className="w-full" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Contact Us
              </span>
              <h2 className="text-3xl font-bold mb-5 leading-tight">
                Have a <span className="italic">question?</span>
              </h2>
              <p className="text-sm mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Fill in the form and our team will get back to you within a few hours. For immediate visa processing, use our booking form.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Visa Operations Center<br />Jeddah · Saudi Arabia</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z" />
                  </svg>
                  <span>+966 12 000 0000</span>
                </div>
              </div>
              <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.70)' }}>Ready to apply for your visa?</p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full"
                  style={{ background: '#da6d3f', color: '#ffffff' }}
                >
                  Start Booking →
                </Link>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:w-[62%] p-7 md:p-10 bg-white">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3CA5D4, #0E3254)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-8 h-8">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#0A385A' }}>Message Received!</h3>
                <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#6b7280' }}>
                  Thank you for reaching out. Our team will respond within a few hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', interest: '', message: '' }); }}
                  className="px-6 py-3 rounded-full font-bold text-sm text-white"
                  style={{ background: '#da6d3f' }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" required error={errors.name}>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Your full name" className={inputCls(!!errors.name)} />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" className={inputCls(!!errors.email)} />
                </Field>
                <Field label="Phone (optional)">
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 7700 000000" className={inputCls()} />
                </Field>
                <Field label="Service Interest">
                  <select value={form.interest} onChange={set('interest')} className={inputCls() + ' cursor-pointer'}>
                    <option value="">Select a topic</option>
                    {VISA_INTERESTS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Message" required error={errors.message} className="md:col-span-2">
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    rows={4}
                    placeholder="Tell us how we can help..."
                    className={inputCls(!!errors.message) + ' resize-none'}
                  />
                </Field>
                {serverError && (
                  <div className="md:col-span-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{serverError}</div>
                )}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ background: 'linear-gradient(to right, #3CA5D4, #0E3254)' }}
                  >
                    {isPending ? 'Sending...' : 'Send Message →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
