'use client';

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion";
import HeroLeadForm from "@/components/HeroLeadForm";

const t = { duration: 0.6, ease };

export default function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative flex min-h-screen items-center">
      {/* Background */}
      {/* <div className="absolute inset-0 z-0">
        <img
          src="/images/man-with-visa.png"
          alt="Hero Background"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55 md:bg-transparent md:[background:linear-gradient(to_right,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.48)_55%,rgba(0,0,0,0.18)_100%)]" />
      </div> */}
      <div className="absolute inset-0 z-0 overflow-hidden">
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="h-full w-full object-cover object-center"
    >
      <source src="/saudivisa-service.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/55 md:bg-transparent md:[background:linear-gradient(to_right,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.48)_55%,rgba(0,0,0,0.18)_100%)]" />
  </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 md:px-0">
        <div className="grid gap-8 pb-20 pt-32 md:grid-cols-2">
          {/* Left */}
          <div className="text-white">
            <m.h1
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: 0.1 }}
              className="mb-5 text-[clamp(36px,6vw,72px)] leading-[1.05] font-semibold"
            >
              SAUDI VISA <br />
              APPLICATIONS
            </m.h1>

            {/* Hajj removed: original text included "Umrah, Tourist, and Hajj visa" */}
            <m.p
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: 0.22 }}
              className="mb-8 max-w-[440px] text-sm md:text-base leading-[1.8] text-white/90"
            >
              Professional support for Umrah and Tourist visa
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
                  className="group inline-flex items-center gap-[10px] rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-[#0A385A] transition-all duration-300 hover:bg-[#da6d3f] hover:text-white"
                >
                  Begin Your Journey
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </m.div>
            </m.div>
          </div>

          {/* Right — lead gen form */}
          <div className="flex flex-col justify-center md:justify-end">
            <HeroLeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
