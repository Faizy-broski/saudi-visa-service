'use client';

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { SlideIn, ease } from "@/lib/motion";

export default function AboutSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="max-w-6xl relative z-10 mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Left: Visa card */}
          <SlideIn direction="left" className="relative z-20 flex justify-center md:justify-start">
            <img
              alt="Saudi Visa Illustration"
              src="/images/saudi-visa-card2.svg"
              className="w-full max-w-[440px] md:w-[90%]"
            />
          </SlideIn>

          {/* Right: Text */}
          <SlideIn direction="right">
            <span className="text-xs font-light uppercase tracking-[0.2em] text-[#da6d3f]">
              About Us
            </span>

            <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#0A385A] md:text-4xl">
              Turning Saudi Travel
              <span className="italic font-bold text-[#da6d3f]">
                {" "}
                Plans Into Reality.
              </span>
            </h2>

            {/* Hajj removed from text: original mentioned "Umrah, Hajj, tourism, business, or family visits" */}
            <p className="my-5 text-sm leading-relaxed text-gray-600 md:my-6">
              From the moment you decide to visit Saudi Arabia, we&apos;re here
              to help. Whether you&apos;re travelling for Umrah, tourism,
              business, or family visits, our dedicated team guides you through
              every stage of the visa process, ensuring a smooth and hassle-free
              experience from application to approval.
            </p>

            <m.div
              whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.2, ease }}
              style={{ display: 'inline-flex' }}
            >
              <Link
                href="#application"
                className="inline-flex items-center gap-[10px] rounded-full bg-[linear-gradient(to_right,#3CA5D4,#0E3254)] px-7 py-3 text-sm font-bold text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Begin Your Journey →
              </Link>
            </m.div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}
