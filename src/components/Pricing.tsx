
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Crown, Zap } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "2,999",
      originalPrice: "4,999",
      icon: Zap,
      description: "Perfect for fitness beginners",
      features: [
        "Access to 2 fitness programs",
        "Basic nutrition guide",
        "Mobile app access",
        "Email support",
        "Progress tracking",
        "30-day money back guarantee"
      ],
      popular: false,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Professional",
      price: "7,999",
      originalPrice: "12,999",
      icon: Star,
      description: "Most popular choice for serious fitness enthusiasts",
      features: [
        "Access to ALL fitness programs",
        "Complete nutrition & meal plans",
        "Priority support",
        "Advanced progress tracking",
        "Live group sessions (monthly)",
        "Personalized workout adjustments",
        "Recipe database access",
        "Lifetime updates"
      ],
      popular: true,
      color: "from-[#e3bd30] to-[#f4d03f]"
    },
    {
      name: "Elite",
      price: "15,999",
      originalPrice: "24,999",
      icon: Crown,
      description: "For those who want premium everything",
      features: [
        "Everything in Professional",
        "1-on-1 trainer consultations",
        "Custom meal planning",
        "Weekly check-ins",
        "Form analysis & feedback",
        "Supplement recommendations",
        "VIP community access",
        "Early access to new programs",
        "Direct trainer messaging"
      ],
      popular: false,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Fitness Journey
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Flexible pricing plans designed to fit your fitness goals and budget. 
            Start your transformation today with lifetime access.
          </p>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#e3bd30]/10 to-[#f4d03f]/10 border border-[#e3bd30]/20 rounded-full px-6 py-2">
            <Star className="w-4 h-4 text-[#e3bd30]" />
            <span className="text-[#e3bd30] font-medium">Limited Time Offer - Up to 60% Off!</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index} 
                className={`relative ${
                  plan.popular 
                    ? 'border-[#e3bd30] shadow-2xl scale-105 bg-gradient-to-b from-[#e3bd30]/5 to-transparent' 
                    : 'border-gray-200 dark:border-gray-800'
                } hover:shadow-lg transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black px-6 py-2 rounded-full font-semibold text-sm">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ₹{plan.price}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">One-time payment • Lifetime access</p>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-3 font-semibold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black' 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                    }`}
                  >
                    Get Started Now
                  </Button>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    30-day money-back guarantee
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need help choosing the right plan? 
          </p>
          <Button variant="outline" className="border-[#e3bd30] text-[#e3bd30] hover:bg-[#e3bd30]/10">
            Contact Our Team
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
