"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

export default function FooterBanner() {
  const pathname = usePathname();
  return (
    <>
      <section className={`relative overflow-hidden ${pathname === "/" ? "rounded-t-[40px] md:rounded-t-[80px]" : "rounded-0"}`}>
        {/* Background image */}
        <img
          src="/images/riyadh-sunset.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* ── TOP BANNER ── */}
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-0 pt-16 md:pt-24 pb-8">
            <div className="max-w-xl">
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-white">
                Now Departing
              </span>

              <h2 className="mb-6 text-[clamp(28px,4vw,56px)] leading-tight font-semibold text-white">
                Your Saudi <br />
                Journey
                <span className="italic font-bold"> Begins Here.</span>
              </h2>

              <p className="mb-10 max-w-lg text-xs leading-relaxed text-white/75">
                Whether you travel for sacred rites or to discover the Kingdom —
                we&apos;ll prepare every document so all that&apos;s left is the flight.
              </p>

              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-[#0A385A] transition hover:text-white hover:bg-saudi-orange hover:text-white hover:scale-105"
              >
                Begin Your Journey →
              </Link>
            </div>
          </div>
        </div>

        {/* ── FOOTER GRID ── */}
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-0 py-12 md:py-16">
            <div className="grid grid-cols-2 gap-8 text-white sm:grid-cols-3 md:grid-cols-5">
              {/* Column 1 */}
              <div className="col-span-2 sm:col-span-3 md:col-span-2">
                <img
                  src="/images/logo.png"
                  alt="Saudi Visa Service"
                  className="mb-4 h-20 md:h-28 w-auto object-contain"
                />
                <p className="text-xs leading-relaxed text-white/80 max-w-[240px]">
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
                        className="text-xs text-white/80 transition hover:text-white"
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
                  Quick Links
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
                        className="text-xs text-white/80 transition hover:text-white"
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

                <ul className="space-y-3 text-xs text-white/80">
                  <li>
                    Visa Operations Center
                    <br />
                    London, United Kingdom
                  </li>
                  <li>
                    <a href="tel:+442036339033" className="hover:text-white transition-colors">Phone: 020 3633 9033</a>
                  </li>
                  <li>
                    <a href="mailto:info@saudivisaservice.co.uk" className="hover:text-white transition-colors">info@saudivisaservice.co.uk</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COPYRIGHT */}
      <div className="gap-3 bg-[#0d2d4e] px-6 md:px-0 py-4 text-xs text-white/70">
      <div className="flex flex-col items-center justify-between sm:flex-row max-w-6xl mx-auto px-4 md:px-0">

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
      </div>
    </>
  );
}
