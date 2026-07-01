'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
  }, []);

  const clear = () => {
    if (timer.current !== null) clearTimeout(timer.current);
  };

  const start = () => {
    if (prefersReducedMotion.current) return;
    clear();
    started.current = true;
    setVisible(true);
    setProgress(8);

    let val = 8;
    const tick = () => {
      val += val < 35 ? 7 : val < 60 ? 4 : val < 80 ? 2 : val < 90 ? 0.8 : 0;
      setProgress(val);
      if (val < 90) timer.current = setTimeout(tick, 220);
    };
    timer.current = setTimeout(tick, 160);
  };

  const finish = () => {
    clear();
    if (!started.current) return;
    started.current = false;
    setProgress(100);
    timer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 380);
  };

  // Complete progress when route settles
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Intercept clicks on internal anchor tags
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore non-primary clicks and modifier keys (open in new tab, etc.)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      // Skip: new-tab, download, aria-disabled
      if (anchor.target === '_blank') return;
      if (anchor.hasAttribute('download')) return;
      if (
        anchor.getAttribute('aria-disabled') === 'true' ||
        anchor.hasAttribute('disabled')
      ) return;

      const href = anchor.href;
      if (!href) return;

      try {
        const url = new URL(href);
        // Skip external origins
        if (url.origin !== window.location.origin) return;
        // Skip hash-only navigation (same path + search, different hash)
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) return;

        start();
      } catch {
        // Malformed href — ignore
      }
    };

    // Capture phase so we get the click before any stopPropagation
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--color-saudi-orange, #da6d3f)',
          borderRadius: '0 9999px 9999px 0',
          transition: progress === 100
            ? 'width 180ms ease-out'
            : 'width 220ms ease-out',
          boxShadow: '0 0 8px rgba(218, 109, 63, 0.55)',
        }}
      />
    </div>
  );
}

// Wrapped in Suspense because useSearchParams() requires a boundary
export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
