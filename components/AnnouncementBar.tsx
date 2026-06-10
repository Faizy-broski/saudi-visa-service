import { Mail, MapPin, Phone, PersonStanding, Globe } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div
      className=" text-white py-2 text-xs "
      style={{ background: "linear-gradient(to right, #3CA5D4, #0E3254)" }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex gap-5">
          <span className="flex gap-2 items-center">
            <Mail className="w-3 h-3" />
            info@saudivisaservice.com
          </span>
          <span className="flex gap-2 items-center">
            <MapPin className="w-3 h-3" />
            Unit 8, Paper Mill Road, Birmingham, B44 8NH
          </span>
          <span className="flex gap-2 items-center">
            <Phone className="w-3 h-3" />
            +44 20 1234 5678
          </span>
        </div>
        <div className="flex gap-5">
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
