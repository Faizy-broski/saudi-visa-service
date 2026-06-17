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
      showToast('Profile updated successfully.', 'success');
    } else {
      showToast(data.error || 'Failed to update profile.', 'error');
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) { showToast('Passwords do not match.', 'error'); return; }
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }
    setSavingPw(true);
    const res = await fetch('/api/admin/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSavingPw(false);
    if (res.ok) {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast('Password updated successfully.', 'success');
    } else {
      showToast(data.error || 'Failed to update password.', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#3CA5D4] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Manage your admin account details and password</p>
      </div>

      {/* Avatar + info */}
      <div className="rounded-2xl p-6 bg-white flex items-center gap-5" style={{ border: '1px solid #eef2f7' }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}
        >
          {(profile.name || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg" style={{ color: '#0A385A' }}>{profile.name || 'Admin'}</div>
          <div className="text-sm" style={{ color: '#6b7280' }}>{profile.email}</div>
          {profile.created_at && (
            <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
              Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Edit profile */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid #eef2f7' }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)', color: '#fff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span className="font-bold text-sm" style={{ color: '#0A385A' }}>Edit Profile</span>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
              style={{ borderColor: '#e5e7eb' }} placeholder="Admin" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4]"
              style={{ borderColor: '#e5e7eb' }} placeholder="admin@example.com" />
          </div>
          <button onClick={saveProfile} disabled={savingProfile}
            className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}>
            {savingProfile
              ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>Saving...</>
              : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>Save Profile</>}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid #eef2f7' }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#da6d3f,#b45309)', color: '#fff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <span className="font-bold text-sm" style={{ color: '#0A385A' }}>Change Password</span>
        </div>
        <div className="p-6 space-y-5">
          {([
            { label: 'Current Password', val: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
            { label: 'New Password', val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew((v) => !v) },
            { label: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
          ] as const).map(({ label, val, set: setter, show, toggle }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={val} onChange={(e) => setter(e.target.value)}
                  className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3CA5D4] w-full pr-11"
                  style={{ borderColor: '#e5e7eb' }} placeholder="••••••••" />
                <button type="button" onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-100 transition-colors"
                  style={{ color: '#9ca3af' }}>
                  {show ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={savePassword} disabled={savingPw || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(to right,#da6d3f,#b45309)' }}>
            {savingPw
              ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>Updating...</>
              : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Update Password</>}
          </button>
        </div>
      </div>
    </div>
  );
}
