'use client';

import Link from "next/link";

export default function FooterBanner() {
  return (
    <>
      {/* Single section: riyadh-sunset.png covers BOTH banner + footer grid */}
      <section className="relative overflow-hidden" style={{ borderTopLeftRadius: '0px', borderTopRightRadius: '0px' }}>

        {/* Absolute background image — covers the entire section */}
        <img
          src="/images/riyadh-sunset.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 0,
          }}
        />

        {/* ── TOP BANNER AREA ── */}
        <div className="relative z-10" style={{ background: 'rgba(10,56,90,0.72)' }}>
          <div className="container mx-auto px-6 py-24 relative z-10">
            <div className="max-w-xl">
              <span
                className="text-xs font-bold uppercase tracking-[0.2em] block mb-4"
                style={{ color: '#ffffff' }}
              >
                Now Departing
              </span>
              <h2
                className="font-bold leading-tight mb-6"
                style={{ fontSize: 'clamp(32px,4vw,56px)', color: '#ffffff' }}
              >
                Your Saudi Journey <br />
                <span className="italic" style={{ color: '#ffffff' }}>Begins Here.</span>
              </h2>
              <p className="text-sm mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '420px' }}>
                Our team is ready to guide you through every step of your Saudi visa application — from the first document to the final stamp.
              </p>
              <Link
                href="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#ffffff',
                  color: '#0A385A',
                  fontWeight: 700,
                  padding: '14px 32px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Begin Your Journey →
              </Link>
            </div>
          </div>
        </div>

        {/* Thin divider between banner and footer grid */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', position: 'relative', zIndex: 10 }} />

        {/* ── FOOTER GRID AREA ── (same background continues) */}
        <div className="relative z-10" style={{ background: 'rgba(10,56,90,0.88)' }}>
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-white">

              {/* Column 1: Logo + description */}
              <div>
                <img
                  src="/images/logo.png"
                  alt="Saudi Visa Service"
                  style={{ height: '60px', marginBottom: '16px' }}
                />
                <p className="text-sm leading-relaxed" style={{ color: '#ffffff' }}>
                  Professional visa assistance for Saudi Arabia — Umrah, Hajj, Tourist, Business, and Family visas handled with care.
                </p>
              </div>

              {/* Column 2: Page links */}
              <div>
                <h4 className="font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.70)' }}>Pages</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'Visa Services', href: '/services' },
                    { label: 'About Us', href: '/about' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Contact Us', href: '/contact' },
                    { label: 'Track Booking', href: '/track' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm transition-colors" style={{ color: '#ffffff' }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Direct links */}
              <div>
                <h4 className="font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.70)' }}>Quick Links</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'Apply for Visa', href: '/booking' },
                    { label: 'Track Booking', href: '/track' },
                    { label: 'About Us', href: '/about' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Contact Us', href: '/contact' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm transition-colors" style={{ color: '#ffffff' }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Contact info */}
              <div>
                <h4 className="font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.70)' }}>Contact</h4>
                <ul className="space-y-3 text-sm" style={{ color: '#ffffff' }}>
                  <li>Visa Operations Center<br />Jeddah · Saudi Arabia</li>
                  <li>+966 12 000 0000</li>
                  <li>info@saudivisaservice.com</li>
                  <li>+44 20 1234 5678</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Copyright bar — solid dark blue, below the section */}
      <div
        className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        style={{ background: '#0d2d4e', color: 'rgba(255,255,255,0.70)' }}
      >
        <span>© 2026 Saudi Visa Services. All rights reserved.</span>
        <div className="flex gap-5">
          {[
            { label: 'Services', href: '/services' },
            { label: 'Track', href: '/track' },
            { label: 'Contact', href: '/#contact' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
