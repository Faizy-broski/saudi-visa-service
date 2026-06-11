import { createAdminClient } from "@/lib/supabase/admin";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import VisaTypes from "@/components/VisaTypes";
import AboutSection from "@/components/AboutSection";
import TrustSection from "@/components/TrustSection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import FooterBanner from "@/components/FooterBanner";

export const dynamic = "force-dynamic";

const FALLBACK_SERVICES = [
  {
    id: "umrah",
    name: "Umrah Visa",
    slug: "umrah",
    tagline: "Spiritual Journey",
    description:
      "Year-round access for pilgrims seeking the sacred rites of Umrah, handled with reverence and precision.",
    price_usd: 199,
    duration: "30 days",
    processing_time: "3-5 days",
    features: [
      "Expert consultation",
      "Document verification",
      "Application tracking",
    ],
    requirements: [
      "Valid passport",
      "Completed application",
      "Proof of accommodation",
    ],
    accent_color: "#0A385A",
    image_url:
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80",
  },
  {
    id: "tourist",
    name: "Tourist Visa",
    slug: "tourist",
    tagline: "Discover The Kingdom",
    description:
      "Explore Riyadh, AlUla, Jeddah and the Red Sea. Multi-entry options for short stays and long itineraries.",
    price_usd: 149,
    duration: "90 days",
    processing_time: "2-3 days",
    features: [
      "Expert consultation",
      "Document verification",
      "Application tracking",
    ],
    requirements: ["Valid passport", "Travel itinerary", "Hotel bookings"],
    accent_color: "#3CA5D4",
    image_url:
      "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80",
  },
  {
    id: "hajj",
    name: "Hajj Visa",
    slug: "hajj",
    tagline: "Sacred Pilgrimage",
    description:
      "Seasonal Hajj processing supported by experienced consultants who understand every requirement.",
    price_usd: 249,
    duration: "Seasonal",
    processing_time: "5-7 days",
    features: [
      "Priority processing",
      "Expert consultation",
      "Full document support",
    ],
    requirements: ["Valid passport", "Proof of Islam", "Health certificate"],
    accent_color: "#da6d3f",
    image_url:
      "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?w=800&q=80",
  },
];

export default async function Home() {
  let services = FALLBACK_SERVICES;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('visa_services')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (data && data.length > 0) {
      services = data;
    }
  } catch {
    // use fallback
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <VisaTypes services={services} />
      <div className="relative">
        <div className="pointer-events-none absolute right-0 top-0 z-0 hidden md:block">
          <img
            src="/images/arab-man-luggage.svg"
            alt=""
            className="h-full w-full  object-cover"
          />
        </div>
        <AboutSection />
        <div id="why-us">
          <TrustSection />
        </div>
      </div>
      <div id="process">
        <HowItWorks />
      </div>
      <Testimonials />
      <div id="contact">
        <ContactForm />
      </div>
      <FooterBanner />
    </>
  );
}
