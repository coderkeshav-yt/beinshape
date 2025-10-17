import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CircularNav from '@/components/CircularNav';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
// Removed Pricing section in favor of featured batches on the homepage
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import PremiumStats from '@/components/PremiumStats';
import PremiumAbout from '@/components/PremiumAbout';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Loading component for lazy loaded components
const LazyLoadedComponent = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner /></div>}>
    {children}
  </Suspense>
);

const Index = () => {
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  const { data: batches } = useQuery({
    queryKey: ['homepage-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const handleViewDetails = (batch: any) => {
    navigate(`/batches/${batch.id}`);
  };

  const handleEnrollNow = (batch: any) => {
    setSelectedBatch(batch);
    setQrOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <CircularNav />
      <Hero />
      
      <LazyLoadedComponent>
        <PremiumStats />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <Features />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <PremiumAbout />
      </LazyLoadedComponent>
      
      {/* Featured Batches Section (replaces Pricing) */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3bd30] to-[#f4d03f]">Programs</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore our most popular batches. Learn at your pace with lifetime access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {batches?.map((batch: any, index: number) => (
              <Card key={batch.id} className="group border-0 overflow-hidden hover:shadow-xl transition-all">
                <CardContent className="p-0">
                  {batch.image_url ? (
                    <div className="h-56 overflow-hidden">
                      <img src={batch.image_url} alt={batch.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center bg-muted">
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-6">
                    <CardHeader className="p-0 mb-3">
                      <CardTitle className="text-xl mb-1">{batch.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{batch.description}</CardDescription>
                    </CardHeader>
                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-gray-900 dark:text-white font-semibold">₹{Number(batch.price).toLocaleString('en-IN')}</div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(batch)}
                          className="w-full sm:w-auto border-[#e3bd30] text-[#e3bd30] hover:bg-[#e3bd30] hover:text-black bg-transparent dark:bg-transparent"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button onClick={() => handleEnrollNow(batch)} className="w-full sm:w-auto bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black">
                          <Zap className="w-4 h-4 mr-2" />
                          Enroll Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/batches')}
              variant="outline"
              className="px-8 py-6 text-lg border-[#e3bd30] text-[#e3bd30] hover:bg-[#e3bd30] hover:text-black bg-transparent dark:bg-transparent"
            >
              Explore All Programs
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* QR Code Payment Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Scan to Pay{selectedBatch ? ` • ₹${Number(selectedBatch.price).toLocaleString('en-IN')}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-muted">
              <img
                src="/lovable-uploads/qr%20code.png"
                alt="Payment QR Code"
                className="w-full h-auto object-contain"
              />
            </div>
            {selectedBatch && (
              <div className="text-center text-sm text-muted-foreground">
                You’re enrolling in <span className="font-medium text-foreground">{selectedBatch.title}</span>.
              </div>
            )}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black"
                onClick={() => setQrOpen(false)}
              >
                Done
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#e3bd30] text-[#e3bd30] hover:bg-[#e3bd30] hover:text-black"
                onClick={() => selectedBatch && navigate(`/batches/${selectedBatch.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LazyLoadedComponent>
        <Testimonials />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <FAQ />
      </LazyLoadedComponent>
      
      <LazyLoadedComponent>
        <Footer />
      </LazyLoadedComponent>
    </div>
  );
};

export default Index;
