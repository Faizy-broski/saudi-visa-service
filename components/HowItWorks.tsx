'use client';

import { FadeUp, SlideIn, StaggerChildren, StaggerItem } from "@/lib/motion";

const steps = [
  {
    n: "01",
    title: "Choose Visa Type",
    desc: "Choose your visa type and submit your application along with the required documents through our secure process.",
  },
  {
    n: "02",
    title: "We Review & Process",
    desc: "Our experts verify your information, review your documents, and handle the application with professional care.",
  },
  {
    n: "03",
    title: "Get Updates",
    desc: "Track your application progress and receive ongoing support until your visa process is successfully completed.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[linear-gradient(135deg,#3CA5D4_0%,#0E3254_60%,#0a2540_100%)] py-16 text-white"
    >
      {/* Airplane watermark — hidden on mobile */}
      <div className="pointer-events-none absolute left-[-8%] top-[-10%] z-[1] hidden w-[55%] -rotate-[15deg] md:block">
        <img src="/images/airplane-side2.svg" alt="" className="w-full" />
      </div>

      {/* Calligraphy watermark */}
      <div className="pointer-events-none absolute bottom-0 right-[3%] top-0 z-[1] hidden w-1/2 md:block">
        <img
          src="/images/caligraphy.svg"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="max-w-6xl relative z-10 mx-auto px-4 md:px-6">
        {/* Top heading row */}
        <div className="mb-10 grid items-start gap-6 md:mb-16 md:grid-cols-2 md:gap-12">
          <FadeUp>
            <span className="mb-3 block text-xs font-light uppercase tracking-[0.2em] text-[#da6d3f]">
              How It Works
            </span>

            <h2 className="text-3xl leading-tight md:text-4xl">
              A Calm Considered
              <span className="italic font-bold text-[#da6d3f]">
                {" "}
                Three-Steps Path.
              </span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.1} className="md:pt-2">
            <p className="text-sm leading-relaxed text-white/75">
              Our streamlined process is designed to guide you through every
              stage, from application submission to final updates, with
              professional support and complete transparency.
            </p>
          </FadeUp>
        </div>

        {/* Bottom content row */}
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
          {/* Left: Documents card */}
          <SlideIn direction="left">
            <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.95)_0%,rgba(220,235,248,0.90)_100%)] p-6 text-[#0A385A] md:p-8">
              <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-[#da6d3f]">
                Required Documents
              </span>

              <h3 className="mb-1 text-xl font-bold text-[#0A385A] md:text-2xl">
                Everything You Need,
              </h3>

              <h3 className="mb-6 text-xl font-bold italic text-[#da6d3f] md:mb-8 md:text-2xl">
                Prepared Correctly.
              </h3>

              <ul className="relative z-10 space-y-3 md:space-y-4">
                {[
                  "Valid passport (6+ months)",
                  "Supporting documents per visa type",
                  "Recent passport photographs",
                  "Travel itinerary details",
                  "Accommodation confirmation",
                  "Vaccination records (if required)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-[#0A385A]"
                  >
                    <span className="text-base text-[#da6d3f]">✔</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pointer-events-none absolute bottom-0 right-0 z-10">
                <img src="/images/caligraphy.svg" alt="" className="w-full" />
              </div>
            </div>
          </SlideIn>

          {/* Right: Steps timeline */}
          <div className="relative pl-[10px]">
            {/* Vertical connecting line */}
            <div className="absolute bottom-8 left-[46px] top-8 w-[2px] bg-white/15" />

            <StaggerChildren stagger={0.15} delay={0.1}>
              {steps.map((step, i) => (
                <StaggerItem
                  key={step.n}
                  className={`relative flex items-start gap-6 ${i !== steps.length - 1 ? "pb-12" : ""}`}
                >
                  {/* Timeline */}
                  <div className="relative flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border text-lg font-bold ${i === 0 ? "border-white bg-white text-[#0E3254] shadow-[0_0_30px_rgba(255,255,255,0.25)]" : "border-white/20 bg-white/10 text-white backdrop-blur-md"}`}
                    >
                      {step.n}

                      {/* Glow ring */}
                      <div
                        className={`absolute inset-0 rounded-full ${i === 0 ? "ring-4 ring-white/20" : ""}`}
                      />
                    </div>

                    {/* Connector */}
                    {i !== steps.length - 1 && (
                      <div className="h-12 w-[2px] bg-gradient-to-b from-white/40 via-white/20 to-white/5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <h4 className="mb-2 text-xl font-bold text-white">
                      {step.title}
                    </h4>

                    <p className="text-sm leading-7 text-white/70">{step.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </div>
    </section>
  );
}
