
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Plus, Youtube } from 'lucide-react';

interface AddChapterContentModalProps {
  chapterId: string;
  onClose: () => void;
  onContentAdded: () => void;
}

const AddChapterContentModal = ({ chapterId, onClose, onContentAdded }: AddChapterContentModalProps) => {
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    video_url: '',
    tags: '',
    order_index: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert tags string to array
      const tagsArray = contentForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase
        .from('chapter_content')
        .insert([{
          title: contentForm.title,
          description: contentForm.description,
          video_url: contentForm.video_url,
          tags: tagsArray,
          chapter_id: chapterId,
          order_index: contentForm.order_index,
        }]);

      if (error) throw error;

      toast.success('Chapter content added successfully!');
      setContentForm({ title: '', description: '', video_url: '', tags: '', order_index: 1 });
      onContentAdded();
      onClose();
    } catch (error) {
      console.error('Error adding chapter content:', error);
      toast.error('Error adding chapter content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                Add Chapter Content
              </CardTitle>
              <CardDescription>Create new content for this chapter</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="content-title">Content Title</Label>
              <Input
                id="content-title"
                value={contentForm.title}
                onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                placeholder="Enter content title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="video-url">YouTube Video URL</Label>
              <Input
                id="video-url"
                type="url"
                value={contentForm.video_url}
                onChange={(e) => setContentForm({...contentForm, video_url: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the full YouTube URL here
              </p>
            </div>

            <div>
              <Label htmlFor="content-description">Description</Label>
              <Textarea
                id="content-description"
                value={contentForm.description}
                onChange={(e) => setContentForm({...contentForm, description: e.target.value})}
                placeholder="Describe this content..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="content-tags">Tags</Label>
              <Input
                id="content-tags"
                value={contentForm.tags}
                onChange={(e) => setContentForm({...contentForm, tags: e.target.value})}
                placeholder="workout, beginner, strength, cardio"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas
              </p>
            </div>

            <div>
              <Label htmlFor="content-order">Order Index</Label>
              <Input
                id="content-order"
                type="number"
                min="1"
                value={contentForm.order_index}
                onChange={(e) => setContentForm({...contentForm, order_index: parseInt(e.target.value)})}
                placeholder="Content order"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add Content'}
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

export default AddChapterContentModal;
