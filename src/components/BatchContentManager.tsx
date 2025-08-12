
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen, Video, ChevronDown, ChevronRight } from 'lucide-react';
import AddChapterModal from './AddChapterModal';
import EditChapterModal from './EditChapterModal';
import AddChapterContentModal from './AddChapterContentModal';
import EditChapterContentModal from './EditChapterContentModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BatchContentManagerProps {
  batchId: string;
  batchTitle: string;
}

const BatchContentManager = ({ batchId, batchTitle }: BatchContentManagerProps) => {
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [showAddContent, setShowAddContent] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: chapters, isLoading } = useQuery({
    queryKey: ['admin-chapters', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('batch_id', batchId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: chapterContents } = useQuery({
    queryKey: ['admin-chapter-contents', batchId],
    queryFn: async () => {
      if (!chapters?.length) return [];
      
      const chapterIds = chapters.map(c => c.id);
      const { data, error } = await supabase
        .from('chapter_content')
        .select('*')
        .in('chapter_id', chapterIds)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!chapters?.length,
  });

  const toggleChapterExpansion = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      // First delete all chapter content
      await supabase
        .from('chapter_content')
        .delete()
        .eq('chapter_id', chapterId);

      // Then delete the chapter
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;

      toast.success('Chapter deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chapter-contents'] });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to delete chapter');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('chapter_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast.success('Content deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-chapter-contents'] });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
    queryClient.invalidateQueries({ queryKey: ['admin-chapter-contents'] });
  };

  const getChapterContents = (chapterId: string) => {
    return chapterContents?.filter(content => content.chapter_id === chapterId) || [];
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#e3bd30]" />
                Content Management - {batchTitle}
              </CardTitle>
              <CardDescription>
                Manage chapters and content for this batch
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddChapter(true)}
              className="bg-[#e3bd30] hover:bg-[#d4a82a] text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chapters && chapters.length > 0 ? (
            <div className="space-y-4">
              {chapters.map((chapter) => {
                const contents = getChapterContents(chapter.id);
                const isExpanded = expandedChapters.has(chapter.id);
                
                return (
                  <Card key={chapter.id} className="border-l-4 border-l-[#e3bd30]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleChapterExpansion(chapter.id)}
                            className="p-1 h-auto"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                          <h3 className="font-bold text-lg">{chapter.title}</h3>
                          <Badge variant="outline">
                            Order: {chapter.order_index}
                          </Badge>
                          <Badge variant="secondary">
                            {contents.length} content{contents.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddContent(chapter.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Content
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingChapter(chapter)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{chapter.title}"? This will also delete all content within this chapter. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteChapter(chapter.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {chapter.description && (
                        <p className="text-sm text-gray-600 mb-2">{chapter.description}</p>
                      )}

                      {isExpanded && (
                        <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-2">
                          {contents.length > 0 ? (
                            contents.map((content) => (
                              <div key={content.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-[#e3bd30]" />
                                    <span className="font-medium">{content.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Order: {content.order_index}
                                    </Badge>
                                    {content.tags && content.tags.length > 0 && (
                                      <div className="flex gap-1">
                                        {content.tags.slice(0, 2).map((tag, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {content.tags.length > 2 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{content.tags.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingContent(content)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Content</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{content.title}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteContent(content.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                                {content.description && (
                                  <p className="text-xs text-gray-500 mt-1 ml-6">{content.description}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No content added yet</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No chapters created yet</p>
              <p className="text-sm text-gray-400">Create your first chapter to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showAddChapter && (
        <AddChapterModal
          batchId={batchId}
          onClose={() => setShowAddChapter(false)}
          onChapterAdded={refreshData}
        />
      )}

      {editingChapter && (
        <EditChapterModal
          chapter={editingChapter}
          onClose={() => setEditingChapter(null)}
          onChapterUpdated={refreshData}
        />
      )}

      {showAddContent && (
        <AddChapterContentModal
          chapterId={showAddContent}
          onClose={() => setShowAddContent(null)}
          onContentAdded={refreshData}
        />
      )}

      {editingContent && (
        <EditChapterContentModal
          content={editingContent}
          onClose={() => setEditingContent(null)}
          onContentUpdated={refreshData}
        />
      )}
    </div>
  );
};

export default BatchContentManager;
