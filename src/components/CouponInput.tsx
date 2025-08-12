
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Tag, X } from 'lucide-react';

interface CouponInputProps {
  batchId: string;
  originalAmount: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  is_active: boolean;
}

const CouponInput = ({ 
  batchId, 
  originalAmount, 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon 
}: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        toast.error('Invalid or expired coupon code');
        setLoading(false);
        return;
      }

      const typedCoupon = coupon as Coupon;

      // Check if coupon is expired
      if (typedCoupon.expires_at && new Date(typedCoupon.expires_at) < new Date()) {
        toast.error('This coupon has expired');
        setLoading(false);
        return;
      }

      // Check usage limit
      if (typedCoupon.usage_limit && typedCoupon.usage_count >= typedCoupon.usage_limit) {
        toast.error('This coupon has reached its usage limit');
        setLoading(false);
        return;
      }

      // Calculate discount
      let discountAmount = 0;
      if (typedCoupon.discount_type === 'percentage') {
        discountAmount = (originalAmount * typedCoupon.discount_value) / 100;
      } else {
        discountAmount = typedCoupon.discount_value;
      }

      // Ensure discount doesn't exceed original amount
      discountAmount = Math.min(discountAmount, originalAmount);

      onCouponApplied(discountAmount, typedCoupon.code);
      toast.success(`Coupon applied! You saved ₹${discountAmount}`);
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    toast.info('Coupon removed');
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-green-600" />
          <span className="text-green-700 dark:text-green-400 font-medium">
            Coupon "{appliedCoupon}" applied
          </span>
        </div>
        <Button
          onClick={removeCoupon}
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Have a coupon code?
        </span>
      </div>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="flex-1"
          disabled={loading}
        />
        <Button
          onClick={applyCoupon}
          disabled={loading || !couponCode.trim()}
          className="bg-[#e3bd30] hover:bg-[#d4a82a] text-black"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CouponInput;
