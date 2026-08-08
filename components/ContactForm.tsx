"use client";

import { useState, useTransition } from "react";
import { FadeUp } from "@/lib/motion";
import { submitContact } from "@/lib/actions/submitContact";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const SIDEBAR_INFO = [
  { icon: <Mail className="w-4 h-4" />, label: "Email", value: "info@saudivisaservice.co.uk", href: "mailto:info@saudivisaservice.co.uk" },
  { icon: <Phone className="w-4 h-4" />, label: "Phone", value: "020 3633 9033", href: "tel:+442036339033" },
  { icon: <MapPin className="w-4 h-4" />, label: "Visa Operations Center", value: "London, United Kingdom" },
  { icon: <Clock className="w-4 h-4" />, label: "Hours", value: "Open 24/7, 365 days a year" },
];

const VISA_INTERESTS = [
  "Umrah Visa",
  "Tourist Visa",
  // "Hajj Visa",
  "General Enquiry",
  "Other",
];

function inputCls(hasError?: boolean) {
  return [
    "w-full rounded-full border text-sm p-3 bg-white focus:outline-none transition-colors",
    hasError ? "border-red-400" : "border-gray-200 focus:border-[#3CA5D4]",
  ].join(" ");
}

function Field({
  label,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        className="text-[10px] font-bold uppercase tracking-widest px-1"
        style={{ color: "#0A385A", opacity: 0.5 }}
      >
        {label}
        {required && (
          <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
        )}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs px-1">{error}</p>}
    </div>
  );
}

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const set =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Please enter your full name.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.message.trim() || form.message.trim().length < 5)
      e.message = "Message is required.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setServerError("");
    startTransition(async () => {
      const res = await submitContact({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.interest || "General Enquiry",
        message: form.message,
      });
      if (res.success) setSubmitted(true);
      else setServerError(res.error);
    });
  };

  return (
    <section className="relative py-16 md:py-24 bg-white" id="application">
      <div className="pointer-events-none absolute right-[-8%] -top-70 z-[1] hidden md:block">
        <img src="/images/airplane.svg" alt="" className="w-full" />
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-0 bg-transparent relative z-10">
        <FadeUp>
          <div className="rounded-2xl md:rounded-[32px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-gray-100">
            {/* Sidebar */}
            <div className="lg:w-[42%] relative overflow-hidden rounded-2xl md:rounded-[32px] bg-[linear-gradient(135deg,#41A9D9_0%,#0C3459_100%)] text-white p-8 md:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                <span className="block text-xs tracking-[2px] uppercase text-white/80 mb-5">
                  Business Lounge
                </span>

                <h2 className="text-4xl leading-[1.05] font-light max-w-md">
                  Begin your{" "}
                  <span className="italic font-semibold">
                    Saudi
                    <br />
                    Journey.
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-5 text-white/90 max-w-sm">
                  Share a few details and a visa consultant will reach out
                  within hours to begin your personalized application.
                </p>

                <div className="mt-8 space-y-3">
                  {SIDEBAR_INFO.map(({ icon, label, value, href }) => {
                    const Tag = href ? "a" : "div";
                    return (
                      <Tag
                        key={label}
                        {...(href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: href.startsWith("http") ? "noopener noreferrer" : undefined } : {})}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.12]"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.15)" }}
                        >
                          {icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{label}</div>
                          <div className="text-xs text-white/75 mt-0.5">{value}</div>
                        </div>
                      </Tag>
                    );
                  })}
                </div>
              </div>

              <div>
                {/* <div className="h-px bg-white/20 mb-8" /> */}

                <div className="flex justify-between mt-8 text-xs pt-4 border-white/20 border-t uppercase text-white/70">
                  <span>
                    Gate <span className="text-white ml-1">A12</span>
                  </span>

                  <span>
                    Boarding <span className="text-white ml-1">Daily</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:w-[62%] p-7 md:p-10 bg-white">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,#3CA5D4,#0E3254)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth={2.5}
                      className="w-8 h-8"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#0A385A]">
                    Message Received!
                  </h3>
                  <p className="text-sm leading-relaxed max-w-sm text-gray-500">
                    Thank you for reaching out. Our team will respond within a
                    few hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        interest: "",
                        message: "",
                      });
                    }}
                    className="px-6 py-3 rounded-full font-bold text-sm text-white bg-[#da6d3f] transition-all duration-300 hover:scale-105 hover:bg-[#0A385A] hover:shadow-[0_10px_26px_rgba(0,0,0,0.2)]"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="relative grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden md:block">
                    <img
                      src="/images/contact-flags.svg"
                      alt=""
                      className="h-full w-full object-cover object-right"
                    />
                  </div>
                  <Field label="Full Name" required error={errors.name} className="bg-white">
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your full name"
                      className={inputCls(!!errors.name)}
                    />
                  </Field>
                  <Field label="Email" required error={errors.email} className="bg-white">
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@email.com"
                      className={inputCls(!!errors.email)}
                    />
                  </Field>
                  <Field label="Phone (optional)" className="bg-white">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+44 7700 000000"
                      className={inputCls()}
                    />
                  </Field>
                  <Field label="Service Interest" className="bg-white">
                    <select
                      value={form.interest}
                      onChange={set("interest")}
                      className={inputCls() + " cursor-pointer"}
                    >
                      <option value="">Select a topic</option>
                      {VISA_INTERESTS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Message"
                    required
                    error={errors.message}
                    className="md:col-span-2 bg-white"
                  >
                    <textarea
                      value={form.message}
                      onChange={set("message")}
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className={[
                        inputCls(!!errors.message).replace(
                          "rounded-full",
                          "rounded-[28px]",
                        ),
                        "resize-none",
                      ].join(" ")}
                    />
                  </Field>
                  {serverError && (
                    <div className="md:col-span-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                      {serverError}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-4 rounded-full bg-gradient-to-r from-[#3CA5D4] to-[#0E3254] font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] hover:from-[#0E3254] hover:to-[#3CA5D4] hover:shadow-[0_10px_26px_rgba(10,56,90,0.35)] disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {isPending ? "Sending..." : "Send Message →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
