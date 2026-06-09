'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadySetup, setAlreadySetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/setup')
      .then((r) => r.json())
      .then((d) => {
        if (d.hasAdmin) setAlreadySetup(true);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const res = await fetch('/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/login');
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Setup failed.');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0A385A 0%,#3CA5D4 100%)' }}>
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadySetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg,#0A385A 0%,#3CA5D4 100%)' }}>
        <div className="w-full max-w-sm rounded-3xl p-8 text-center" style={{ background: '#ffffff', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#0A385A' }}>Admin Already Configured</h1>
          <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>An admin account already exists. Please log in.</p>
          <a href="/admin/login" className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}>
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg,#0A385A 0%,#3CA5D4 100%)' }}>
      <div className="w-full max-w-sm rounded-3xl p-8" style={{ background: '#ffffff', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="Saudi Visa Service" style={{ height: '56px', margin: '0 auto 20px' }} />
          <h1 className="text-xl font-bold" style={{ color: '#0A385A' }}>Initial Setup</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Create your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Your Name', type: 'text', value: name, set: setName, placeholder: 'Admin User' },
            { label: 'Email Address', type: 'email', value: email, set: setEmail, placeholder: 'admin@saudivisaservice.com' },
            { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: '••••••••' },
            { label: 'Confirm Password', type: 'password', value: confirm, set: setConfirm, placeholder: '••••••••' },
          ].map(({ label, type, value, set, placeholder }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0A385A', opacity: 0.5 }}>{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                required
                className="rounded-xl border border-gray-200 text-sm p-3.5 focus:outline-none focus:border-[#3CA5D4]"
              />
            </div>
          ))}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm" style={{ color: '#dc2626' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-sm text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }}
          >
            {loading ? 'Creating account...' : 'Create Admin Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}
