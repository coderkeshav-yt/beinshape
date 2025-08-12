
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

interface AddChapterModalProps {
  batchId: string;
  onClose: () => void;
  onChapterAdded: () => void;
}

const AddChapterModal = ({ batchId, onClose, onChapterAdded }: AddChapterModalProps) => {
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    order_index: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('chapters')
        .insert([{
          title: chapterForm.title,
          description: chapterForm.description,
          batch_id: batchId,
          order_index: chapterForm.order_index,
        }]);

      if (error) throw error;

      toast.success('Chapter added successfully!');
      setChapterForm({ title: '', description: '', order_index: 1 });
      onChapterAdded();
      onClose();
    } catch (error) {
      console.error('Error adding chapter:', error);
      toast.error('Error adding chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Chapter</CardTitle>
              <CardDescription>Create a new chapter for this batch</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                value={chapterForm.title}
                onChange={(e) => setChapterForm({...chapterForm, title: e.target.value})}
                placeholder="Enter chapter title"
                required
              />
            </div>
            <div>
              <Label htmlFor="chapter-description">Description</Label>
              <Textarea
                id="chapter-description"
                value={chapterForm.description}
                onChange={(e) => setChapterForm({...chapterForm, description: e.target.value})}
                placeholder="Enter chapter description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="order-index">Order Index</Label>
              <Input
                id="order-index"
                type="number"
                min="1"
                value={chapterForm.order_index}
                onChange={(e) => setChapterForm({...chapterForm, order_index: parseInt(e.target.value)})}
                placeholder="Chapter order"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add Chapter'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddChapterModal;
