const QuoteSVG = () => (
  <svg
    width="32" height="24" viewBox="0 0 32 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}
  >
    <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0L16 2.4C11.2 3.6 8.4 6.4 8 10.4H14.4V24H0ZM17.6 24V14.4C17.6 6.4 22.4 1.6 32 0L33.6 2.4C28.8 3.6 26 6.4 25.6 10.4H32V24H17.6Z" fill="#da6d3f" opacity="0.5" />
  </svg>
);

const testimonials = [
  { quote: '"Their guidance made the entire process feel calm. Every document was reviewed with care."', initial: 'A', name: 'Ayesha R.', role: 'Umrah Applicant' },
  { quote: '"Responsive, clear, and incredibly professional. I knew exactly what to do at every step."', initial: 'M', name: 'Mohammed K.', role: 'Tourist Visa' },
  { quote: '"The most reassuring service I\'ve experienced. They treated my application with real respect."', initial: 'F', name: 'Fatima S.', role: 'Hajj Applicant' },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 overflow-hidden relative" style={{ background: '#ffffff' }}>

      {/* Left background image — hidden on mobile */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 z-0 pointer-events-none" style={{ width: '28%' }}>
        <img src="/images/hajj-pilgrims.png" alt="" className="w-full h-full object-cover object-right" style={{ opacity: 0.25, filter: 'grayscale(10%)' }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#da6d3f' }}>Client Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: '#0A385A' }}>
            What Ours <span className="italic" style={{ color: '#da6d3f' }}>Customers Says.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <QuoteSVG />
                <p className="text-sm text-gray-600 mb-6 md:mb-8 leading-relaxed">{t.quote}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#0A385A' }}>
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#0A385A' }}>{t.name}</div>
                  <div className="text-[11px] text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
