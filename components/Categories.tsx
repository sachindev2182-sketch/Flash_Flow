import { Utensils, Home, Bus, BookOpen, Gamepad2, CreditCard } from "lucide-react";

export default function Categories() {
  const items = [
    { label: "Food & Cafes", icon: <Utensils className="w-7 h-7 text-orange-600" />, color: "bg-orange-100" },
    { label: "Hostel / Rent", icon: <Home className="w-7 h-7 text-blue-600" />, color: "bg-blue-100" },
    { label: "Travel", icon: <Bus className="w-7 h-7 text-green-600" />, color: "bg-green-100" },
    { label: "Education", icon: <BookOpen className="w-7 h-7 text-purple-600" />, color: "bg-purple-100" },
    { label: "Entertainment", icon: <Gamepad2 className="w-7 h-7 text-pink-600" />, color: "bg-pink-100" },
    { label: "Subscriptions", icon: <CreditCard className="w-7 h-7 text-yellow-600" />, color: "bg-yellow-600" },
  ];

  return (
    <section className="py-24 px-6 bg-[#f8f9fb]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0d0c22] mb-4">
            Built for how you actually spend
          </h2>
          <p className="text-[#6e6d7a] text-lg font-medium">
            No more manual entry. We categorize everything so you don’t have to.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center justify-center p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[14px] font-bold text-[#1a1c2e] text-center">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="inline-block px-6 py-3 bg-white border border-gray-100 rounded-full text-[#6e6d7a] text-sm font-bold shadow-sm">
            ✨ Your expenses are automatically organized so you don’t have to think twice.
          </p>
        </div>
      </div>
    </section>
  );
}