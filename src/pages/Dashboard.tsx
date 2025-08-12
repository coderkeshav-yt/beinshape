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
          <div className="text-center mb-16 animate-fade-in">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 font-dejanire">
                Welcome back, 
                <span className="block text-gradient mt-2 animate-float">
                  {user.user_metadata?.full_name || 'Fitness Warrior'}!
                </span>
              </h1>
              <div className="absolute -top-4 -right-4 w-24 h-24 gradient-primary rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <p className="text-xl text-muted-foreground font-dejanire max-w-3xl mx-auto leading-relaxed">
              Continue your fitness journey and track your progress with our comprehensive training programs
            </p>
            {(isAdmin || user?.user_metadata?.is_admin) && (
              <div className="mt-6 animate-scale-in">
                <Badge className="gradient-accent text-accent-foreground border-0 px-6 py-3 text-base font-bold shadow-medium">
                  🛡️ Administrator • All Content Access
                </Badge>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slide-up">
            <Card className="border-0 overflow-hidden group gradient-glass">
              <div className="gradient-success p-8 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-success-foreground/80 font-semibold font-dejanire text-sm uppercase tracking-wider">Active Programs</p>
                    <p className="text-5xl font-bold text-success-foreground mt-2">
                      {userBatches.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Award className="w-8 h-8 text-success-foreground" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </Card>

            <Card className="border-0 overflow-hidden group gradient-glass">
              <div className="gradient-primary p-8 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-primary-foreground/80 font-semibold font-dejanire text-sm uppercase tracking-wider">Total Enrollments</p>
                    <p className="text-5xl font-bold text-primary-foreground mt-2">{enrollments.length}</p>
                  </div>
                  <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <TrendingUp className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </Card>

            <Card className="border-0 overflow-hidden group gradient-glass">
              <div className="gradient-danger p-8 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-destructive-foreground/80 font-semibold font-dejanire text-sm uppercase tracking-wider">Goals Achieved</p>
                    <p className="text-5xl font-bold text-destructive-foreground mt-2">
                      {userBatches.length * 3}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Target className="w-8 h-8 text-destructive-foreground" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-foreground font-dejanire">
                    {(isAdmin || user?.user_metadata?.is_admin) ? 'All Available Programs' : 'Your Active Programs'}
                  </h2>
                  {userBatches.length > 0 && (
                    <Badge variant="secondary" className="font-dejanire px-4 py-2">
                      {userBatches.length} 
                      {(isAdmin || user?.user_metadata?.is_admin) ? ' Total' : ' Active'}
                    </Badge>
                  )}
                </div>
                
                {userBatches.length > 0 ? (
                  <div className="space-y-8">
                    {userBatches.map((batch, index) => (
                      <Card key={batch.id} className="border-0 overflow-hidden group hover-lift animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex flex-col md:flex-row">
                          {batch.image_url && (
                            <div className="w-full md:w-48 h-48 flex-shrink-0 relative overflow-hidden">
                              <img
                                src={batch.image_url}
                                alt={batch.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          )}
                          <div className="flex-1 p-8">
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                              <div className="flex-1 mb-4 md:mb-0">
                                <h3 className="text-3xl font-bold text-foreground font-dejanire group-hover:text-gradient transition-colors mb-3">
                                  {batch.title}
                                </h3>
                                <p className="text-muted-foreground font-dejanire line-clamp-2 text-lg leading-relaxed">
                                  {batch.description}
                                </p>
                              </div>
                              <div className="flex flex-col items-start md:items-end space-y-3">
                                {(() => {
                                  const status = getEnrollmentStatus(batch.id);
                                  if (status === 'admin') {
                                    return (
                                      <Badge className="gradient-accent text-accent-foreground border-0 font-dejanire px-4 py-2 shadow-medium">
                                        🛡️ Admin Access • FREE
                                      </Badge>
                                    );
                                  } else if (status === 'paid') {
                                    return (
                                      <Badge className="gradient-success text-success-foreground border-0 font-dejanire px-4 py-2 shadow-medium">
                                        ✅ Active
                                      </Badge>
                                    );
                                  } else {
                                    return (
                                      <Badge className="bg-warning/20 text-warning border-warning/30 font-dejanire px-4 py-2">
                                        {status === 'pending' ? '⏳ Payment Pending' : '❌ Not Enrolled'}
                                      </Badge>
                                    );
                                  }
                                })()}
                                <span className="text-3xl font-bold text-gradient">
                                  {(isAdmin || user?.user_metadata?.is_admin) ? 'FREE' : `₹${batch.price.toLocaleString()}`}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 fill-primary text-primary" />
                                  ))}
                                </div>
                                <span className="text-muted-foreground font-dejanire font-semibold text-base">
                                  🏆 Premium Program
                                </span>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <Button 
                                  onClick={() => handleViewBatch(batch)}
                                  size="lg"
                                  className="font-dejanire w-full sm:w-auto"
                                >
                                  <Play className="w-5 h-5 mr-2" />
                                  {(isAdmin || user?.user_metadata?.is_admin) ? 'Manage Content' : 'Continue Learning'}
                                </Button>
                                <Button variant="outline" size="lg" className="font-dejanire w-full sm:w-auto">
                                  <FileText className="w-5 h-5 mr-2" />
                                  Resources
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-medium border-0">
                    <CardContent className="text-center py-16">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-3 font-dejanire">
                        No Active Programs
                      </h3>
                      <p className="text-muted-foreground mb-8 font-dejanire text-lg">
                        Start your fitness journey by enrolling in a training program
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Pending Payments */}
                {!(isAdmin || user?.user_metadata?.is_admin) && pendingEnrollments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-foreground font-dejanire">
                      Pending Payments
                    </h3>
                    {pendingEnrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="bg-warning/5 border-warning/20 shadow-medium">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground font-dejanire text-lg">
                                {enrollment.batch.title}
                              </h4>
                              <p className="text-muted-foreground font-dejanire">
                                Payment pending - Complete to access content
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-primary font-dejanire">
                                ₹{enrollment.batch.price.toLocaleString()}
                              </p>
                              <Button size="sm" className="mt-3 gradient-primary text-primary-foreground font-dejanire">
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground font-dejanire">
                    {(isAdmin || user?.user_metadata?.is_admin) ? 'Quick Actions' : 'Explore Batches'}
                  </h2>
                </div>
                
                {(isAdmin || user?.user_metadata?.is_admin) ? (
                  <div className="space-y-4">
                    <Card className="shadow-medium border-0 hover:shadow-strong transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 font-dejanire">Admin Dashboard</h3>
                          <p className="text-muted-foreground text-sm mb-4">Manage batches, users, and content</p>
                          <Button asChild className="gradient-primary text-primary-foreground font-dejanire w-full">
                            <a href="/admin">Open Admin Panel</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {availableBatches
                      .filter(batch => !enrollments.some(e => e.batch.id === batch.id))
                      .slice(0, 3)
                      .map((batch) => (
                      <Card key={batch.id} className="shadow-medium hover:shadow-strong transition-all duration-300 cursor-pointer group border-0"
                            onClick={() => handleViewBatch(batch)}>
                        {batch.image_url && (
                          <div className="h-32 overflow-hidden rounded-t-lg">
                            <img
                              src={batch.image_url}
                              alt={batch.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground mb-2 font-dejanire line-clamp-1">
                            {batch.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 font-dejanire line-clamp-2">
                            {batch.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary font-dejanire">
                              ₹{batch.price.toLocaleString()}
                            </span>
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
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
