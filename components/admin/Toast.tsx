'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastItem { id: string; type: 'success' | 'error' | 'info'; message: string; }
interface ToastCtx { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void; }

const Ctx = createContext<ToastCtx>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ width: '360px' }}>
        {toasts.map((t) => (
          <ToastCard key={t.id} t={t} onDismiss={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToastCard({ t, onDismiss }: { t: ToastItem; onDismiss: () => void }) {
  const cfg = {
    success: { bg: '#f0fdf4', border: '#86efac', ic: '#16a34a', tx: '#15803d' },
    error:   { bg: '#fff1f2', border: '#fecdd3', ic: '#ef4444', tx: '#dc2626' },
    info:    { bg: '#f0f9ff', border: '#bae6fd', ic: '#3CA5D4', tx: '#0369a1' },
  }[t.type];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl pointer-events-auto"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span style={{ color: cfg.ic, flexShrink: 0, marginTop: '1px' }}>
        {t.type === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>}
        {t.type === 'error'   && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        {t.type === 'info'    && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
      </span>
      <span className="flex-1 text-sm font-medium leading-snug" style={{ color: cfg.tx }}>{t.message}</span>
      <button onClick={onDismiss} className="flex-shrink-0 hover:opacity-70" style={{ color: '#9ca3af' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

export function useToast() { return useContext(Ctx); }
