
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

const AdminCouponManager = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    usage_limit: '',
    expires_at: ''
  });
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          code: newCoupon.code.toUpperCase(),
          discount_type: newCoupon.discount_type,
          discount_value: parseFloat(newCoupon.discount_value),
          usage_limit: newCoupon.usage_limit ? parseInt(newCoupon.usage_limit) : null,
          expires_at: newCoupon.expires_at || null
        }]);

      if (error) throw error;

      toast.success('Coupon created successfully!');
      setIsCreateModalOpen(false);
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        usage_limit: '',
        expires_at: ''
      });
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Failed to create coupon');
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Failed to update coupon status');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e3bd30]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Coupon Management
            </CardTitle>
            <CardDescription>Create and manage discount coupons</CardDescription>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#e3bd30] hover:bg-[#d4a82a] text-black">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogDescription>
                  Create a new discount coupon for your batches
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    placeholder="SAVE20"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={newCoupon.discount_type}
                    onValueChange={(value) => setNewCoupon({ ...newCoupon, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">
                    Discount Value ({newCoupon.discount_type === 'percentage' ? '%' : '₹'})
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    placeholder={newCoupon.discount_type === 'percentage' ? '20' : '500'}
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    placeholder="100"
                    value={newCoupon.usage_limit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={newCoupon.expires_at}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateCoupon} className="w-full bg-[#e3bd30] hover:bg-[#d4a82a] text-black">
                  Create Coupon
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {coupons && coupons.length > 0 ? (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="border-l-4 border-l-[#e3bd30]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{coupon.code}</h3>
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}% off` 
                          : `₹${coupon.discount_value} off`}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-1">
                        <span>Used: {coupon.usage_count}</span>
                        {coupon.usage_limit && <span>Limit: {coupon.usage_limit}</span>}
                        {coupon.expires_at && (
                          <span>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                      >
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No coupons created yet</p>
            <p className="text-sm text-gray-400">Create your first coupon to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCouponManager;
