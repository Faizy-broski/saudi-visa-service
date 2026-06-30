import { createAdminClient } from '@/lib/supabase/admin';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const FALLBACK_IMAGES: Record<string, string> = {
  umrah:   'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80',
  tourist: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=80',
  // hajj:    'https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=1200&q=80',
};

const FALLBACK_SERVICES: Record<string, any> = {
  umrah: {
    id: 'umrah', name: 'Umrah Visa', slug: 'umrah', tagline: 'Spiritual Journey',
    description: 'The Umrah visa is available year-round and allows Muslim pilgrims to visit the holy cities of Makkah and Madinah. Our team handles every aspect of your application with care, ensuring your journey begins as peacefully as it continues.',
    price_usd: 199, duration: '30 days', processing_time: '3–5 days',
    accent_color: '#0A385A',
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80',
    features: ['Expert visa consultation', 'Document preparation & review', 'Real-time application tracking', 'Email notifications at every step', 'Post-approval support'],
    requirements: ['Valid passport (min. 6 months validity)', 'Recent passport-sized photograph', 'Completed visa application form', 'Proof of accommodation in Saudi Arabia', 'Return flight tickets'],
  },
  tourist: {
    id: 'tourist', name: 'Tourist Visa', slug: 'tourist', tagline: 'Discover Saudi',
    description: 'Saudi Arabia has opened its doors to the world. From the ancient rock city of AlUla to the vibrant streets of Riyadh and the crystal-clear waters of the Red Sea, the Tourist Visa lets you explore it all. Multi-entry options available for extended itineraries.',
    price_usd: 149, duration: '90 days', processing_time: '2–3 days',
    accent_color: '#3CA5D4',
    image_url: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=80',
    features: ['Fast 2–3 day processing', 'Multi-entry options available', 'Document preparation & review', 'Real-time application tracking', 'Email notifications at every step'],
    requirements: ['Valid passport (min. 6 months validity)', 'Passport-sized photograph', 'Completed application form', 'Travel itinerary (optional)', 'Hotel booking confirmation (optional)'],
  },
  // Hajj Visa removed:
  // hajj: {
  //   id: 'hajj', name: 'Hajj Visa', slug: 'hajj', tagline: 'Sacred Pilgrimage',
  //   description: 'The Hajj Visa is issued exclusively during the Hajj season and is one of the most spiritually significant travel documents in the world. Our experienced consultants understand every nuance of the Hajj application process and will ensure your pilgrimage proceeds without administrative hurdles.',
  //   price_usd: 249, duration: 'Seasonal', processing_time: '5–7 days',
  //   accent_color: '#da6d3f',
  //   image_url: 'https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=1200&q=80',
  //   features: ['Priority seasonal processing', 'Expert Hajj consultation', 'Full document preparation', 'Group application support', 'Email notifications at every step'],
  //   requirements: ['Valid passport (min. 6 months validity)', 'Proof of Muslim faith (if required)', 'Passport-sized photograph', 'Health certificate / vaccination records', 'Completed Hajj application form'],
  // },
};

