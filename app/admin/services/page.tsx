'use client';

import { useState, useEffect, useCallback } from 'react';

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
      <div className="text-xs" style={{ color: '#9ca3af' }}>Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}</div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-gray-100" style={{ border: '1px solid #eef2f7', color: '#0A385A' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => onChange(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all"
            style={{ background: p === page ? 'linear-gradient(to right,#3CA5D4,#0E3254)' : 'transparent', color: p === page ? '#fff' : '#6b7280', border: `1px solid ${p === page ? 'transparent' : '#eef2f7'}` }}>
            {p}
          </button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-gray-100" style={{ border: '1px solid #eef2f7', color: '#0A385A' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

interface VisaService {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  price_usd: number;
  duration?: string;
  processing_time?: string;
  features: string[];
  requirements: string[];
  accent_color?: string;
  active: boolean;
  display_order: number;
  image_url?: string;
}

const EMPTY: Omit<VisaService, 'id'> = {
  name: '', slug: '', tagline: '', description: '', price_usd: 0,
  duration: '', processing_time: '', features: [], requirements: [],
  accent_color: '#0A385A', active: true, display_order: 99, image_url: '',
};

export default function ServicesPage() {
  const [services, setServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Partial<VisaService> & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/services').then((r) => r.json());
    setServices(res.services ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterActive]);

  const openNew = () => {
    setEditing({ ...EMPTY });
    setFeatureInput('');
    setReqInput('');
  };

  const openEdit = (svc: VisaService) => {
    setEditing({ ...svc });
    setFeatureInput('');
    setReqInput('');
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const method = editing.id ? 'PATCH' : 'POST';
    await fetch('/api/admin/services', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch('/api/admin/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    });
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, active } : s));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const addItem = (field: 'features' | 'requirements', val: string) => {
    if (!val.trim()) return;
    setEditing((prev) => prev ? { ...prev, [field]: [...(prev[field] as string[] ?? []), val.trim()] } : prev);
    if (field === 'features') setFeatureInput('');
    else setReqInput('');
  };

  const removeItem = (field: 'features' | 'requirements', idx: number) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const arr = [...(prev[field] as string[] ?? [])];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  };

  const activeCount = services.filter((s) => s.active).length;
  const inactiveCount = services.filter((s) => !s.active).length;
  const avgPrice = services.length ? Math.round(services.reduce((s, sv) => s + (sv.price_usd || 0), 0) / services.length) : 0;

  const visibleServices = services.filter((s) => {
    if (filterActive === 'active') return s.active;
    if (filterActive === 'inactive') return !s.active;
    return true;
  });
  const paginated = visibleServices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>Visa Services</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{services.length} services · {activeCount} active</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
          style={{ background: 'linear-gradient(to right,#da6d3f,#c45a2e)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Service
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: services.length, sub: 'all visa types', grad: 'linear-gradient(135deg,#3CA5D4,#0E3254)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
          { label: 'Active', value: activeCount, sub: 'shown on website', grad: 'linear-gradient(135deg,#10b981,#059669)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Inactive', value: inactiveCount, sub: 'hidden from site', grad: 'linear-gradient(135deg,#9ca3af,#6b7280)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
          { label: 'Avg. Price', value: `$${avgPrice}`, sub: 'per service', grad: 'linear-gradient(135deg,#da6d3f,#b45309)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
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

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          { f: 'all' as const, label: 'All Services', count: services.length },
          { f: 'active' as const, label: 'Active', count: activeCount },
          { f: 'inactive' as const, label: 'Inactive', count: inactiveCount },
        ]).map(({ f, label, count }) => {
          const active = filterActive === f;
          return (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#3CA5D4] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {paginated.map((svc) => (
            <div
              key={svc.id}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.05)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
                style={{ background: svc.accent_color || '#0A385A' }}
              >
                {svc.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: '#0A385A' }}>{svc.name}</span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: svc.active ? '#f0fdf4' : '#f9fafb', color: svc.active ? '#16a34a' : '#9ca3af' }}
                  >
                    {svc.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                  ${svc.price_usd} · {svc.duration || '—'} · {svc.processing_time || '—'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Toggle */}
                <button
                  onClick={() => toggle(svc.id, !svc.active)}
                  className="relative inline-flex h-6 w-11 rounded-full transition-colors flex-shrink-0"
                  style={{ background: svc.active ? '#3CA5D4' : '#d1d5db' }}
                  title={svc.active ? 'Deactivate' : 'Activate'}
                >
                  <span
                    className="inline-block h-4 w-4 mt-1 rounded-full bg-white transition-transform shadow"
                    style={{ transform: svc.active ? 'translateX(24px)' : 'translateX(4px)' }}
                  />
                </button>
                <button
                  onClick={() => openEdit(svc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: '#f8fbff', color: '#0A385A', border: '1px solid #eef2f7' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button
                  onClick={() => remove(svc.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
          <Pagination page={page} total={visibleServices.length} onChange={setPage} />
        </div>
      )}

      {/* Edit/Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-2xl rounded-3xl my-8" style={{ background: '#fff' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#eef2f7' }}>
              <h2 className="font-bold text-lg" style={{ color: '#0A385A' }}>{editing.id ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setEditing(null)} className="text-2xl leading-none" style={{ color: '#9ca3af' }}>×</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Service Name', type: 'text', placeholder: 'e.g. Umrah Visa' },
                  { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Most Popular' },
                  { key: 'price_usd', label: 'Price (USD)', type: 'number', placeholder: '199' },
                  { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 30 days' },
                  { key: 'processing_time', label: 'Processing Time', type: 'text', placeholder: 'e.g. 3-5 days' },
                  { key: 'accent_color', label: 'Accent Color', type: 'color', placeholder: '' },
                  { key: 'display_order', label: 'Display Order', type: 'number', placeholder: '1' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>{label}</label>
                    <input
                      type={type}
                      value={String((editing as Record<string, unknown>)[key] ?? '')}
                      onChange={(e) => setEditing((p) => p ? { ...p, [key]: e.target.value } : p)}
                      placeholder={placeholder}
                      className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
                      style={{ borderColor: '#e5e7eb', height: type === 'color' ? '48px' : 'auto' }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>Description</label>
                <textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing((p) => p ? { ...p, description: e.target.value } : p)}
                  rows={3}
                  className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4] resize-none"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>Image URL</label>
                <input
                  type="text"
                  value={editing.image_url ?? ''}
                  onChange={(e) => setEditing((p) => p ? { ...p, image_url: e.target.value } : p)}
                  placeholder="https://images.unsplash.com/photo-...?w=800&q=80"
                  className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
                  style={{ borderColor: '#e5e7eb' }}
                />
                {editing.image_url && (
                  <img src={editing.image_url} alt="preview" className="mt-1 h-24 w-full object-cover rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>Features (What We Provide)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('features', featureInput))}
                    placeholder="Add feature and press Enter"
                    className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                  <button onClick={() => addItem('features', featureInput)} className="px-4 rounded-xl text-sm font-bold text-white" style={{ background: '#0A385A' }}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editing.features ?? []).map((f, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ background: '#f0f9ff', color: '#0A385A' }}>
                      {f}
                      <button onClick={() => removeItem('features', i)} className="ml-1 font-bold" style={{ color: '#9ca3af' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>Requirements</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', reqInput))}
                    placeholder="Add requirement and press Enter"
                    className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                  <button onClick={() => addItem('requirements', reqInput)} className="px-4 rounded-xl text-sm font-bold text-white" style={{ background: '#0A385A' }}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editing.requirements ?? []).map((r, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ background: '#fff7ed', color: '#ea580c' }}>
                      {r}
                      <button onClick={() => removeItem('requirements', i)} className="ml-1 font-bold" style={{ color: '#9ca3af' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setEditing((p) => p ? { ...p, active: !p.active } : p)}
                  className="relative inline-flex h-6 w-11 rounded-full transition-colors"
                  style={{ background: editing.active ? '#3CA5D4' : '#d1d5db' }}
                >
                  <span
                    className="inline-block h-4 w-4 mt-1 rounded-full bg-white transition-transform shadow"
                    style={{ transform: editing.active ? 'translateX(24px)' : 'translateX(4px)' }}
                  />
                </button>
                <span className="text-sm" style={{ color: '#6b7280' }}>{editing.active ? 'Active — shown on website' : 'Inactive — hidden from website'}</span>
              </div>

              <div className="flex gap-3 pt-2 border-t" style={{ borderColor: '#eef2f7' }}>
                <button
                  onClick={save}
                  disabled={saving || !editing.name}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                  {saving ? 'Saving...' : editing.id ? 'Save Changes' : 'Create Service'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: '#f8fbff', color: '#6b7280', border: '1px solid #eef2f7' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
