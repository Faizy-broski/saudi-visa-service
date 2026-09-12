'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';

const ITEMS_PER_PAGE = 10;

const STATUS_LABEL: Record<string, string> = { new: 'New', contacted: 'Contacted', converted: 'Converted', closed: 'Closed' };
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  new: { bg: '#fff7ed', text: '#ea580c' },
  contacted: { bg: '#f0f9ff', text: '#3CA5D4' },
  converted: { bg: '#f0fdf4', text: '#16a34a' },
  closed: { bg: '#f3f4f6', text: '#6b7280' },
};

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

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  visa_interest?: string;
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  source: string;
  created_at: string;
}

export default function LeadsPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'converted' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/leads').then((r) => r.json());
    setLeads(res.leads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filter]);

  const updateStatus = async (id: string, status: Lead['status']) => {
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : null));
    showToast('Lead status updated', 'success');
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.phone ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const newCount = leads.filter((l) => l.status === 'new').length;
  const convertedCount = leads.filter((l) => l.status === 'converted').length;
  const todayCount = leads.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>Leads</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            {newCount} new · {leads.length} total
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, sub: 'all time', grad: 'linear-gradient(135deg,#3CA5D4,#0E3254)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { label: 'New', value: newCount, sub: 'awaiting contact', grad: 'linear-gradient(135deg,#da6d3f,#b45309)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: 'Converted', value: convertedCount, sub: 'became customers', grad: 'linear-gradient(135deg,#10b981,#059669)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Today', value: todayCount, sub: 'received today', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
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
            placeholder="Search name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
            style={{ borderColor: '#eef2f7' }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { f: 'all' as const, label: 'All', count: leads.length },
            { f: 'new' as const, label: 'New', count: newCount },
            { f: 'contacted' as const, label: 'Contacted', count: leads.filter((l) => l.status === 'contacted').length },
            { f: 'converted' as const, label: 'Converted', count: convertedCount },
            { f: 'closed' as const, label: 'Closed', count: leads.filter((l) => l.status === 'closed').length },
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
          <div className="text-4xl mb-3">🧲</div>
          <p className="font-medium" style={{ color: '#9ca3af' }}>No leads found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {paginated.map((lead) => {
            const c = STATUS_COLOR[lead.status];
            return (
              <div
                key={lead.id}
                className="rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md"
                style={{
                  background: '#ffffff',
                  border: `1px solid ${lead.status === 'new' ? '#3CA5D4' : '#eef2f7'}`,
                  borderLeft: `4px solid ${lead.status === 'new' ? '#da6d3f' : '#e5e7eb'}`,
                }}
                onClick={() => setSelected(lead)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {lead.status === 'new' && (
                        <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#da6d3f' }} />
                      )}
                      <span className="font-semibold text-sm truncate" style={{ color: '#0A385A' }}>{lead.name}</span>
                      <span className="text-xs" style={{ color: '#9ca3af' }}>·</span>
                      <span className="text-xs truncate" style={{ color: '#6b7280' }}>{lead.email}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {lead.phone && (
                        <span className="text-xs" style={{ color: '#6b7280' }}>{lead.phone}</span>
                      )}
                      {lead.visa_interest && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: '#f0f9ff', color: '#3CA5D4' }}>
                          {lead.visa_interest}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs mb-2" style={{ color: '#9ca3af' }}>
                      {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {STATUS_LABEL[lead.status]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <Pagination page={page} total={filtered.length} onChange={setPage} />
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-lg rounded-3xl overflow-hidden" style={{ background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#eef2f7' }}>
              <h2 className="font-bold text-lg" style={{ color: '#0A385A' }}>Lead Details</h2>
              <button onClick={() => setSelected(null)} className="text-2xl leading-none" style={{ color: '#9ca3af' }}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Visa Interest', value: selected.visa_interest || '—' },
                  { label: 'Source', value: selected.source },
                  { label: 'Date', value: new Date(selected.created_at).toLocaleString('en-GB') },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9ca3af' }}>{label}</div>
                    <div className="text-sm font-medium" style={{ color: '#0A385A' }}>{value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Status</div>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'contacted', 'converted', 'closed'] as const).map((s) => {
                    const active = selected.status === s;
                    const c = STATUS_COLOR[s];
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: active ? c.bg : '#fff',
                          color: active ? c.text : '#9ca3af',
                          border: `1px solid ${active ? c.text : '#e5e7eb'}`,
                        }}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected.message && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Message</div>
                  <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ background: '#f8fbff', color: '#374151' }}>
                    {selected.message}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email Lead
                </a>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                    style={{ background: '#f8fbff', color: '#0A385A', border: '1px solid #eef2f7' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call
                  </a>
                )}
                <button
                  onClick={() => deleteLead(selected.id)}
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
