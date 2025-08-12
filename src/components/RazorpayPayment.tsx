
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import CouponInput from '@/components/CouponInput';

interface RazorpayPaymentProps {
  batchId: string;
  batchTitle: string;
  amount: number;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment = ({ batchId, batchTitle, amount, onSuccess }: RazorpayPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string>();
  const { user } = useAuth();

  const finalAmount = amount - discount;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCouponApplied = (discountAmount: number, couponCode: string) => {
    setDiscount(discountAmount);
    setAppliedCoupon(couponCode);
  };

  const handleCouponRemoved = () => {
    setDiscount(0);
    setAppliedCoupon(undefined);
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to enroll in a batch');
      return;
    }

    setLoading(true);

    try {
      // Check if user is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('payment_status')
        .eq('user_id', user.id)
        .eq('batch_id', batchId)
        .eq('payment_status', 'paid')
        .single();

      if (existingEnrollment) {
        toast.error('You are already enrolled in this batch');
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }

      // Create enrollment record
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .upsert([
          {
            user_id: user.id,
            batch_id: batchId,
            payment_status: 'pending'
          }
        ], {
          onConflict: 'user_id,batch_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        toast.error('Failed to create enrollment. Please try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: 'your_razorpay_key_here', // Replace with your actual Razorpay key
        amount: finalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Be In Shape',
        description: `Enrollment for ${batchTitle}`,
        image: '/lovable-uploads/1588d38a-7e4d-4f9f-a394-e79adb26ec99.png',
        order_id: enrollment.id,
        handler: async function (response: any) {
          try {
            console.log('Payment successful:', response);
            
            // Update enrollment with payment success
            const { error: updateError } = await supabase
              .from('enrollments')
              .update({
                payment_status: 'paid',
                stripe_session_id: response.razorpay_payment_id,
                enrolled_at: new Date().toISOString()
              })
              .eq('id', enrollment.id);

            // Update coupon usage if applied
            if (appliedCoupon) {
              try {
                await supabase.rpc('increment_coupon_usage', {
                  coupon_code: appliedCoupon
                });
              } catch (couponError) {
                console.error('Error updating coupon usage:', couponError);
                // Don't fail the payment for this
              }
            }

            if (updateError) {
              console.error('Error updating enrollment:', updateError);
              toast.error('Payment successful but enrollment update failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
            } else {
              toast.success('🎉 Payment successful! You are now enrolled in the batch.');
              if (onSuccess) onSuccess();
              // Refresh the page after a short delay to reflect the new enrollment status
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          } catch (error) {
            console.error('Error processing payment success:', error);
            toast.error('Payment successful but enrollment update failed. Please contact support.');
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          contact: user.user_metadata?.mobile_number || ''
        },
        theme: {
          color: '#e3bd30'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setLoading(false);
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300,
        remember_customer: true
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Please try again'}`);
        
        // Update enrollment status to failed
        supabase
          .from('enrollments')
          .update({ payment_status: 'failed' })
          .eq('id', enrollment.id);
      });

      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showCheckout) {
    return (
      <Button
        onClick={() => setShowCheckout(true)}
        className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black hover:from-[#d4a82a] hover:to-[#e6c235] font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <div className="flex items-center justify-center space-x-3">
          <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Enroll Now - ₹{amount.toLocaleString()}</span>
          <Shield className="w-4 h-4 opacity-70" />
        </div>
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center font-dejanire">Complete Your Enrollment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Batch Details */}
        <div>
          <h3 className="font-semibold text-lg font-dejanire">{batchTitle}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Premium Fitness Program</p>
        </div>

        <Separator />

        {/* Coupon Input */}
        <CouponInput
          batchId={batchId}
          originalAmount={amount}
          onCouponApplied={handleCouponApplied}
          onCouponRemoved={handleCouponRemoved}
          appliedCoupon={appliedCoupon}
        />

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Batch Price</span>
            <span>₹{amount.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discount.toLocaleString()}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-[#e3bd30]">₹{finalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Button */}
        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black hover:from-[#d4a82a] hover:to-[#e6c235] font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Pay ₹{finalAmount.toLocaleString()}</span>
                <Shield className="w-4 h-4 opacity-70" />
              </div>
            )}
          </Button>
          
          <Button
            onClick={() => setShowCheckout(false)}
            variant="outline"
            className="w-full"
          >
            Back
          </Button>
        </div>

        {/* Security Note */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Your payment is secured with industry-standard encryption
        </p>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
