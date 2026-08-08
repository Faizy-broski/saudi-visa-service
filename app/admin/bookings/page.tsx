'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { VisaApplication, ApplicationStatus } from '@/lib/types/database';
import { useToast } from '@/components/admin/Toast';

const STATUS_OPTIONS = [
  { value: 'pending'   as ApplicationStatus, label: 'Pending',   color: '#da6d3f', bg: '#fff7ed' },
  { value: 'reviewing' as ApplicationStatus, label: 'Reviewing', color: '#3CA5D4', bg: '#f0f9ff' },
  { value: 'on_hold'   as ApplicationStatus, label: 'On Hold',   color: '#f59e0b', bg: '#fffbeb' },
  { value: 'approved'  as ApplicationStatus, label: 'Approved',  color: '#10b981', bg: '#f0fdf4' },
  { value: 'rejected'  as ApplicationStatus, label: 'Rejected',  color: '#ef4444', bg: '#fff1f2' },
];

const VISA_LABEL: Record<string, string> = {
  umrah: 'Umrah', tourist: 'Tourist', /* hajj: 'Hajj', */ business: 'Business', family: 'Family',
};

const ITEMS_PER_PAGE = 10;

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });
  return (
    <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: '#eef2f7' }}>
      <div className="text-xs" style={{ color: '#9ca3af' }}>
        Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-colors hover:bg-gray-100"
          style={{ border: '1px solid #eef2f7', color: '#0A385A' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all"
            style={{ background: p === page ? 'linear-gradient(to right,#3CA5D4,#0E3254)' : 'transparent', color: p === page ? '#fff' : '#6b7280', border: `1px solid ${p === page ? 'transparent' : '#eef2f7'}` }}>
            {p}
          </button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-colors hover:bg-gray-100"
          style={{ border: '1px solid #eef2f7', color: '#0A385A' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVisa, setFilterVisa] = useState('');
  const [emailTarget, setEmailTarget] = useState<{ id: string; name: string; email: string } | null>(null);
  const [emailMsg, setEmailMsg] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/bookings');
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterVisa]);

  const handleQuickStatus = async (id: string, status: ApplicationStatus) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    await fetch('/api/admin/update-status', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' });
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const sendQuickEmail = async () => {
    if (!emailTarget || !emailMsg.trim()) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: emailTarget.id, message: emailMsg, toEmail: emailTarget.email, toName: emailTarget.name }),
      });
      if (res.ok) {
        showToast('Email sent successfully', 'success');
        setEmailTarget(null);
        setEmailMsg('');
      } else {
        showToast('Failed to send email', 'error');
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.reference_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || b.status === filterStatus;
    const matchVisa = !filterVisa || b.visa_type === filterVisa;
    return matchSearch && matchStatus && matchVisa;
  });

  const totalRevenue = bookings.reduce((s, b) => s + (Number(b.amount_usd) || 0), 0);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved').length;
  const reviewingCount = bookings.filter((b) => b.status === 'reviewing').length;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>Bookings</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, sub: 'all time', grad: 'linear-gradient(135deg,#3CA5D4,#0E3254)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { label: 'Pending Review', value: pendingCount, sub: 'awaiting action', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label: 'Approved', value: approvedCount, sub: 'visas issued', grad: 'linear-gradient(135deg,#10b981,#059669)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          { label: 'Total Revenue', value: `£${totalRevenue.toLocaleString()}`, sub: 'service fees', grad: 'linear-gradient(135deg,#da6d3f,#b45309)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
        ].map(({ label, value, sub, grad, icon }) => (
          <div key={label} className="rounded-2xl p-5 bg-white flex items-start gap-4" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.05)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: grad }}>{icon}</div>
            <div>
              <div className="text-xl font-bold leading-none mb-1" style={{ color: '#0A385A' }}>{value}</div>
              <div className="text-xs font-semibold" style={{ color: '#0A385A' }}>{label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status tab filters */}
      <div className="flex flex-wrap gap-2">
        {[{ value: '', label: 'All', color: '#0A385A' }, ...STATUS_OPTIONS].map((s) => {
          const count = s.value === '' ? bookings.length : bookings.filter((b) => b.status === s.value).length;
          const active = filterStatus === s.value;
          return (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: active ? 'linear-gradient(to right,#3CA5D4,#0E3254)' : '#ffffff',
                color: active ? '#ffffff' : '#6b7280',
                border: active ? 'none' : '1px solid #eef2f7',
                boxShadow: active ? '0 2px 12px rgba(60,165,212,0.3)' : 'none',
              }}
            >
              {s.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: active ? 'rgba(255,255,255,0.2)' : '#f3f4f6', color: active ? '#fff' : '#9ca3af' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + visa type */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, reference..."
            className="rounded-xl border border-gray-200 text-sm pl-9 pr-4 py-2.5 bg-white focus:outline-none focus:border-[#3CA5D4] w-full"
          />
        </div>
        <select
          value={filterVisa}
          onChange={(e) => setFilterVisa(e.target.value)}
          className="rounded-xl border border-gray-200 text-sm px-4 py-2.5 bg-white focus:outline-none cursor-pointer"
        >
          <option value="">All Visa Types</option>
          {Object.entries(VISA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-xs font-medium px-3 py-2 rounded-xl" style={{ background: '#f8fbff', color: '#9ca3af', border: '1px solid #eef2f7' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>

      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #eef2f7' }}>
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#3CA5D4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fbff', borderBottom: '1px solid #eef2f7' }}>
                  {[
                    { label: 'Reference', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                    { label: 'Applicant',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                    { label: 'Visa',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                    { label: 'Amount',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                    { label: 'Date',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                    { label: 'Status',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
                    { label: 'Actions',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
                  ].map(({ label, icon }) => (
                    <th key={label} className="text-left px-5 py-3" style={{ color: '#9ca3af' }}>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">{icon}{label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-[#f8fbff] transition-colors" style={{ borderColor: '#f3f4f6' }}>
                    <td className="px-5 py-4">
                      <Link href={`/admin/bookings/${b.id}`} className="font-mono text-xs font-bold hover:underline transition-colors" style={{ color: '#3CA5D4' }}>
                        {b.reference_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-sm" style={{ color: '#374151' }}>{b.full_name}</div>
                      <div className="text-xs" style={{ color: '#9ca3af' }}>{b.email}</div>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#6b7280' }}>{VISA_LABEL[b.visa_type] ?? b.visa_type}</td>
                    <td className="px-5 py-4 text-xs font-semibold" style={{ color: '#da6d3f' }}>
                      {b.amount_usd ? `£${Number(b.amount_usd).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const cfg = STATUS_OPTIONS.find((s) => s.value === b.status);
                        return (
                          <select
                            value={b.status}
                            onChange={(e) => handleQuickStatus(b.id, e.target.value as ApplicationStatus)}
                            className="rounded-lg text-xs font-bold px-2 py-1.5 focus:outline-none cursor-pointer"
                            style={{ background: cfg?.bg ?? '#f8fbff', color: cfg?.color ?? '#6b7280', border: `1.5px solid ${cfg?.color ?? '#e5e7eb'}` }}
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: '#f8fbff', color: '#0A385A', border: '1px solid #eef2f7' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          View
                        </Link>
                        <button
                          onClick={() => { setEmailTarget({ id: b.id, name: b.full_name, email: b.email }); setEmailMsg(''); }}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: '#fff7ed', color: '#da6d3f', border: '1px solid #fed7aa' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          Email
                        </button>
                        <button
                          onClick={async () => { if (confirm(`Delete booking for ${b.full_name}? This cannot be undone.`)) await handleDelete(b.id); }}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm" style={{ color: '#9ca3af' }}>No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>

      {/* Email Modal */}
      {emailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,56,90,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 24px 64px rgba(10,56,90,0.2)' }}>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#da6d3f,#b45309)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </span>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: '#0A385A' }}>Send Email</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>Compose a message to this applicant</div>
              </div>
              <button onClick={() => setEmailTarget(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: '#9ca3af' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="text-xs px-4 py-2.5 rounded-xl" style={{ background: '#f8fbff', border: '1px solid #eef2f7', color: '#6b7280' }}>
                To: <span className="font-semibold" style={{ color: '#0A385A' }}>{emailTarget.name}</span>
                <span className="ml-1.5" style={{ color: '#9ca3af' }}>({emailTarget.email})</span>
              </div>
              <textarea
                value={emailMsg}
                onChange={(e) => setEmailMsg(e.target.value)}
                rows={5}
                placeholder={`Write a message to ${emailTarget.name}...`}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#da6d3f]"
                style={{ borderColor: '#e5e7eb', color: '#374151' }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setEmailTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  style={{ background: '#f8fbff', color: '#6b7280', border: '1px solid #eef2f7' }}
                >
                  Cancel
                </button>
                <button
                  onClick={sendQuickEmail}
                  disabled={sendingEmail || !emailMsg.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(to right,#da6d3f,#b45309)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
