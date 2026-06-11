'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { VisaApplication, ApplicationStatus } from '@/lib/types/database';
import { useToast } from '@/components/admin/Toast';

const STATUS_OPTIONS = [
  { value: 'pending'   as ApplicationStatus, label: 'Pending',   color: '#da6d3f', bg: '#fff7ed', border: '#fed7aa' },
  { value: 'reviewing' as ApplicationStatus, label: 'Reviewing', color: '#3CA5D4', bg: '#f0f9ff', border: '#bae6fd' },
  { value: 'on_hold'   as ApplicationStatus, label: 'On Hold',   color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  { value: 'approved'  as ApplicationStatus, label: 'Approved',  color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  { value: 'rejected'  as ApplicationStatus, label: 'Rejected',  color: '#ef4444', bg: '#fff1f2', border: '#fecdd3' },
];

const VISA_LABEL: Record<string, string> = {
  umrah: 'Umrah Visa', tourist: 'Tourist Visa', hajj: 'Hajj Visa', business: 'Business Visa', family: 'Family Visa',
};

function Card({ title, icon, children, accent }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: accent ?? 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}>
          {icon}
        </span>
        <span className="font-bold text-sm" style={{ color: '#0A385A' }}>{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: string | number | null | undefined }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ label, value }) => (
        <div key={label} className="rounded-xl p-3.5" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9ca3af' }}>{label}</div>
          <div className="text-sm font-semibold break-words" style={{ color: value ? '#0A385A' : '#9ca3af' }}>{value ?? '—'}</div>
        </div>
      ))}
    </div>
  );
}

