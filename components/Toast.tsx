'use client';

import { useEffect, useRef, useState } from 'react';

interface ToastProps {
  referenceNumber: string;
  onClose: () => void;
}

export default function Toast({ referenceNumber, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 6000;

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));

    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) dismiss();
    }, 60);

    return () => {
      cancelAnimationFrame(show);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 400,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
        width: '360px',
        maxWidth: 'calc(100vw - 48px)',
        boxShadow: '0 20px 48px rgba(10,56,90,0.22), 0 4px 12px rgba(0,0,0,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(10,56,90,0.08)',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(to right,#3CA5D4,#da6d3f)',
          width: `${progress}%`,
          transition: 'width 0.06s linear',
        }}
      />

      <div style={{ padding: '20px 20px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>

          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#3CA5D4,#0E3254)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.5} width={20} height={20}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#0A385A' }}>
                Payment Confirmed!
              </span>
              <button
                onClick={dismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  fontSize: '16px',
                  padding: '0 0 0 8px',
                  lineHeight: 1,
                }}
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5 }}>
              Your application is confirmed. A confirmation email has been sent to you.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fbff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '5px 10px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                Ref
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0A385A', letterSpacing: '0.05em' }}>
                {referenceNumber}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
