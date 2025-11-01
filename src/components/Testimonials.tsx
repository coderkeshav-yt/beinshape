
import { TestimonialCarousel } from '@/components/ui/testimonial';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3d8?auto=format&fit=crop&w=200&h=200',
      description: 'Be In Shape transformed my life completely. The trainers are incredible and the programs are perfectly structured for maximum results.'
    },
    {
      id: 2,
      name: 'Jon Doe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200',
      description: 'The strength training program helped me reach new personal records. Highly recommend to anyone serious about fitness and health.'
    },
    {
      id: 3,
      name: 'Ravi Jha',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200',
      description: 'Perfect for my busy schedule. The nutrition guidance and flexible training options work amazingly well for working professionals.'
    },
    {
      id: 4,
      name: 'David Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200',
      description: 'Outstanding results in just 3 months! The personalized approach and expert guidance made all the difference in my fitness journey.'
    },
    {
      id: 5,
      name: 'Sourav',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200',
      description: 'The community support and professional trainers create an environment where you can truly excel and achieve your fitness goals.'
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Hear from our community of fitness warriors who transformed their lives
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <TestimonialCarousel 
            testimonials={testimonials}
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

