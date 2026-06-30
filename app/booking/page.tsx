import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveStripeKeys } from '@/lib/settings';
import BookingForm from './BookingForm';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export interface BookingFormConfig {
  passport: 'required' | 'optional' | 'hidden';
  id_card: 'required' | 'optional' | 'hidden';
  photo: 'required' | 'optional' | 'hidden';
  custom_docs: { key: string; label: string; required: boolean }[];
}

export interface VisaService {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price_usd: number;
  duration: string;
  processing_time: string;
  features: string[];
  requirements: string[];
  accent_color: string;
  image_url?: string;
  booking_form_config?: BookingFormConfig | null;
}

const FALLBACK_SERVICES: VisaService[] = [
  {
    id: 'umrah',
    name: 'Umrah Visa',
    slug: 'umrah',
    tagline: 'Spiritual Journey',
    description: 'Year-round access for pilgrims seeking the sacred rites of Umrah, handled with reverence and precision.',
    price_usd: 199,
    duration: '30 days',
    processing_time: '3-5 days',
    features: ['Expert consultation', 'Document verification', 'Application tracking'],
    requirements: ['Valid passport (6+ months)', 'Completed application form', 'Proof of accommodation', '2 passport photos'],
    accent_color: '#0A385A',
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
  },
  {
    id: 'tourist',
    name: 'Tourist Visa',
    slug: 'tourist',
    tagline: 'Discover Saudi',
    description: 'Explore Riyadh, AlUla, Jeddah and the Red Sea. Multi-entry options for short stays and long itineraries.',
    price_usd: 149,
    duration: '90 days',
    processing_time: '2-3 days',
    features: ['Expert consultation', 'Document verification', 'Application tracking'],
    requirements: ['Valid passport (6+ months)', 'Travel itinerary', 'Hotel bookings', 'Return ticket'],
    accent_color: '#3CA5D4',
    image_url: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80',
  },
  // Hajj Visa removed:
  // {
  //   id: 'hajj',
  //   name: 'Hajj Visa',
  //   slug: 'hajj',
  //   tagline: 'Sacred Pilgrimage',
  //   description: 'Seasonal Hajj processing supported by experienced consultants who understand every requirement.',
  //   price_usd: 249,
  //   duration: 'Seasonal',
  //   processing_time: '5-7 days',
  //   features: ['Priority processing', 'Expert consultation', 'Full document support'],
  //   requirements: ['Valid passport (6+ months)', 'Proof of Islam', 'Health certificate', 'Meningitis vaccination'],
  //   accent_color: '#da6d3f',
  //   image_url: 'https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=800&q=80',
  // },
];

export default async function BookingPage() {
  let services: VisaService[] = FALLBACK_SERVICES;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('visa_services')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (data && data.length > 0) {
      services = data as VisaService[];
    }
  } catch {
    // use fallback
  }

  const { publishableKey: stripeKey } = await getActiveStripeKeys();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <PageHero
        tag="Apply Booking"
        title="Apply for Your Saudi Visa"
        subtitle="Complete the form below to begin your visa application. Fast, secure, and fully online."
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Apply Booking' }]}
      />
      <BookingForm services={services} stripeKey={stripeKey} />
      <FooterBanner />
    </>
  );
}
