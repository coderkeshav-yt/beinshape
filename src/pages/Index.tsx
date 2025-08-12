
import { lazy, Suspense } from 'react';
import CircularNav from '@/components/CircularNav';
import Hero from '@/components/Hero';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Lazy load components that aren't immediately visible
const Features = lazy(() => import('@/components/Features'));
const Pricing = lazy(() => import('@/components/Pricing'));
const Testimonials = lazy(() => import('@/components/Testimonials'));
const FAQ = lazy(() => import('@/components/FAQ'));
const Footer = lazy(() => import('@/components/Footer'));
const PremiumStats = lazy(() => import('@/components/PremiumStats'));
const PremiumAbout = lazy(() => import('@/components/PremiumAbout'));

// Loading component for lazy loaded components
const LazyLoadedComponent = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner /></div>}>
    {children}
  </Suspense>
);

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
