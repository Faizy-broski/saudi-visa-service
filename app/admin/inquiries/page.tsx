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
    <div className="flex items-center justify-between px-2 py-3">
      <div className="text-xs" style={{ color: '#9ca3af' }}>
        Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition-colors"
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
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition-colors"
          style={{ border: '1px solid #eef2f7', color: '#0A385A' }}>
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
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
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
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            {unreadCount} unread · {inquiries.length} total
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Inquiries', value: inquiries.length, sub: 'all time', grad: 'linear-gradient(135deg,#3CA5D4,#0E3254)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { label: 'Unread / New', value: unreadCount, sub: 'awaiting reply', grad: 'linear-gradient(135deg,#da6d3f,#b45309)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: 'Replied', value: repliedCount, sub: 'messages handled', grad: 'linear-gradient(135deg,#10b981,#059669)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Today', value: todayCount, sub: "received today", grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
            style={{ borderColor: '#eef2f7' }}
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
                  background: active ? 'linear-gradient(to right,#3CA5D4,#0E3254)' : '#f8fbff',
                  color: active ? '#fff' : '#6b7280',
                  border: `1px solid ${active ? 'transparent' : '#eef2f7'}`,
                  boxShadow: active ? '0 2px 8px rgba(60,165,212,0.3)' : 'none',
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
        <div className="text-center py-20 rounded-2xl" style={{ background: '#f8fbff' }}>
          <div className="text-4xl mb-3">📬</div>
          <p className="font-medium" style={{ color: '#9ca3af' }}>No inquiries found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {paginated.map((inq) => (
            <div
              key={inq.id}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md"
              style={{
                background: '#ffffff',
                border: `1px solid ${inq.replied ? '#eef2f7' : '#3CA5D4'}`,
                borderLeft: `4px solid ${inq.replied ? '#e5e7eb' : '#da6d3f'}`,
              }}
              onClick={() => setSelected(inq)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!inq.replied && (
                      <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#da6d3f' }} />
                    )}
                    <span className="font-semibold text-sm truncate" style={{ color: '#0A385A' }}>{inq.name}</span>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>·</span>
                    <span className="text-xs truncate" style={{ color: '#6b7280' }}>{inq.email}</span>
                  </div>
                  {inq.service_interest && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mr-2" style={{ background: '#f0f9ff', color: '#3CA5D4' }}>
                      {inq.service_interest}
                    </span>
                  )}
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: '#6b7280' }}>{inq.message}</p>
                </div>
                <div className="flex-shrink-0 text-right">
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

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-lg rounded-3xl overflow-hidden" style={{ background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#eef2f7' }}>
              <h2 className="font-bold text-lg" style={{ color: '#0A385A' }}>Inquiry Details</h2>
              <button onClick={() => setSelected(null)} className="text-2xl leading-none" style={{ color: '#9ca3af' }}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Service Interest', value: selected.service_interest || '—' },
                  { label: 'Date', value: new Date(selected.created_at).toLocaleString('en-GB') },
                  { label: 'Status', value: selected.replied ? 'Replied' : 'Pending' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9ca3af' }}>{label}</div>
                    <div className="text-sm font-medium" style={{ color: '#0A385A' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Message</div>
                <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ background: '#f8fbff', color: '#374151' }}>
                  {selected.message}
                </div>
              </div>
              {/* Reply form */}
              {showReplyForm && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #bae6fd', background: '#f0f9ff' }}>
                  <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#bae6fd' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" style={{ color: '#3CA5D4' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <span className="text-xs font-bold" style={{ color: '#0369a1' }}>Reply to: {selected.name} ({selected.email})</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <textarea
                      value={replyMsg}
                      onChange={(e) => setReplyMsg(e.target.value)}
                      rows={4}
                      placeholder={`Write your reply to ${selected.name}...`}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:border-[#3CA5D4] bg-white"
                      style={{ borderColor: '#bae6fd', color: '#374151' }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={sendReply}
                        disabled={sendingReply || !replyMsg.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                        style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        {sendingReply ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button
                        onClick={() => { setShowReplyForm(false); setReplyMsg(''); }}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm"
                        style={{ background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => markReplied(selected.id, !selected.replied)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: selected.replied ? '#6b7280' : 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
                >
                  {selected.replied
                    ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Mark as Pending</>
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>Mark as Replied</>}
                </button>
                <button
                  onClick={() => setShowReplyForm((v) => !v)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: showReplyForm ? '#f0f9ff' : '#f8fbff',
                    color: showReplyForm ? '#3CA5D4' : '#0A385A',
                    border: `1px solid ${showReplyForm ? '#bae6fd' : '#eef2f7'}`,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {showReplyForm ? 'Hide Reply' : 'Reply via Email'}
                </button>
                <button
                  onClick={() => deleteInquiry(selected.id)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm"
                  style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
