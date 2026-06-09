const TRUST_CARDS = [
  { num: '01', title: 'Professional Guidance',  desc: 'Senior advisors walk you through every requirement, in plain language.' },
  { num: '02', title: 'Application Accuracy',   desc: 'Every form, every document, reviewed before it ever leaves your hands.' },
  { num: '03', title: 'Fast Communication',     desc: 'Replies measured in hours, not days — across every time zone.' },
  { num: '04', title: 'Dedicated Support',      desc: 'One point of contact from the first message to the moment you board.' },
];

export default function TrustSection() {
  return (
    <section className="bg-white relative overflow-hidden" id="trust" style={{ padding: '80px 0 80px 0' }}>

      <div className="container mx-auto px-4 md:px-6 text-center mb-10 md:mb-12 relative z-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#da6d3f' }}>Why Choose Us</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: '#0A385A' }}>
          Stamped With Trust <span className="italic" style={{ color: '#da6d3f' }}>And Quite Precision.</span>
        </h2>
      </div>

      {/* ── Mobile: simple 2-col card grid ── */}
      <div className="md:hidden container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 mb-10">
          {TRUST_CARDS.map((c) => (
            <div key={c.num} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute font-black" style={{ top: 0, right: 4, fontSize: '48px', color: '#da6d3f', opacity: 0.15, lineHeight: 1 }}>{c.num}</div>
              <div className="relative z-10">
                <h4 className="font-bold text-sm mb-1.5" style={{ color: '#0A385A' }}>{c.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop: airplane with floating cards ── */}
      <div className="hidden md:block container mx-auto px-6 relative" style={{ minHeight: '460px' }}>

        {/* Airplane centered background */}
        <div
          className="absolute z-0 pointer-events-none"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -44%)', width: '100%', maxWidth: '90%' }}
        >
          <img alt="Airplane" src="/images/airplane-front.png" className="w-full" style={{ opacity: 1 }} />
        </div>

        <div className="relative z-10" style={{ minHeight: '460px' }}>
          {/* Card 01 */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm absolute" style={{ top: '20px', left: '225px', width: '300px', transform: 'rotate(-3deg)', overflow: 'visible' }}>
            <div className="absolute font-black" style={{ top: 0, right: 0, fontSize: '60px', color: '#da6d3f', opacity: 0.18, lineHeight: 1, zIndex: 0 }}>01</div>
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-1" style={{ color: '#0A385A' }}>Professional Guidance</h4>
              <p className="text-xs text-gray-500">Senior advisors walk you through every requirement, in plain language.</p>
            </div>
          </div>
          {/* Card 04 */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm absolute" style={{ top: '20px', right: '224px', width: '300px', transform: 'rotate(3deg)', overflow: 'visible' }}>
            <div className="absolute font-black" style={{ top: 0, right: 0, fontSize: '60px', color: '#da6d3f', opacity: 0.18, lineHeight: 1, zIndex: 0 }}>04</div>
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-1" style={{ color: '#0A385A' }}>Dedicated Support</h4>
              <p className="text-xs text-gray-500">One point of contact from the first message to the moment you board.</p>
            </div>
          </div>
          {/* Card 02 */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm absolute" style={{ top: '126px', left: '200px', width: '299px', transform: 'rotate(-5deg)', overflow: 'visible' }}>
            <div className="absolute font-black" style={{ top: 0, right: 0, fontSize: '60px', color: '#da6d3f', opacity: 0.18, lineHeight: 1, zIndex: 0 }}>02</div>
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-1" style={{ color: '#0A385A' }}>Application Accuracy</h4>
              <p className="text-xs text-gray-500">Every form, every document, reviewed before it ever leaves your hands.</p>
            </div>
          </div>
          {/* Card 03 */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm absolute" style={{ top: '126px', right: '198px', width: '300px', transform: 'rotate(5deg)', overflow: 'visible' }}>
            <div className="absolute font-black" style={{ top: 0, right: 0, fontSize: '60px', color: '#da6d3f', opacity: 0.18, lineHeight: 1, zIndex: 0 }}>03</div>
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-1" style={{ color: '#0A385A' }}>Fast Communication</h4>
              <p className="text-xs text-gray-500">Replies measured in hours, not days — across every time zone.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 md:mt-16 relative z-10 px-4">
        <p className="text-sm text-gray-400 max-w-lg mx-auto italic mb-6 md:mb-8">
          We treat visa applications the way private banks treat portfolios — with care, discretion, and unmistakable
          attention to detail.
        </p>
        <a
          href="#application"
          style={{
            background: 'linear-gradient(to right, #3CA5D4, #0E3254)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Apply For Visa Service →
        </a>
      </div>

    </section>
  );
}
