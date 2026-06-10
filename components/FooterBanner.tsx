"use client";

import Link from "next/link";

export default function FooterBanner() {
  return (
    <>
      <section className="relative overflow-hidden rounded-t-[80px]">
        {/* Background image */}
        <img
          src="/images/riyadh-sunset.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* <div className="inset-0 absolute bg-linear-to-b from-0% from-black/0 to-black/70"/> */}

        {/* ── TOP BANNER ── */}
        <div className="relative z-10 ">
          <div className="max-w-6xl mx-auto px-6 pt-24 py-2">
            <div className="max-w-xl">
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-white">
                Now Departing
              </span>

              <h2 className="mb-6 text-[clamp(32px,4vw,56px)] leading-tight text-white">
                Your Saudi <br />
                Journey
                <span className="italic font-bold ">Begins Here.</span>
              </h2>

              <p className="mb-10 max-w-lg text-xs leading-relaxed text-white/75">
                Whether you travel for sacred rites or to discover the Kingdom —
                we'll prepare every document so all that's left is the flight.
              </p>

              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-[#0A385A] transition hover:bg-[#da6d3f] hover:text-white"
              >
                Begin Your Journey →
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        {/* <div className="relative z-10 border-t border-white/10" /> */}

        {/* ── FOOTER GRID ── */}
        <div className="relative z-10 ">
          <div className="max-w-6xl mx-auto py-16">
            <div className="grid grid-cols-1 text-white md:grid-cols-5">
              {/* Column 1 */}
              <div className="w-64 col-span-2">
                <img
                  src="/images/logo.png"
                  alt="Saudi Visa Service"
                  className="mb-4 w-full h-40"
                />
                <p className="text-xs leading-relaxed text-white">
                  Providing reliable, transparent, and hassle-free Saudi visa
                  services.
                </p>
              </div>

              {/* Column 2 */}
              <div>
                <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">
                  Page
                </h4>
                <ul className="space-y-3">
                  {[
                    { label: "Home", href: "/" },
                    { label: "Visa Services", href: "/services" },
                    { label: "About Us", href: "/about" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Contact Us", href: "/contact" },
                    { label: "Track Booking", href: "/track" },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-xs text-white transition hover:text-white/80"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">
                  Link Direct
                </h4>
                <ul className="space-y-3">
                  {[
                    { label: "Apply for Visa", href: "/booking" },
                    { label: "Track Booking", href: "/track" },
                    { label: "About Us", href: "/about" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Contact Us", href: "/contact" },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-xs text-white transition hover:text-white/80"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4 */}
              <div>
                <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">
                  Contact Info
                </h4>

                <ul className="space-y-3 text-xs text-white">
                  <li>
                    Visa Operations Center
                    <br />
                    Jeddah · Saudi Arabia
                  </li>
                  <li>+966 12 000 0000</li>
                  <li>info@saudivisaservice.com</li>
                  <li>+44 20 1234 5678</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COPYRIGHT */}
      <div className="flex flex-col items-center justify-between gap-3 bg-[#0d2d4e] px-6 py-4 text-xs text-white/70 sm:flex-row">
        <span>© 2026 Saudi Visa Services. All rights reserved.</span>

        <div className="flex gap-5">
          {[
            { label: "Services", href: "/services" },
            { label: "Track", href: "/track" },
            { label: "Contact", href: "/#contact" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="transition hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
