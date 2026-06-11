'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';

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
    <div className="flex items-center justify-between px-2 py-3 mt-2">
      <div className="text-xs" style={{ color: '#6b7280' }}>
        Showing <span className="font-semibold" style={{ color: '#374151' }}>{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}–{Math.min(page * ITEMS_PER_PAGE, total)}</span> of <span className="font-semibold" style={{ color: '#374151' }}>{total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition-colors"
          style={{ border: '1px solid #eef2f7', color: '#374151' }}>
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
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition-colors"
          style={{ border: '1px solid #eef2f7', color: '#374151' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service_interest?: string;
  message: string;
  replied: boolean;
  reply_sent_at?: string;
  created_at: string;
}

export default function InquiriesPage() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [replyMsg, setReplyMsg] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/inquiries').then((r) => r.json());
    setInquiries(res.inquiries ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filter]);
  useEffect(() => { setReplyMsg(''); setShowReplyForm(false); }, [selected?.id]);

  const sendReply = async () => {
    if (!selected || !replyMsg.trim()) return;
    setSendingReply(true);
    const res = await fetch('/api/admin/reply-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inquiryId: selected.id,
        message: replyMsg,
        toEmail: selected.email,
        toName: selected.name,
        serviceInterest: selected.service_interest,
      }),
    });
    setSendingReply(false);
    if (res.ok) {
      setReplyMsg('');
      setShowReplyForm(false);
      setInquiries((prev) => prev.map((i) => i.id === selected.id ? { ...i, replied: true } : i));
      setSelected((prev) => prev ? { ...prev, replied: true } : null);
      showToast(`Reply sent to ${selected.name}`, 'success');
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to send reply', 'error');
    }
  };

  const markReplied = async (id: string, replied: boolean) => {
    await fetch('/api/admin/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, replied }),
    });
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, replied } : i));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, replied } : null);
    showToast(replied ? 'Marked as replied' : 'Marked as pending', 'success');
  };

  const deleteInquiry = async (id: string) => {
    await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
    setConfirmDeleteId(null);
    showToast('Inquiry deleted', 'info');
  };

  const filtered = inquiries.filter((i) => {
    if (filter === 'unread' && i.replied) return false;
    if (filter === 'replied' && !i.replied) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.message.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = inquiries.filter((i) => !i.replied).length;
  const repliedCount = inquiries.filter((i) => i.replied).length;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const todayCount = inquiries.filter((i) => new Date(i.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>Contact Inquiries</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
            {unreadCount > 0 ? `${unreadCount} unread · ` : ''}{inquiries.length} total
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Inquiries', value: inquiries.length, sub: 'all time', grad: 'linear-gradient(135deg,#3CA5D4,#0E3254)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { label: 'Unread / New', value: unreadCount, sub: 'awaiting reply', grad: 'linear-gradient(135deg,#da6d3f,#b45309)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: 'Replied', value: repliedCount, sub: 'messages handled', grad: 'linear-gradient(135deg,#10b981,#059669)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Today', value: todayCount, sub: 'received today', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
        ].map(({ label, value, sub, grad, icon }) => (
          <div key={label} className="rounded-2xl p-5 bg-white flex items-start gap-4" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: grad }}>{icon}</div>
            <div className="min-w-0">
              <div className="text-xl font-bold leading-none mb-1" style={{ color: '#0A385A' }}>{value}</div>
              <div className="text-xs font-semibold truncate" style={{ color: '#374151' }}>{label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none bg-white"
            style={{ borderColor: '#e5e7eb', color: '#374151' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3CA5D4'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>
        <div className="flex gap-2">
          {([
            { f: 'all' as const, label: 'All', count: inquiries.length },
            { f: 'unread' as const, label: 'Unread', count: unreadCount },
            { f: 'replied' as const, label: 'Replied', count: repliedCount },
          ]).map(({ f, label, count }) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: active ? 'linear-gradient(to right,#3CA5D4,#0E3254)' : '#ffffff',
                  color: active ? '#fff' : '#6b7280',
                  border: `1px solid ${active ? 'transparent' : '#eef2f7'}`,
                  boxShadow: active ? '0 2px 8px rgba(60,165,212,0.25)' : 'none',
                }}
              >
                {label}
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: active ? 'rgba(255,255,255,0.2)' : '#e5e7eb', color: active ? '#fff' : '#6b7280' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#3CA5D4] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#fff', border: '1px solid #eef2f7' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-7 h-7">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: '#374151' }}>No inquiries found</p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            {search || filter !== 'all' ? 'Try adjusting your search or filters' : 'Contact form submissions will appear here'}
          </p>
          {(search || filter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilter('all'); }}
              className="mt-4 text-xs font-semibold px-4 py-2 rounded-xl"
              style={{ background: '#f0f9ff', color: '#3CA5D4', border: '1px solid #bae6fd' }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((inq) => (
            <div
              key={inq.id}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md bg-white"
              style={{
                border: `1px solid ${inq.replied ? '#eef2f7' : '#e0f0fa'}`,
                borderLeft: `4px solid ${inq.replied ? '#e5e7eb' : '#da6d3f'}`,
              }}
              onClick={() => setSelected(inq)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {!inq.replied && (
                      <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: '#da6d3f' }} />
                    )}
                    <span className="font-semibold text-sm" style={{ color: '#0A385A' }}>{inq.name}</span>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>·</span>
                    <span className="text-xs truncate" style={{ color: '#6b7280' }}>{inq.email}</span>
                    {inq.phone && (
                      <>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>·</span>
                        <span className="text-xs" style={{ color: '#6b7280' }}>{inq.phone}</span>
                      </>
                    )}
                  </div>
                  {inq.service_interest && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5" style={{ background: '#f0f9ff', color: '#3CA5D4' }}>
                      {inq.service_interest}
                    </span>
                  )}
                  <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: '#6b7280' }}>{inq.message}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs mb-2" style={{ color: '#9ca3af' }}>
                    {new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: inq.replied ? '#f0fdf4' : '#fff7ed',
                      color: inq.replied ? '#16a34a' : '#ea580c',
                    }}
                  >
                    {inq.replied ? 'Replied' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <Pagination page={page} total={filtered.length} onChange={setPage} />
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,56,90,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden bg-white flex flex-col" style={{ maxHeight: '90vh', boxShadow: '0 24px 64px rgba(10,56,90,0.25)' }}>
            {/* Modal header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: '#eef2f7', background: '#f8fbff' }}>
              <div>
                <h2 className="font-bold text-base" style={{ color: '#0A385A' }}>Inquiry Details</h2>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                  {new Date(selected.created_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: '#9ca3af' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Service Interest', value: selected.service_interest || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9ca3af' }}>{label}</div>
                    <div className="text-sm font-semibold truncate" style={{ color: '#0A385A' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: selected.replied ? '#f0fdf4' : '#fff7ed',
                    color: selected.replied ? '#16a34a' : '#ea580c',
                    border: `1px solid ${selected.replied ? '#bbf7d0' : '#fed7aa'}`,
                  }}
                >
                  {selected.replied ? '✓ Replied' : '● Pending Reply'}
                </span>
              </div>

              {/* Message */}
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Message</div>
                <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ background: '#f8fbff', border: '1px solid #eef2f7', color: '#374151' }}>
                  {selected.message}
                </div>
              </div>

              {/* Reply form */}
              {showReplyForm && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #bae6fd', background: '#f0f9ff' }}>
                  <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#bae6fd' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0" style={{ color: '#3CA5D4' }}>
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    <span className="text-xs font-bold" style={{ color: '#0369a1' }}>Reply to {selected.name} ({selected.email})</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <textarea
                      value={replyMsg}
                      onChange={(e) => setReplyMsg(e.target.value)}
                      rows={4}
                      placeholder={`Write your reply to ${selected.name}...`}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none focus:outline-none bg-white"
                      style={{ borderColor: '#bae6fd', color: '#374151' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3CA5D4'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#bae6fd'}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={sendReply}
                        disabled={sendingReply || !replyMsg.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-opacity"
                        style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        {sendingReply ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button
                        onClick={() => { setShowReplyForm(false); setReplyMsg(''); }}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm transition-colors hover:bg-gray-50"
                        style={{ background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete confirm inline */}
              {confirmDeleteId === selected.id && (
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#e11d48' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1" style={{ color: '#be123c' }}>Delete this inquiry?</p>
                    <p className="text-xs mb-3" style={{ color: '#9f1239' }}>This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteInquiry(selected.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
                        style={{ background: '#e11d48' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-gray-50"
                        style={{ background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer actions */}
            <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: '#eef2f7', background: '#f8fbff' }}>
              <button
                onClick={() => markReplied(selected.id, !selected.replied)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: selected.replied ? '#6b7280' : 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
              >
                {selected.replied
                  ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Mark Pending</>
                  : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>Mark Replied</>}
              </button>
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: showReplyForm ? '#f0f9ff' : '#fff',
                  color: showReplyForm ? '#3CA5D4' : '#0A385A',
                  border: `1px solid ${showReplyForm ? '#bae6fd' : '#eef2f7'}`,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {showReplyForm ? 'Hide Reply' : 'Reply by Email'}
              </button>
              <button
                onClick={() => {
                  setConfirmDeleteId(confirmDeleteId === selected.id ? null : selected.id);
                  setShowReplyForm(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: confirmDeleteId === selected.id ? '#fff1f2' : '#fff',
                  color: '#e11d48',
                  border: '1px solid #fecdd3',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
