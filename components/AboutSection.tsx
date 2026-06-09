import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="bg-white overflow-hidden relative" style={{ padding: '0 0 0 0' }}>

      {/* Arab man — hidden on mobile to avoid overflow */}
      <div className="hidden md:block absolute right-0 z-0 pointer-events-none" style={{ top: 0, height: 'auto', width: '53%' }}>
        <img
          src="/images/arab-man-luggage.jpg"
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transform: 'scaleX(-1)',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.28) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.28) 100%)',
            filter: 'grayscale(10%) opacity(0.28)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">

          {/* Left: Visa card */}
          <div style={{ position: 'relative', zIndex: 20 }}>
            <img
              alt="Saudi Visa Illustration"
              src="/images/saudi-visa-card2.png"
              className="w-full md:w-[85%]"
              style={{
                maxWidth: '485px',
                marginBottom: '0',
                filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.10))',
              }}
            />
            {/* Negative margin only on desktop */}
            <style>{`@media(min-width:768px){.visa-card-img{margin-bottom:-100px!important}}`}</style>
          </div>

          {/* Right: Text */}
          <div className="pt-2 pb-10 md:pb-0">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#da6d3f' }}>About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 leading-tight" style={{ color: '#0A385A' }}>
              Turning Saudi Travel
              <span className="italic" style={{ color: '#da6d3f' }}> Plans Into Reality.</span>
            </h2>
            <p className="text-gray-600 my-5 md:my-6 leading-relaxed text-sm">
              From the moment you decide to visit Saudi Arabia, we&apos;re here to help. Whether you&apos;re travelling for Umrah,
              Hajj, tourism, business, or family visits, our dedicated team guides you through every stage of the visa
              process, ensuring a smooth and hassle-free experience from application to approval.
            </p>
            <Link
              href="#application"
              style={{
                background: 'linear-gradient(to right, #3CA5D4, #0E3254)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Begin Your Journey →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
