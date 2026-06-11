'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/admin/Toast';

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

interface Settings {
  smtp_host: string; smtp_port: string; smtp_username: string; smtp_password: string;
  smtp_from_name: string; admin_email: string;
  stripe_mode: string;
  stripe_test_publishable_key: string; stripe_test_secret_key: string;
  stripe_live_publishable_key: string; stripe_live_secret_key: string;
  site_name: string; support_phone: string;
}

const DEFAULTS: Settings = {
  smtp_host: '', smtp_port: '587', smtp_username: '', smtp_password: '',
  smtp_from_name: 'Saudi Visa Service', admin_email: '',
  stripe_mode: 'test',
  stripe_test_publishable_key: '', stripe_test_secret_key: '',
  stripe_live_publishable_key: '', stripe_live_secret_key: '',
  site_name: 'Saudi Visa Service', support_phone: '',
};

const TABS = [
  {
    id: 'general', label: 'General',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    id: 'email', label: 'Email (SMTP)',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  {
    id: 'stripe', label: 'Stripe Payments',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showTestSecret, setShowTestSecret] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => { setSettings({ ...DEFAULTS, ...(d.settings ?? {}) }); setLoading(false); });
  }, []);

  const set = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((prev) => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setSaving(false);
    if (res.ok) showToast('Settings saved successfully', 'success');
    else showToast('Failed to save settings', 'error');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[#3CA5D4] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Manage site configuration, email delivery, and payment settings</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#f0f4f8', border: '1px solid #e5eaf0' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? '#0A385A' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 8px rgba(10,56,90,0.1)' : 'none',
            }}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>

        {/* General */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-5">
            <SectionHeader
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              title="Site Information"
              description="Basic details about your visa service"
            />
            <Row label="Site Name" hint="Displayed in emails and the browser tab">
              <Input value={settings.site_name} onChange={set('site_name')} placeholder="Saudi Visa Service" />
            </Row>
            <Row label="Support Phone" hint="Shown to customers for assistance">
              <Input value={settings.support_phone} onChange={set('support_phone')} placeholder="+966 50 000 0000" />
            </Row>
            <Row label="Admin Notification Email" hint="Where new booking & inquiry alerts are sent">
              <Input value={settings.admin_email} onChange={set('admin_email')} placeholder="admin@saudivisaservice.com" type="email" />
            </Row>
          </div>
        )}

        {/* Email SMTP */}
        {activeTab === 'email' && (
          <div className="p-6 space-y-5">
            <SectionHeader
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              title="SMTP Email Configuration"
              description="Used to send booking confirmations, replies, and status updates"
            />

            <div className="rounded-xl p-4 text-sm" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
              <strong>Using Gmail?</strong> Set host to <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(3,105,161,0.1)' }}>smtp.gmail.com</code> and use an App Password (not your login password). Enable 2FA first, then generate one at <strong>myaccount.google.com/apppasswords</strong>.
            </div>

            <Row label="SMTP Host">
              <Input value={settings.smtp_host} onChange={set('smtp_host')} placeholder="smtp.gmail.com" />
            </Row>
            <Row label="SMTP Port">
              <Input value={settings.smtp_port} onChange={set('smtp_port')} placeholder="587" type="number" />
            </Row>
            <Row label="Username / Email Address">
              <Input value={settings.smtp_username} onChange={set('smtp_username')} placeholder="your@gmail.com" type="email" />
            </Row>
            <Row label="App Password">
              <div className="relative">
                <Input value={settings.smtp_password} onChange={set('smtp_password')} placeholder="xxxx xxxx xxxx xxxx" type={showSmtpPass ? 'text' : 'password'} />
                <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#9ca3af' }}>
                  {showSmtpPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </Row>
            <Row label="From Name" hint="The sender name recipients will see">
              <Input value={settings.smtp_from_name} onChange={set('smtp_from_name')} placeholder="Saudi Visa Service" />
            </Row>
          </div>
        )}

        {/* Stripe */}
        {activeTab === 'stripe' && (
          <div className="p-6 space-y-6">

            <SectionHeader
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
              title="Stripe Payment Settings"
              description="Configure which keys are used to process visa payments"
            />

            {/* Mode toggle card */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #eef2f7' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#f8fbff', borderBottom: '1px solid #eef2f7' }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#0A385A' }}>Payment Mode</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Controls which API keys are used for all transactions</div>
                </div>
                <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: '#eef2f7' }}>
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, stripe_mode: 'test' }))}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: settings.stripe_mode === 'test' ? 'linear-gradient(to right,#f59e0b,#d97706)' : 'transparent',
                      color: settings.stripe_mode === 'test' ? '#fff' : '#9ca3af',
                      boxShadow: settings.stripe_mode === 'test' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                    </svg>
                    Test Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, stripe_mode: 'live' }))}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: settings.stripe_mode === 'live' ? 'linear-gradient(to right,#10b981,#059669)' : 'transparent',
                      color: settings.stripe_mode === 'live' ? '#fff' : '#9ca3af',
                      boxShadow: settings.stripe_mode === 'live' ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Live Mode
                  </button>
                </div>
              </div>
              <div
                className="px-5 py-3 flex items-center gap-2 text-xs font-semibold"
                style={{
                  background: settings.stripe_mode === 'live' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
                  color: settings.stripe_mode === 'live' ? '#059669' : '#d97706',
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: settings.stripe_mode === 'live' ? '#10b981' : '#f59e0b' }} />
                {settings.stripe_mode === 'live'
                  ? 'LIVE MODE ACTIVE — real payments will be charged'
                  : 'TEST MODE ACTIVE — no real payments, use Stripe test cards'}
              </div>
            </div>

            {/* Live mode warning */}
            {settings.stripe_mode === 'live' && (
              <div className="rounded-xl p-4 flex items-start gap-3 text-sm" style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div>
                  <strong>Live mode is active.</strong> Customers will be charged real money. Verify your live keys are correct before saving.
                </div>
              </div>
            )}

            {/* Test Keys section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#92400e' }}>Test Keys</span>
                {settings.stripe_mode === 'test' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>ACTIVE</span>
                )}
              </div>
              <div className="rounded-xl p-3.5 text-xs" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
                Use <code className="font-mono">pk_test_...</code> and <code className="font-mono">sk_test_...</code> keys from Stripe Dashboard → Developers → API keys.
              </div>
              <Row label="Test Publishable Key">
                <Input value={settings.stripe_test_publishable_key} onChange={set('stripe_test_publishable_key')} placeholder="pk_test_51..." />
              </Row>
              <Row label="Test Secret Key">
                <div className="relative">
                  <Input value={settings.stripe_test_secret_key} onChange={set('stripe_test_secret_key')} placeholder="sk_test_51..." type={showTestSecret ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowTestSecret(!showTestSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#9ca3af' }}>
                    {showTestSecret ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </Row>
            </div>

            <div style={{ borderTop: '1px solid #eef2f7' }} />

            {/* Live Keys section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#065f46' }}>Live Keys</span>
                {settings.stripe_mode === 'live' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>ACTIVE</span>
                )}
              </div>
              <div className="rounded-xl p-3.5 text-xs" style={{ background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' }}>
                Use <code className="font-mono">pk_live_...</code> and <code className="font-mono">sk_live_...</code> keys from Stripe Dashboard → Developers → API keys.
              </div>
              <Row label="Live Publishable Key">
                <Input value={settings.stripe_live_publishable_key} onChange={set('stripe_live_publishable_key')} placeholder="pk_live_51..." />
              </Row>
              <Row label="Live Secret Key">
                <div className="relative">
                  <Input value={settings.stripe_live_secret_key} onChange={set('stripe_live_secret_key')} placeholder="sk_live_51..." type={showLiveSecret ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowLiveSecret(!showLiveSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#9ca3af' }}>
                    {showLiveSecret ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </Row>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={save} disabled={saving}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
        >
          {saving
            ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>Saving...</>
            : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Settings</>}
        </button>
        <p className="text-xs" style={{ color: '#9ca3af' }}>Changes apply immediately after saving</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b" style={{ borderColor: '#eef2f7' }}>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}>
        {icon}
      </span>
      <div>
        <div className="font-bold text-sm" style={{ color: '#0A385A' }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{description}</div>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <label className="text-sm font-semibold" style={{ color: '#374151' }}>{label}</label>
        {hint && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none w-full transition-colors"
      style={{ borderColor: '#e5e7eb', color: '#374151' }}
      onFocus={(e) => e.currentTarget.style.borderColor = '#3CA5D4'}
      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
    />
  );
}
