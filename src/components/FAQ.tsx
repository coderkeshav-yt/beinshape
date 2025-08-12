
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "What makes Be In Shape different from other fitness programs?",
      answer: "Be In Shape offers personalized training programs designed by certified trainers, comprehensive nutrition guides, and lifetime access to all content. Our approach focuses on sustainable fitness habits rather than quick fixes."
    },
    {
      question: "Do I need any equipment to start?",
      answer: "Most of our programs can be started with minimal equipment. We offer both bodyweight routines and equipment-based workouts. Each program clearly lists the required equipment so you can choose what works best for you."
    },
    {
      question: "How long does it take to see results?",
      answer: "Results vary depending on your starting point, consistency, and goals. Most members start seeing improvements in strength and energy within 2-4 weeks, with visible changes typically occurring within 6-8 weeks of consistent training."
    },
    {
      question: "Can I access the programs on my mobile device?",
      answer: "Yes! Our platform is fully responsive and works seamlessly on all devices including smartphones, tablets, and computers. You can access your training programs anywhere, anytime."
    },
    {
      question: "What if I'm a complete beginner?",
      answer: "Perfect! We have programs specifically designed for beginners. Each program includes detailed instructions, proper form demonstrations, and progressive difficulty levels to ensure you start safely and build confidence."
    },
    {
      question: "Is there ongoing support available?",
      answer: "Absolutely! Each program includes access to our expert support team. You can ask questions, get form checks, and receive guidance throughout your fitness journey."
    },
    {
      question: "What's included in the lifetime access?",
      answer: "Lifetime access includes all video lessons, workout plans, nutrition guides, progress tracking tools, and any future updates to your purchased programs. Once you buy a program, it's yours forever."
    },
    {
      question: "Can I switch between different programs?",
      answer: "Yes, if you've purchased multiple programs, you can switch between them at any time. We also offer bundle deals if you're interested in multiple training styles."
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get answers to the most common questions about our fitness programs
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-[#e3bd30] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#e3bd30] flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
