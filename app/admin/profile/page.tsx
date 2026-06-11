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

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

function TextInput({
  value, onChange, placeholder, type = 'text', autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none w-full transition-colors"
      style={{ borderColor: '#e5e7eb', color: '#374151' }}
      onFocus={(e) => e.currentTarget.style.borderColor = '#3CA5D4'}
      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
    />
  );
}

export default function ProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState({ name: '', email: '', created_at: '' });
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetch('/api/admin/profile').then((r) => r.json()).then((d) => {
      setProfile(d.profile ?? {});
      setName(d.profile?.name ?? '');
      setEmail(d.profile?.email ?? '');
      setLoading(false);
    });
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    const res = await fetch('/api/admin/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setSavingProfile(false);
    if (res.ok) {
      setProfile((p) => ({ ...p, name, email }));
      showToast('Profile updated successfully', 'success');
    } else {
      showToast(data.error || 'Failed to update profile', 'error');
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    setSavingPw(true);
    const res = await fetch('/api/admin/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSavingPw(false);
    if (res.ok) {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast('Password updated successfully', 'success');
    } else {
      showToast(data.error || 'Failed to update password', 'error');
    }
  };

  const profileChanged = name !== profile.name || email !== profile.email;
  const passwordFilled = currentPassword && newPassword && confirmPassword;

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[#3CA5D4] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>My Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Manage your admin account details and password</p>
      </div>

      {/* Profile summary card */}
      <div className="rounded-2xl p-5 bg-white flex items-center gap-5" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}
        >
          {(profile.name || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg" style={{ color: '#0A385A' }}>{profile.name || 'Admin'}</div>
          <div className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{profile.email}</div>
          {profile.created_at && (
            <div className="text-xs mt-1 flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Edit profile card */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <div>
            <span className="font-bold text-sm" style={{ color: '#0A385A' }}>Edit Profile</span>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Update your display name and email address</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <FieldRow label="Full Name">
            <TextInput value={name} onChange={setName} placeholder="Admin" />
          </FieldRow>
          <FieldRow label="Email Address" hint="Used for login and admin notifications">
            <TextInput value={email} onChange={setEmail} placeholder="admin@example.com" type="email" />
          </FieldRow>
          <div className="pt-1">
            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile || !profileChanged}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
            >
              {savingProfile
                ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>Saving...</>
                : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>Save Profile</>}
            </button>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#da6d3f,#b45309)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <div>
            <span className="font-bold text-sm" style={{ color: '#0A385A' }}>Change Password</span>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Minimum 8 characters required</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {[
            { label: 'Current Password', val: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
            { label: 'New Password', val: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew((v) => !v) },
            { label: 'Confirm New Password', val: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
          ].map(({ label, val, setter, show, toggle }) => (
            <FieldRow key={label} label={label}>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none w-full pr-11 transition-colors"
                  style={{ borderColor: '#e5e7eb', color: '#374151' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3CA5D4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#9ca3af' }}
                >
                  {show ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </FieldRow>
          ))}

          {/* Password match indicator */}
          {newPassword && confirmPassword && (
            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg`}
              style={{
                background: newPassword === confirmPassword ? '#f0fdf4' : '#fff1f2',
                color: newPassword === confirmPassword ? '#16a34a' : '#e11d48',
              }}>
              {newPassword === confirmPassword
                ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>Passwords match</>
                : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Passwords do not match</>}
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={savePassword}
              disabled={savingPw || !passwordFilled}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#da6d3f,#b45309)' }}
            >
              {savingPw
                ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>Updating...</>
                : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Update Password</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
