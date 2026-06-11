'use client';

import { m, useReducedMotion } from "framer-motion";
import { FadeUp, StaggerChildren, StaggerItem, viewportOnce, transition } from "@/lib/motion";

const TRUST_CARDS = [
  {
    num: "01",
    title: "Professional Guidance",
    desc: "Senior advisors walk you through every requirement, in plain language.",
  },
  {
    num: "02",
    title: "Application Accuracy",
    desc: "Every form, every document, reviewed before it ever leaves your hands.",
  },
  {
    num: "03",
    title: "Fast Communication",
    desc: "Replies measured in hours, not days — across every time zone.",
  },
  {
    num: "04",
    title: "Dedicated Support",
    desc: "One point of contact from the first message to the moment you board.",
  },
];

// Visual card styles (no absolute positioning — that lives on the motion wrapper)
const cardVisual = `
  w-sm
  rounded-3xl
  border border-[#f3c6b5]
  bg-white
  p-8
  shadow-[0_25px_40px_rgba(0,0,0,0.12)]
  transition-all duration-300
  hover:-translate-y-3
  hover:shadow-[0_35px_60px_rgba(0,0,0,0.18)]
`;

export default function TrustSection() {
  const reduce = useReducedMotion();
  const cardInit = reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
  const cardVisible = { opacity: 1, y: 0 };

  return (
    <section
      className="relative overflow-hidden bg-white py-20"
      id="trust"
    >
      {/* Heading */}
      <div className="max-w-6xl relative z-10 mx-auto mb-10 px-4 text-center md:mb-12 md:px-6">
        <FadeUp>
          <span className="text-xs font-light uppercase tracking-[0.2em] text-[#da6d3f]">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-[#0A385A] md:text-4xl">
            Stamped With Trust{" "}
            <span className="italic text-[#da6d3f] font-bold">
              And <br /> Quiet Precision.
            </span>
          </h2>
        </FadeUp>
      </div>

      {/* ── Mobile: simple 2-col card grid ── */}
      <StaggerChildren className="md:hidden max-w-6xl mx-auto px-4 md:px-6" stagger={0.1}>
        <div className="grid grid-cols-2 gap-4 mb-10">
          {TRUST_CARDS.map((c) => (
            <StaggerItem key={c.num}>
              <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="absolute right-1 top-0 text-[48px] font-black leading-none text-[#da6d3f]/15">
                  {c.num}
                </div>
                <div className="relative z-10">
                  <h4
                    className="font-bold text-sm mb-1.5"
                    style={{ color: "#0A385A" }}
                  >
                    {c.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerChildren>

      {/* ── Desktop: airplane with floating cards ── */}
      <div className="relative mx-auto hidden min-h-[460px] max-w-6xl px-4 md:px-6 md:block">
        {/* Airplane centered background */}
        <m.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-full max-w-full -translate-x-1/2 -translate-y-[44%]"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ ...transition, delay: 0.2 }}
        >
          <img
            alt="Airplane"
            src="/images/airplane-front.svg"
            className="w-full"
            style={{ opacity: 1 }}
          />
        </m.div>

        <div className="relative z-10" style={{ minHeight: "460px" }}>
          {/* Card 01 — top left */}
          <m.div
            className="absolute top-2 left-0"
            initial={cardInit}
            whileInView={cardVisible}
            viewport={viewportOnce}
            transition={{ ...transition, delay: 0 }}
          >
            <div className={`${cardVisual} -rotate-[5deg]`}>
              <div className="absolute -right-10 top-1/2 -translate-1/2 z-0 text-[100px] font-black leading-none text-[#da6d3f]/10">
                01
              </div>
              <div className="relative z-10">
                <h4 className="font-semibold text-lg mb-1 text-[#0A385A]">
                  Professional Guidance
                </h4>
                <p className="text-xs text-gray-500">
                  Senior advisors walk you through every requirement, in plain
                  language.
                </p>
              </div>
            </div>
          </m.div>

          {/* Card 04 — top right */}
          <m.div
            className="absolute top-2 right-0"
            initial={cardInit}
            whileInView={cardVisible}
            viewport={viewportOnce}
            transition={{ ...transition, delay: 0.1 }}
          >
            <div className={`${cardVisual} rotate-[5deg]`}>
              <div className="absolute -right-10 top-1/2 -translate-1/2 z-0 text-[100px] font-black leading-none text-[#da6d3f]/10">
                04
              </div>
              <div className="relative z-10">
                <h4 className="font-semibold text-lg mb-1 text-[#0A385A]">
                  Dedicated Support
                </h4>
                <p className="text-xs text-gray-500">
                  One point of contact from the first message to the moment you
                  board.
                </p>
              </div>
            </div>
          </m.div>

          {/* Card 02 — middle left */}
          <m.div
            className="absolute top-[126px] left-20"
            initial={cardInit}
            whileInView={cardVisible}
            viewport={viewportOnce}
            transition={{ ...transition, delay: 0.2 }}
          >
            <div className={`${cardVisual} rotate-[3deg]`}>
              <div className="absolute -right-10 top-1/2 -translate-1/2 z-0 text-[100px] font-black leading-none text-[#da6d3f]/10">
                02
              </div>
              <div className="relative z-10">
                <h4 className="font-semibold text-lg mb-1 text-[#0A385A]">
                  Application Accuracy
                </h4>
                <p className="text-xs text-gray-500">
                  Every form, every document, reviewed before it ever leaves your
                  hands.
                </p>
              </div>
            </div>
          </m.div>

          {/* Card 03 — middle right */}
          <m.div
            className="absolute top-[126px] right-20"
            initial={cardInit}
            whileInView={cardVisible}
            viewport={viewportOnce}
            transition={{ ...transition, delay: 0.3 }}
          >
            <div className={`${cardVisual} -rotate-[3deg]`}>
              <div className="absolute -right-10 top-1/2 -translate-1/2 z-0 text-[100px] font-black leading-none text-[#da6d3f]/10">
                03
              </div>
              <div className="relative z-10">
                <h4 className="font-semibold text-lg mb-1 text-[#0A385A]">
                  Fast Communication
                </h4>
                <p className="text-xs text-gray-500">
                  Replies measured in hours, not days — across every time zone.
                </p>
              </div>
            </div>
          </m.div>
        </div>
      </div>

      {/* Footer CTA */}
      <FadeUp className="text-center mt-8 md:mt-16 relative z-10 px-4">
        <p className="mx-auto mb-6 max-w-lg text-sm italic text-gray-400 md:mb-8">
          We treat visa applications the way private banks treat portfolios —
          with care, discretion, and unmistakable attention to detail.
        </p>
        <m.div
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-flex' }}
        >
          <a
            href="#application"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#3CA5D4] to-[#0E3254] px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            Apply For Visa Service →
          </a>
        </m.div>
      </FadeUp>
    </section>
  );
}
