
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, BookOpen, Trophy, Clock, Users, Star, CheckCircle, Lock } from 'lucide-react';
import { isRLSPolicyError } from '@/lib/utils';

// Function to convert YouTube URL to embed URL
const getEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // Handle youtu.be short URLs
  const shortUrlMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/);
  if (shortUrlMatch && shortUrlMatch[1]) {
    return `https://www.youtube.com/embed/${shortUrlMatch[1]}`;
  }
  
  // Handle youtu.be with additional parameters
  const embedUrlMatch = url.match(/youtube\.com\/embed\/([^&\n?#]+)/);
  if (embedUrlMatch) {
    return url; // Already in embed format
  }
  
  return null; // Not a recognized YouTube URL
};

interface Batch {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  created_at: string;
  detailed_description?: string;
  features?: string[];
  duration?: string;
  level?: string;
  instructor?: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_free?: boolean;
}

interface ChapterContent {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  video_url: string | null;
  tags: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface BatchDetailPageProps {
  batch: Batch;
  onBack: () => void;
  onEnroll: (batchId: string) => void;
  isEnrolled: boolean;
}

const BatchDetailPage = ({ batch, onBack, onEnroll, isEnrolled }: BatchDetailPageProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapterContents, setChapterContents] = useState<ChapterContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchChapters();
  }, [batch.id]);

  const fetchChapters = async () => {
    try {
      console.log('Fetching chapters for batch ID:', batch.id);
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('batch_id', batch.id)
        .order('order_index', { ascending: true });

      console.log('Chapters fetch result:', { data, error, count: data?.length });

      if (error) {
        // If error is due to RLS policy (permission denied), handle gracefully
        if (isRLSPolicyError(error)) {
          console.log('RLS policy restricted access to chapters');
          setChapters([]);
          return;
        }
        throw error;
      }
      
      // Mark intro chapters as free
      const updatedChapters = (data || []).map(chapter => ({
        ...chapter,
        is_free: chapter.title.toLowerCase().includes('intro')
      }));
      
      setChapters(updatedChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      // Set empty chapters array to show appropriate UI
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterContent = async (chapterId: string) => {
    if (!chapterId) return;
    
    setContentLoading(true);
    try {
      console.log('Fetching content for chapter ID:', chapterId);
      const { data, error } = await supabase
        .from('chapter_content')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('order_index', { ascending: true });

      if (error) {
        if (isRLSPolicyError(error)) {
          console.log('RLS policy restricted access to chapter content');
          setChapterContents([]);
          return;
        }
        throw error;
      }
      
      console.log('Chapter content fetched:', data);
      // Map the data to match our ChapterContent interface
      const formattedData: ChapterContent[] = (data || []).map((item: any) => ({
        id: item.id,
        chapter_id: item.chapter_id,
        title: item.title,
        description: item.description || '',
        video_url: item.video_url || null,
        tags: item.tags || [],
        order_index: item.order_index || 0,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at
      }));
      
      setChapterContents(formattedData);
    } catch (error) {
      console.error('Error fetching chapter content:', error);
      setChapterContents([]);
    } finally {
      setContentLoading(false);
    }
  };
  
  const handleChapterClick = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    await fetchChapterContent(chapter.id);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // If a chapter is selected, show the chapter content view
  if (selectedChapter) {
    console.log('Rendering chapter content for:', selectedChapter);
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => setSelectedChapter(null)}
            variant="outline"
            className="mb-6 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                {selectedChapter.title.toLowerCase().includes('intro') && (
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                    FREE
                  </Badge>
                )}
                {!selectedChapter.title.toLowerCase().includes('intro') && (
                  <Badge variant="secondary" className="bg-gray-500/20 text-gray-600 border-gray-500/30">
                    <Lock className="w-3 h-3 mr-1" />
                    PREMIUM
                  </Badge>
                )}
              </div>
              {selectedChapter.description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {selectedChapter.description}
                </p>
              )}
            </div>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Chapter Content</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {selectedChapter.title} - Learning Materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e3bd30]"></div>
                  </div>
                ) : chapterContents.length > 0 ? (
                  <div className="space-y-6">
                    {chapterContents.map((content, index) => (
                      <div key={content.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e3bd30]/20 flex items-center justify-center text-[#e3bd30] font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {content.title}
                            </h3>
                            {content.description && (
                              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {content.description}
                              </p>
                            )}
                            {content.video_url && (() => {
                              const embedUrl = getEmbedUrl(content.video_url);
                              
                              if (embedUrl) {
                                // For YouTube videos
                                return (
                                  <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden">
                                    <iframe
                                      src={embedUrl}
                                      className="w-full h-full"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      title={content.title}
                                    ></iframe>
                                  </div>
                                );
                              } else if (content.video_url.match(/\.(mp4|webm|ogg)$/i)) {
                                // For direct video files
                                return (
                                  <div className="mt-4">
                                    <video 
                                      controls 
                                      className="w-full rounded-lg"
                                      src={content.video_url}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                );
                              } else {
                                // For other video URLs, show a link
                                return (
                                  <div className="mt-4">
                                    <a 
                                      href={content.video_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      Watch Video (Opens in new tab)
                                    </a>
                                  </div>
                                );
                              }
                            })()}
                            {content.tags && content.tags.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {content.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Content Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      This chapter doesn't have any content yet. Please check back later.
                    </p>
                    {!selectedChapter.is_free && !isEnrolled && (
                      <Button
                        onClick={() => onEnroll(batch.id)}
                        className="bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold"
                      >
                        <Trophy className="w-5 h-5 mr-2" />
                        Enroll to Access Content
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Batches
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-0">
                {batch.image_url && (
                  <div className="relative h-64 w-full">
                    <img
                      src={batch.image_url}
                      alt={batch.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="secondary" className="bg-[#e3bd30]/20 text-[#e3bd30] border-[#e3bd30]/30">
                      Fitness Training
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Self-paced</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      <span>All levels</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{batch.title}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{batch.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">5.0 (Premium)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Comprehensive workout plans',
                    'Nutrition guidance',
                    'Progress tracking tools',
                    'Expert support',
                    'Lifetime access',
                    'Mobile-friendly content'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Course Content</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {chapters.length > 0 ? `${chapters.length} chapters • Self-paced learning • Click any chapter to explore` : 'Course content available after enrollment'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600 dark:text-gray-400">Loading chapters...</div>
                  </div>
                ) : chapters.length > 0 ? (
                  <div className="space-y-3">
                    {chapters.map((chapter, index) => {
                      const isFree = chapter.is_free || false;
                      const userCanAccess = isFree || isEnrolled || (user?.user_metadata?.is_admin);
                      
                      return (
                        <div 
                          key={chapter.id} 
                          className={`group flex items-center p-6 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-medium ${
                            userCanAccess 
                              ? 'border-primary/20 hover:border-primary/40 bg-white dark:bg-card hover:bg-primary/5' 
                              : 'border-border hover:border-border bg-muted/30 hover:bg-muted/50'
                          } ${!userCanAccess ? 'opacity-75' : ''}`}
                          onClick={() => userCanAccess ? handleChapterClick(chapter) : onEnroll(batch.id)}
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mr-6 text-lg font-bold group-hover:bg-primary/20 transition-colors">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e3bd30] transition-colors">
                              {chapter.title}
                            </h4>
                            {chapter.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 group-hover:text-gray-500 transition-colors">
                                {chapter.description}
                              </p>
                            )}
                          </div>
                          <Play className="w-5 h-5 text-gray-400 group-hover:text-[#e3bd30] group-hover:scale-110 transition-all duration-200" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Course Content Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Enroll in this course to access all chapters and premium content.
                    </p>
                    <Button
                      onClick={() => onEnroll(batch.id)}
                      className="bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold"
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      Enroll Now to View Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-[#e3bd30] mb-2">
                    {formatPrice(batch.price)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">One-time payment • Lifetime access</p>
                </div>

                {!isEnrolled ? (
                  <Button
                    onClick={() => onEnroll(batch.id)}
                    className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold py-3 text-lg mb-4"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Enroll Now
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold py-3 text-lg mb-4"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continue Learning
                  </Button>
                )}

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty Level</span>
                    <span className="text-gray-900 dark:text-white font-medium">All Levels</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="text-gray-900 dark:text-white font-medium">Self-paced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Access</span>
                    <span className="text-gray-900 dark:text-white font-medium">Lifetime</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Certificate</span>
                    <span className="text-gray-900 dark:text-white font-medium">Included</span>
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

export default BatchDetailPage;
