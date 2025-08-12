
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, BookOpen, Lock, Play, CheckCircle } from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';
import { isRLSPolicyError } from '@/lib/utils';

interface Batch {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

interface ChapterContent {
  id: string;
  title: string;
  description: string;
  video_url: string;
  tags: string[];
  order_index: number;
}

interface BatchContentViewProps {
  batch: Batch;
  onBack: () => void;
  onEnroll: (batchId: string) => void;
  isEnrolled: boolean;
}

const BatchContentView = ({ batch, onBack, onEnroll, isEnrolled }: BatchContentViewProps) => {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapterContents, setChapterContents] = useState<ChapterContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchChapters();
  }, [batch.id, user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (profile?.is_admin) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  useEffect(() => {
    if (selectedChapter) {
      fetchChapterContents();
    }
  }, [selectedChapter]);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('batch_id', batch.id)
        .order('order_index', { ascending: true });

      if (error) {
        // If error is due to RLS policy (permission denied), handle gracefully
        if (isRLSPolicyError(error)) {
          console.log('RLS policy restricted access to chapters');
          setChapters([]);
          return;
        }
        throw error;
      }
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      // Set empty chapters array to show appropriate UI
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterContents = async () => {
    if (!selectedChapter) return;

    try {
      const { data, error } = await supabase
        .from('chapter_content')
        .select('*')
        .eq('chapter_id', selectedChapter.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setChapterContents(data || []);
    } catch (error) {
      console.error('Error fetching chapter contents:', error);
    }
  };

  const isChapterFree = (chapterTitle: string) => {
    return chapterTitle.toLowerCase().includes('intro') || 
           chapterTitle.toLowerCase().includes('introduction') ||
           chapterTitle.toLowerCase().includes('free') ||
           chapterTitle.toLowerCase().includes('preview');
  };

  const canAccessContent = (chapter: Chapter) => {
    // Check if user is admin first
    if (isAdmin || user?.user_metadata?.is_admin) return true;
    
    // Then check if enrolled
    if (isEnrolled) return true;
    
    // Finally check if chapter is free
    return isChapterFree(chapter.title);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Content View
  if (selectedContent) {
    const canAccess = canAccessContent(selectedChapter!);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => setSelectedContent(null)}
            variant="outline"
            className="mb-6 border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chapter
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                {selectedContent.title}
              </h1>
              {selectedContent.description && (
                <p className="text-gray-400 text-lg mb-6">
                  {selectedContent.description}
                </p>
              )}
              {selectedContent.tags && selectedContent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedContent.tags.map((tag, index) => (
                    <Badge key={index} className="bg-gradient-to-r from-[#e3bd30]/20 to-[#f4d03f]/20 text-[#e3bd30] border-[#e3bd30]/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {selectedContent.video_url && (
              <YouTubeEmbed
                videoUrl={selectedContent.video_url}
                title={selectedContent.title}
                isLocked={!canAccess}
                onUnlock={() => onEnroll(batch.id)}
                channelUrl="https://youtube.com/@your-channel-name"
                showChannelLink={canAccess}
                premium={true}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Chapter Contents View
  if (selectedChapter) {
    const canAccess = canAccessContent(selectedChapter);
    
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => setSelectedChapter(null)}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chapters
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedChapter.title}
                </h1>
                {isChapterFree(selectedChapter.title) && (
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                    FREE
                  </Badge>
                )}
                {!canAccess && (
                  <Badge variant="secondary" className="bg-gray-500/20 text-gray-600 border-gray-500/30">
                    <Lock className="w-3 h-3 mr-1" />
                    PREMIUM
                  </Badge>
                )}
              </div>
              {selectedChapter.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedChapter.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {chapterContents.length > 0 ? (
                chapterContents.map((content, index) => (
                  <Card 
                    key={content.id} 
                    className={`cursor-pointer transition-all hover:border-[#e3bd30]/30 ${
                      !canAccess ? 'opacity-75' : ''
                    }`}
                    onClick={() => canAccess ? setSelectedContent(content) : onEnroll(batch.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 bg-[#e3bd30]/20 text-[#e3bd30] rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {content.title}
                            </h3>
                            {content.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {content.description}
                              </p>
                            )}
                            {content.tags && content.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {content.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {content.video_url && (
                            <Play className="w-5 h-5 text-red-500" />
                          )}
                          {!canAccess && <Lock className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No content available for this chapter yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Batch View
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6 shadow-soft hover:shadow-medium transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Batches
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8 shadow-medium hover:shadow-strong transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-0">
                {batch.image_url && (
                  <div className="h-72 w-full relative">
                    <img
                      src={batch.image_url}
                      alt={batch.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h1 className="text-4xl font-bold mb-2 font-dejanire">{batch.title}</h1>
                      <p className="text-lg opacity-90">{batch.description}</p>
                    </div>
                  </div>
                )}
                {!batch.image_url && (
                  <div className="p-8 bg-gradient-to-r from-primary/10 to-accent/10">
                    <h1 className="text-4xl font-bold text-foreground mb-4 font-dejanire">
                      {batch.title}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {batch.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card className="shadow-medium border-0">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="text-foreground font-dejanire text-2xl">Course Content</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {chapters.length > 0 ? `${chapters.length} chapters • ${chapters.filter(c => isChapterFree(c.title)).length} free chapters` : 'Course content available after enrollment'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {chapters.length > 0 ? (
                    chapters.map((chapter, index) => {
                      const isFree = isChapterFree(chapter.title);
                      const canAccess = canAccessContent(chapter);
                      
                      return (
                        <div 
                          key={chapter.id} 
                          className={`group flex items-center p-6 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-medium ${
                            canAccess 
                              ? 'border-primary/20 hover:border-primary/40 bg-white dark:bg-card hover:bg-primary/5' 
                              : 'border-border hover:border-border bg-muted/30 hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedChapter(chapter)}
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mr-6 text-lg font-bold group-hover:bg-primary/20 transition-colors">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-foreground text-lg font-dejanire">
                                {chapter.title}
                              </h4>
                              {isFree && (
                                <Badge className="bg-success/20 text-success border-success/30 text-xs font-bold">
                                  FREE
                                </Badge>
                              )}
                              {(isAdmin || user?.user_metadata?.is_admin) && (
                                <Badge className="bg-warning/20 text-warning border-warning/30 text-xs font-bold">
                                  ADMIN ACCESS
                                </Badge>
                                )}
                            </div>
                            {chapter.description && (
                              <p className="text-muted-foreground">
                                {chapter.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {canAccess ? (
                              <CheckCircle className="w-6 h-6 text-success" />
                            ) : (
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Lock className="w-5 h-5" />
                                <span className="text-sm font-medium">Premium</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Course Content Preview
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {!user ? 'Sign up or log in to view the complete course content and start your fitness journey!' : 'Enroll in this course to access all chapters and premium content.'}
                      </p>
                      {!user ? (
                        <div className="flex gap-3 justify-center">
                          <Button
                            onClick={() => window.location.href = '/auth'}
                            variant="outline"
                            className="border-primary/20 text-primary hover:bg-primary/10"
                          >
                            Sign In
                          </Button>
                          <Button
                            onClick={() => window.location.href = '/auth'}
                            className="gradient-primary text-primary-foreground"
                          >
                            Get Started
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => onEnroll(batch.id)}
                          className="gradient-primary text-primary-foreground"
                        >
                          Enroll Now
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-strong border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2 font-dejanire">
                    {(isAdmin || user?.user_metadata?.is_admin) ? 'FREE' : formatPrice(batch.price)}
                  </div>
                  <p className="opacity-90 font-medium">
                    {(isAdmin || user?.user_metadata?.is_admin) ? 'Admin Access • Full Content' : 'One-time payment • Lifetime access'}
                  </p>
                </div>
              </div>
              
              <CardContent className="p-6">
                {(() => {
                  if (isAdmin || user?.user_metadata?.is_admin) {
                    return (
                      <div className="text-center mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-3 text-lg">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Admin Access • FREE
                        </Badge>
                      </div>
                    );
                  } else if (!isEnrolled) {
                    return (
                      <Button
                        onClick={() => onEnroll(batch.id)}
                        className="w-full gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-4 mb-6 text-lg shadow-medium hover:shadow-strong transition-all duration-300"
                      >
                        Enroll Now • Transform Your Fitness
                      </Button>
                    );
                  } else {
                    return (
                      <div className="text-center mb-6 p-4 bg-success/10 border border-success/20 rounded-xl">
                        <Badge className="bg-success/20 text-success border-success/30 px-6 py-3 text-lg">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Enrolled & Active
                        </Badge>
                      </div>
                    );
                  }
                })()}

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                    <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <span className="font-medium">Lifetime access to all content</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">Mobile & desktop friendly</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                    <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-warning" />
                    </div>
                    <span className="font-medium">Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                    <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-info-foreground" />
                    </div>
                    <span className="font-medium">Free intro chapters included</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchContentView;
