
import CircularNav from '@/components/CircularNav';
import Footer from '@/components/Footer';
import { Award, Users, Target, Heart, Star, CheckCircle, Zap, Trophy } from 'lucide-react';

const About = () => {
  const team = [
    {
      name: "Ravi prakash",
      role: "Founder & Head Trainer",
      image: "/placeholder.svg",
      description: "15+ years in fitness training with certifications from ACSM and NASM"
    },
    {
      name: "keshav singh",
      role: "Nutrition Specialist",
      image: "/placeholder.svg", 
      description: "Registered Dietitian specializing in sports nutrition and wellness"
    },
    {
      name: "keshav singh",
      role: "Strength & Conditioning Coach",
      image: "/placeholder.svg",
      description: "Former Olympic trainer with expertise in functional movement and rehabilitation"
    },
    {
      name: "keshav singh",
      role: "Yoga & Wellness Instructor",
      image: "/placeholder.svg",
      description: "Certified yoga instructor focusing on mind-body connection and flexibility"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion for Fitness",
      description: "We live and breathe fitness, bringing infectious energy to every session and program we create."
    },
    {
      icon: Target,
      title: "Goal-Oriented Approach",
      description: "Every program is designed with specific, measurable goals to ensure you see real progress."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We believe in the power of community support and motivation to achieve lasting transformation."
    },
    {
      icon: Award,
      title: "Excellence in Training",
      description: "Our commitment to the highest standards of training and continuous improvement drives us forward."
    }
  ];

  const achievements = [
    { number: "50,000+", label: "Lives Transformed" },
    { number: "500+", label: "Certified Programs" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "25+", label: "Awards Won" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <CircularNav />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-[#e3bd30]/20 to-[#f4d03f]/20 text-[#e3bd30] rounded-full text-sm font-semibold mb-6">
              About BeInShape
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Redefining 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]"> Fitness Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              We're not just another fitness company. We're your partners in transformation, 
              committed to helping you unlock your full potential through premium training programs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <Star className="w-5 h-5 text-[#e3bd30]" />
                <span className="text-gray-900 dark:text-white font-semibold">Industry Leading</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-900 dark:text-white font-semibold">Proven Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story of 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">Transformation</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400">
                <p>
                  BeInShape was born from a simple belief: everyone deserves access to world-class fitness training, 
                  regardless of their starting point or background. What started as a small local gym has evolved 
                  into a premium fitness ecosystem that has transformed thousands of lives.
                </p>
                <p>
                  Our journey began with a group of passionate trainers who were frustrated by the one-size-fits-all 
                  approach to fitness. We knew that real transformation required personalized attention, scientific 
                  methodology, and unwavering support.
                </p>
                <p>
                  Today, we're proud to offer comprehensive programs that address not just physical fitness, but 
                  mental wellness, nutritional health, and lifestyle transformation. Every program we create is 
                  backed by science and proven by results.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#e3bd30] to-[#f4d03f] rounded-3xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    To democratize premium fitness training and make world-class health and wellness 
                    accessible to everyone, everywhere.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Trophy className="w-8 h-8 text-[#e3bd30]" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Excellence Guaranteed</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Premium quality in every program</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">Values</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do and shape the experience we create for our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">Expert Team</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              World-class trainers and specialists dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{member.name}</h3>
                <p className="text-[#e3bd30] font-semibold mb-4 text-center">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Join thousands of success stories and begin your premium fitness journey today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
              Start Your Journey
            </button>
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              View Programs
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
