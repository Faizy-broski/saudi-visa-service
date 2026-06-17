'use client';

import { Quote } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/lib/motion";

const testimonials = [
  {
    quote:
      '"Their guidance made the entire process feel calm. Every document was reviewed with care."',
    initial: "A",
    name: "Ayesha R.",
    role: "Umrah Applicant",
    offset: "md:mt-8",
  },
  {
    quote:
      '"Responsive, clear, and incredibly professional. I knew exactly what to do at every step."',
    initial: "M",
    name: "Mohammed K.",
    role: "Tourist Visa",
    offset: "md:mt-4",
  },
  {
    quote:
      '"The most reassuring service I\'ve experienced. They treated my application with real respect."',
    initial: "F",
    name: "Fatima S.",
    role: "Hajj Applicant",
    offset: "md:mt-8",
  },
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* Left background image — hidden on mobile */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden md:block">
        <img
          src="/images/hajj-pilgrims.svg"
          alt=""
          className="h-full w-full object-cover object-right"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
        <FadeUp className="mb-10 text-center md:mb-16">
          <span className="text-xs font-light uppercase tracking-[0.2em] text-[#da6d3f]">
            Client Testimonials
          </span>

          <h2 className="mt-4 text-3xl font-semibold text-[#0A385A] md:text-4xl">
            What Ours{" "}
            <span className="italic font-bold text-[#da6d3f]">
              Customers <br />
              Says.
            </span>
          </h2>
        </FadeUp>

        <StaggerChildren
          className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8"
          stagger={0.12}
        >
          {testimonials.map((t) => (
            <StaggerItem
              key={t.name}
              className={t.offset}
            >
              <div
                className="
                  flex flex-col justify-between rounded-3xl
                  border border-[#f2d8cf]
                  bg-white/30 p-6 md:p-8
                  shadow-[0_10px_30px_rgba(0,0,0,0.08)]
                  transition-all duration-300 ease-out
                  hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]
                "
              >
                <div>
                  <Quote className="text-[#da6d3f] opacity-50" />

                  <p className="mb-6 text-sm leading-relaxed text-gray-600 md:mb-8">
                    {t.quote}
                  </p>

                  <div className="mb-6 border-b border-gray-100" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(to_right,#3CA5D4,#0E3254)] text-xs font-bold text-white">
                    {t.initial}
                  </div>

                  <div>
                    <div className="text-sm font-semibold">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
