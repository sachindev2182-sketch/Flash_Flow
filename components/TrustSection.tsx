export default function TrustSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto bg-[#14162e] rounded-[45px] p-10 md:p-20 text-center text-white shadow-2xl overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-50"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-bold tracking-wide">SECURE & ENCRYPTED</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
            Your money is safe with us.
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
            Your data is encrypted using 256-bit AES standards and is never shared with third parties. 
            Trusted by <span className="text-white font-bold">10,000+ users</span> worldwide.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
            {/* Logos Placeholder */}
            <div className="font-bold text-xl tracking-tighter italic">FIN-SAFE</div>
            <div className="font-bold text-xl tracking-tighter italic">TRUST-E</div>
            <div className="font-bold text-xl tracking-tighter italic">SECURE-PAY</div>
            <div className="font-bold text-xl tracking-tighter italic">BANK-LEVEL</div>
          </div>
        </div>
      </div>
    </section>
  );
}