function SidebarCard({ title, icon, accent, children }: { title: string; icon: React.ReactNode; accent?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: accent ?? 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}>
          {icon}
        </span>
        <span className="font-bold text-sm" style={{ color: '#0A385A' }}>{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [booking, setBooking] = useState<VisaApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('pending');
  const [emailMsg, setEmailMsg] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/bookings?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.booking) {
          setBooking(d.booking);
          setNewStatus(d.booking.status);
          setNotes(d.booking.consultant_notes ?? '');
        }
        setLoading(false);
      });
  }, [id]);

  const updateStatus = () => {
    startTransition(async () => {
      const res = await fetch('/api/admin/update-status', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setBooking((b) => b ? { ...b, status: newStatus } : b);
        showToast(`Status updated to ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    });
  };

  const saveNotes = () => {
    startTransition(async () => {
      const res = await fetch('/api/admin/update-status', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, consultant_notes: notes }),
      });
      if (res.ok) {
        setBooking((b) => b ? { ...b, consultant_notes: notes } : b);
        showToast('Notes saved', 'success');
      } else {
        showToast('Failed to save notes', 'error');
      }
    });
  };

  const sendEmail = () => {
    if (!emailMsg.trim() || !booking) return;
    startTransition(async () => {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, message: emailMsg, toEmail: booking.email, toName: booking.full_name }),
      });
      if (res.ok) {
        setEmailMsg('');
        showToast('Email sent successfully', 'success');
      } else {
        showToast('Failed to send email', 'error');
      }
    });
  };

  const deleteBooking = () => {
    startTransition(async () => {
      await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' });
      showToast('Booking deleted', 'info');
      router.push('/admin/bookings');
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[#3CA5D4] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-8 h-8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div className="text-center">
        <p className="font-bold text-base" style={{ color: '#0A385A' }}>Booking not found</p>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>This booking may have been deleted</p>
      </div>
      <Link href="/admin/bookings" className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: '#f0f9ff', color: '#3CA5D4', border: '1px solid #bae6fd' }}>
        ← Back to Bookings
      </Link>
    </div>
  );

  const statusCfg = STATUS_OPTIONS.find((s) => s.value === booking.status) ?? STATUS_OPTIONS[0];
  const currentStatusCfg = STATUS_OPTIONS.find((s) => s.value === newStatus) ?? STATUS_OPTIONS[0];
  const notesChanged = notes !== (booking.consultant_notes ?? '');

  return (
    <div className="space-y-6">

      {/* Header banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A385A 0%, #1a6498 50%, #3CA5D4 100%)', boxShadow: '0 8px 32px rgba(10,56,90,0.2)' }}>
        <div className="px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] mb-2 tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Booking Reference</div>
            <div className="font-mono text-sm font-bold mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>{booking.reference_number}</div>
            <h1 className="text-2xl font-bold text-white mb-2">{booking.full_name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {booking.email}
              </span>
              {booking.phone && (
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.37 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91A16 16 0 0 0 14 16l.91-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>
                  {booking.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Applied {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1.5px solid ${statusCfg.border}` }}>
              {statusCfg.label}
            </span>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
              {VISA_LABEL[booking.visa_type] ?? booking.visa_type}
            </span>
            {booking.amount_usd && (
              <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                ${Number(booking.amount_usd).toFixed(2)} paid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Applicant Details */}
          <Card title="Applicant Details" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
            <InfoGrid items={[
              { label: 'Full Name',     value: booking.full_name },
              { label: 'Email',         value: booking.email },
              { label: 'Phone',         value: booking.phone },
              { label: 'Country',       value: booking.country },
              { label: 'Nationality',   value: booking.nationality },
              { label: 'Date of Birth', value: booking.date_of_birth ? new Date(booking.date_of_birth).toLocaleDateString('en-GB') : null },
            ]} />
          </Card>

          {/* Visa & Travel */}
          <Card title="Visa & Travel Details" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}>
            <InfoGrid items={[
              { label: 'Visa Type',         value: VISA_LABEL[booking.visa_type] ?? booking.visa_type },
              { label: 'Travel Date',       value: booking.travel_date ? new Date(booking.travel_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
              { label: 'No. of Travelers',  value: booking.num_travelers },
              { label: 'Departure City',    value: booking.departure_city },
              { label: 'Passport No.',      value: booking.passport_number },
              { label: 'Passport Expiry',   value: booking.passport_expiry ? new Date(booking.passport_expiry).toLocaleDateString('en-GB') : null },
            ]} />
          </Card>

          {/* Payment */}
          <Card title="Payment Information" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}>
            <InfoGrid items={[
              { label: 'Amount Paid',    value: booking.amount_usd ? `$${Number(booking.amount_usd).toFixed(2)}` : null },
              { label: 'Payment Intent', value: booking.stripe_payment_intent_id },
              { label: 'Submitted On',   value: new Date(booking.created_at).toLocaleString('en-GB') },
              { label: 'Last Updated',   value: booking.updated_at ? new Date(booking.updated_at).toLocaleString('en-GB') : null },
            ]} />
          </Card>

          {/* Documents */}
          {(booking.passport_url || booking.id_card_url || booking.photo_url) && (
            <Card title="Uploaded Documents" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
              <div className="flex flex-wrap gap-3">
                {[
                  booking.passport_url && { label: 'Passport Copy', url: booking.passport_url },
                  booking.id_card_url  && { label: 'ID Card',       url: booking.id_card_url },
                  booking.photo_url    && { label: 'Profile Photo',  url: booking.photo_url },
                ].filter(Boolean).map((doc) => (
                  <a
                    key={(doc as { label: string; url: string }).label}
                    href={(doc as { label: string; url: string }).url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:opacity-80"
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                    {(doc as { label: string; url: string }).label}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 opacity-60"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Special requirements */}
          {booking.message && (
            <Card title="Special Requirements" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#374151' }}>{booking.message}</p>
            </Card>
          )}
        </div>

        {/* Right: Action sidebar */}
        <div className="space-y-5">

          {/* Update Status */}
          <SidebarCard
            title="Update Status"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setNewStatus(s.value)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: newStatus === s.value ? s.color : s.bg,
                      color: newStatus === s.value ? '#fff' : s.color,
                      border: `1.5px solid ${s.color}`,
                      boxShadow: newStatus === s.value ? `0 2px 8px ${s.color}40` : 'none',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="rounded-xl p-3 text-xs text-center font-semibold" style={{ background: currentStatusCfg.bg, color: currentStatusCfg.color, border: `1px solid ${currentStatusCfg.border}` }}>
                Selected: <strong>{currentStatusCfg.label}</strong>
              </div>
              <button
                type="button"
                onClick={updateStatus}
                disabled={isPending || newStatus === booking.status}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
              >
                {isPending
                  ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>Saving...</>
                  : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>Save Status</>}
              </button>
            </div>
          </SidebarCard>

          {/* Consultant Notes */}
          <SidebarCard
            title="Consultant Notes"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
            accent="linear-gradient(135deg,#8b5cf6,#6d28d9)"
          >
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add internal notes about this application..."
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none focus:outline-none"
                style={{ borderColor: '#e5e7eb', color: '#374151' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={saveNotes}
                disabled={isPending || !notesChanged}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#8b5cf6,#6d28d9)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Notes
              </button>
            </div>
          </SidebarCard>

          {/* Send Email */}
          <SidebarCard
            title="Send Email"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
            accent="linear-gradient(135deg,#da6d3f,#b45309)"
          >
            <div className="space-y-3">
              <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: '#f8fbff', color: '#6b7280', border: '1px solid #eef2f7' }}>
                To: <span className="font-semibold" style={{ color: '#0A385A' }}>{booking.full_name}</span>
                <span className="ml-1" style={{ color: '#9ca3af' }}>({booking.email})</span>
              </div>
              <textarea
                value={emailMsg}
                onChange={(e) => setEmailMsg(e.target.value)}
                rows={4}
                placeholder={`Write a message to ${booking.full_name}...`}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none focus:outline-none"
                style={{ borderColor: '#e5e7eb', color: '#374151' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#da6d3f'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={sendEmail}
                disabled={isPending || !emailMsg.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#da6d3f,#b45309)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {isPending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </SidebarCard>

          {/* Danger Zone */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #fecdd3' }}>
            <div className="px-5 py-4 border-b flex items-center gap-3" style={{ background: '#fff1f2', borderColor: '#fecdd3' }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#fecdd3', color: '#e11d48' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
              <span className="font-bold text-sm" style={{ color: '#be123c' }}>Danger Zone</span>
            </div>
            <div className="p-5 space-y-3" style={{ background: '#fff8f8' }}>
              <p className="text-xs" style={{ color: '#9f1239' }}>Permanently delete this booking. This action cannot be undone.</p>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-red-50"
                  style={{ background: '#fff', color: '#e11d48', border: '1.5px solid #fecdd3' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Delete Booking
                </button>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-center py-1 rounded-lg" style={{ color: '#be123c', background: '#fecdd330' }}>
                    Are you sure? This cannot be reversed.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={deleteBooking}
                      disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                      style={{ background: '#e11d48' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      {isPending ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-gray-50"
                      style={{ background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
