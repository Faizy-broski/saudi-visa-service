import { createAdminClient } from '@/lib/supabase/admin';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import PageHero from '@/components/PageHero';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: '#da6d3f' }}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#0A385A' }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#da6d3f' }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const FALLBACK_IMAGES: Record<string, string> = {
  umrah: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
  tourist: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80',
  // hajj: 'https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=800&q=80',
};

const FALLBACK_SERVICES = [
  {
    id: 'umrah', name: 'Umrah Visa', slug: 'umrah', tagline: 'Spiritual Journey',
    description: 'Year-round access for pilgrims seeking the sacred rites of Umrah, handled with reverence and precision.',
    price_usd: 199, duration: '30 days', processing_time: '3-5 days',
    features: ['Expert consultation', 'Document verification', 'Application tracking'],
    requirements: ['Valid passport (6+ months)', 'Completed application form', 'Proof of accommodation'],
    accent_color: '#0A385A',
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
  },
  {
    id: 'tourist', name: 'Tourist Visa', slug: 'tourist', tagline: 'Discover Saudi',
    description: 'Explore Riyadh, AlUla, Jeddah and the Red Sea. Multi-entry options for short stays.',
    price_usd: 149, duration: '90 days', processing_time: '2-3 days',
    features: ['Expert consultation', 'Document verification', 'Application tracking'],
    requirements: ['Valid passport (6+ months)', 'Travel itinerary', 'Hotel bookings'],
    accent_color: '#3CA5D4',
    image_url: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80',
  },
  // Hajj Visa removed:
  // {
  //   id: 'hajj', name: 'Hajj Visa', slug: 'hajj', tagline: 'Sacred Pilgrimage',
  //   description: 'Seasonal Hajj processing supported by experienced consultants who understand every requirement.',
  //   price_usd: 249, duration: 'Seasonal', processing_time: '5-7 days',
  //   features: ['Priority processing', 'Expert consultation', 'Full document support'],
  //   requirements: ['Valid passport (6+ months)', 'Proof of Islam', 'Health certificate'],
  //   accent_color: '#da6d3f',
  //   image_url: 'https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=800&q=80',
  // },
];

export default async function ServicesPage() {
  let list = FALLBACK_SERVICES;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('visa_services')
      .select('*')
      .eq('active', true)
      .order('display_order');
    if (data && data.length > 0) list = data;
  } catch {
    // use fallback
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <PageHero
        tag="Our Services"
        title="Saudi Visa Services"
        subtitle="Professional visa assistance handled end-to-end by our expert consultants. Choose your visa type below to get started."
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      />

      {/* Stats strip */}
      <section className="py-10" style={{ background: '#f8fbff', borderBottom: '1px solid #eef2f7' }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '10,000+', label: 'Visas Processed' },
              { stat: '98%', label: 'Approval Rate' },
              { stat: '24hrs', label: 'Response Time' },
              { stat: '5★', label: 'Customer Rating' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold mb-1" style={{ color: '#0A385A' }}>{stat}</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.25em] block mb-3" style={{ color: '#da6d3f' }}>
              Available Visas
            </span>
            <h2 className="text-3xl font-bold" style={{ color: '#0A385A' }}>
              Choose Your <span className="italic" style={{ color: '#da6d3f' }}>Visa Type</span>
            </h2>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-20" style={{ color: '#9ca3af' }}>
              No services available at the moment. Please check back soon.
            </div>
          ) : (
            <div className={`grid gap-8 ${list.length === 1 ? 'max-w-md mx-auto' : list.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 lg:grid-cols-3'}`}>
              {list.map((svc) => {
                const img = (svc as { image_url?: string }).image_url || FALLBACK_IMAGES[svc.slug] || FALLBACK_IMAGES.umrah;
                return (
                <div
                  key={svc.id}
                  className="rounded-[24px] overflow-hidden flex flex-col"
                  style={{ border: '1px solid #eef2f7', boxShadow: '0 4px 32px rgba(10,56,90,0.08)' }}
                >
                  {/* Image header */}
                  <div className="relative h-52 overflow-hidden">
                    <img src={img} alt={svc.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,56,90,0.88) 0%, rgba(10,56,90,0.2) 60%, transparent 100%)' }} />
                    {svc.tagline && (
                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-white" style={{ background: '#da6d3f' }}>
                          {svc.tagline}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                      <h3 className="text-2xl font-bold text-white">{svc.name}</h3>
                      <span className="text-3xl font-bold text-white">£{svc.price_usd}</span>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-5 px-6 py-3 border-b text-xs font-medium" style={{ background: '#f8fbff', borderColor: '#eef2f7' }}>
                    {svc.duration && (
                      <span className="flex items-center gap-1.5" style={{ color: '#0A385A' }}>
                        <ClockIcon />{svc.duration}
                      </span>
                    )}
                    {svc.processing_time && (
                      <span className="flex items-center gap-1.5" style={{ color: '#da6d3f' }}>
                        <BoltIcon />{svc.processing_time}
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex flex-col gap-5 flex-1 bg-white">
                    {svc.description && (
                      <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{svc.description}</p>
                    )}

                    {svc.requirements?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#0A385A' }}>Requirements</div>
                        <ul className="space-y-2">
                          {svc.requirements.map((r: string) => (
                            <li key={r} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                              <CheckIcon />{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {svc.features?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#0A385A' }}>What We Provide</div>
                        <ul className="space-y-2">
                          {svc.features.map((f: string) => (
                            <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                              <StarIcon />{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex flex-col gap-2">
                      <Link
                        href="/booking"
                        className="block text-center py-3.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(to right, #3CA5D4, #0E3254)' }}
                      >
                        Apply Now →
                      </Link>
                      <Link
                        href={`/services/${svc.slug}`}
                        className="block text-center py-3 rounded-xl font-semibold text-sm border transition-colors hover:bg-gray-50"
                        style={{ color: '#0A385A', borderColor: '#eef2f7' }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #0A385A 0%, #3CA5D4 100%)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to start your Saudi journey?</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.70)' }}>
            Our consultants are standing by to guide you through every step.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 font-bold text-sm px-8 py-4 rounded-full"
            style={{ background: '#da6d3f', color: '#ffffff' }}
          >
            Start Your Application →
          </Link>
        </div>
      </section>
      <FooterBanner />
    </>
  );
}
