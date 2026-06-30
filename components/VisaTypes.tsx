'use client';

import { useState, useCallback } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { FadeUp, ease } from '@/lib/motion';
import { StaggerChildren, StaggerItem } from '@/lib/motion';

interface VisaService {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  price_usd: number;
  duration?: string;
  processing_time?: string;
  features?: string[];
  requirements?: string[];
  accent_color?: string;
  image_url?: string;
}

const FALLBACK_IMAGES: Record<string, string> = {
  umrah: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
  tourist: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80',
  // hajj: 'https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=800&q=80',
};

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function VisaCard({ svc, height }: { svc: VisaService; height: number }) {
  const reduce = useReducedMotion();
  const img = svc.image_url || FALLBACK_IMAGES[svc.slug] || 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80';
  return (
    <m.div
      className="relative group overflow-hidden rounded-3xl w-full flex-shrink-0"
      style={{ height }}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.35, ease }}
    >
      <img
        src={img}
        alt={svc.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute top-5 left-5">
        <span
          className="text-white text-[10px] uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
        >
          {svc.tagline || svc.name}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{svc.name}</h3>
        {(svc.duration || svc.processing_time) && (
          <div className="flex items-center gap-4 mb-3 text-white/70 text-xs">
            {svc.duration && <span className="flex items-center gap-1.5"><ClockIcon />{svc.duration}</span>}
            {svc.processing_time && <span className="flex items-center gap-1.5"><BoltIcon />{svc.processing_time}</span>}
          </div>
        )}
        <p className="text-sm text-white/75 mb-5 leading-relaxed line-clamp-2">{svc.description}</p>
        <div className="flex items-center justify-between">
          <a
            href="/booking"
            className="bg-white text-saudi-blue text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-saudi-orange hover:text-white transition-all"
          >
            Apply Now →
          </a>
          <span className="text-2xl font-bold text-white">£{svc.price_usd}</span>
        </div>
      </div>
    </m.div>
  );
}

export default function VisaTypes({ services }: { services: VisaService[] }) {
  const VISIBLE = 3;
  const total = services.length;
  const canSlide = total > VISIBLE;
  const maxIndex = Math.max(0, total - VISIBLE);
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setCurrentIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex]);

  return (
    <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 md:px-6" id="services">
      {/* Section header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-4 md:gap-6">
        <div className="max-w-xl">
          <FadeUp>
            <span className="text-xs font-light text-saudi-orange uppercase tracking-[0.2em]">Our Visa Services</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0A385A] mt-3 md:mt-4">
              Two Pathways into <span className="italic font-bold text-[#da6d3f]">Saudi Arabia.</span>
            </h2>
          </FadeUp>
        </div>
        <FadeUp delay={0.1} className="text-sm text-gray-600 max-w-sm">
          <p>
            Each application is treated as a private journey — curated documents, human attention, and steady communication
            until your visa is in hand.
          </p>
        </FadeUp>
      </div>

      {/* ── Mobile layout: vertical stack ── */}
      <StaggerChildren className="md:hidden flex flex-col gap-5" stagger={0.1}>
        {services.map((svc) => (
          <StaggerItem key={svc.id}>
            <VisaCard svc={svc} height={300} />
          </StaggerItem>
        ))}
        {services.length === 0 && (
          <div className="text-center py-16 text-gray-400">No services configured yet.</div>
        )}
      </StaggerChildren>

      {/* ── Desktop layout: horizontal slider ── */}
      <div className="hidden md:block relative">
        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-in-out"
            style={canSlide ? { transform: `translateX(calc(-${currentIndex * 100 / VISIBLE}% - ${currentIndex * 24 / VISIBLE}px))` } : undefined}
          >
            {services.map((svc) => (
              <div
                key={svc.id}
                style={{
                  width: canSlide ? `calc(${100 / VISIBLE}% - ${(VISIBLE - 1) * 24 / VISIBLE}px)` : `calc(${100 / Math.min(total, VISIBLE)}% - ${(Math.min(total, VISIBLE) - 1) * 24 / Math.min(total, VISIBLE)}px)`,
                  flexShrink: 0,
                }}
              >
                <VisaCard svc={svc} height={480} />
              </div>
            ))}
            {services.length === 0 && (
              <div className="w-full text-center py-20 text-gray-400">No services configured yet.</div>
            )}
          </div>
        </div>

        {canSlide && (
          <div className="flex items-center justify-between mt-10">
            <div className="flex gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className="transition-all rounded-full"
                  style={{ width: currentIndex === i ? '24px' : '8px', height: '8px', background: currentIndex === i ? '#0A385A' : '#d1d5db' }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="w-11 h-11 rounded-full border-2 border-saudi-blue text-saudi-blue flex items-center justify-center hover:bg-saudi-blue hover:text-white transition-all font-bold text-lg disabled:opacity-40"
              >←</button>
              <button
                onClick={next}
                disabled={currentIndex === maxIndex}
                className="w-11 h-11 rounded-full bg-saudi-blue text-white flex items-center justify-center hover:bg-saudi-orange transition-all font-bold text-lg disabled:opacity-40"
              >→</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
