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

export interface BookingFormConfig {
  passport: 'required' | 'optional' | 'hidden';
  id_card: 'required' | 'optional' | 'hidden';
  photo: 'required' | 'optional' | 'hidden';
  custom_docs: { key: string; label: string; required: boolean }[];
}

export const DEFAULT_FORM_CONFIG: BookingFormConfig = {
  passport: 'required',
  id_card: 'optional',
  photo: 'required',
  custom_docs: [],
};

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
  booking_form_config: BookingFormConfig | null;
}

const EMPTY: Omit<VisaService, 'id'> = {
  name: '', slug: '', tagline: '', description: '', price_usd: 0,
  duration: '', processing_time: '', features: [], requirements: [],
  accent_color: '#0A385A', active: true, display_order: 99, image_url: '',
  booking_form_config: null,
};

type DocMode = 'required' | 'optional' | 'hidden';
const DOC_MODES: { val: DocMode; label: string; bg: string }[] = [
  { val: 'required', label: 'Required', bg: '#0A385A' },
  { val: 'optional', label: 'Optional', bg: '#3CA5D4' },
  { val: 'hidden',   label: 'Hidden',   bg: '#9ca3af' },
];

function DocModeToggle({ value, onChange }: { value: DocMode; onChange: (v: DocMode) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      {DOC_MODES.map(({ val, label, bg }) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className="px-3 py-1.5 text-xs font-semibold transition-all"
          style={{
            background: value === val ? bg : '#f9fafb',
            color: value === val ? '#fff' : '#9ca3af',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  const { showToast } = useToast();
  const [services, setServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Partial<VisaService> & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [newDocLabel, setNewDocLabel] = useState('');
  const [addHint, setAddHint] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'form-setup'>('details');

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
    setFeatureInput(''); setReqInput(''); setNewDocLabel('');
    setActiveTab('details');
  };

  const openEdit = (svc: VisaService) => {
    setEditing({ ...svc });
    setFeatureInput(''); setReqInput(''); setNewDocLabel('');
    setActiveTab('details');
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) {
      showToast('Service name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const method = editing.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Failed to save service.', 'error');
        return;
      }
      showToast(editing.id ? 'Service updated successfully.' : 'Service created successfully.', 'success');
      setEditing(null);
      setActiveTab('details');
      load();
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
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
    const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { showToast('Failed to delete service.', 'error'); return; }
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Service deleted.', 'success');
  };

  const addItem = (field: 'features' | 'requirements', val: string) => {
    if (!val.trim()) {
      setAddHint(field);
      setTimeout(() => setAddHint(null), 2500);
      return;
    }
    setAddHint(null);
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

  const getFormCfg = (): BookingFormConfig =>
    editing?.booking_form_config ?? { ...DEFAULT_FORM_CONFIG, custom_docs: [] };

  const updateFormCfg = (update: Partial<BookingFormConfig>) =>
    setEditing((p) => {
      if (!p) return p;
      const cur = p.booking_form_config ?? { ...DEFAULT_FORM_CONFIG, custom_docs: [] };
      return { ...p, booking_form_config: { ...cur, ...update } };
    });

  const addCustomDoc = () => {
    if (!newDocLabel.trim()) return;
    const key = newDocLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const cfg = getFormCfg();
    if (cfg.custom_docs.some((d) => d.key === key)) {
      showToast('A document with this name already exists.', 'error');
      return;
    }
    updateFormCfg({ custom_docs: [...cfg.custom_docs, { key, label: newDocLabel.trim(), required: false }] });
    setNewDocLabel('');
  };

  const activeCount = services.filter((s) => s.active).length;
  const inactiveCount = services.filter((s) => !s.active).length;
  const avgPrice = services.length
    ? Math.round(services.reduce((s, sv) => s + (sv.price_usd || 0), 0) / services.length)
    : 0;

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

      {/* Stats */}
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
          const isActive = filterActive === f;
          return (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isActive ? 'linear-gradient(to right,#3CA5D4,#0E3254)' : '#f8fbff',
                color: isActive ? '#fff' : '#6b7280',
                border: `1px solid ${isActive ? 'transparent' : '#eef2f7'}`,
                boxShadow: isActive ? '0 2px 8px rgba(60,165,212,0.3)' : 'none',
              }}
            >
              {label}
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: isActive ? 'rgba(255,255,255,0.2)' : '#e5e7eb', color: isActive ? '#fff' : '#6b7280' }}>{count}</span>
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
                  {svc.booking_form_config && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#f0f9ff', color: '#3CA5D4' }}>
                      Custom Form
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                  ${svc.price_usd} · {svc.duration || '—'} · {svc.processing_time || '—'}
                </div>
              </div>
              <div className="flex items-center gap-2">
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

      {/* Edit / Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-2xl rounded-3xl my-8 flex flex-col" style={{ background: '#fff' }}>

            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#eef2f7' }}>
              <h2 className="font-bold text-lg" style={{ color: '#0A385A' }}>{editing.id ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setEditing(null)} className="text-2xl leading-none" style={{ color: '#9ca3af' }}>×</button>
            </div>

            {/* Tabs */}
            <div className="px-6 flex gap-1 flex-shrink-0" style={{ borderBottom: '1px solid #eef2f7' }}>
              {([
                { id: 'details' as const, label: 'Service Details' },
                { id: 'form-setup' as const, label: 'Form Setup' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="pt-4 pb-3 px-2 text-sm font-semibold transition-colors border-b-2"
                  style={{
                    borderColor: activeTab === tab.id ? '#3CA5D4' : 'transparent',
                    color: activeTab === tab.id ? '#0A385A' : '#9ca3af',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>

              {/* ── Details tab ── */}
              {activeTab === 'details' && (
                <>
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
                        onChange={(e) => { setFeatureInput(e.target.value); if (addHint === 'features') setAddHint(null); }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('features', featureInput))}
                        placeholder="Type a feature, then click Add"
                        className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
                        style={{ borderColor: addHint === 'features' ? '#f59e0b' : '#e5e7eb' }}
                      />
                      <button
                        onClick={() => addItem('features', featureInput)}
                        className="flex items-center gap-1.5 px-4 rounded-xl text-sm font-bold text-white transition-all"
                        style={{ background: '#0A385A', minWidth: '80px' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 flex-shrink-0">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add
                      </button>
                    </div>
                    {addHint === 'features' && (
                      <p className="text-xs flex items-center gap-1.5" style={{ color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        First type a feature above, then click Add.
                      </p>
                    )}
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
                        onChange={(e) => { setReqInput(e.target.value); if (addHint === 'requirements') setAddHint(null); }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', reqInput))}
                        placeholder="Type a requirement, then click Add"
                        className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
                        style={{ borderColor: addHint === 'requirements' ? '#f59e0b' : '#e5e7eb' }}
                      />
                      <button
                        onClick={() => addItem('requirements', reqInput)}
                        className="flex items-center gap-1.5 px-4 rounded-xl text-sm font-bold text-white transition-all"
                        style={{ background: '#0A385A', minWidth: '80px' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 flex-shrink-0">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add
                      </button>
                    </div>
                    {addHint === 'requirements' && (
                      <p className="text-xs flex items-center gap-1.5" style={{ color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        First type a requirement above, then click Add.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(editing.requirements ?? []).map((r, i) => (
                        <span key={i} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ background: '#fff7ed', color: '#ea580c' }}>
                          {r}
                          <button onClick={() => removeItem('requirements', i)} className="ml-1 font-bold" style={{ color: '#9ca3af' }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Active toggle */}
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
                </>
              )}

              {/* ── Form Setup tab ── */}
              {activeTab === 'form-setup' && (() => {
                const cfg = getFormCfg();
                return (
                  <div className="space-y-6">
                    <div className="rounded-xl p-4" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                      <p className="text-xs leading-relaxed" style={{ color: '#0369a1' }}>
                        Configure which documents customers must upload when booking this service.
                        Changes here only affect the booking form — not what&apos;s displayed on the services page.
                      </p>
                    </div>

                    {/* Standard documents */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#0A385A', opacity: 0.5 }}>Standard Document Requirements</div>
                      <div className="space-y-3">
                        {([
                          {
                            key: 'passport' as const,
                            label: 'Passport Copy',
                            icon: (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                                <rect x="4" y="2" width="16" height="20" rx="2"/>
                                <circle cx="12" cy="10" r="3"/>
                                <path d="M7 17c0-2.76 2.24-4 5-4s5 1.24 5 4"/>
                              </svg>
                            ),
                          },
                          {
                            key: 'id_card' as const,
                            label: 'National ID Card',
                            icon: (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                                <rect x="2" y="5" width="20" height="14" rx="2"/>
                                <circle cx="8" cy="12" r="2.5"/>
                                <line x1="13" y1="10" x2="19" y2="10"/>
                                <line x1="13" y1="14" x2="17" y2="14"/>
                              </svg>
                            ),
                          },
                          {
                            key: 'photo' as const,
                            label: 'Profile Photo',
                            icon: (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                              </svg>
                            ),
                          },
                        ]).map(({ key, label, icon }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 p-3.5 rounded-xl"
                            style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#e0f0fa', color: '#0A385A' }}>
                                {icon}
                              </div>
                              <span className="text-sm font-semibold" style={{ color: '#0A385A' }}>{label}</span>
                            </div>
                            <DocModeToggle
                              value={cfg[key]}
                              onChange={(v) => updateFormCfg({ [key]: v })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom documents */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#0A385A', opacity: 0.5 }}>Custom Documents</div>
                      <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Add extra documents specific to this service (e.g. Health Certificate, Mahram Letter).</p>

                      {/* Add new */}
                      <div className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={newDocLabel}
                          onChange={(e) => { setNewDocLabel(e.target.value); if (addHint === 'custom_doc') setAddHint(null); }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDoc())}
                          placeholder="Type document name, then click Add"
                          className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
                          style={{ borderColor: addHint === 'custom_doc' ? '#f59e0b' : '#e5e7eb' }}
                        />
                        <button
                          onClick={() => {
                            if (!newDocLabel.trim()) {
                              setAddHint('custom_doc');
                              setTimeout(() => setAddHint(null), 2500);
                              return;
                            }
                            setAddHint(null);
                            addCustomDoc();
                          }}
                          className="px-4 rounded-xl text-sm font-bold text-white flex items-center gap-1.5"
                          style={{ background: '#0A385A', minWidth: '80px' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 flex-shrink-0"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Add
                        </button>
                      </div>
                      {addHint === 'custom_doc' && (
                        <p className="text-xs flex items-center gap-1.5 mb-3" style={{ color: '#d97706' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          First type the document name above, then click Add.
                        </p>
                      )}
                      <div className="mb-4" />

                      {/* List of custom docs */}
                      {cfg.custom_docs.length === 0 ? (
                        <div className="text-center py-6 rounded-xl" style={{ background: '#f8fbff', border: '1px dashed #e5e7eb' }}>
                          <p className="text-sm" style={{ color: '#9ca3af' }}>No custom documents added yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cfg.custom_docs.map((doc) => (
                            <div
                              key={doc.key}
                              className="flex items-center justify-between gap-3 p-3.5 rounded-xl"
                              style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7', color: '#92400e' }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="8" y1="13" x2="16" y2="13"/>
                                    <line x1="8" y1="17" x2="13" y2="17"/>
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold truncate" style={{ color: '#0A385A' }}>{doc.label}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newDocs = cfg.custom_docs.map((d) => d.key === doc.key ? { ...d, required: true } : d);
                                      updateFormCfg({ custom_docs: newDocs });
                                    }}
                                    className="px-2.5 py-1.5 text-xs font-semibold transition-all"
                                    style={{ background: doc.required ? '#0A385A' : '#f9fafb', color: doc.required ? '#fff' : '#9ca3af' }}
                                  >
                                    Required
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newDocs = cfg.custom_docs.map((d) => d.key === doc.key ? { ...d, required: false } : d);
                                      updateFormCfg({ custom_docs: newDocs });
                                    }}
                                    className="px-2.5 py-1.5 text-xs font-semibold transition-all"
                                    style={{ background: !doc.required ? '#3CA5D4' : '#f9fafb', color: !doc.required ? '#fff' : '#9ca3af' }}
                                  >
                                    Optional
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    updateFormCfg({ custom_docs: cfg.custom_docs.filter((d) => d.key !== doc.key) });
                                  }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                                  style={{ color: '#9ca3af' }}
                                  title="Remove"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl p-4 space-y-1.5" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#0A385A', opacity: 0.5 }}>Current Setup Summary</div>
                      {[
                        { label: 'Passport Copy', val: cfg.passport },
                        { label: 'National ID Card', val: cfg.id_card },
                        { label: 'Profile Photo', val: cfg.photo },
                        ...cfg.custom_docs.map(d => ({ label: d.label, val: d.required ? 'required' as DocMode : 'optional' as DocMode })),
                      ].map(({ label, val }) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span style={{ color: '#374151' }}>{label}</span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: val === 'required' ? '#f0fdf4' : val === 'optional' ? '#f0f9ff' : '#f9fafb',
                              color: val === 'required' ? '#16a34a' : val === 'optional' ? '#0369a1' : '#9ca3af',
                            }}
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer: Save / Cancel */}
            <div className="p-6 flex gap-3 border-t flex-shrink-0" style={{ borderColor: '#eef2f7' }}>
              <button
                onClick={save}
                disabled={saving || !editing.name}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                    {editing.id ? 'Save Changes' : 'Create Service'}
                  </>
                )}
              </button>
              <button
                onClick={() => { setEditing(null); setActiveTab('details'); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: '#f8fbff', color: '#6b7280', border: '1px solid #eef2f7' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
