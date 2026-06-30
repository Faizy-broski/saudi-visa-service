import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import AdminBarChart from '@/components/AdminBarChart';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b', reviewing: '#3CA5D4', approved: '#10b981', rejected: '#ef4444', on_hold: '#8b5cf6',
};
const VISA_LABEL: Record<string, string> = {
  umrah: 'Umrah', tourist: 'Tourist', /* hajj: 'Hajj', */ business: 'Business', family: 'Family',
};

function StatCard({ label, value, sub, icon, grad }: { label: string; value: string | number; sub: string; icon: React.ReactNode; grad: string }) {
  return (
    <div className="rounded-2xl p-5 bg-white flex items-start gap-4 transition-shadow hover:shadow-md" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white" style={{ background: grad }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none mb-1" style={{ color: '#0A385A' }}>{value}</div>
        <div className="text-sm font-semibold truncate" style={{ color: '#374151' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{sub}</div>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { data: allBookings, count: totalBookings },
    { data: recentInquiries, count: totalInquiries },
    { data: chartBookings },
    { data: allServices },
  ] = await Promise.all([
    supabase.from('visa_applications').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(8),
    supabase.from('contact_messages').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
    supabase.from('visa_applications').select('created_at, amount_usd').gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('visa_services').select('id, name, active'),
  ]);

  const apps = allBookings ?? [];
  const pending = apps.filter((a) => a.status === 'pending').length;
  const approved = apps.filter((a) => a.status === 'approved').length;
  const revenue = apps.reduce((s, a) => s + (Number(a.amount_usd) || 0), 0);
  const unreadInquiries = (recentInquiries ?? []).filter((i) => !i.replied).length;

  // Build 7-day chart data
  const days: { label: string; date: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      value: 0,
    });
  }
  for (const b of chartBookings ?? []) {
    const key = b.created_at.slice(0, 10);
    const day = days.find((d) => d.date === key);
    if (day) day.value++;
  }
  const chartData = days.map(({ label, value }) => ({ label, value }));
  const totalRevenue7d = (chartBookings ?? []).reduce((s, b) => s + (Number(b.amount_usd) || 0), 0);

  return (
    <div className="space-y-7">

      {/* Welcome header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A385A' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right, #3CA5D4, #0E3254)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Manage Bookings
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Bookings" value={totalBookings ?? 0} sub="all time"
          grad="linear-gradient(135deg,#3CA5D4,#0E3254)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
        />
        <StatCard
          label="Pending Review" value={pending} sub="awaiting action"
          grad="linear-gradient(135deg,#f59e0b,#d97706)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Approved" value={approved} sub="visas issued"
          grad="linear-gradient(135deg,#10b981,#059669)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard
          label="Total Revenue" value={`£${revenue.toLocaleString()}`} sub="service fees"
          grad="linear-gradient(135deg,#da6d3f,#b45309)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
      </div>

      {/* Chart + Status overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base" style={{ color: '#0A385A' }}>Bookings — Last 7 Days</h3>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                {(chartBookings ?? []).length} bookings · ${totalRevenue7d.toLocaleString()} revenue this week
              </p>
            </div>
            <div
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)', color: '#fff' }}
            >
              7D
            </div>
          </div>
          <AdminBarChart data={chartData} color="#3CA5D4" />
        </div>

        {/* Status overview */}
        <div className="rounded-2xl p-6 bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
          <h3 className="font-bold text-base mb-5" style={{ color: '#0A385A' }}>Status Overview</h3>
          {apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: '#f8fbff' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {Object.entries(STATUS_COLOR).map(([status, color]) => {
                const count = apps.filter((a) => a.status === status).length;
                const pct = apps.length > 0 ? Math.round((count / apps.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="font-medium capitalize" style={{ color: '#374151' }}>{status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color }}>{count}</span>
                        <span style={{ color: '#9ca3af' }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#eef2f7' }}>
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Visa breakdown + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Visa breakdown */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
          <h3 className="font-bold text-base mb-5" style={{ color: '#0A385A' }}>Visa Type Breakdown</h3>
          {apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: '#f8fbff' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(VISA_LABEL).map(([key, label]) => {
                const count = apps.filter((a) => a.visa_type === key).length;
                const pct = apps.length > 0 ? (count / apps.length) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium" style={{ color: '#374151' }}>{label} Visa</span>
                      <span className="font-bold text-xs" style={{ color: '#0A385A' }}>{count} booking{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: '#eef2f7' }}>
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(to right,#3CA5D4,#0E3254)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl p-6 bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
          <h3 className="font-bold text-base mb-4" style={{ color: '#0A385A' }}>Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'View All Bookings', href: '/admin/bookings', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, count: totalBookings ?? 0 },
              { label: 'View Inquiries', href: '/admin/inquiries', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, count: totalInquiries ?? 0, badge: unreadInquiries },
              { label: 'Manage Services', href: '/admin/services', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>, count: (allServices ?? []).filter(s => s.active).length },
              { label: 'Settings', href: '/admin/settings', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, count: null },
            ].map(({ label, href, icon, count, badge }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-saudi-light-blue group"
                style={{ border: '1px solid #eef2f7' }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg,#3CA5D4,#0E3254)' }}>{icon}</span>
                  <span className="text-sm font-semibold" style={{ color: '#0A385A' }}>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {badge ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fff7ed', color: '#ea580c' }}>{badge} new</span> : null}
                  {count !== null && <span className="text-xs font-bold" style={{ color: '#9ca3af' }}>{count}</span>}
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-4 h-4 transition-transform group-hover:translate-x-0.5"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: '#eef2f7', background: '#f8fbff' }}>
          <div>
            <h3 className="font-bold" style={{ color: '#0A385A' }}>Recent Bookings</h3>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Latest {apps.length} application{apps.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/admin/bookings" className="text-xs font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-85" style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)', color: '#fff' }}>
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #eef2f7' }}>
                {['Reference', 'Applicant', 'Visa', 'Amount', 'Date', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b hover:bg-saudi-light-blue transition-colors" style={{ borderColor: '#f3f4f6' }}>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/bookings/${a.id}`} className="font-mono text-xs font-bold hover:underline" style={{ color: '#3CA5D4' }}>
                      {a.reference_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-sm" style={{ color: '#0A385A' }}>{a.full_name}</div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>{a.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium" style={{ color: '#374151' }}>{VISA_LABEL[a.visa_type] ?? a.visa_type}</td>
                  <td className="px-5 py-3.5 text-xs font-bold" style={{ color: '#da6d3f' }}>{a.amount_usd ? `£${Number(a.amount_usd).toFixed(2)}` : '—'}</td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b7280' }}>{new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap"
                      style={{ background: (STATUS_COLOR[a.status] ?? '#9ca3af') + '20', color: STATUS_COLOR[a.status] ?? '#9ca3af' }}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#374151' }}>No bookings yet</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Bookings will appear here once submitted</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent inquiries */}
      <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(10,56,90,0.04)' }}>
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: '#eef2f7', background: '#f8fbff' }}>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-bold" style={{ color: '#0A385A' }}>Recent Inquiries</h3>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Latest contact messages</p>
            </div>
            {unreadInquiries > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fff7ed', color: '#ea580c' }}>{unreadInquiries} new</span>
            )}
          </div>
          <Link href="/admin/inquiries" className="text-xs font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-85" style={{ background: 'linear-gradient(to right,#3CA5D4,#0E3254)', color: '#fff' }}>
            View all →
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
          {(recentInquiries ?? []).map((inq) => (
            <div key={inq.id} className="px-6 py-4 flex items-start gap-4 hover:bg-saudi-light-blue transition-colors">
              <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: inq.replied ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : 'linear-gradient(135deg,#da6d3f,#b45309)' }}>
                {(inq.name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: '#0A385A' }}>{inq.name}</span>
                  <span className="text-xs truncate" style={{ color: '#9ca3af' }}>{inq.email}</span>
                </div>
                <p className="text-xs line-clamp-1" style={{ color: '#6b7280' }}>{inq.message}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs mb-1" style={{ color: '#9ca3af' }}>
                  {new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: inq.replied ? '#f0fdf4' : '#fff7ed', color: inq.replied ? '#16a34a' : '#ea580c' }}>
                  {inq.replied ? 'Replied' : 'New'}
                </span>
              </div>
            </div>
          ))}
          {(recentInquiries ?? []).length === 0 && (
            <div className="px-6 py-14 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f8fbff', border: '1px solid #eef2f7' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-6 h-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#374151' }}>No inquiries yet</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Contact messages will appear here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
