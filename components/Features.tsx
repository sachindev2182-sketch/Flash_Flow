import { BarChart3, Calendar, LineChart, ShieldCheck } from "lucide-react";

export default function Features() {
  const features = [
    { title: "Expense Tracking", desc: "Categorize income and spending automatically.", icon: <BarChart3 className="w-8 h-8 text-blue-600" /> },
    { title: "Budget Planning", desc: "Set monthly goals and stay on track.", icon: <Calendar className="w-8 h-8 text-indigo-600" /> },
    { title: "Insights & Reports", desc: "Visual charts for smarter financial decisions.", icon: <LineChart className="w-8 h-8 text-violet-600" /> },
    { title: "Secure Data", desc: "Bank-level encryption for your privacy.", icon: <ShieldCheck className="w-8 h-8 text-emerald-600" /> },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0d0c22]">Everything you need to grow</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
            <h3 className="text-xl font-bold mb-3 text-[#1a1c2e]">{f.title}</h3>
            <p className="text-[#6e6d7a] text-[15px] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}