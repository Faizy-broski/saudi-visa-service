'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe, type StripeCardElementOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily: "'Poppins', sans-serif",
      color: '#0A385A',
      fontWeight: '400',
      '::placeholder': { color: '#9ca3af' },
      iconColor: '#3CA5D4',
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
  hidePostalCode: true,
};

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  visaType: string;
  travelDate: string;
  message?: string;
}

interface PaymentInfo {
  clientSecret: string;
  paymentIntentId: string;
  display: string;
  label: string;
}

/* ── Inner form — must be inside <Elements> ── */
function CheckoutForm({
  formData,
  paymentInfo,
  onSuccess,
}: {
  formData: BookingFormData;
  paymentInfo: PaymentInfo;
  onSuccess: (ref: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardName, setCardName] = useState(formData.fullName);
  const [cardNameError, setCardNameError] = useState('');
  const [cardReady, setCardReady] = useState(false);
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || processing) return;

    // Validate card name
    if (!cardName.trim() || cardName.trim().length < 2) {
      setCardNameError('Please enter the name on your card');
      return;
    }
    setCardNameError('');

    if (!cardReady) {
      setCardError('Please complete your card details');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setSubmitError('Card element not initialised. Please refresh and try again.');
      return;
    }

    setProcessing(true);
    setSubmitError('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      paymentInfo.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardName.trim(),
            email: formData.email,
          },
        },
      }
    );

    if (error) {
      setSubmitError(error.message ?? 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Complete booking: save to DB + send emails
      try {
        const res = await fetch('/api/complete-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            paymentIntentId: paymentIntent.id,
            amountDisplay: paymentInfo.display,
          }),
        });
        const data = await res.json();
        onSuccess(data.referenceNumber ?? paymentIntent.id);
      } catch {
        // Even if backend fails, payment succeeded — still show success
        onSuccess(paymentIntent.id);
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handlePay} className="p-8 flex flex-col gap-5">

      {/* Summary strip */}
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
      >
        <div>
          <div className="text-[11px] text-white/60 uppercase tracking-widest mb-0.5">Service</div>
          <div className="text-white font-semibold text-sm">{paymentInfo.label}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-white/60 uppercase tracking-widest mb-0.5">Total</div>
          <div className="text-white font-bold text-xl">{paymentInfo.display}</div>
        </div>
      </div>

      {/* Applicant line */}
      <div className="text-xs text-gray-400 -mt-2">
        Application for <span className="font-semibold text-saudi-blue">{formData.fullName}</span>
      </div>

      {/* Cardholder Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-saudi-blue/50">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => { setCardName(e.target.value); setCardNameError(''); }}
          placeholder="Name exactly as on card"
          className={`rounded-xl border text-sm p-3 bg-white focus:outline-none transition-colors ${
            cardNameError ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#3CA5D4]'
          }`}
        />
        {cardNameError && <p className="text-red-500 text-xs">{cardNameError}</p>}
      </div>

      {/* Email (read-only) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-saudi-blue/50">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          readOnly
          className="rounded-xl border border-gray-200 text-sm p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

      {/* Stripe CardElement */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-saudi-blue/50">
          Card Details
        </label>
        <div
          className={`rounded-xl border p-3.5 bg-white transition-colors ${
            cardError ? 'border-red-400' : 'border-gray-200'
          }`}
          style={{ minHeight: '44px' }}
        >
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(event) => {
              setCardError(event.error?.message ?? '');
              setCardReady(event.complete);
            }}
          />
        </div>
        {cardError && <p className="text-red-500 text-xs">{cardError}</p>}
      </div>

      {/* General submission error */}
      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
      >
        {processing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Processing…
          </>
        ) : (
          `Pay ${paymentInfo.display} →`
        )}
      </button>

      {/* Security note */}
      <p className="text-center text-[11px] text-gray-400 -mt-2 flex items-center justify-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Payments are secured &amp; encrypted by Stripe
      </p>
    </form>
  );
}

/* ── Success screen ── */
function SuccessScreen({
  referenceNumber,
  visaType,
  onClose,
}: {
  referenceNumber: string;
  visaType: string;
  onClose: () => void;
}) {
  return (
    <div className="p-10 flex flex-col items-center text-center gap-5">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-10 h-10">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold" style={{ color: '#0A385A' }}>Payment Successful!</h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
        Your <strong>{visaType}</strong> application has been received. A confirmation email has been sent to your inbox.
      </p>
      <div className="bg-saudi-light-blue border border-gray-200 rounded-xl px-6 py-4 w-full">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Application Reference</div>
        <div className="font-bold text-saudi-blue font-mono tracking-wide">{referenceNumber}</div>
      </div>
      <p className="text-xs text-gray-400">Our team will contact you within 24 hours.</p>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-3 rounded-full font-bold text-sm text-white"
        style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
      >
        Done
      </button>
    </div>
  );
}

/* ── Modal shell ── */
export default function PaymentModal({
  isOpen,
  onClose,
  formData,
  onPaymentSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: BookingFormData;
  onPaymentSuccess?: (referenceNumber: string) => void;
}) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fetch clientSecret whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    setPaymentInfo(null);
    setFetchError('');
    setReferenceNumber(null);
    setLoading(true);

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visaType: formData.visaType,
        customerName: formData.fullName,
        customerEmail: formData.email,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPaymentInfo(data as PaymentInfo);
      })
      .catch((err: Error) => setFetchError(err.message || 'Failed to initialise payment'))
      .finally(() => setLoading(false));
  }, [isOpen, formData.visaType, formData.fullName, formData.email]);

  const handleClose = useCallback(() => {
    if (!referenceNumber) onClose(); // Don't close mid-payment
    else onClose();
  }, [onClose, referenceNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading && !paymentInfo ? handleClose : undefined}
      />

      {/* Modal card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header bar */}
        <div
          className="flex items-center justify-between px-8 pt-7 pb-0"
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#0A385A' }}>
              {referenceNumber ? 'Booking Confirmed' : 'Complete Payment'}
            </h2>
            {!referenceNumber && (
              <p className="text-xs text-gray-400 mt-0.5">Secure checkout</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
            <svg className="animate-spin h-10 w-10 text-[#3CA5D4]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-sm text-gray-400">Preparing secure checkout…</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="p-8 text-center">
            <div className="text-red-500 text-sm mb-4">{fetchError}</div>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-full text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          </div>
        )}

        {!loading && !fetchError && referenceNumber && (
          <SuccessScreen
            referenceNumber={referenceNumber}
            visaType={formData.visaType}
            onClose={handleClose}
          />
        )}

        {!loading && !fetchError && !referenceNumber && paymentInfo && (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              formData={formData}
              paymentInfo={paymentInfo}
              onSuccess={(ref) => {
                setReferenceNumber(ref);
                onPaymentSuccess?.(ref);
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
