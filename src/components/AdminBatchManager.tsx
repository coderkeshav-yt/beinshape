import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen, Users, TrendingUp, Settings } from 'lucide-react';
import AdminCouponManager from './AdminCouponManager';
import BatchContentManager from './BatchContentManager';

const AdminBatchManager = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [managingContentBatch, setManagingContentBatch] = useState<any>(null);
  const [newBatch, setNewBatch] = useState({
    title: '',
    description: '',
    price: '',
    image_url: ''
  });
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ['admin-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: enrollmentStats } = useQuery({
    queryKey: ['enrollment-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('batch_id, payment_status')
        .eq('payment_status', 'paid');

      if (error) throw error;
      
      const stats = data.reduce((acc: Record<string, number>, enrollment) => {
        if (enrollment.batch_id) {
          acc[enrollment.batch_id] = (acc[enrollment.batch_id] || 0) + 1;
        }
        return acc;
      }, {});
      
      return stats;
    },
  });

  const handleCreateBatch = async () => {
    if (!newBatch.title || !newBatch.price) {
      toast.error('Please fill in title and price');
      return;
    }

    try {
      // Generate slug from title
      const generateSlug = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };

      const slug = generateSlug(newBatch.title);

      const { error } = await supabase
        .from('batches')
        .insert([{
          title: newBatch.title,
          description: newBatch.description,
          price: parseInt(newBatch.price),
          image_url: newBatch.image_url || null,
          slug: slug
        }]);

      if (error) throw error;

      toast.success('Batch created successfully!');
      setIsCreateModalOpen(false);
      setNewBatch({ title: '', description: '', price: '', image_url: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] });
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    }
  };

  const handleUpdateBatch = async () => {
    if (!editingBatch || !editingBatch.title || !editingBatch.price) {
      toast.error('Please fill in title and price');
      return;
    }

    try {
      // Generate slug from title
      const generateSlug = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };

      const slug = generateSlug(editingBatch.title);

      const { error } = await supabase
        .from('batches')
        .update({
          title: editingBatch.title,
          description: editingBatch.description,
          price: parseInt(editingBatch.price),
          image_url: editingBatch.image_url || null,
          slug: slug
        })
        .eq('id', editingBatch.id);

      if (error) throw error;

      toast.success('Batch updated successfully!');
      setEditingBatch(null);
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] });
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Failed to update batch');
    }
  };

  const handleDeleteBatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Batch deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] });
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
  };

  const toggleBatchStatus = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('batches')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Batch ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] });
    } catch (error) {
      console.error('Error updating batch status:', error);
      toast.error('Failed to update batch status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e3bd30]"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If managing content for a specific batch
  if (managingContentBatch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setManagingContentBatch(null)}
          >
            ← Back to Batches
          </Button>
          <h2 className="text-2xl font-bold">Content Management</h2>
        </div>
        <BatchContentManager 
          batchId={managingContentBatch.id}
          batchTitle={managingContentBatch.title}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-[#e3bd30]" />
              <div>
                <p className="text-2xl font-bold">{batches?.length || 0}</p>
                <p className="text-sm text-gray-500">Total Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {enrollmentStats ? Object.values(enrollmentStats).reduce((a, b) => a + b, 0) : 0}
                </p>
                <p className="text-sm text-gray-500">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {batches?.filter(b => b.is_active).length || 0}
                </p>
                <p className="text-sm text-gray-500">Active Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupon Management */}
      <AdminCouponManager />

      {/* Batch Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Batch Management</CardTitle>
              <CardDescription>Create and manage your fitness batches</CardDescription>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#e3bd30] hover:bg-[#d4a82a] text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Batch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Batch</DialogTitle>
                  <DialogDescription>
                    Create a new fitness batch for your students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Batch Title</Label>
                    <Input
                      id="title"
                      placeholder="Morning Fitness Batch"
                      value={newBatch.title}
                      onChange={(e) => setNewBatch({ ...newBatch, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this batch offers..."
                      value={newBatch.description}
                      onChange={(e) => setNewBatch({ ...newBatch, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="2999"
                      value={newBatch.price}
                      onChange={(e) => setNewBatch({ ...newBatch, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL (Optional)</Label>
                    <Input
                      id="image_url"
                      placeholder="https://example.com/image.jpg"
                      value={newBatch.image_url}
                      onChange={(e) => setNewBatch({ ...newBatch, image_url: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateBatch} className="w-full bg-[#e3bd30] hover:bg-[#d4a82a] text-black">
                    Create Batch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {batches && batches.length > 0 ? (
            <div className="space-y-4">
              {batches.map((batch) => (
                <Card key={batch.id} className="border-l-4 border-l-[#e3bd30]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{batch.title}</h3>
                          <Badge variant={batch.is_active ? 'default' : 'secondary'}>
                            {batch.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {enrollmentStats?.[batch.id] || 0} enrollments
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{batch.description}</p>
                        <p className="font-semibold text-[#e3bd30]">₹{batch.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setManagingContentBatch(batch)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Manage Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBatchStatus(batch.id, batch.is_active)}
                        >
                          {batch.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Dialog 
                          open={editingBatch?.id === batch.id} 
                          onOpenChange={(open) => !open && setEditingBatch(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingBatch({
                                id: batch.id,
                                title: batch.title,
                                description: batch.description || '',
                                price: batch.price.toString(),
                                image_url: batch.image_url || ''
                              })}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Batch</DialogTitle>
                            </DialogHeader>
                            {editingBatch && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-title">Batch Title</Label>
                                  <Input
                                    id="edit-title"
                                    value={editingBatch.title}
                                    onChange={(e) => setEditingBatch({ ...editingBatch, title: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingBatch.description}
                                    onChange={(e) => setEditingBatch({ ...editingBatch, description: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-price">Price (₹)</Label>
                                  <Input
                                    id="edit-price"
                                    type="number"
                                    value={editingBatch.price}
                                    onChange={(e) => setEditingBatch({ ...editingBatch, price: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-image_url">Image URL</Label>
                                  <Input
                                    id="edit-image_url"
                                    value={editingBatch.image_url}
                                    onChange={(e) => setEditingBatch({ ...editingBatch, image_url: e.target.value })}
                                  />
                                </div>
                                <Button onClick={handleUpdateBatch} className="w-full bg-[#e3bd30] hover:bg-[#d4a82a] text-black">
                                  Update Batch
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{batch.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBatch(batch.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No batches created yet</p>
              <p className="text-sm text-gray-400">Create your first batch to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBatchManager;
