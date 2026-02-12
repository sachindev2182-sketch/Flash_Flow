import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import TrustSection from '@/components/TrustSection';
import Categories from '@/components/Categories';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-blue-100">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <TrustSection />
      <Categories />
    </div>
  );
}