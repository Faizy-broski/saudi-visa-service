'use client';

import { m, useReducedMotion, type Variants } from 'framer-motion';

// ── Timing ───────────────────────────────────────────────────────────────────
export const ease = [0.22, 1, 0.36, 1] as const;
export const transition = { duration: 0.6, ease };
export const fastTransition = { duration: 0.35, ease };
export const viewportOnce = { once: true, margin: '-60px' } as const;

// ── Variants ─────────────────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
};

// ── Types ─────────────────────────────────────────────────────────────────────
type BaseProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

// ── Wrapper components ────────────────────────────────────────────────────────

export function FadeUp({ children, delay = 0, className, style }: BaseProps & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      variants={fadeUp}
      initial={reduce ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...transition, delay }}
      className={className}
      style={style}
    >
      {children}
    </m.div>
  );
}

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  className,
  style,
}: BaseProps & { direction?: 'left' | 'right' | 'up'; delay?: number }) {
  const reduce = useReducedMotion();
  const v = direction === 'left' ? slideLeft : direction === 'right' ? slideRight : fadeUp;
  return (
    <m.div
      variants={v}
      initial={reduce ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...transition, delay }}
      className={className}
      style={style}
    >
      {children}
    </m.div>
  );
}

export function ScaleIn({ children, delay = 0, className, style }: BaseProps & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      variants={scaleIn}
      initial={reduce ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...transition, delay }}
      className={className}
      style={style}
    >
      {children}
    </m.div>
  );
}

export function StaggerChildren({
  children,
  className,
  style,
  delay = 0,
  stagger = 0.1,
}: BaseProps & { delay?: number; stagger?: number }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      initial={reduce ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
      style={style}
    >
      {children}
    </m.div>
  );
}

// Used as direct children of StaggerChildren — inherits variant from parent stagger
export function StaggerItem({ children, className, style }: BaseProps) {
  return (
    <m.div variants={fadeUp} className={className} style={style}>
      {children}
    </m.div>
  );
}
