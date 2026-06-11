'use client';

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion";

const t = { duration: 0.6, ease };

export default function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative flex min-h-screen items-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/man-with-visa.png"
          alt="Hero Background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid gap-8 pb-20 pt-32 md:grid-cols-2">
          {/* Left */}
          <div className="text-white">
            <m.h1
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: 0.1 }}
              className="mb-6 text-[clamp(40px,6vw,72px)] leading-[1.05] font-semibold"
            >
              SAUDI VISA <br />
              APPLICATIONS
            </m.h1>

            <m.p
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: 0.22 }}
              className="mb-8 max-w-[440px] text-base leading-[1.7] text-white/90"
            >
              Professional support for Umrah, Tourist, and Hajj visa
              applications with document guidance, application assistance, and
              status tracking.
            </m.p>

            <m.div
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: 0.34 }}
              style={{ display: 'inline-flex' }}
            >
              <m.div
                whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.2, ease }}
                style={{ display: 'inline-flex' }}
              >
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-[10px] rounded-full bg-white px-8 py-3.5 text-[15px] font-bold text-[#0A385A] transition-all duration-300 hover:bg-[#da6d3f] hover:text-white"
                >
                  Begin Your Journey
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </m.div>
            </m.div>
          </div>

          {/* Right */}
          <m.div
            initial={reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...t, delay: 0.2 }}
            className="flex flex-col justify-end text-white md:text-right"
          >
            <h2 className="mb-4 text-[clamp(28px,4vw,52px)] leading-[1.1] font-semibold">
              Travel <br />
              Made Easy
            </h2>

            <p className="max-w-[280px] text-[13px] leading-[1.7] opacity-90 md:ml-auto">
              Trusted visa experts helping you reach Saudi Arabia with
              confidence and peace of mind.
            </p>
          </m.div>
        </div>
      </div>
    </section>
  );
}
