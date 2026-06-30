'use client';

import { useState } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import PageHero from '@/components/PageHero';
import Link from 'next/link';

const FAQ_SECTIONS = [
  {
    category: 'General',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    items: [
      {
        /* Hajj removed from description: original included "Umrah, Hajj, and Tourist visas" */
        q: 'What is Saudi Visa Service?',
        a: 'Saudi Visa Service is a professional visa assistance platform that helps individuals and groups apply for Saudi Arabian visas — including Umrah and Tourist visas. We manage the entire process on your behalf, from document preparation to submission and tracking.',
      },
      {
        /* Hajj removed from visa types: original listed "Hajj Visa (seasonal)" */
        q: 'Which visas do you handle?',
        a: 'We currently handle two visa types: Umrah Visa (year-round for pilgrims) and Tourist Visa (for leisure, exploration, and short stays).',
      },
      {
        q: 'Are you an official Saudi government agency?',
        a: 'No. We are a licensed private visa consultancy. We work with and through official channels on your behalf, but we are not a government body. Our role is to simplify and accelerate the application process for you.',
      },
      {
        q: 'Which countries do you serve?',
        a: 'We serve applicants from over 50 countries, primarily in the UK, Europe, USA, Canada, Australia, and South Asia. If you are unsure whether we serve your country, contact us before applying.',
      },
    ],
  },
  {
    category: 'Visa Types & Requirements',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    items: [
      {
        q: 'What documents are required for an Umrah Visa?',
        a: 'You will need: a valid passport (minimum 6 months validity), a recent passport-sized photograph, a completed application form, and proof of accommodation in Saudi Arabia. Women under 45 travelling without a Mahram may need additional documentation.',
      },
      {
        q: 'What documents are required for a Tourist Visa?',
        a: 'Tourist Visa requirements include: a valid passport, passport photograph, and in some cases proof of travel itinerary or hotel bookings. Saudi Arabia has relaxed many tourist visa requirements in recent years, making the process straightforward.',
      },
      // Hajj Visa FAQ item removed:
      // {
      //   q: 'Is the Hajj Visa available year-round?',
      //   a: 'No. The Hajj Visa is only available during the Hajj season (the last months of the Islamic calendar). Applications typically open 3–4 months before Hajj. Outside of this period, pilgrims may apply for an Umrah Visa instead.',
      // },
      {
        q: 'Can I extend my Saudi visa?',
        a: 'Visa extensions are possible but must be arranged through the appropriate Saudi government channels before your current visa expires. We can advise on the extension process as part of our post-approval support.',
      },
    ],
  },
  {
    category: 'Booking & Application',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    items: [
      {
        q: 'How do I apply?',
        a: 'Click "Apply Now" in the navigation bar, select your visa type, fill in your personal details, upload the required documents, and complete payment. You\'ll receive a confirmation email with your reference number immediately.',
      },
      {
        /* Hajj removed from processing times: original mentioned "Hajj visas can take 5–10 business days" */
        q: 'How long does the process take?',
        a: 'Processing times vary by visa type. Tourist and Umrah visas typically take 2–5 business days. We will keep you informed at every stage.',
      },
      {
        q: 'Can I apply for multiple travellers at once?',
        a: 'Yes. Our booking form allows you to specify the number of travellers. Each traveller will need their own documents, and pricing applies per person. Contact us for group bookings of 10 or more.',
      },
      {
        q: 'Can I cancel or change my application?',
        a: 'Applications can be cancelled before submission to the Saudi embassy for a partial refund. Once submitted, cancellations are subject to our refund policy (see Payment section). Changes to details may incur an amendment fee. Contact us as soon as possible if changes are needed.',
      },
    ],
  },
  {
    category: 'Documents & Upload',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    ),
    items: [
      {
        q: 'What format should my documents be in?',
        a: 'All documents should be uploaded as JPEG, PNG, or PDF files. Maximum file size is 5MB per document. Ensure photos are clear, unobstructed, and taken against a plain white background.',
      },
      {
        q: 'Are my documents secure?',
        a: 'Yes. All uploaded documents are stored in an encrypted private storage system accessible only to our team. We never share your documents with third parties other than the relevant embassy or government authority.',
      },
      {
        q: 'What if my documents are rejected?',
        a: 'If any document does not meet requirements, we will notify you by email with clear instructions on what to correct and how to resubmit. Most rejections are resolved quickly without affecting your overall processing time significantly.',
      },
    ],
  },
  {
    category: 'Payment & Refunds',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) via our secure Stripe payment gateway. Bank transfers are available for group bookings of 10 or more on request.',
      },
      {
        q: 'Is my payment secure?',
        a: 'Yes. All payments are processed through Stripe, a PCI DSS Level 1 certified payment processor. We never store your card details on our servers.',
      },
      {
        q: 'What is your refund policy?',
        a: 'If your application is rejected by the Saudi embassy through no fault of your own, we offer a full refund of our service fee. Government/embassy fees are non-refundable in most cases. Cancellations before submission receive a 75% refund; cancellations after submission are non-refundable.',
      },
      {
        q: 'Will I receive a receipt?',
        a: 'Yes. A full payment receipt is sent to your email address immediately after successful payment. Your booking confirmation email also includes a breakdown of all fees.',
      },
    ],
  },
  {
    category: 'After Booking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    items: [
      {
        q: 'How do I track my application?',
        a: 'Use the Track Booking page on our website. Enter the reference number sent to your email after booking. You\'ll see the current status (Pending, Under Review, Approved, or Rejected) and any notes from your consultant.',
      },
      {
        q: 'Will I be notified of status changes?',
        a: 'Yes. We send email notifications every time your application status changes — when it moves to review, when it is approved, or if any action is required from your side.',
      },
      {
        /* Hajj removed: original mentioned "For Hajj visas, the process may involve a physical document" */
        q: 'How will I receive my approved visa?',
        a: 'For e-visas (Tourist and Umrah), the approved visa will be sent directly to your email as a PDF.',
      },
      {
        q: 'What should I do if I have a problem after approval?',
        a: 'Contact our support team via the Contact page or email us at info@saudivisaservice.co.uk. Our team is available to help with any post-approval queries, airport issues, or documentation concerns.',
      },
    ],
  },
];

function AccordionItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="border-b last:border-b-0 transition-colors"
      style={{ borderColor: '#eef2f7' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold leading-relaxed" style={{ color: '#0A385A' }}>{q}</span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all mt-0.5"
          style={{
            background: isOpen ? '#0A385A' : '#eef2f7',
            color: isOpen ? '#ffffff' : '#0A385A',
            transform: isOpen ? 'rotate(45deg)' : 'none',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="pb-5">
          <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [openItem, setOpenItem] = useState<string | null>('0-0');

  const toggle = (key: string) => setOpenItem(openItem === key ? null : key);

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <PageHero
        tag="FAQ"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about Saudi visas, our process, documents, and payments — answered clearly."
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
      />

      {/* FAQ content */}
      <section style={{ background: '#f8fbff' }} className="py-20">
        <div className="container mx-auto px-6 max-w-3xl space-y-8">
          {FAQ_SECTIONS.map((section, si) => (
            <div
              key={section.category}
              className="rounded-2xl overflow-hidden bg-white"
              style={{ border: '1px solid #eef2f7', boxShadow: '0 2px 16px rgba(10,56,90,0.04)' }}
            >
              {/* Section header */}
              <div
                className="px-6 py-4 flex items-center gap-3 border-b"
                style={{ background: '#f8fbff', borderColor: '#eef2f7', color: '#0A385A' }}
              >
                {section.icon}
                <span className="font-bold text-sm">{section.category}</span>
              </div>

              {/* Items */}
              <div className="px-6">
                {section.items.map((item, ii) => (
                  <AccordionItem
                    key={`${si}-${ii}`}
                    q={item.q}
                    a={item.a}
                    isOpen={openItem === `${si}-${ii}`}
                    onToggle={() => toggle(`${si}-${ii}`)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Still have questions */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, #0A385A 0%, #3CA5D4 100%)', color: '#ffffff' }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Still have questions?</h3>
            <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Our team responds to all enquiries within a few hours during business hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="font-bold text-sm px-7 py-3.5 rounded-full"
                style={{ background: '#ffffff', color: '#0A385A', textDecoration: 'none' }}
              >
                Contact Us →
              </Link>
              <Link
                href="/booking"
                className="font-bold text-sm px-7 py-3.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.14)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}
              >
                Apply for Visa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterBanner />
    </>
  );
}
