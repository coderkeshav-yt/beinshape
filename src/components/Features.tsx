
import { Trophy, Users, Zap, Heart, Target, Award } from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const Features = () => {
  const features = [
    {
      Icon: Trophy,
      name: 'Premium Training',
      description: 'World-class fitness programs designed by certified trainers for maximum results.',
      href: '/batches',
      cta: 'View Programs',
      background: <div className="absolute inset-0 bg-gradient-to-br from-[#e3bd30]/20 to-[#f4d03f]/20 dark:from-[#e3bd30]/10 dark:to-[#f4d03f]/10" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: Users,
      name: 'Expert Trainers',
      description: 'Learn from industry professionals with years of experience in fitness training.',
      href: '/about',
      cta: 'Meet Trainers',
      background: <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10" />,
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: Zap,
      name: 'High-Intensity Workouts',
      description: 'Maximize your results with scientifically proven high-intensity training methods.',
      href: '/batches',
      cta: 'Start Training',
      background: <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: Heart,
      name: 'Health & Nutrition',
      description: 'Holistic approach to fitness combining exercise with proper nutrition guidance.',
      href: '/contact',
      cta: 'Learn More',
      background: <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 dark:from-red-500/10 dark:to-pink-500/10" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Target,
      name: 'Goal Achievement',
      description: 'Customized programs designed to help you achieve your specific fitness goals efficiently.',
      href: '/dashboard',
      cta: 'Set Goals',
      background: <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Be In Shape?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the difference with our premium fitness programs and expert guidance
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
};

export default Features;
