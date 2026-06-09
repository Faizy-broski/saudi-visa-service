'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ToastProvider } from '@/components/admin/Toast';

const NAV = [
  {
    href: '/admin', label: 'Dashboard', exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/admin/bookings', label: 'Bookings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    href: '/admin/inquiries', label: 'Inquiries',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    href: '/admin/services', label: 'Services',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  },
  {
    href: '/admin/settings', label: 'Settings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login' || pathname === '/admin/setup') return <ToastProvider>{children}</ToastProvider>;

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const getLabel = () => {
    if (pathname === '/admin/profile') return 'My Profile';
    const match = NAV.find((n) => n.exact ? pathname === n.href : pathname.startsWith(n.href));
    return match?.label ?? 'Admin';
  };

  return (
    <ToastProvider>
    <div className="min-h-screen flex" style={{ background: '#f0f4f8' }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: 'linear-gradient(160deg, #0b2d4e 0%, #0d3a60 60%, #0f4778 100%)', boxShadow: '4px 0 32px rgba(10,56,90,0.2)' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link href="/admin">
            <img src="/images/logo.png" alt="Saudi Visa Service" style={{ height: '48px' }} />
          </Link>
          <div className="text-[9px] font-bold uppercase tracking-[0.25em] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin Portal</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href} href={href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
                style={{
                  background: active ? 'linear-gradient(to right, rgba(60,165,212,0.35), rgba(60,165,212,0.12))' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  borderLeft: active ? '3px solid #3CA5D4' : '3px solid transparent',
                  boxShadow: active ? 'inset 0 0 20px rgba(60,165,212,0.08)' : 'none',
                }}
              >
                <span style={{ color: active ? '#3CA5D4' : 'rgba(255,255,255,0.4)' }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-1 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
            style={{
              background: pathname === '/admin/profile' ? 'linear-gradient(to right, rgba(60,165,212,0.35), rgba(60,165,212,0.12))' : 'transparent',
              color: pathname === '/admin/profile' ? '#ffffff' : 'rgba(255,255,255,0.5)',
              borderLeft: pathname === '/admin/profile' ? '3px solid #3CA5D4' : '3px solid transparent',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"
              style={{ color: pathname === '/admin/profile' ? '#3CA5D4' : 'rgba(255,255,255,0.4)' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </Link>
          <Link
            href="/" target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm"
            style={{ color: 'rgba(239,68,68,0.75)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-3 border-b bg-white" style={{ borderColor: '#e8eef5' }}>
          <div className="font-bold text-sm" style={{ color: '#0A385A' }}>{getLabel()}</div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold" style={{ color: '#0A385A' }}>Admin</div>
              <div className="text-[10px]" style={{ color: '#9ca3af' }}>globalsmtp2024@gmail.com</div>
            </div>
            <Link href="/admin/profile">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}
                title="My Profile"
              >
                A
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-red-50"
              style={{ color: '#ef4444', border: '1px solid #fecdd3' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
    </ToastProvider>
  );
}
