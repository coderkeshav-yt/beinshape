
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { HeroSection } from '@/components/ui/hero-section-dark';

const Hero = () => {
  return (
    <HeroSection
      title="Premium Fitness Training Platform"
      subtitle={{
        regular: "Transform your body with ",
        gradient: "Be In Shape",
      }}
      description="Experience world-class fitness programs designed by certified trainers. Build strength, endurance, and confidence with our comprehensive training modules."
      ctaText="Join Today"
      ctaHref="/auth"
      bottomImage={{
        light: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=600",
        dark: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=600",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.3,
        cellSize: 50,
        lightLineColor: "#e3bd30",
        darkLineColor: "#e3bd30",
      }}
      className="min-h-screen bg-white dark:bg-black"
    />
  );
};

export default Hero;
