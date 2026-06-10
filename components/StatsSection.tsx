import { FileCheckCorner, Users, HeartHandshake, Clock3 } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "12,400+",
    label: "Applications Assisted",
  },
  {
    icon: FileCheckCorner,
    value: "Step-by-step",
    label: "Document Guidance",
  },
  {
    icon: Clock3,
    value: "24–72 hrs",
    label: "Quick Processing Support",
  },
  {
    icon: HeartHandshake,
    value: "98%",
    label: "Customer Satisfaction",
  },
];

export default function StatsSection() {
  return (
    <section className="relative z-20 -mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-[40px] border border-black/5 bg-white/10 backdrop-blur-xs p-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="rounded-[28px] bg-[#F4F4F4] p-8  md:px-12 md:py-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div key={stat.label} className="flex items-center gap-5">
                    {/* Icon */}
                    <div className="flex p-3 shrink-0 items-center justify-center rounded-[18px] bg-[#E7773D]">
                      <Icon className="h-5 w-5 text-white stroke-[1.5]" />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="text-md font-semibold leading-none text-[#163B63]">
                        {stat.value}
                      </h3>

                      <p className="mt-2 text-xs leading-none text-[#66788A]">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
