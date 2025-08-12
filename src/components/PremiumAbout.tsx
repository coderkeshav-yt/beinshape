
import { CheckCircle, Award, Target, Heart } from 'lucide-react';

const PremiumAbout = () => {
  const features = [
    {
      icon: Award,
      title: "Certified Trainers",
      description: "Learn from industry-certified fitness professionals with years of experience"
    },
    {
      icon: Target,
      title: "Personalized Programs",
      description: "Customized workout plans tailored to your fitness level and goals"
    },
    {
      icon: Heart,
      title: "Holistic Approach",
      description: "Complete wellness programs covering fitness, nutrition, and mental health"
    },
    {
      icon: CheckCircle,
      title: "Proven Results",
      description: "Track record of helping thousands achieve their fitness transformation"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#e3bd30]/20 to-[#f4d03f]/20 text-[#e3bd30] rounded-full text-sm font-semibold mb-4">
                About BeInShape
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Transforming Lives Through 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]"> Premium Fitness</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                At BeInShape, we believe fitness is not just about physical transformation—it's about building confidence, 
                discipline, and a lifestyle that empowers you to achieve your greatest potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-[#e3bd30] to-[#f4d03f] rounded-3xl p-8 shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  To make premium fitness training accessible to everyone, providing world-class 
                  programs that deliver real results and lasting lifestyle changes.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#e3bd30] mb-1">5+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#e3bd30] mb-1">50+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Expert Trainers</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#e3bd30]/20 to-[#f4d03f]/20 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-[#f4d03f]/20 to-[#e3bd30]/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumAbout;
