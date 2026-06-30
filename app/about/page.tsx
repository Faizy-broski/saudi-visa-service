import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import PageHero from '@/components/PageHero';
import Link from 'next/link';

const STATS = [
  { value: '10,000+', label: 'Visas Processed' },
  { value: '98%',     label: 'Approval Rate' },
  { value: '5+',      label: 'Years Experience' },
  { value: '50+',     label: 'Countries Served' },
];

const VALUES = [
  {
    title: 'Integrity',
    desc: 'We handle every application with complete transparency. No hidden fees, no false promises — just honest guidance from start to finish.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Speed',
    desc: 'Our streamlined process and direct government relationships mean your application moves faster than standard channels.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: 'Expertise',
    /* Hajj removed: original said "Umrah, Hajj, and tourism categories" */
    desc: 'Our consultants have processed thousands of Saudi visas across Umrah and tourism categories. We know every requirement inside out.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    title: 'Support',
    desc: 'From document preparation to post-approval queries, our support team stays with you throughout the entire journey.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const SERVICES_OVERVIEW = [
  {
    name: 'Umrah Visa',
    slug: 'umrah',
    desc: 'Year-round access for pilgrims. We handle every document, every step, so you can focus on the spiritual journey ahead.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <path d="M12 2C9 2 6 4.5 6 8c0 2.5 1.5 4.5 3 5.5V16h6v-2.5c1.5-1 3-3 3-5.5 0-3.5-3-6-6-6z" />
        <path d="M9 16v1a3 3 0 0 0 6 0v-1" />
        <line x1="4" y1="22" x2="20" y2="22" />
        <line x1="2" y1="19" x2="22" y2="19" />
      </svg>
    ),
    href: '/services/umrah',
  },
  {
    name: 'Tourist Visa',
    slug: 'tourist',
    desc: 'Explore AlUla, Riyadh, the Red Sea and beyond. Fast processing for short and extended stays with multi-entry options.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    href: '/services/tourist',
  },
  // Hajj Visa removed:
  // {
  //   name: 'Hajj Visa',
  //   slug: 'hajj',
  //   desc: 'Seasonal pilgrimage processing supported by consultants who understand every religious and governmental requirement.',
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
  //       <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
  //       <path d="M19 3l1 1" />
  //       <circle cx="19.5" cy="3.5" r="0.5" fill="currentColor" />
  //     </svg>
  //   ),
  //   href: '/services/hajj',
  // },
];

const TIMELINE = [
  { year: '2019', event: 'Founded in Jeddah with a small team of 3 passionate visa consultants.' },
  /* Hajj removed: original said "Expanded services to cover Hajj and Tourist visas" */
  { year: '2021', event: 'Expanded services to cover Tourist visas; processed 1,000+ applications.' },
  { year: '2023', event: 'Launched online booking platform serving clients across 50+ countries.' },
  { year: '2025', event: '10,000+ successful applications and growing with a 98% approval rate.' },
];

export default function AboutPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <PageHero
        tag="About Us"
        title="Simplifying Saudi Arabia, One Visa at a Time"
        subtitle="Founded by visa professionals with deep roots in Saudi government relations, we've built the most trusted visa service platform for UK and international travellers heading to the Kingdom."
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
      />

      {/* Stats bar */}
      <section style={{ background: '#0A385A' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="py-8 md:py-10 text-center text-white"
              >
                <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#3CA5D4' }}>{value}</div>
                <div className="text-[10px] md:text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission + Story */}
      <section className="py-16 md:py-24" style={{ background: '#f8fbff' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] block mb-4 text-[#da6d3f]">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 leading-tight text-[#0A385A]">
                Making Saudi Arabia accessible to the world
              </h2>
              <p className="text-sm leading-relaxed mb-5 text-gray-600">
                We started Saudi Visa Service because we saw how unnecessarily complicated the visa process was for ordinary travellers. Long queues, confusing paperwork, and unreliable agents left people frustrated before their journey even began.
              </p>
              <p className="text-sm leading-relaxed mb-8 text-gray-600">
                Our platform simplifies the entire process — from choosing the right visa to tracking your application in real time. We combine technology with human expertise to deliver results that are fast, accurate, and stress-free.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-full text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(to right, #3CA5D4, #0E3254)' }}
              >
                Start Your Application →
              </Link>
            </div>
            <div className="space-y-4">
              {TIMELINE.map(({ year, event }) => (
                <div key={year} className="flex gap-5 items-start">
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm"
                    style={{ background: '#0A385A', color: '#ffffff' }}
                  >
                    {year}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm leading-relaxed text-gray-700">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] block mb-4 text-[#da6d3f]">What We Stand For</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0A385A]">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ title, desc, icon }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-[#eef2f7]"
                style={{ background: '#f8fbff' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: '#0A385A', color: '#ffffff' }}
                >
                  {icon}
                </div>
                <h3 className="font-semibold text-base mb-2 text-[#0A385A]">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="py-16 md:py-24" style={{ background: '#f8fbff' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] block mb-4 text-[#da6d3f]">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0A385A]">Our Visa Services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES_OVERVIEW.map(({ name, desc, icon, href }) => (
              <Link
                key={name}
                href={href}
                className="p-8 rounded-2xl bg-white border border-[#eef2f7] group transition-shadow hover:shadow-[0_8px_32px_rgba(10,56,90,0.10)]"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: '#0A385A', color: '#ffffff' }}
                >
                  {icon}
                </div>
                <h3 className="font-semibold text-lg mb-3 text-[#0A385A]">{name}</h3>
                <p className="text-sm leading-relaxed mb-5 text-gray-600">{desc}</p>
                <span className="text-xs font-bold" style={{ color: '#da6d3f' }}>Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16 md:py-20 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #0A385A 0%, #3CA5D4 100%)' }}
      >
        <div className="max-w-xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Ready to Begin?</h2>
          <p className="text-sm mb-10 leading-relaxed text-white/75">
            Join thousands of travellers who trust us with their Saudi visa. Apply today and get a decision in as little as 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-full transition-all hover:opacity-90"
              style={{ background: '#ffffff', color: '#0A385A' }}
            >
              Apply for Visa →
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-full transition-all hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <FooterBanner />
    </>
  );
}
