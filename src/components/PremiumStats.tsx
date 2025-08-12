
import { Users, Trophy, Star, Zap } from 'lucide-react';

const PremiumStats = () => {
  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "Happy Members",
      description: "Transformed their fitness journey"
    },
    {
      icon: Trophy,
      number: "95%",
      label: "Success Rate",
      description: "Members achieve their goals"
    },
    {
      icon: Star,
      number: "4.9/5",
      label: "Rating",
      description: "Average member satisfaction"
    },
    {
      icon: Zap,
      number: "500+",
      label: "Workouts",
      description: "Professional training programs"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">Thousands</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our community of fitness enthusiasts who have transformed their lives through our premium training programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#e3bd30]/50"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </h3>
                <h4 className="text-lg font-semibold text-[#e3bd30] mb-2">
                  {stat.label}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumStats;
