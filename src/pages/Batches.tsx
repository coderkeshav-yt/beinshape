
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, Users, Star, ChevronRight, Play, Search, Filter, TrendingUp, Award, Shield, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { lazy, Suspense } from 'react';
import CircularNav from '@/components/CircularNav';
// Content view removed from Batches page; details open on their own route
import LoadingSpinner from '@/components/ui/loading-spinner';

// Lazy load the Footer component
const Footer = lazy(() => import('@/components/Footer'));

// Loading component for lazy loaded components
const LazyLoadedComponent = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner /></div>}>
    {children}
  </Suspense>
);

const Batches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qrBatch, setQrBatch] = useState<any>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Check if user is admin
  const { data: adminCheck } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      const adminStatus = profile?.is_admin || user?.user_metadata?.is_admin;
      setIsAdmin(adminStatus);
      return adminStatus;
    },
    enabled: !!user,
  });

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: userEnrollments } = useQuery({
    queryKey: ['user-enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('batch_id, payment_status')
        .eq('user_id', user.id)
        .eq('payment_status', 'paid');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isEnrolled = (batchId: string) => {
    if (isAdmin) return true; // Admin has access to all batches
    return userEnrollments?.some(enrollment => enrollment.batch_id === batchId) || false;
  };

  const handleEnroll = (batchId: string) => {
    const batch = sortedBatches?.find(b => b.id === batchId);
    if (batch) {
      setQrBatch(batch);
      setQrOpen(true);
    }
  };

  const handleViewDetails = (batch: any) => {
    // Navigate to batch detail page using ID
    console.log('Navigating to batch:', { id: batch.id, title: batch.title, slug: batch.slug });
    navigate(`/batches/${batch.id}`);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Filter and sort batches
  const filteredBatches = batches?.filter(batch =>
    batch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBatches = filteredBatches?.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // We no longer render an inline content view here

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

  return (
    <>
      <CircularNav />
      <div className="min-h-screen gradient-hero pt-20">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="relative">
              <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6 font-dejanire">
                Premium Fitness Programs
              </h1>
              <div className="absolute -top-8 -left-8 w-32 h-32 gradient-primary rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-8 w-24 h-24 gradient-accent rounded-full blur-2xl opacity-30 animate-pulse"></div>
            </div>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg glass border-0"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48 h-12 glass border-0">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Batches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
            {sortedBatches?.map((batch, index) => {
              const enrolled = isEnrolled(batch.id);
              
              return (
                <Card key={batch.id} className="group glass border-0 hover-lift overflow-hidden animate-fade-in bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-0">
                    {batch.image_url ? (
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={batch.image_url}
                          alt={batch.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Top Badge */}
                        <div className="absolute top-4 right-4">
                          {isAdmin ? (
                            <Badge className="gradient-accent text-accent-foreground border-0 shadow-xl px-3 py-1.5 font-bold text-sm">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : enrolled ? (
                            <Badge className="gradient-success text-white border-0 shadow-xl px-3 py-1.5 font-bold text-sm">
                              <Play className="w-3 h-3 mr-1" />
                              Enrolled
                            </Badge>
                          ) : (
                            <Badge className="gradient-primary text-white border-0 shadow-xl px-3 py-1.5 font-bold text-sm">
                              <Zap className="w-3 h-3 mr-1" />
                              {formatPrice(batch.price)}
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-sm font-semibold">4.9</span>
                            <span className="text-white/80 text-xs">(127)</span>
                          </div>
                        </div>

                        {/* Quick Info */}
                        <div className="absolute bottom-4 right-4">
                          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Users className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">2.3k+ enrolled</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 gradient-card flex items-center justify-center">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No preview available</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl font-bold text-foreground mb-2 font-dejanire group-hover:text-gradient transition-colors line-clamp-2">
                          {batch.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                          {batch.description}
                        </CardDescription>
                      </CardHeader>

                      {/* Features */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
                        <div className="flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-lg">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">Self-paced</span>
                        </div>
                        <div className="flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-lg">
                          <Award className="w-3 h-3" />
                          <span className="font-medium">Certificate</span>
                        </div>
                        <div className="flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-lg">
                          <Shield className="w-3 h-3" />
                          <span className="font-medium">Lifetime</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {enrolled || isAdmin ? (
                          <Button
                            onClick={() => handleViewDetails(batch)}
                            size="lg"
                            className="w-full font-dejanire group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <BookOpen className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                            <span className="relative z-10">{isAdmin ? 'Manage Content' : 'Continue Learning'}</span>
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              onClick={() => {
                                console.log('Batch data:', batch);
                                handleViewDetails(batch);
                              }}
                              variant="outline"
                              size="lg"
                              className="w-full font-dejanire bg-white/90 hover:bg-white text-gray-800 dark:bg-gray-800/80 dark:hover:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <BookOpen className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              <span className="relative">View Details</span>
                              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                              onClick={() => handleEnroll(batch.id)}
                              size="lg"
                              className="w-full font-dejanire bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              <span className="relative">Enroll Now • {formatPrice(batch.price)}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {sortedBatches?.length === 0 && (
            <div className="text-center py-16">
              <div className="glass rounded-2xl p-12 max-w-md mx-auto">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No programs found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Clear Search
                </Button>
              </div>
            </div>
          )}

          {/* Removed payment sections under batch grid to avoid duplicate cards */}

          {/* CTA Section */}
          <div className="text-center glass rounded-3xl p-12 shadow-xl animate-fade-in border border-border/20">
            <div className="relative">
              <h2 className="text-4xl font-bold text-foreground mb-6 font-dejanire">
                Ready to <span className="text-gradient">Transform Your Life?</span>
              </h2>
              <div className="absolute -top-2 -right-2 w-16 h-16 gradient-primary rounded-full blur-2xl opacity-30 animate-pulse"></div>
            </div>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of satisfied members who have achieved their fitness goals with our expert-designed programs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="glass p-6 rounded-xl group hover-lift border border-border/20">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2 font-dejanire">Expert Guidance</h3>
                <p className="text-muted-foreground text-sm">Professional trainers with years of experience</p>
              </div>
              <div className="glass p-6 rounded-xl group hover-lift border border-border/20">
                <div className="w-12 h-12 gradient-success rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2 font-dejanire">Lifetime Access</h3>
                <p className="text-muted-foreground text-sm">Once enrolled, access your content forever</p>
              </div>
              <div className="glass p-6 rounded-xl group hover-lift border border-border/20">
                <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2 font-dejanire">Community Support</h3>
                <p className="text-muted-foreground text-sm">Connect with like-minded fitness enthusiasts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <LazyLoadedComponent>
        <Footer />
      </LazyLoadedComponent>

      {/* QR Code Payment Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Scan to Pay{qrBatch ? ` • ₹${Number(qrBatch.price).toLocaleString('en-IN')}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-muted">
              <img src="/Web_asset/qr%20code.png" alt="Payment QR Code" className="w-full h-auto object-contain" />
            </div>
            {qrBatch && (
              <div className="text-center text-sm text-muted-foreground">
                You’re enrolling in <span className="font-medium text-foreground">{qrBatch.title}</span>.
              </div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => setQrOpen(false)}>
                Done
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#e3bd30] text-[#e3bd30] hover:bg-[#e3bd30] hover:text-black"
                onClick={() => qrBatch && navigate(`/batches/${qrBatch.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Batches;
