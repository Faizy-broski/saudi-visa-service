'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home',       href: '/',        anchor: null },
  { label: 'About Us',   href: '/about',   anchor: null },
  { label: 'Services',   href: '/services',anchor: null },
  { label: 'Track',      href: '/track',   anchor: null },
  { label: 'FAQ',        href: '/faq',     anchor: null },
  { label: 'Contact Us', href: '/contact', anchor: null },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solid = !isHome || scrolled;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string | null) => {
    if (!anchor) return;
    if (isHome) {
      e.preventDefault();
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuOpen(false);
    }
  };

  return (
    <header
      id="main-navbar"
      className="fixed left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: solid ? 'linear-gradient(to right, #3CA5D4, #0E3254)' : 'transparent',
        top: solid ? '0px' : '32px',
      }}
    >
      <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <img alt="Saudi Visa Service" src="/images/logo.png" style={{ height: '70px', flexShrink: 0 }} />
        </Link>

        {/* Desktop nav pill */}
        <div
          className="hidden md:flex items-center"
          style={{
            background: 'rgba(255,255,255,0.09)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '9999px',
            padding: '4px',
            gap: '2px',
          }}
        >
          {NAV_ITEMS.map(({ label, href, anchor }) => {
            const isActive = anchor
              ? false
              : label === 'Home'
              ? pathname === '/'
              : pathname.startsWith(href);

            return (
              <Link
                key={label}
                href={href}
                onClick={(e) => handleAnchorClick(e, anchor)}
                style={{
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0A385A' : 'rgba(255,255,255,0.88)',
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  borderRadius: '9999px',
                  padding: '7px 18px',
                  fontSize: '13.5px',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.88)';
                }}
              >
                {label}
              </Link>
            );
          })}

          {/* Apply Now button — white, stays white on hover */}
          <Link
            href="/booking"
            style={{
              background: '#ffffff',
              color: '#0A385A',
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 700,
              borderRadius: '9999px',
              padding: '7px 22px',
              fontSize: '13.5px',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              marginLeft: '6px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Apply Booking →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 rounded-full bg-white transition-all" style={{ transformOrigin: 'center', transform: menuOpen ? 'translateY(8px) rotate(45deg)' : 'none' }} />
          <span className="block w-6 h-0.5 rounded-full bg-white transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-6 h-0.5 rounded-full bg-white transition-all" style={{ transformOrigin: 'center', transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ background: '#0E3254', borderColor: 'rgba(255,255,255,0.12)' }}>
          {NAV_ITEMS.map(({ label, href, anchor }) => (
            <Link
              key={label}
              href={href}
              onClick={(e) => { handleAnchorClick(e, anchor); setMenuOpen(false); }}
              className="block px-6 py-3 text-sm border-b"
              style={{
                color: pathname === href ? '#ffffff' : 'rgba(255,255,255,0.75)',
                borderColor: 'rgba(255,255,255,0.08)',
                fontWeight: pathname === href ? 600 : 400,
              }}
            >
              {label}
            </Link>
          ))}
          <div className="p-4">
            <Link
              href="/booking"
              onClick={() => setMenuOpen(false)}
              className="block text-center py-3 rounded-full text-sm font-bold"
              style={{ background: '#ffffff', color: '#0A385A' }}
            >
              Apply Booking →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
