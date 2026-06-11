import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import ContactForm from '@/components/ContactForm';
import PageHero from '@/components/PageHero';

const INFO_CARDS = [
  {
    title: 'Phone',
    value: '+966 12 000 0000',
    sub: 'Mon – Fri, 9am – 6pm GST',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z" />
      </svg>
    ),
  },
  {
    title: 'Email',
    value: 'info@saudivisaservice.com',
    sub: 'We reply within a few hours',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: 'Office',
    value: 'Jeddah, Saudi Arabia',
    sub: 'Visa Operations Centre',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: 'UK Line',
    value: '+44 20 1234 5678',
    sub: 'Mon – Fri, 9am – 5pm GMT',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

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

      {/* Info cards */}
      <section className="pt-16 md:pt-20 pb-6" style={{ background: '#f8fbff' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INFO_CARDS.map(({ title, value, sub, icon }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white border border-[#eef2f7]"
                style={{ boxShadow: '0 2px 16px rgba(10,56,90,0.04)' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#0A385A', color: '#ffffff' }}
                >
                  {icon}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[#0A385A] opacity-45">{title}</div>
                <div className="text-sm font-semibold mb-1 text-[#0A385A]">{value}</div>
                <div className="text-xs text-gray-400">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-10" style={{ background: '#f8fbff' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div
            className="rounded-2xl overflow-hidden border border-[#eef2f7]"
            style={{ boxShadow: '0 2px 24px rgba(10,56,90,0.07)', height: '380px' }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3713.4621564846144!2d39.18967171505294!3d21.485811285796714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3d01fb1137e59%3A0xe059f4d5c5b9c8b4!2sJeddah%2C%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1717900000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Saudi Visa Service Office Location — Jeddah, Saudi Arabia"
            />
          </div>
          <p className="text-xs text-center mt-3 text-gray-400">
            Visa Operations Centre · Jeddah, Saudi Arabia
          </p>
        </div>
      </section>

      {/* Contact form */}
      <ContactForm />

      <FooterBanner />
    </>
  );
}
