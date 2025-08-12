
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email: email.trim() }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('This email is already subscribed to our newsletter');
        } else {
          toast.error('Failed to subscribe. Please try again.');
        }
      } else {
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e3bd30]/30 to-[#f4d03f]/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(227,189,48,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(244,208,63,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Enhanced Brand Section */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/1588d38a-7e4d-4f9f-a394-e79adb26ec99.png" 
                alt="Be In Shape Logo" 
                className="h-14 w-auto drop-shadow-lg"
              />
              <span className="text-3xl font-bold font-dejanire bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] bg-clip-text text-transparent">
                Be In Shape
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed font-dejanire text-lg">
              Transform your body, elevate your mind, and unleash your potential with our premium fitness programs designed for lasting results.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Youtube, href: "#", label: "YouTube" }
              ].map(({ icon: Icon, href, label }) => (
                <a 
                  key={label}
                  href={href} 
                  className="group w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-[#e3bd30] hover:bg-[#e3bd30]/20 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[#e3bd30]/30 hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 font-dejanire text-white relative">
              Quick Links
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full"></div>
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Batches', path: '/batches' },
                { name: 'About', path: '/about' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-[#e3bd30] transition-all duration-300 font-dejanire flex items-center group text-lg"
                  >
                    <span className="w-2 h-2 bg-[#e3bd30] rounded-full mr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-125"></span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Contact Info */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 font-dejanire text-white relative">
              Contact Info
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full"></div>
            </h3>
            <ul className="space-y-6">
              {[
                { icon: Phone, text: '++91 8317434600', href: 'tel:+15551234567' },
                { icon: Mail, text: 'info@beinshape.com', href: 'mailto:info@beinshape.com' },
                { icon: MapPin, text: '123 Fitness Street, Gym City', href: '#' }
              ].map(({ icon: Icon, text, href }, index) => (
                <li key={index} className="flex items-center space-x-4 text-gray-300 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#e3bd30]/20 to-[#f4d03f]/20 rounded-xl flex items-center justify-center group-hover:from-[#e3bd30]/30 group-hover:to-[#f4d03f]/30 transition-all duration-300 backdrop-blur-sm border border-[#e3bd30]/20">
                    <Icon className="w-5 h-5 text-[#e3bd30] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <a 
                    href={href} 
                    className="font-dejanire text-lg hover:text-[#e3bd30] transition-colors duration-300 group-hover:translate-x-1 transform"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Newsletter */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 font-dejanire text-white relative">
              Stay Updated
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full"></div>
            </h3>
            <p className="text-gray-300 mb-8 font-dejanire leading-relaxed text-lg">
              Subscribe to get the latest fitness tips, exclusive offers, and motivational content delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-6">
              <Input 
                type="email" 
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm font-dejanire h-12 rounded-xl focus:border-[#e3bd30] focus:ring-1 focus:ring-[#e3bd30] transition-all duration-300"
                disabled={isSubmitting}
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold font-dejanire h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
              </Button>
            </form>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="border-t border-white/10 mt-16 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <p className="text-gray-400 font-dejanire text-lg">
              &copy; 2025 Be In Shape. All rights reserved.
            </p>
            <div className="flex items-center space-x-3 text-gray-400 font-dejanire text-lg">
              <span>Made with</span>
              <Heart className="w-5 h-5 text-red-500 fill-current animate-pulse" />
              <span>for fitness enthusiasts worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
