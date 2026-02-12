export default function HowItWorks() {
  const steps = [
    { step: "01", title: "Add Transactions", desc: "Connect accounts or enter data manually." },
    { step: "02", title: "Categorize", desc: "Your spending is sorted automatically." },
    { step: "03", title: "Analyze", desc: "Improve spending with smart insights." },
  ];

  return (
    <section className="py-24 bg-[#f8f9fb] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0d0c22]">Simple 3-step tracking</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center md:text-left">
              <span className="text-6xl font-black text-blue-500/10 absolute -top-10 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0">
                {s.step}
              </span>
              <h3 className="text-2xl font-bold mb-4 text-[#1a1c2e] relative">{s.title}</h3>
              <p className="text-[#6e6d7a] text-lg font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}