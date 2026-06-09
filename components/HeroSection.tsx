import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center" id="home">
      {/* Background image fills full viewport including behind navbar */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Hero Background"
          className="w-full h-full object-cover"
          src="/images/man-with-visa.png"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A385A]/60 to-transparent"></div>
      </div>

      {/* Content — padded top so text sits below navbar visually */}
      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-8 pt-32 pb-20">
        {/* Left: Heading + CTA */}
        <div className="text-white">
          <h1
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: 'clamp(44px,6vw,72px)',
              lineHeight: 1.05,
              marginBottom: '24px',
              color: '#fff',
            }}
          >
            SAUDI VISA <br /> APPLICATIONS
          </h1>
          <p
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: '16px',
              lineHeight: 1.7,
              marginBottom: '32px',
              maxWidth: '440px',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Professional support for Umrah, Tourist, and Hajj visa applications
            with document guidance, application assistance, and status tracking.
          </p>
          <Link
            href="/services"
            className="group inline-flex items-center gap-[10px] hover:bg-[#da6d3f] hover:text-white transition-all duration-[0.25s]"
            style={{
              background: '#ffffff',
              color: '#0A385A',
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 700,
              padding: '14px 32px',
              borderRadius: '9999px',
              fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            Begin Your Journey <span style={{ fontSize: '18px' }}>→</span>
          </Link>
        </div>

        {/* Right: Travel Made Easy */}
        <div className="flex flex-col justify-end text-right text-white">
          <h2
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: 'clamp(32px,4vw,52px)',
              marginBottom: '16px',
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            Travel <br /> Made Easy
          </h2>
          <p
            style={{
              fontFamily: "'Poppins',sans-serif",
              maxWidth: '280px',
              marginLeft: 'auto',
              fontSize: '13px',
              opacity: 0.88,
              lineHeight: 1.7,
            }}
          >
            Trusted visa experts helping you reach Saudi Arabia with confidence
            and peace of mind.
          </p>
        </div>
      </div>
    </section>
  );
}
