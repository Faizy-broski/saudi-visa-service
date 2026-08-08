import { Mail, MapPin, Phone, PersonStanding, Globe } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div
      className="text-white py-2 text-xs"
      style={{ background: "linear-gradient(to right, #3CA5D4, #0E3254)" }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-0 flex justify-between items-center">
        <div className="flex gap-4 overflow-hidden">
          <a href="mailto:info@saudivisaservice.co.uk" className="flex gap-2 items-center shrink-0 hover:underline">
            <Mail className="w-3 h-3 shrink-0" />
            info@saudivisaservice.co.uk
          </a>
          <span className="hidden sm:flex gap-2 items-center shrink-0">
            <MapPin className="w-3 h-3 shrink-0" />
            London, United Kingdom
          </span>
          <a href="tel:+442036339033" className="hidden md:flex gap-2 items-center shrink-0 hover:underline">
            <Phone className="w-3 h-3 shrink-0" />
            020 3633 9033
          </a>
        </div>
        <div className="hidden sm:flex gap-5 shrink-0">
          <a
            className="hover:underline opacity-80 flex gap-1 items-center"
            href="#"
          >
            <PersonStanding className="w-3 h-3" />
            Accessibility
          </a>
          <a
            className="hover:underline opacity-80 flex gap-1 items-center"
            href="#"
          >
            <Globe className="w-3 h-3" />
            English
          </a>
        </div>
      </div>
    </div>
  );
}
