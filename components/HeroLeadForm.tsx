'use client';

import { useState, useTransition } from "react";
import { m } from "framer-motion";
import { submitLead } from "@/lib/actions/submitLead";

const VISA_INTERESTS = ["Umrah Visa", "Tourist Visa", "General Enquiry", "Other"];

function inputCls(hasError?: boolean) {
  return [
    "w-full rounded-xl border text-sm px-4 py-3 bg-white/95 text-[#0A385A] placeholder:text-gray-400 focus:outline-none transition-colors",
    hasError ? "border-red-400" : "border-transparent focus:border-[#da6d3f]",
  ].join(" ");
}

export default function HeroLeadForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your full name.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim() || form.phone.trim().length < 6) e.phone = "Enter a valid phone number.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setServerError("");
    startTransition(async () => {
      const res = await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        visaInterest: form.interest || undefined,
      });
      if (res.success) setSubmitted(true);
      else setServerError(res.error);
    });
  };

  return (
    <m.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full rounded-3xl p-6 md:p-7"
      style={{
        background: "rgba(10,56,90,0.55)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}
    >
      {submitted ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#da6d3f]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-7 h-7">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Request Received!</h3>
          <p className="text-sm text-white/80 max-w-xs">
            A visa consultant will reach out to you shortly.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", phone: "", interest: "" });
            }}
            className="px-5 py-2.5 rounded-full font-bold text-sm text-white bg-[#da6d3f] transition-all hover:bg-white hover:text-[#0A385A]"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <h3 className="text-white font-semibold text-lg mb-1">Get a Free Consultation</h3>
          <p className="text-white/75 text-xs mb-1">
            Share your details and we&apos;ll contact you within hours.
          </p>

          <div>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Full Name"
              className={inputCls(!!errors.name)}
            />
            {errors.name && <p className="text-red-300 text-xs mt-1 px-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="Email Address"
              className={inputCls(!!errors.email)}
            />
            {errors.email && <p className="text-red-300 text-xs mt-1 px-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="Phone Number"
              className={inputCls(!!errors.phone)}
            />
            {errors.phone && <p className="text-red-300 text-xs mt-1 px-1">{errors.phone}</p>}
          </div>

          <select value={form.interest} onChange={set("interest")} className={inputCls() + " cursor-pointer"}>
            <option value="">Select Visa Interest (optional)</option>
            {VISA_INTERESTS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {serverError && (
            <div className="rounded-xl bg-red-500/15 border border-red-400/40 px-3 py-2 text-xs text-red-200">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 w-full py-3.5 rounded-full bg-[#da6d3f] font-bold text-sm text-white transition-all duration-300 hover:bg-white hover:text-[#0A385A] disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Get Started →"}
          </button>
        </form>
      )}
    </m.div>
  );
}
