
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BatchDetailPage from '@/components/BatchDetailPage';
import CircularNav from '@/components/CircularNav';
import RazorpayPayment from '@/components/RazorpayPayment';

const BatchDetail = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', identifier],
    queryFn: async () => {
      if (!identifier) throw new Error('Batch identifier is required');
      
      // For now, just use ID lookup until slug field is added
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('id', identifier)
        .single();

      if (error) throw error;

      return data;
    },
    enabled: !!identifier,
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
    // Scroll to the bottom where the payment component is
    const paymentElement = document.getElementById('payment-section');
    if (paymentElement) {
      paymentElement.scrollIntoView({ behavior: 'smooth' });
    }
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
        {!isEnrolled && (
          <div id="payment-section" className="bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-md mx-auto">
                <RazorpayPayment
                  batchId={batch.id}
                  batchTitle={batch.title}
                  amount={batch.price}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BatchDetail;
