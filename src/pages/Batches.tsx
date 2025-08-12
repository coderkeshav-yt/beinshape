
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
import CircularNav from '@/components/CircularNav';
import BatchContentView from '@/components/BatchContentView';
import RazorpayPayment from '@/components/RazorpayPayment';

const Batches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
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
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    
    // Scroll to the payment section
    const paymentElement = document.getElementById(`payment-${batchId}`);
    if (paymentElement) {
      paymentElement.scrollIntoView({ behavior: 'smooth' });
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

  if (selectedBatch) {
    return (
      <BatchContentView
        batch={selectedBatch}
        onBack={() => setSelectedBatch(null)}
        onEnroll={handleEnroll}
        isEnrolled={isEnrolled(selectedBatch.id)}
      />
    );
  }

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
              <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6 font-dejanire animate-float">
                Premium Fitness Programs
              </h1>
              <div className="absolute -top-8 -left-8 w-32 h-32 gradient-primary rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-8 w-24 h-24 gradient-accent rounded-full blur-2xl opacity-30 animate-pulse"></div>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-dejanire leading-relaxed mb-8">
              Transform your fitness journey with our expert-designed programs. Professional guidance, lifetime access, and community support.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="glass px-6 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-semibold">1000+ Success Stories</span>
                </div>
              </div>
              <div className="glass px-6 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Expert Trainers</span>
                </div>
              </div>
              <div className="glass px-6 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Lifetime Access</span>
                </div>
              </div>
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
                              className="w-full font-dejanire group glass border-0"
                            >
                              <BookOpen className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              View Details
                              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                              onClick={() => handleEnroll(batch.id)}
                              size="lg"
                              className="w-full font-dejanire group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <Zap className="w-4 h-4 mr-2 relative z-10" />
                              <span className="relative z-10">Enroll Now • {formatPrice(batch.price)}</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar for Enrolled Users */}
                      {(enrolled || isAdmin) && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>Progress</span>
                            <span>75%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="gradient-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                      )}
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

          {/* Payment sections for each batch */}
          {sortedBatches?.map((batch) => {
            const enrolled = isEnrolled(batch.id);
            
            if (enrolled || isAdmin) return null;
            
            return (
              <div key={`payment-${batch.id}`} id={`payment-${batch.id}`} className="mb-12 scroll-mt-20">
                <div className="max-w-lg mx-auto">
                  <div className="glass rounded-3xl p-8 shadow-xl">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2 font-dejanire">
                        Enroll in {batch.title}
                      </h3>
                      <p className="text-muted-foreground">
                        Complete your enrollment to start your fitness journey
                      </p>
                    </div>
                    <RazorpayPayment
                      batchId={batch.id}
                      batchTitle={batch.title}
                      amount={batch.price}
                    />
                  </div>
                </div>
              </div>
            );
          })}

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
    </>
  );
};

export default Batches;
