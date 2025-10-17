
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BatchDetailPage from '@/components/BatchDetailPage';
import CircularNav from '@/components/CircularNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// Removed RazorpayPayment import as bottom payment section is no longer shown

const BatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrOpen, setQrOpen] = useState(false);

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: async () => {
      if (!id) throw new Error('Batch ID is required');
      
      console.log('Fetching batch with ID:', id);
      
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching batch:', error);
        throw error;
      }

      console.log('Batch data:', data);
      return data;
    },
    enabled: !!id,
  });

  const { data: userEnrollments } = useQuery({
    queryKey: ['user-enrollments', user?.id, batch?.id],
    queryFn: async () => {
      if (!user || !batch?.id) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('batch_id, payment_status')
        .eq('user_id', user.id)
        .eq('batch_id', batch.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!batch?.id,
  });

  const isEnrolled = userEnrollments?.some(
    enrollment => enrollment.payment_status === 'paid'
  );

  const handleBack = () => {
    navigate('/batches');
  };

  const handleEnroll = () => {
    setQrOpen(true);
  };

  if (isLoading) {
    return (
      <>
        <CircularNav />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e3bd30]"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!batch) {
    return (
      <>
        <CircularNav />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Batch not found</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Batch ID: {id}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Check the console for debug information.</p>
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black rounded-lg hover:from-[#d4a82a] hover:to-[#e6c235] font-semibold transition-all duration-300"
              >
                Back to Batches
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CircularNav />
      <div className="pt-20">
        <BatchDetailPage
          batch={batch}
          onBack={handleBack}
          onEnroll={handleEnroll}
          isEnrolled={!!isEnrolled}
        />
        {/* QR Code Payment Modal */}
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                Scan to Pay • ₹{Number(batch.price).toLocaleString('en-IN')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-muted">
                <img src="/lovable-uploads/qr%20code.png" alt="Payment QR Code" className="w-full h-auto object-contain" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                You’re enrolling in <span className="font-medium text-foreground">{batch.title}</span>.
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black" onClick={() => setQrOpen(false)}>
                  Done
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#e3bd30] text-[#e3bd30] hover:bg-[#e3bd30] hover:text-black"
                  onClick={() => navigate('/batches')}
                >
                  Back to Batches
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default BatchDetail;
