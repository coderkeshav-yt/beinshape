
import { HeroSection } from '@/components/ui/hero-section-dark';
import { useEffect } from 'react';

// Optimize images with proper dimensions
const HERO_IMAGES = {
  light: '/Web_asset/hero_section.jpg',
  dark: '/Web_asset/hero_section.jpg'
};

const Hero = () => {
  // Preload hero images
  useEffect(() => {
    const preloadImages = () => {
      [HERO_IMAGES.light, HERO_IMAGES.dark].forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };
    preloadImages();
  }, []);

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
        light: HERO_IMAGES.light,
        dark: HERO_IMAGES.dark,
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
