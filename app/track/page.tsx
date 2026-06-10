'use client';

import { useState, FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import AnnouncementBar from '@/components/AnnouncementBar';
import PageHero from '@/components/PageHero';

type Status = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'on_hold';

interface Booking {
  reference_number: string;
  status: Status;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  visa_type: string;
  travel_date: string | null;
  num_travelers?: number | null;
  departure_city?: string | null;
  amount_usd?: number | null;
  consultant_notes?: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending Review',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  reviewing: {
    label: 'Under Review',
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  approved: {
    label: 'Approved',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  rejected: {
    label: 'Rejected',
    color: '#991b1b',
    bg: '#fff1f2',
    border: '#fecdd3',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  on_hold: {
    label: 'On Hold',
    color: '#9a3412',
    bg: '#fff7ed',
    border: '#fed7aa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

const STEPS: { key: Status; label: string }[] = [
  { key: 'pending', label: 'Submitted' },
  { key: 'reviewing', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
];

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtTravel(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function TrackPage() {
  const [ref, setRef] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setBooking(null);

    const res = await fetch(`/api/track?ref=${encodeURIComponent(ref.trim())}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.');
    } else {
      setBooking(data.booking);
    }
  };

  const cfg = booking ? STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending : null;
  const stepIndex = booking
    ? booking.status === 'rejected' || booking.status === 'on_hold'
      ? 1
      : STEPS.findIndex((s) => s.key === booking.status)
    : -1;

  const displayName = booking
    ? booking.first_name && booking.last_name
      ? `${booking.first_name} ${booking.last_name}`
      : booking.full_name
    : '';

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <PageHero
        tag="Booking Tracker"
        title="Track Your Application"
        subtitle="Enter your reference number to check the real-time status of your Saudi visa application."
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Track Booking' }]}
      />

      {/* Search box */}
      <section style={{ background: '#f8fbff' }} className="pb-4">
        <div className="container mx-auto px-6 max-w-xl -mt-8 relative z-10">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl p-6 shadow-xl"
            style={{ background: '#ffffff', border: '1px solid #eef2f7' }}
          >
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#0A385A', opacity: 0.55 }}>
              Reference Number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="e.g. SVS-2024-ABCDE"
                className="flex-1 rounded-xl border px-4 py-3 text-sm focus:outline-none focus:border-[#3CA5D4]"
                style={{ borderColor: '#e5e7eb', color: '#0A385A' }}
              />
              <button
                type="submit"
                disabled={loading || !ref.trim()}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60 flex items-center gap-2"
                style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)', whiteSpace: 'nowrap' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
                Track
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm font-medium flex items-center gap-2" style={{ color: '#ef4444' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Result */}
      {booking && cfg && (
        <section style={{ background: '#f8fbff' }} className="py-10">
          <div className="container mx-auto px-6 max-w-2xl space-y-6">

            {/* Status banner */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <div style={{ color: cfg.color }}>{cfg.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</div>
                <div className="text-xs mt-0.5" style={{ color: cfg.color, opacity: 0.7 }}>
                  Last updated {fmt(booking.updated_at)}
                </div>
              </div>
              <div
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: cfg.border, color: cfg.color }}
              >
                {booking.reference_number}
              </div>
            </div>

            {/* Progress steps (only for non-rejected/on_hold) */}
            {booking.status !== 'rejected' && booking.status !== 'on_hold' && (
              <div className="rounded-2xl p-6 bg-white" style={{ border: '1px solid #eef2f7' }}>
                <div className="flex items-center">
                  {STEPS.map((step, i) => {
                    const done = i <= stepIndex;
                    const active = i === stepIndex;
                    return (
                      <div key={step.key} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: done ? (active ? '#3CA5D4' : '#0A385A') : '#eef2f7',
                              color: done ? '#ffffff' : '#9ca3af',
                            }}
                          >
                            {done && !active ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </div>
                          <span className="text-[10px] font-semibold mt-2 text-center" style={{ color: done ? '#0A385A' : '#9ca3af' }}>
                            {step.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div
                            className="h-0.5 flex-1 mx-1 mb-5"
                            style={{ background: i < stepIndex ? '#0A385A' : '#eef2f7' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking details */}
            <div className="rounded-2xl bg-white p-6 space-y-4" style={{ border: '1px solid #eef2f7' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>Booking Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Applicant" value={displayName} />
                <Detail label="Visa Type" value={booking.visa_type.charAt(0).toUpperCase() + booking.visa_type.slice(1)} />
                <Detail label="Travel Date" value={fmtTravel(booking.travel_date)} />
                <Detail label="Travelers" value={booking.num_travelers ? String(booking.num_travelers) : '—'} />
                <Detail label="Departure City" value={booking.departure_city || '—'} />
                <Detail label="Amount Paid" value={booking.amount_usd ? `$${booking.amount_usd} USD` : '—'} />
                <Detail label="Submitted On" value={fmt(booking.created_at)} />
                <Detail label="Reference" value={booking.reference_number} />
              </div>
            </div>

            {/* Consultant notes */}
            {booking.consultant_notes && (
              <div className="rounded-2xl p-5" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#1e40af', opacity: 0.7 }}>
                  Note from Consultant
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#1e3a8a' }}>{booking.consultant_notes}</p>
              </div>
            )}

            {/* Help text */}
            <p className="text-xs text-center" style={{ color: '#9ca3af' }}>
              Questions about your application? Contact us at{' '}
              <a href="mailto:info@saudivisaservice.com" style={{ color: '#3CA5D4' }}>
                info@saudivisaservice.com
              </a>
            </p>
          </div>
        </section>
      )}

      {/* Empty state hint when no search yet */}
      {!booking && !error && !loading && (
        <section style={{ background: '#f8fbff' }} className="py-16">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: '#eef2f7' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.5} className="w-9 h-9">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: '#0A385A' }}>Enter Your Reference Number</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
              Your reference number was emailed to you after completing your booking. It looks like{' '}
              <span className="font-mono font-semibold" style={{ color: '#3CA5D4' }}>SVS-2024-XXXXX</span>.
            </p>
          </div>
        </section>
      )}

      <FooterBanner />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#0A385A', opacity: 0.45 }}>{label}</div>
      <div className="text-sm font-semibold" style={{ color: '#0A385A' }}>{value}</div>
    </div>
  );
}
