import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import PageHero from '@/components/PageHero';
import ContactSection from '@/components/ContactSection';

export default function ContactPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <PageHero
        tag="Contact Us"
        title="We're Here to Help"
        subtitle="Have a question about your visa application, documents, or anything else? Reach out and our team will get back to you promptly."
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]}
      />

      <ContactSection />

      <FooterBanner />
    </>
  );
}
