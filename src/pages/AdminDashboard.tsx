import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, BookOpen, MessageCircle, Mail, TrendingUp, DollarSign, ShieldAlert, Lock } from 'lucide-react';
import AdminBatchManager from '@/components/AdminBatchManager';
import AdminAccessManager from '@/components/AdminAccessManager';
import ContactSubmissions from '@/components/ContactSubmissions';
import NewsletterSubscriptions from '@/components/NewsletterSubscriptions';
import CircularNav from '@/components/CircularNav';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin with proper verification
  const { data: adminStatus, isLoading: adminCheckLoading } = useQuery({
    queryKey: ['admin-verification', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }
        
        return profile?.is_admin || false;
      } catch (error) {
        console.error('Admin verification error:', error);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 0, // Always fresh check
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Update admin status and verification state
  useEffect(() => {
    if (!authLoading && !adminCheckLoading) {
      setIsAdmin(adminStatus || false);
      setIsVerifyingAdmin(false);
    }
  }, [adminStatus, authLoading, adminCheckLoading]);

  // Redirect non-admin users immediately
  useEffect(() => {
    if (!authLoading && !adminCheckLoading && !isVerifyingAdmin) {
      if (!user) {
        // Not logged in - redirect to auth
        navigate('/auth', { replace: true });
      } else if (!isAdmin) {
        // Logged in but not admin - redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, adminCheckLoading, isVerifyingAdmin, navigate]);

  // Fetch overview statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [batchesRes, usersRes, contactRes, newsletterRes, enrollmentsRes] = await Promise.all([
        supabase.from('batches').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('contact_submissions').select('id', { count: 'exact' }),
        supabase.from('newsletter_subscriptions').select('id', { count: 'exact' }),
        supabase.from('enrollments').select('id, payment_status', { count: 'exact' })
      ]);

      const paidEnrollments = enrollmentsRes.data?.filter(e => e.payment_status === 'paid').length || 0;

      return {
        totalBatches: batchesRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalContacts: contactRes.count || 0,
        totalNewsletterSubs: newsletterRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        paidEnrollments
      };
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const StatCard = ({ title, value, icon: Icon, description, gradient }: any) => (
    <Card className={`border-0 ${gradient} text-white shadow-2xl hover-lift overflow-hidden group relative backdrop-blur-xl`}>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-white/95 font-dejanire uppercase tracking-wider">{title}</CardTitle>
        <div className="p-2.5 bg-white/25 backdrop-blur-sm rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
          <Icon className="h-5 w-5 text-white drop-shadow-lg" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-5xl font-black text-white mb-1 tracking-tight group-hover:scale-105 transition-transform duration-300">{value}</div>
        <p className="text-xs text-white/90 font-dejanire font-medium tracking-wide">{description}</p>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 group-hover:bg-white/50 transition-colors duration-300"></div>
    </Card>
  );

  // Show loading state while verifying admin status
  if (authLoading || adminCheckLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">Verifying Admin Access...</p>
            <p className="text-sm text-muted-foreground">Please wait while we authenticate your credentials</p>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin (as fallback before redirect)
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="border-2 border-destructive/50 shadow-2xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Access Denied</h2>
              <p className="text-muted-foreground mb-6">
                You do not have permission to access the admin panel. This area is restricted to authorized administrators only.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Lock className="w-4 h-4" />
                <span>Admin authentication required</span>
              </div>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full gradient-primary text-primary-foreground font-semibold"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <CircularNav />
      <div className="min-h-screen gradient-hero pt-20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Enhanced Header Section */}
          <div className="mb-16 text-center animate-fade-in relative">
            {/* Layered Background Effects */}
            <div className="absolute inset-0 -top-32 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="w-[600px] h-[600px] bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-full blur-[100px] animate-pulse-slow"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-96 h-96 bg-gradient-to-l from-accent/30 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10 space-y-6">
              {/* Main Title with Enhanced Typography */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground font-dejanire tracking-tight">
                <span className="inline-block hover:scale-105 transition-transform duration-300">Admin</span>{' '}
                <span className="relative inline-block">
                  <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Dashboard
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                </span>
              </h1>
              
              {/* Subtitle with Icons */}
              <div className="flex items-center justify-center gap-4 text-muted-foreground max-w-4xl mx-auto">
                <div className="hidden md:block w-24 h-px bg-gradient-to-r from-transparent to-muted-foreground/30"></div>
                <p className="text-base md:text-lg font-dejanire font-medium tracking-wide px-4">
                  Complete platform oversight • Real-time metrics • Streamlined management
                </p>
                <div className="hidden md:block w-24 h-px bg-gradient-to-l from-transparent to-muted-foreground/30"></div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Enhanced Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 glass border border-white/10 h-auto md:h-auto rounded-3xl shadow-2xl p-3 gap-3 backdrop-blur-xl bg-white/5 dark:bg-black/5">
              <TabsTrigger 
                value="overview" 
                className="font-dejanire font-bold text-sm md:text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl rounded-2xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 py-4 md:py-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-center gap-2.5 relative z-10">
                  <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-black tracking-wide">Overview</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="batches" 
                className="font-dejanire font-bold text-sm md:text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl rounded-2xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 py-4 md:py-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-center gap-2.5 relative z-10">
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-black tracking-wide">Batches</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="access" 
                className="font-dejanire font-bold text-sm md:text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl rounded-2xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 py-4 md:py-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-center gap-2.5 relative z-10">
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-black tracking-wide">Access</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="contacts" 
                className="font-dejanire font-bold text-sm md:text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl rounded-2xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 py-4 md:py-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-center gap-2.5 relative z-10">
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-black tracking-wide">Contacts</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="newsletter" 
                className="font-dejanire font-bold text-sm md:text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl rounded-2xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 py-4 md:py-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-center gap-2.5 relative z-10">
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-black tracking-wide">Newsletter</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-10 animate-fade-in">
              {/* Enhanced Stats Grid */}
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6 font-dejanire flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  Platform Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Batches"
                  value={stats?.totalBatches || 0}
                  icon={BookOpen}
                  description="Active fitness programs"
                  gradient="gradient-primary"
                />
                <StatCard
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  icon={Users}
                  description="Registered members"
                  gradient="gradient-success"
                />
                <StatCard
                  title="Contact Messages"
                  value={stats?.totalContacts || 0}
                  icon={MessageCircle}
                  description="Customer inquiries"
                  gradient="gradient-accent"
                />
                <StatCard
                  title="Newsletter Subscribers"
                  value={stats?.totalNewsletterSubs || 0}
                  icon={Mail}
                  description="Email subscriptions"
                  gradient="gradient-primary"
                />
                <StatCard
                  title="Total Enrollments"
                  value={stats?.totalEnrollments || 0}
                  icon={TrendingUp}
                  description="All enrollment attempts"
                  gradient="gradient-secondary"
                />
                <StatCard
                  title="Paid Enrollments"
                  value={stats?.paidEnrollments || 0}
                  icon={DollarSign}
                  description="Successfully paid"
                  gradient="gradient-success"
                />
                </div>
              </div>

              {/* Enhanced Quick Actions */}
              <Card className="glass border border-white/10 shadow-2xl overflow-hidden relative backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                
                <CardHeader className="pb-8 relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    <CardTitle className="text-gradient font-dejanire text-3xl md:text-4xl font-black tracking-tight">Quick Actions</CardTitle>
                  </div>
                  <CardDescription className="font-dejanire text-base md:text-lg text-muted-foreground ml-5">
                    Access frequently used administrative tools instantly
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 relative z-10 pb-8">
                  <Button
                    onClick={() => setActiveTab('batches')}
                    size="lg"
                    className="h-32 gradient-primary text-primary-foreground font-dejanire text-base hover-lift group hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden rounded-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="text-center relative z-10 space-y-3">
                      <div className="p-3 bg-white/20 rounded-xl mx-auto w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="font-black text-base">Manage Batches</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('contacts')}
                    size="lg"
                    className="h-32 gradient-accent text-accent-foreground font-dejanire text-base hover-lift group hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300 relative overflow-hidden rounded-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="text-center relative z-10 space-y-3">
                      <div className="p-3 bg-white/20 rounded-xl mx-auto w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      <div className="font-black text-base">View Messages</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('newsletter')}
                    size="lg"
                    className="h-32 gradient-success text-success-foreground font-dejanire text-base hover-lift group hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 relative overflow-hidden rounded-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="text-center relative z-10 space-y-3">
                      <div className="p-3 bg-white/20 rounded-xl mx-auto w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Mail className="w-8 h-8" />
                      </div>
                      <div className="font-black text-base">Newsletter</div>
                    </div>
                  </Button>
                  
                  <div className="h-32 glass border-2 border-dashed border-muted/40 rounded-2xl flex items-center justify-center font-dejanire text-base text-muted-foreground cursor-not-allowed relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-muted/5 to-transparent"></div>
                    <div className="text-center relative z-10 space-y-3">
                      <div className="p-3 bg-muted/20 rounded-xl mx-auto w-fit opacity-60">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="font-bold text-base mb-1">Analytics</div>
                        <div className="text-xs opacity-75 font-semibold tracking-wider uppercase">Coming Soon</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batches">
              <AdminBatchManager />
            </TabsContent>

            <TabsContent value="access">
              <AdminAccessManager />
            </TabsContent>

            <TabsContent value="contacts">
              <ContactSubmissions />
            </TabsContent>

            <TabsContent value="newsletter">
              <NewsletterSubscriptions />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
