import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import CircularNav from '@/components/CircularNav';
import Profile from '@/components/Profile';
import BatchContentView from '@/components/BatchContentView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Play, FileText, Trophy, TrendingUp, Star, Award, Target, Calendar, Clock, Users, BarChart3, Activity, Zap } from 'lucide-react';

interface DashboardBatch {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
}

interface Enrollment {
  id: string;
  payment_status: string;
  batch: DashboardBatch;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableBatches, setAvailableBatches] = useState<DashboardBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<DashboardBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
        // Update user metadata to include admin status
        user.user_metadata = { ...user.user_metadata, is_admin: true };
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [enrollmentData, batchData] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            id,
            payment_status,
            batch:batches(id, title, description, price, image_url, created_at, updated_at, is_active)
          `)
          .eq('user_id', user?.id),
        supabase
          .from('batches')
          .select('*')
          .eq('is_active', true)
      ]);

      if (enrollmentData.error) throw enrollmentData.error;
      if (batchData.error) throw batchData.error;

      setEnrollments(enrollmentData.data || []);
      setAvailableBatches(batchData.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user?.id,
          batch_id: batchId,
          payment_status: 'pending'
        });

      if (error) throw error;
      
      fetchUserData();
      setSelectedBatch(null);
    } catch (error) {
      console.error('Error enrolling in batch:', error);
    }
  };

  const handleViewBatch = (batch: DashboardBatch) => {
    // Navigate to batch detail page using ID
    navigate(`/batches/${batch.id}`);
  };

  const isEnrolled = (batchId: string) => {
    // Admin has access to all batches automatically
    if (isAdmin || user?.user_metadata?.is_admin) return true;
    
    // Otherwise check for paid enrollment
    return enrollments.some(e => e.batch.id === batchId && e.payment_status === 'paid');
  };

  const getEnrollmentStatus = (batchId: string) => {
    // Admin has automatic access
    if (isAdmin || user?.user_metadata?.is_admin) return 'admin';
    
    // Check enrollment status
    const enrollment = enrollments.find(e => e.batch.id === batchId);
    if (!enrollment) return 'not_enrolled';
    
    return enrollment.payment_status === 'paid' ? 'paid' : 'pending';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e3bd30] mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-dejanire">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (selectedBatch) {
    return (
      <BatchContentView
        batch={selectedBatch}
        onBack={() => setSelectedBatch(null)}
        onEnroll={handleEnrollment}
        isEnrolled={isEnrolled(selectedBatch.id)}
      />
    );
  }

  const activeEnrollments = enrollments.filter(e => e.payment_status === 'paid');
  const pendingEnrollments = enrollments.filter(e => e.payment_status === 'pending');
  const userBatches = isAdmin || user?.user_metadata?.is_admin ? availableBatches : activeEnrollments.map(e => e.batch);

  return (
    <div className="min-h-screen gradient-hero">
      <CircularNav />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Header */}
          <div className="text-center mb-12 animate-fade-in relative">
            <div className="absolute inset-0 -top-20 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="w-96 h-96 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
            </div>
            <div className="relative z-10">
              <Badge className="gradient-accent text-accent-foreground border-0 px-5 py-1.5 text-xs font-bold shadow-lg mb-4 animate-bounce-in">
                ✨ Premium Dashboard
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 font-dejanire tracking-tight">
                Welcome back, 
                <span className="block text-gradient mt-2 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient">
                  {user.user_metadata?.full_name || 'Fitness Warrior'}!
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground font-dejanire max-w-3xl mx-auto leading-relaxed mb-4">
                Continue your fitness journey and track your progress
              </p>
              {(isAdmin || user?.user_metadata?.is_admin) && (
                <div className="mt-4 animate-scale-in">
                  <Badge className="gradient-accent text-accent-foreground border-0 px-6 py-2 text-sm font-bold shadow-xl relative overflow-hidden group">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                    <span className="relative z-10">🛡️ Administrator • Full Access</span>
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12 animate-slide-up">
            <Card className="border-0 overflow-hidden group gradient-glass hover:shadow-xl transition-all duration-500 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="gradient-success p-6 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-success-foreground/90 font-bold font-dejanire text-xs uppercase tracking-widest mb-2">Active Programs</p>
                    <p className="text-4xl md:text-5xl font-black text-success-foreground">
                      {userBatches.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                    <Award className="w-8 h-8 text-success-foreground" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </Card>

            <Card className="border-0 overflow-hidden group gradient-glass hover:shadow-xl transition-all duration-500 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="gradient-primary p-6 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-primary-foreground/90 font-bold font-dejanire text-xs uppercase tracking-widest mb-2">Total Enrollments</p>
                    <p className="text-4xl md:text-5xl font-black text-primary-foreground">{enrollments.length}</p>
                  </div>
                  <div className="w-16 h-16 bg-black/30 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                    <TrendingUp className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </Card>

            <Card className="border-0 overflow-hidden group gradient-glass hover:shadow-xl transition-all duration-500 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="gradient-danger p-6 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-destructive-foreground/90 font-bold font-dejanire text-xs uppercase tracking-widest mb-2">Goals Achieved</p>
                    <p className="text-4xl md:text-5xl font-black text-destructive-foreground">
                      {userBatches.length * 3}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                    <Target className="w-8 h-8 text-destructive-foreground" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground font-dejanire text-lg">Loading your programs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Active Programs */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground font-dejanire tracking-tight">
                      {(isAdmin || user?.user_metadata?.is_admin) ? 'All Available Programs' : 'Your Active Programs'}
                    </h2>
                  </div>
                  {userBatches.length > 0 && (
                    <Badge variant="secondary" className="font-dejanire px-4 py-2 text-sm font-bold">
                      {userBatches.length} 
                      {(isAdmin || user?.user_metadata?.is_admin) ? ' Total' : ' Active'}
                    </Badge>
                  )}
                </div>
                
                {userBatches.length > 0 ? (
                  <div className="space-y-5">
                    {userBatches.map((batch, index) => (
                      <Card key={batch.id} className="border-0 overflow-hidden group hover:shadow-xl transition-all duration-500 animate-fade-in relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50" style={{ animationDelay: `${index * 0.1}s` }}>
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-0 group-hover:bg-primary/10 transition-colors duration-500"></div>
                        
                        <div className="flex flex-col lg:flex-row relative z-10">
                          {batch.image_url && (
                            <div className="w-full lg:w-64 h-48 lg:h-auto flex-shrink-0 relative overflow-hidden group/image">
                              <img
                                src={batch.image_url}
                                alt={batch.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              {/* Image Overlay Badge */}
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-black/40 backdrop-blur-md text-white border-0 font-dejanire px-3 py-1.5 shadow-xl text-xs">
                                  ✨ Premium
                                </Badge>
                              </div>
                            </div>
                          )}
                          <div className="flex-1 p-5 md:p-6">
                            <div className="flex flex-col space-y-4">
                              {/* Header Section */}
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                <div className="flex-1">
                                  <h3 className="text-xl md:text-2xl font-black text-foreground font-dejanire group-hover:text-gradient transition-colors mb-2 tracking-tight leading-tight">
                                    {batch.title}
                                  </h3>
                                  <p className="text-muted-foreground font-dejanire line-clamp-2 text-sm md:text-base leading-relaxed">
                                    {batch.description}
                                  </p>
                                </div>
                                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 lg:gap-3 flex-shrink-0">
                                  {(() => {
                                    const status = getEnrollmentStatus(batch.id);
                                    if (status === 'admin') {
                                      return (
                                        <Badge className="gradient-accent text-accent-foreground border-0 font-dejanire px-3 py-1.5 shadow-lg whitespace-nowrap text-xs font-bold">
                                          🛡️ Admin
                                        </Badge>
                                      );
                                    } else if (status === 'paid') {
                                      return (
                                        <Badge className="gradient-success text-success-foreground border-0 font-dejanire px-3 py-1.5 shadow-lg whitespace-nowrap text-xs font-bold">
                                          ✅ Enrolled
                                        </Badge>
                                      );
                                    } else {
                                      return (
                                        <Badge className="bg-warning/20 text-warning border-2 border-warning/30 font-dejanire px-3 py-1.5 whitespace-nowrap text-xs font-bold">
                                          {status === 'pending' ? '⏳ Pending' : '❌ Not Enrolled'}
                                        </Badge>
                                      );
                                    }
                                  })()}
                                  <span className="text-2xl md:text-3xl font-black text-gradient whitespace-nowrap">
                                    {(isAdmin || user?.user_metadata?.is_admin) ? 'FREE' : `₹${batch.price.toLocaleString()}`}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Rating and Badge Section */}
                              <div className="flex flex-wrap items-center gap-3 md:gap-4 py-3 border-t border-border/50">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                                  ))}
                                  <span className="ml-1 text-xs font-bold text-foreground">5.0</span>
                                </div>
                                <div className="h-4 w-px bg-border"></div>
                                <Badge variant="secondary" className="font-dejanire px-2.5 py-1 text-xs font-semibold">
                                  🏆 Premium
                                </Badge>
                                <div className="h-4 w-px bg-border hidden sm:block"></div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-dejanire hidden sm:flex">
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="font-semibold">1.2k+</span>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                  onClick={() => handleViewBatch(batch)}
                                  size="default"
                                  className="gradient-primary text-primary-foreground font-dejanire font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 w-full relative overflow-hidden group/btn"
                                >
                                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></span>
                                  <Play className="w-4 h-4 mr-2 relative z-10" />
                                  <span className="relative z-10">{(isAdmin || user?.user_metadata?.is_admin) ? 'Manage Content' : 'Continue Learning'}</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-xl border-0 gradient-glass">
                    <CardContent className="text-center py-20">
                      <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-primary">
                        <BookOpen className="w-12 h-12 text-primary-foreground" />
                      </div>
                      <h3 className="text-3xl font-bold text-foreground mb-4 font-dejanire">
                        No Active Programs Yet
                      </h3>
                      <p className="text-muted-foreground mb-8 font-dejanire text-lg max-w-md mx-auto leading-relaxed">
                        Start your fitness journey by enrolling in a premium training program tailored to your goals
                      </p>
                      <Button 
                        size="lg" 
                        className="gradient-primary text-primary-foreground font-dejanire font-semibold text-base px-8 hover:shadow-primary transition-all"
                        onClick={() => navigate('/batches')}
                      >
                        <Trophy className="w-5 h-5 mr-2" />
                        Browse Programs
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Pending Payments */}
                {!(isAdmin || user?.user_metadata?.is_admin) && pendingEnrollments.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-foreground font-dejanire flex items-center gap-3">
                      <Clock className="w-8 h-8 text-warning" />
                      Pending Payments
                    </h3>
                    {pendingEnrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/30 shadow-xl overflow-hidden group">
                        <CardContent className="p-6 md:p-8">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge className="bg-warning/20 text-warning border-warning/30 font-dejanire px-3 py-1.5">
                                  ⏳ Payment Required
                                </Badge>
                              </div>
                              <h4 className="text-2xl font-bold text-foreground font-dejanire mb-2 group-hover:text-gradient transition-colors">
                                {enrollment.batch.title}
                              </h4>
                              <p className="text-muted-foreground font-dejanire text-base">
                                Complete your payment to unlock premium content and start your fitness journey
                              </p>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-4 flex-shrink-0">
                              <p className="text-4xl font-bold text-gradient font-dejanire">
                                ₹{enrollment.batch.price.toLocaleString()}
                              </p>
                              <Button 
                                size="lg" 
                                className="gradient-primary text-primary-foreground font-dejanire font-semibold text-base px-8 hover:shadow-primary transition-all w-full md:w-auto"
                              >
                                <Zap className="w-5 h-5 mr-2" />
                                Complete Payment
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Profile Section */}
                <Profile />
              </div>

              {/* Available Programs Sidebar */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-black text-foreground font-dejanire tracking-tight">
                    {(isAdmin || user?.user_metadata?.is_admin) ? 'Quick Actions' : 'Explore More'}
                  </h2>
                </div>
                
                {(isAdmin || user?.user_metadata?.is_admin) ? (
                  <div className="space-y-4">
                    <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-500 overflow-hidden group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="p-6 relative z-10">
                        <div className="text-center">
                          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-all duration-500">
                            <Award className="w-8 h-8 text-primary-foreground" />
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-2 font-dejanire">Admin Dashboard</h3>
                          <p className="text-muted-foreground text-xs mb-4">Manage batches, users & content</p>
                          <Button asChild className="gradient-primary text-primary-foreground font-dejanire w-full font-semibold hover:shadow-lg transition-all duration-300 relative overflow-hidden group/btn">
                            <a href="/admin">
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></span>
                              <span className="relative z-10">Open Panel</span>
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-primary/50">
                    {availableBatches
                      .filter(batch => !enrollments.some(e => e.batch.id === batch.id))
                      .slice(0, 5)
                      .map((batch, idx) => (
                      <Card key={batch.id} className="shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group border-0 overflow-hidden relative animate-fade-in"
                            onClick={() => handleViewBatch(batch)}
                            style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {batch.image_url && (
                          <div className="h-40 overflow-hidden relative">
                            <img
                              src={batch.image_url}
                              alt={batch.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <div className="flex items-center justify-between">
                                <Badge className="bg-white/20 backdrop-blur-md text-white border-0 font-dejanire px-2.5 py-1 shadow-lg font-semibold text-xs">
                                  🏆 Premium
                                </Badge>
                                <span className="text-xl font-black text-white font-dejanire drop-shadow-2xl">
                                  ₹{batch.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-4 relative z-10">
                          <h3 className="font-bold text-foreground mb-2 font-dejanire line-clamp-2 text-base group-hover:text-gradient transition-colors leading-tight">
                            {batch.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3 font-dejanire line-clamp-2 leading-relaxed">
                            {batch.description}
                          </p>
                          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                              ))}
                              <span className="ml-0.5 font-semibold">5.0</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="font-semibold">500+</span>
                            </div>
                          </div>
                          <Button 
                            className="w-full gradient-primary text-primary-foreground font-dejanire font-semibold hover:shadow-lg transition-all duration-300 h-9 text-sm relative overflow-hidden group/btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewBatch(batch);
                            }}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></span>
                            <Play className="w-3.5 h-3.5 mr-1.5 relative z-10" />
                            <span className="relative z-10">View Details</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!(isAdmin || user?.user_metadata?.is_admin) && availableBatches.filter(batch => !enrollments.some(e => e.batch.id === batch.id)).length === 0 && (
                  <Card className="shadow-medium border-0">
                    <CardContent className="text-center py-8">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-dejanire">
                        You're enrolled in all available programs!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
