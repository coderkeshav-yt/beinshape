
import CircularNav from '@/components/CircularNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const contactData = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([contactData]);

      if (error) {
        console.error('Error submitting contact form:', error);
        toast.error('Failed to send message. Please try again.');
        return;
      }

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['123 Fitness Street', 'Gym City, GC 12345']
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91 98765 43210', '+91 87654 32109']
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@beinshape.com', 'support@beinshape.com']
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Mon-Fri: 6AM-10PM', 'Sat-Sun: 7AM-9PM']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-black dark:to-gray-900">
      <CircularNav />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 font-dejanire">
              Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-dejanire">
              Ready to start your fitness journey? Contact us today and let's transform your life together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-white/10 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-dejanire">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-800 dark:text-white font-dejanire">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="bg-white/50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder="Enter your first name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-800 dark:text-white font-dejanire">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="bg-white/50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder="Enter your last name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-800 dark:text-white font-dejanire">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="bg-white/50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-800 dark:text-white font-dejanire">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    className="bg-white/50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="What's this about?"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-800 dark:text-white font-dejanire">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    className="bg-white/50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[120px]"
                    placeholder="Tell us more..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed font-dejanire"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-xl flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-dejanire">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 dark:text-gray-300 font-dejanire">{detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Google Maps */}
              <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-dejanire">Find Us</h3>
                <div className="rounded-xl overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28650.67761897247!2d85.85673067431637!3d26.153226899999993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39edb9d3e45501a7%3A0xd6ab757a0b3e35d7!2sBe%20In%20Shape%20Gym%20%7C%20Best%20Gym%20In%20Darbhanga!5e0!3m2!1sen!2sin!4v1761631887450!5m2!1sen!2sin" 
                    width="100%" 
                    height="300" 
                    style={{border: 0}} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                    title="Be In Shape Gym Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
