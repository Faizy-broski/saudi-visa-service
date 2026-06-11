"use client";

import { useState, useTransition } from "react";
import { FadeUp } from "@/lib/motion";
import { submitContact } from "@/lib/actions/submitContact";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const VISA_INTERESTS = [
  "Umrah Visa",
  "Tourist Visa",
  "Hajj Visa",
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
      <div className="pointer-events-none absolute right-[-8%] -top-70  z-[1] ">
        <img src="/images/airplane.svg" alt="" className="w-full" />
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-6 bg-white relative z-10">
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
                Share a few details and a visa consultant will reach out within
                hours to begin your personalized application.
              </p>

              <div className="mt-10 space-y-4 text-sm">
                <div className="flex gap-4">
                  <MapPin className="w-4 h-4 mt-1" />
                  <div>
                    <p>Visa Operations Center</p>
                    <p className="text-white/80">Jeddah · Saudi Arabia</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="w-4 h-4" />
                  <p>+966 12 000 0000</p>
                </div>

                <div className="flex gap-4">
                  <Mail className="w-4 h-4" />
                  <p>visa@saudiavisa.com</p>
                </div>
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
                  Thank you for reaching out. Our team will respond within a few
                  hours.
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
                  className="px-6 py-3 rounded-full font-bold text-sm text-white  bg-[#da6d3f]"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <Field label="Full Name" required error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Your full name"
                    className={inputCls(!!errors.name)}
                  />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@email.com"
                    className={inputCls(!!errors.email)}
                  />
                </Field>
                <Field label="Phone (optional)">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+44 7700 000000"
                    className={inputCls()}
                  />
                </Field>
                <Field label="Service Interest">
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
                  className="md:col-span-2"
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
                    className="w-full py-4 rounded-full bg-[linear-gradient(to_right,#3CA5D4,#0E3254)] font-bold text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-60"
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
