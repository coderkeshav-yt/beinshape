
import CircularNav from '@/components/CircularNav';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import PremiumStats from '@/components/PremiumStats';
import PremiumAbout from '@/components/PremiumAbout';

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <CircularNav />
      <Hero />
      
      <LazyLoadedComponent>
        <PremiumStats />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <Features />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <PremiumAbout />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <Pricing />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <Testimonials />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <FAQ />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <Footer />
      </LazyLoadedComponent>
    </div>
  );
};

export default Index;
