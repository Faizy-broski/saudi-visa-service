import Link from "next/link";

export default function HeroSection() {
  return (
    <section id="home" className=" relative flex min-h-screen items-center">
      <div className="max-w-6xl mx-auto">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/man-with-visa.png"
            alt="Hero Background"
            className="h-full w-full object-cover"
          />

          {/* <div className="absolute inset-0 bg-gradient-to-r from-[#0A385A]/60 to-transparent" /> */}
        </div>

        {/* Content */}
        <div className="relative z-10 grid gap-8 pb-20 pt-32 md:grid-cols-2">
          {/* Left */}
          <div className="text-white">
            <h1 className="mb-6 text-[clamp(44px,6vw,72px)] leading-[1.05] font-semibold">
              SAUDI VISA <br />
              APPLICATIONS
            </h1>

            <p className="mb-8 max-w-[440px] text-base leading-[1.7] text-white/90">
              Professional support for Umrah, Tourist, and Hajj visa
              applications with document guidance, application assistance, and
              status tracking.
            </p>

            <Link
              href="/services"
              className="group inline-flex items-center gap-[10px] rounded-full bg-white px-8 py-3.5 text-[15px] font-bold text-[#0A385A] transition-all duration-300 hover:bg-[#da6d3f] hover:text-white"
            >
              Begin Your Journey
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-end text-white md:text-right">
            <h2 className="mb-4 text-[clamp(32px,4vw,52px)] leading-[1.1] font-semibold">
              Travel <br />
              Made Easy
            </h2>

            <p className="max-w-[280px] text-[13px] leading-[1.7] opacity-90 md:ml-auto">
              Trusted visa experts helping you reach Saudi Arabia with
              confidence and peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