const PROCESS_STEPS = [
  { step: '01', title: 'Select & Book', desc: 'Choose your visa type, fill in your details, and complete secure online payment in minutes.' },
  { step: '02', title: 'Upload Documents', desc: 'Submit your passport copy, photograph, and any supporting documents through our secure portal.' },
  { step: '03', title: 'We Process', desc: 'Our consultants review your application and liaise with the relevant authorities on your behalf.' },
  { step: '04', title: 'Receive Approval', desc: 'Your approved visa is delivered directly to your inbox, ready for travel.' },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 flex-shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#da6d3f' }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let service = FALLBACK_SERVICES[slug] ?? null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('visa_services')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();
    if (data) service = data;
  } catch {
    // use fallback
  }

  if (!service) notFound();

  const img = service.image_url || FALLBACK_IMAGES[slug] || FALLBACK_IMAGES.umrah;
  const accent = service.accent_color || '#0A385A';

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: '480px' }}>
        <img src={img} alt={service.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,56,90,0.92) 0%, rgba(10,56,90,0.65) 60%, rgba(10,56,90,0.2) 100%)' }} />
        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-28 pb-10 md:pt-44 md:pb-20 flex flex-col justify-end" style={{ minHeight: '480px' }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-6 flex-wrap">
            {[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services' },
              { label: service.name },
            ].map((crumb, i, arr) => {
              const isLast = i === arr.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  {!isLast ? (
                    <Link href={crumb.href!} className="font-medium" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold" style={{ color: '#ffffff' }}>{crumb.label}</span>
                  )}
                </span>
              );
            })}
          </nav>
          {service.tagline && (
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-white w-fit mb-4"
              style={{ background: accent }}
            >
              {service.tagline}
            </span>
          )}
          <h1 className="font-bold text-white mb-4" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 1.1 }}>
            {service.name}
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mb-8" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {service.description}
          </p>
          {/* Quick stats */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'From', value: `£${service.price_usd} GBP` },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Validity', value: service.duration },
              { icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, label: 'Processing', value: service.processing_time },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{icon}</span>
                <div>
                  <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                  <div className="text-sm font-bold text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section style={{ background: '#f8fbff' }} className="py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Left: Features + Requirements */}
            <div className="lg:col-span-3 space-y-8">

              {/* What's included */}
              {service.features?.length > 0 && (
                <div className="rounded-2xl bg-white p-8" style={{ border: '1px solid #eef2f7' }}>
                  <h2 className="font-bold text-xl mb-6" style={{ color: '#0A385A' }}>What's Included</h2>
                  <ul className="space-y-4">
                    {service.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: '#f0fdf4', color: '#16a34a' }}
                        >
                          <CheckIcon />
                        </span>
                        <span className="text-sm leading-relaxed" style={{ color: '#374151' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {service.requirements?.length > 0 && (
                <div className="rounded-2xl bg-white p-8" style={{ border: '1px solid #eef2f7' }}>
                  <h2 className="font-bold text-xl mb-6" style={{ color: '#0A385A' }}>Required Documents</h2>
                  <ul className="space-y-4">
                    {service.requirements.map((r: string) => (
                      <li key={r} className="flex items-start gap-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: '#eff6ff', color: '#1d4ed8' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </span>
                        <span className="text-sm leading-relaxed" style={{ color: '#374151' }}>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Process steps */}
              <div className="rounded-2xl bg-white p-8" style={{ border: '1px solid #eef2f7' }}>
                <h2 className="font-bold text-xl mb-8" style={{ color: '#0A385A' }}>How It Works</h2>
                <div className="space-y-6">
                  {PROCESS_STEPS.map(({ step, title, desc }, i) => (
                    <div key={step} className="flex gap-5 items-start">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: i === 0 ? accent : '#f8fbff', color: i === 0 ? '#ffffff' : '#0A385A', border: i === 0 ? 'none' : '1px solid #eef2f7' }}
                      >
                        {step}
                      </div>
                      <div>
                        <div className="font-bold text-sm mb-1" style={{ color: '#0A385A' }}>{title}</div>
                        <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Booking card */}
            <div className="lg:col-span-2">
              <div
                className="rounded-2xl overflow-hidden sticky top-28"
                style={{ border: '1px solid #eef2f7', boxShadow: '0 8px 40px rgba(10,56,90,0.10)' }}
              >
                {/* Card header */}
                <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${accent} 0%, #0E3254 100%)` }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Service Fee</div>
                  <div className="text-4xl font-bold mb-1">£{service.price_usd}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>per person · GBP</div>
                </div>

                {/* Highlights */}
                <div className="p-6 space-y-3 bg-white">
                  {[
                    { label: 'Validity', value: service.duration },
                    { label: 'Processing Time', value: service.processing_time },
                    { label: 'Application Type', value: 'Online — 100% Digital' },
                    { label: 'Support', value: 'Email & Phone' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm py-2 border-b last:border-b-0" style={{ borderColor: '#eef2f7' }}>
                      <span style={{ color: '#9ca3af' }}>{label}</span>
                      <span className="font-semibold" style={{ color: '#0A385A' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 bg-white space-y-3">
                  <Link
                    href={`/booking?service=${service.slug}`}
                    className="block text-center py-4 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(to right, #3CA5D4, #0E3254)` }}
                  >
                    Apply for {service.name} →
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-center py-3 rounded-xl font-semibold text-sm border transition-colors"
                    style={{ color: '#0A385A', borderColor: '#eef2f7' }}
                  >
                    Have a question?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-bold text-xl mb-8" style={{ color: '#0A385A' }}>Other Services</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {Object.values(FALLBACK_SERVICES)
              .filter((s: any) => s.slug !== slug)
              .map((s: any) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="rounded-2xl overflow-hidden group block"
                  style={{ border: '1px solid #eef2f7', textDecoration: 'none' }}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img src={s.image_url} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,56,90,0.85) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <span className="font-bold text-sm text-white">{s.name}</span>
                      <span className="text-sm font-bold text-white">£{s.price_usd}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#6b7280' }}>{s.description}</p>
                    <span className="text-xs font-bold mt-3 block" style={{ color: '#3CA5D4' }}>View Details →</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <FooterBanner />
    </>
  );
}
