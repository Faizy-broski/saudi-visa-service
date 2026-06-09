export default function StatsSection() {
  return (
    <section className="container mx-auto px-6 -mt-12 relative z-20">
      <div className="bg-white rounded-xl shadow-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 items-center border-t-4 border-saudi-orange">

        {/* Stat 1: Applications Assisted */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-saudi-orange rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.477-3.716M9 20H4v-2a4 4 0 015.477-3.716M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">32,400+</div>
            <div className="text-[11px] text-gray-500">Applications Assisted</div>
          </div>
        </div>

        {/* Stat 2: Document Guidance */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-saudi-orange rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">Step-by-step</div>
            <div className="text-[11px] text-gray-500">Document Guidance</div>
          </div>
        </div>

        {/* Stat 3: Quick Processing */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-saudi-orange rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">24–72 hrs</div>
            <div className="text-[11px] text-gray-500">Quick Processing Support</div>
          </div>
        </div>

        {/* Stat 4: Customer Satisfaction */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-saudi-orange rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">98%</div>
            <div className="text-[11px] text-gray-500">Customer Satisfaction</div>
          </div>
        </div>

      </div>
    </section>
  );
}
