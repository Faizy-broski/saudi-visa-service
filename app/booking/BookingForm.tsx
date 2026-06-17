'use client';

import { useState, useRef, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { VisaService, BookingFormConfig } from './page';

/* ─── Types ─── */
interface FormData {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  travelDate: string;
  numTravelers: number;
  departureCity: string;
  specialRequirements: string;
  passportFile: File | null;
  idCardFile: File | null;
  photoFile: File | null;
}

const EMPTY_FORM: FormData = {
  serviceId: '', serviceName: '', servicePrice: 0,
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', nationality: '', passportNumber: '', passportExpiry: '',
  travelDate: '', numTravelers: 1, departureCity: '', specialRequirements: '',
  passportFile: null, idCardFile: null, photoFile: null,
};

const FALLBACK_IMAGES: Record<string, string> = {
  umrah: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
  tourist: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80',
  hajj: 'https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=800&q=80',
};

const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'Australian', 'Austrian', 'Azerbaijani',
  'Bahraini', 'Bangladeshi', 'Belgian', 'Bosnian', 'Brazilian', 'British',
  'Canadian', 'Chinese', 'Egyptian', 'Ethiopian', 'French', 'German', 'Ghanaian',
  'Greek', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Italian',
  'Jordanian', 'Kazakh', 'Kenyan', 'Kuwaiti', 'Lebanese', 'Libyan', 'Malaysian',
  'Maldivian', 'Moroccan', 'Nigerian', 'Norwegian', 'Omani', 'Pakistani',
  'Palestinian', 'Filipino', 'Portuguese', 'Qatari', 'Russian', 'Saudi',
  'Senegalese', 'Somali', 'South African', 'Spanish', 'Sudanese', 'Swedish',
  'Swiss', 'Syrian', 'Tanzanian', 'Tunisian', 'Turkish', 'Ugandan', 'Emirati',
  'American', 'Uzbek', 'Yemeni', 'Other',
].sort();

