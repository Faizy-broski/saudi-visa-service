export default function HowItWorks() {
  return (
    <section
      className="relative text-white overflow-hidden"
      id="how-it-works"
      style={{ padding: '64px 0', background: 'linear-gradient(135deg, #3CA5D4 0%, #0E3254 60%, #0a2540 100%)' }}
    >
      {/* Airplane watermark — hidden on mobile */}
      <div
        className="hidden md:block absolute z-0 pointer-events-none"
        style={{ left: '-8%', top: '-10%', width: '55%', opacity: 0.10, transform: 'rotate(-15deg)' }}
      >
        <img src="/images/airplane-front.png" alt="" className="w-full" />
      </div>

      {/* Visa card watermark — hidden on mobile */}
      <div
        className="hidden md:block absolute z-0 pointer-events-none"
        style={{ right: '-2%', top: 0, bottom: 0, width: '50%', opacity: 0.06 }}
      >
        <img src="/images/saudi-visa-card2.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Top heading row */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start mb-10 md:mb-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: '#da6d3f' }}>How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              A Calm Considered
              <span className="italic" style={{ color: '#da6d3f' }}> Three-Steps Path.</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed md:pt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Our streamlined process is designed to guide you through every stage, from application submission to final updates, with professional support and complete transparency.
          </p>
        </div>

        {/* Bottom content row */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">

          {/* Left: Documents card */}
          <div
            className="rounded-3xl p-6 md:p-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(220,235,248,0.90) 100%)', color: '#0A385A' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest mb-4 block" style={{ color: '#da6d3f' }}>Required Documents</span>
            <h3 className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#0A385A' }}>Everything You Need,</h3>
            <h3 className="text-xl md:text-2xl font-bold italic mb-6 md:mb-8" style={{ color: '#da6d3f' }}>Prepared Correctly.</h3>

            <ul className="space-y-3 md:space-y-4 relative z-10">
              {[
                'Valid passport (6+ months)',
                'Supporting documents per visa type',
                'Recent passport photographs',
                'Travel itinerary details',
                'Accommodation confirmation',
                'Vaccination records (if required)',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium" style={{ color: '#0A385A' }}>
                  <span style={{ color: '#da6d3f', fontSize: '16px' }}>✔</span> {item}
                </li>
              ))}
            </ul>

            <div className="absolute bottom-0 right-0 w-28 md:w-36 pointer-events-none">
              <img src="/images/saudi-visa-card2.png" alt="" className="w-full" style={{ opacity: 0.7 }} />
            </div>
          </div>

          {/* Right: Steps timeline */}
          <div className="relative" style={{ paddingLeft: '10px' }}>

            {/* Vertical connecting line */}
            <div
              className="absolute"
              style={{ left: '46px', top: '32px', bottom: '32px', width: '2px', background: 'rgba(255,255,255,0.15)' }}
            />

            {[
              { n: '01', title: 'Choose Visa Type', desc: 'Choose your visa type and submit your application along with the required documents through our secure process.', opacity: 1, bgOpacity: '0.20', borderOpacity: '0.80' },
              { n: '02', title: 'We Review & Process', desc: 'Our experts verify your information, review your documents, and handle the application with professional care.', opacity: 0.75, bgOpacity: '0.10', borderOpacity: '0.40' },
              { n: '03', title: 'Get Updates', desc: 'Track your application progress and receive ongoing support until your visa process is successfully completed.', opacity: 0.55, bgOpacity: '0.07', borderOpacity: '0.25' },
            ].map((step, i) => (
              <div key={step.n} className={`flex gap-5 md:gap-6 items-start ${i < 2 ? 'mb-10 md:mb-12' : ''} relative`} style={{ opacity: step.opacity }}>
                <div
                  className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm md:text-base relative z-10"
                  style={{ background: `rgba(255,255,255,${step.bgOpacity})`, border: `2px solid rgba(255,255,255,${step.borderOpacity})`, backdropFilter: 'blur(4px)' }}
                >
                  {step.n}
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">{step.title}</h4>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