/* ─── Step progress bar ─── */
function StepBar({ current, total }: { current: number; total: number }) {
  const labels = ['Service', 'Personal Info', 'Travel Details', 'Documents', 'Payment'];
  return (
    <div className="flex items-center gap-0 mb-10">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                style={{
                  background: done ? '#10b981' : active ? 'linear-gradient(135deg, #3CA5D4, #0E3254)' : '#eef2f7',
                  color: done || active ? '#ffffff' : '#9ca3af',
                  boxShadow: active ? '0 0 0 4px rgba(60,165,212,0.2)' : 'none',
                }}
              >
                {done ? '✓' : n}
              </div>
              <span className="text-[9px] font-semibold whitespace-nowrap hidden sm:block" style={{ color: active ? '#0A385A' : done ? '#10b981' : '#9ca3af' }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-5 rounded-full" style={{ background: done ? '#10b981' : '#eef2f7' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── File upload field ─── */
function FileUploadField({
  label, required, accept, maxMB, value, onChange, error,
}: {
  label: string; required?: boolean; accept: string; maxMB: number;
  value: File | null; onChange: (f: File | null) => void; error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const isImage = value && value.type.startsWith('image/');
  const preview = isImage ? URL.createObjectURL(value) : null;

  const handleFile = (f: File | null) => {
    if (!f) return onChange(null);
    if (f.size > maxMB * 1024 * 1024) return;
    onChange(f);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      {value ? (
        <div
          className="flex items-center gap-4 p-4 rounded-2xl border"
          style={{ borderColor: '#3CA5D4', background: '#f0f9ff' }}
        >
          {preview && (
            <img src={preview} alt="preview" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
          )}
          {!preview && (
            <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#eef2f7' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.5} className="w-7 h-7">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#0A385A' }}>{value.name}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>{(value.size / 1024).toFixed(0)} KB</div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
            style={{ background: '#ef4444' }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-all hover:border-[#3CA5D4] hover:bg-[#f0f9ff]"
          style={{ borderColor: error ? '#ef4444' : '#e5e7eb' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f8fbff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3CA5D4" strokeWidth={1.5} className="w-6 h-6">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="text-sm font-semibold" style={{ color: '#0A385A' }}>Click to upload</div>
          <div className="text-xs" style={{ color: '#9ca3af' }}>
            {accept.replace(/\./g, '').toUpperCase().split(',').join(', ')} · Max {maxMB}MB
          </div>
        </button>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

/* ─── Input utility ─── */
function inputCls(err?: boolean) {
  return `w-full rounded-xl border text-sm p-3.5 bg-white focus:outline-none transition-colors ${err ? 'border-red-400' : 'border-gray-200 focus:border-[#3CA5D4]'}`;
}
function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#0A385A', opacity: 0.5 }}>
      {text} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
  );
}
function FieldWrap({ children, error, className = '' }: { children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

/* ─── Payment step inner form ─── */
const CARD_OPTIONS = {
  style: {
    base: { fontSize: '15px', fontFamily: "'Poppins', sans-serif", color: '#0A385A', '::placeholder': { color: '#9ca3af' }, iconColor: '#3CA5D4' },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
  hidePostalCode: true,
};

function PaymentStep({
  form, customFiles, stripeKey, onSuccess,
}: {
  form: FormData; customFiles: Record<string, File | null>; stripeKey: string; onSuccess: (ref: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState(`${form.firstName} ${form.lastName}`);
  const [cardReady, setCardReady] = useState(false);
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || processing) return;

    if (!cardName.trim()) { setSubmitError('Please enter the cardholder name.'); return; }
    if (!cardReady) { setCardError('Please complete your card details.'); return; }

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) return;

    setProcessing(true);
    setSubmitError('');

    // 1. Create payment intent
    const piRes = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: form.serviceId, customerName: `${form.firstName} ${form.lastName}`, customerEmail: form.email }),
    }).then((r) => r.json());

    if (piRes.error) { setSubmitError(piRes.error); setProcessing(false); return; }

    // 2. Confirm card payment
    const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(piRes.clientSecret, {
      payment_method: { card: cardEl, billing_details: { name: cardName, email: form.email } },
    });

    if (stripeErr) { setSubmitError(stripeErr.message ?? 'Payment failed.'); setProcessing(false); return; }

    if (paymentIntent?.status === 'succeeded') {
      // 3. Submit booking with documents via FormData
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v instanceof File) fd.append(k, v);
        else if (v !== null && v !== undefined) fd.append(k, String(v));
      });
      Object.entries(customFiles).forEach(([k, v]) => {
        if (v instanceof File) fd.append(`custom_${k}`, v);
      });
      fd.append('paymentIntentId', paymentIntent.id);
      fd.append('amountUsd', (piRes.amount / 100).toFixed(2));

      const bookRes = await fetch('/api/booking/create', { method: 'POST', body: fd }).then((r) => r.json());
      onSuccess(bookRes.referenceNumber ?? paymentIntent.id);
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      {/* Summary */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#da6d3f' }}>Booking Summary</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Service', form.serviceName],
            ['Applicant', `${form.firstName} ${form.lastName}`],
            ['Email', form.email],
            ['Travel Date', form.travelDate],
            ['Travelers', String(form.numTravelers)],
            ['Passport No.', form.passportNumber],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: '#9ca3af' }}>{l}</div>
              <div className="font-semibold truncate" style={{ color: '#0A385A' }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: '#eef2f7' }}>
          <span className="text-sm font-bold" style={{ color: '#0A385A' }}>Total Due</span>
          <span className="text-2xl font-bold" style={{ color: '#da6d3f' }}>${form.servicePrice}</span>
        </div>
      </div>

      {/* Card holder name */}
      <FieldWrap>
        <Label text="Cardholder Name" required />
        <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className={inputCls()} placeholder="Name exactly as on card" />
      </FieldWrap>

      {/* Email read-only */}
      <FieldWrap>
        <Label text="Billing Email" />
        <input type="email" value={form.email} readOnly className="w-full rounded-xl border border-gray-200 text-sm p-3.5 bg-gray-50 text-gray-500 cursor-not-allowed" />
      </FieldWrap>

      {/* Stripe card */}
      <FieldWrap error={cardError}>
        <Label text="Card Details" required />
        <div className={`rounded-xl border p-3.5 bg-white transition-colors ${cardError ? 'border-red-400' : 'border-gray-200'}`} style={{ minHeight: '44px' }}>
          <CardElement options={CARD_OPTIONS} onChange={(ev) => { setCardError(ev.error?.message ?? ''); setCardReady(ev.complete); }} />
        </div>
      </FieldWrap>

      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 rounded-xl font-bold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(to right, #3CA5D4, #0E3254)' }}
      >
        {processing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Processing payment...
          </>
        ) : `Pay $${form.servicePrice} — Confirm Booking →`}
      </button>

      <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Secured &amp; encrypted by Stripe
      </p>
    </form>
  );
}

const DEFAULT_FORM_CFG: BookingFormConfig = {
  passport: 'required',
  id_card: 'optional',
  photo: 'required',
  custom_docs: [],
};

/* ─── Main booking form component ─── */
export default function BookingForm({ services, stripeKey }: { services: VisaService[]; stripeKey: string }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stripePromise = useMemo(() => (stripeKey ? loadStripe(stripeKey) : null), [stripeKey]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [customFiles, setCustomFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referenceNumber, setReferenceNumber] = useState('');

  const set = (field: keyof FormData, value: FormData[keyof FormData]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const getServiceCfg = (): BookingFormConfig => {
    const svc = services.find((s) => s.id === form.serviceId);
    return svc?.booking_form_config ?? DEFAULT_FORM_CFG;
  };

  /* ── Validation per step ── */
  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    const today = new Date().toISOString().split('T')[0];

    if (s === 1) {
      if (!form.serviceId) e.serviceId = 'Please select a visa service.';
    }
    if (s === 2) {
      if (form.firstName.trim().length < 2) e.firstName = 'First name is required.';
      if (form.lastName.trim().length < 2) e.lastName = 'Last name is required.';
      if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
      if (form.phone.trim().length < 7) e.phone = 'Valid phone required.';
      if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth required.';
      else {
        const age = (Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000);
        if (age < 1) e.dateOfBirth = 'Invalid date of birth.';
      }
      if (!form.nationality) e.nationality = 'Nationality required.';
      if (form.passportNumber.trim().length < 4) e.passportNumber = 'Passport number required.';
      if (!form.passportExpiry || form.passportExpiry <= today) e.passportExpiry = 'Passport must be valid (future date).';
    }
    if (s === 3) {
      if (!form.travelDate || form.travelDate <= today) e.travelDate = 'Travel date must be in the future.';
      if (form.numTravelers < 1 || form.numTravelers > 20) e.numTravelers = 'Must be between 1 and 20.';
    }
    if (s === 4) {
      const cfg = getServiceCfg();
      if (cfg.passport === 'required' && !form.passportFile) e.passportFile = 'Passport copy is required.';
      if (cfg.id_card === 'required' && !form.idCardFile) e.idCardFile = 'National ID card is required.';
      if (cfg.photo === 'required' && !form.photoFile) e.photoFile = 'Profile photo is required.';
      if (form.passportFile && form.passportFile.size > 5 * 1024 * 1024) e.passportFile = 'File must be under 5MB.';
      if (form.idCardFile && form.idCardFile.size > 5 * 1024 * 1024) e.idCardFile = 'File must be under 5MB.';
      if (form.photoFile && form.photoFile.size > 2 * 1024 * 1024) e.photoFile = 'Photo must be under 2MB.';
      cfg.custom_docs.forEach((doc) => {
        if (doc.required && !customFiles[doc.key]) e[`custom_${doc.key}`] = `${doc.label} is required.`;
        const f = customFiles[doc.key];
        if (f && f.size > 5 * 1024 * 1024) e[`custom_${doc.key}`] = `${doc.label} must be under 5MB.`;
      });
    }
    return e;
  };

  const next = () => {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  if (referenceNumber) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 max-w-lg text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #3CA5D4, #0E3254)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-10 h-10"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: '#0A385A' }}>Booking Confirmed!</h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>
          Your payment was successful and your visa application has been submitted. A confirmation email with all details has been sent to <strong>{form.email}</strong>.
        </p>
        <div className="rounded-2xl p-5 mb-6" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Reference Number</div>
          <div className="text-xl font-bold font-mono" style={{ color: '#0A385A' }}>{referenceNumber}</div>
        </div>
        <p className="text-xs" style={{ color: '#9ca3af' }}>Our team will contact you within 24 hours. Keep your reference number safe.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-12 max-w-3xl">
        <StepBar current={step} total={5} />

        {/* ── Step 1: Service Selection ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#0A385A' }}>Choose Your Visa Type</h2>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Select the visa service that matches your travel purpose.</p>
            </div>
            {errors.serviceId && <p className="text-sm" style={{ color: '#ef4444' }}>{errors.serviceId}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {services.map((svc) => {
                const selected = form.serviceId === svc.id;
                const img = svc.image_url || FALLBACK_IMAGES[svc.slug] || FALLBACK_IMAGES.umrah;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, serviceId: svc.id, serviceName: svc.name, servicePrice: svc.price_usd }))}
                    className="relative text-left rounded-2xl overflow-hidden transition-all border-2"
                    style={{
                      borderColor: selected ? '#3CA5D4' : '#eef2f7',
                      boxShadow: selected ? '0 0 0 4px rgba(60,165,212,0.2)' : '0 2px 12px rgba(10,56,90,0.06)',
                    }}
                  >
                    {/* Image header */}
                    <div className="relative h-36 overflow-hidden">
                      <img src={img} alt={svc.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,56,90,0.85) 0%, rgba(10,56,90,0.1) 70%, transparent 100%)' }} />
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: '#3CA5D4' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                        <span className="font-bold text-base text-white leading-tight">{svc.name}</span>
                        <span className="text-xl font-bold text-white">${svc.price_usd}</span>
                      </div>
                    </div>
                    {/* Meta */}
                    <div className="p-4 bg-white space-y-1.5">
                      {svc.tagline && (
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#da6d3f' }}>{svc.tagline}</div>
                      )}
                      <div className="flex items-center gap-4 text-xs" style={{ color: '#6b7280' }}>
                        {svc.duration && (
                          <span className="flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5" style={{ color: '#0A385A' }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            {svc.duration}
                          </span>
                        )}
                        {svc.processing_time && (
                          <span className="flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" style={{ color: '#da6d3f' }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                            {svc.processing_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {form.serviceId && (
              <div className="rounded-2xl p-5" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>Requirements for {form.serviceName}</div>
                <ul className="space-y-1.5">
                  {services.find((s) => s.id === form.serviceId)?.requirements?.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#0A385A" strokeWidth={2.5} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Personal Information ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#0A385A' }}>Personal Information</h2>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Please enter your details exactly as they appear on your passport.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldWrap error={errors.firstName}>
                <Label text="First Name" required /><input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputCls(!!errors.firstName)} placeholder="As on passport" />
              </FieldWrap>
              <FieldWrap error={errors.lastName}>
                <Label text="Last Name" required /><input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputCls(!!errors.lastName)} placeholder="As on passport" />
              </FieldWrap>
              <FieldWrap error={errors.email}>
                <Label text="Email Address" required /><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls(!!errors.email)} placeholder="you@email.com" />
              </FieldWrap>
              <FieldWrap error={errors.phone}>
                <Label text="Phone Number" required /><input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls(!!errors.phone)} placeholder="+44 7700 000000" />
              </FieldWrap>
              <FieldWrap error={errors.dateOfBirth}>
                <Label text="Date of Birth" required /><input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} className={inputCls(!!errors.dateOfBirth)} max={new Date().toISOString().split('T')[0]} />
              </FieldWrap>
              <FieldWrap error={errors.nationality}>
                <Label text="Nationality" required />
                <select value={form.nationality} onChange={(e) => set('nationality', e.target.value)} className={inputCls(!!errors.nationality) + ' cursor-pointer'}>
                  <option value="">Select nationality</option>
                  {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </FieldWrap>
              <FieldWrap error={errors.passportNumber}>
                <Label text="Passport Number" required /><input value={form.passportNumber} onChange={(e) => set('passportNumber', e.target.value.toUpperCase())} className={inputCls(!!errors.passportNumber)} placeholder="e.g. A12345678" style={{ fontFamily: 'monospace' }} />
              </FieldWrap>
              <FieldWrap error={errors.passportExpiry}>
                <Label text="Passport Expiry Date" required /><input type="date" value={form.passportExpiry} onChange={(e) => set('passportExpiry', e.target.value)} className={inputCls(!!errors.passportExpiry)} min={new Date().toISOString().split('T')[0]} />
              </FieldWrap>
            </div>
          </div>
        )}

        {/* ── Step 3: Travel Details ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#0A385A' }}>Travel Details</h2>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Tell us about your travel plans.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldWrap error={errors.travelDate}>
                <Label text="Preferred Travel Date" required />
                <input type="date" value={form.travelDate} onChange={(e) => set('travelDate', e.target.value)} className={inputCls(!!errors.travelDate)} min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} />
              </FieldWrap>
              <FieldWrap error={errors.numTravelers}>
                <Label text="Number of Travelers" required />
                <input type="number" value={form.numTravelers} onChange={(e) => set('numTravelers', Number(e.target.value))} className={inputCls(!!errors.numTravelers)} min={1} max={20} />
              </FieldWrap>
              <FieldWrap className="md:col-span-2">
                <Label text="Departure City (optional)" />
                <input value={form.departureCity} onChange={(e) => set('departureCity', e.target.value)} className={inputCls()} placeholder="e.g. London, Dubai" />
              </FieldWrap>
              <FieldWrap className="md:col-span-2">
                <Label text="Special Requirements (optional)" />
                <textarea value={form.specialRequirements} onChange={(e) => set('specialRequirements', e.target.value)} rows={3} className={inputCls() + ' resize-none'} placeholder="Any special requests, dietary requirements, or additional information..." />
              </FieldWrap>
            </div>
          </div>
        )}

        {/* ── Step 4: Documents ── */}
        {step === 4 && (() => {
          const cfg = getServiceCfg();
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: '#0A385A' }}>Upload Documents</h2>
                <p className="text-sm" style={{ color: '#9ca3af' }}>Please upload clear, readable copies of your documents. Supported: JPG, PNG, PDF.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cfg.passport !== 'hidden' && (
                  <div className="md:col-span-2">
                    <FileUploadField
                      label="Passport Copy"
                      required={cfg.passport === 'required'}
                      accept=".jpg,.jpeg,.png,.pdf"
                      maxMB={5}
                      value={form.passportFile}
                      onChange={(f) => set('passportFile', f)}
                      error={errors.passportFile}
                    />
                  </div>
                )}
                {cfg.id_card !== 'hidden' && (
                  <FileUploadField
                    label="National ID Card"
                    required={cfg.id_card === 'required'}
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxMB={5}
                    value={form.idCardFile}
                    onChange={(f) => set('idCardFile', f)}
                    error={errors.idCardFile}
                  />
                )}
                {cfg.photo !== 'hidden' && (
                  <FileUploadField
                    label="Profile Photo"
                    required={cfg.photo === 'required'}
                    accept=".jpg,.jpeg,.png"
                    maxMB={2}
                    value={form.photoFile}
                    onChange={(f) => set('photoFile', f)}
                    error={errors.photoFile}
                  />
                )}
                {cfg.custom_docs.map((doc) => (
                  <FileUploadField
                    key={doc.key}
                    label={doc.label}
                    required={doc.required}
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxMB={5}
                    value={customFiles[doc.key] ?? null}
                    onChange={(f) => setCustomFiles((prev) => ({ ...prev, [doc.key]: f }))}
                    error={errors[`custom_${doc.key}`]}
                  />
                ))}
              </div>
              <div className="rounded-2xl p-4 flex gap-3" style={{ background: '#fffbeb', border: '1px solid #f59e0b' }}>
                <span className="flex-shrink-0">💡</span>
                <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
                  Ensure documents are clear and all corners are visible. Blurry or incomplete documents may delay your application.
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── Step 5: Payment ── */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#0A385A' }}>Payment</h2>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Review your booking and complete payment to confirm your application.</p>
            </div>
            <Elements stripe={stripePromise}>
              <PaymentStep form={form} customFiles={customFiles} stripeKey={stripeKey} onSuccess={setReferenceNumber} />
            </Elements>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div className={`flex gap-4 mt-10 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
            {step > 1 && (
              <button onClick={back} className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all" style={{ color: '#0A385A', borderColor: '#e5e7eb' }}>
                ← Back
              </button>
            )}
            <button
              onClick={next}
              className="px-8 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(to right, #3CA5D4, #0E3254)' }}
            >
              {step === 4 ? 'Review & Pay →' : 'Continue →'}
            </button>
          </div>
        )}
        {step === 5 && (
          <button onClick={back} className="mt-4 px-6 py-3 rounded-xl font-semibold text-sm border" style={{ color: '#0A385A', borderColor: '#e5e7eb' }}>
            ← Back
          </button>
        )}
      </div>
    </>
  );
}
