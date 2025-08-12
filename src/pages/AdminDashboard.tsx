import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, MessageCircle, Mail, TrendingUp, DollarSign } from 'lucide-react';
import AdminBatchManager from '@/components/AdminBatchManager';
import ContactSubmissions from '@/components/ContactSubmissions';
import NewsletterSubscriptions from '@/components/NewsletterSubscriptions';
import CircularNav from '@/components/CircularNav';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
  });

  const StatCard = ({ title, value, icon: Icon, description, gradient }: any) => (
    <Card className={`border-0 ${gradient} text-white shadow-xl hover-lift overflow-hidden group relative`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <CardTitle className="text-base font-bold text-white/90 font-dejanire">{title}</CardTitle>
        <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold text-white mb-2">{value}</div>
        <p className="text-sm text-white/80 font-dejanire">{description}</p>
      </CardContent>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </Card>
  );

  return (
    <>
      <CircularNav />
      <div className="min-h-screen gradient-hero pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-16 text-center animate-fade-in">
            <div className="relative">
              <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 font-dejanire">
                Admin <span className="text-gradient">Dashboard</span>
              </h1>
              <div className="absolute -top-4 -right-4 w-32 h-32 gradient-primary rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <p className="text-xl text-muted-foreground font-dejanire max-w-3xl mx-auto leading-relaxed">
              Manage your fitness platform, track performance metrics, and oversee all operations from this centralized hub
            </p>
            <Badge className="gradient-accent text-accent-foreground border-0 px-6 py-3 text-base font-bold shadow-medium mt-6">
              🛡️ Administrator Access
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 glass border-0 h-14 rounded-2xl shadow-medium">
              <TabsTrigger value="overview" className="font-dejanire font-semibold text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-xl">📊 Overview</TabsTrigger>
              <TabsTrigger value="batches" className="font-dejanire font-semibold text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-xl">📚 Batches</TabsTrigger>
              <TabsTrigger value="contacts" className="font-dejanire font-semibold text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-xl">💬 Contacts</TabsTrigger>
              <TabsTrigger value="newsletter" className="font-dejanire font-semibold text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-xl">📧 Newsletter</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard
                  title="📚 Total Batches"
                  value={stats?.totalBatches || 0}
                  icon={BookOpen}
                  description="Active fitness programs"
                  gradient="gradient-primary"
                />
                <StatCard
                  title="👥 Total Users"
                  value={stats?.totalUsers || 0}
                  icon={Users}
                  description="Registered members"
                  gradient="gradient-success"
                />
                <StatCard
                  title="💬 Contact Messages"
                  value={stats?.totalContacts || 0}
                  icon={MessageCircle}
                  description="Customer inquiries"
                  gradient="gradient-accent"
                />
                <StatCard
                  title="📧 Newsletter Subscribers"
                  value={stats?.totalNewsletterSubs || 0}
                  icon={Mail}
                  description="Email subscriptions"
                  gradient="gradient-primary"
                />
                <StatCard
                  title="📈 Total Enrollments"
                  value={stats?.totalEnrollments || 0}
                  icon={TrendingUp}
                  description="All enrollment attempts"
                  gradient="gradient-secondary"
                />
                <StatCard
                  title="💰 Paid Enrollments"
                  value={stats?.paidEnrollments || 0}
                  icon={DollarSign}
                  description="Successfully paid"
                  gradient="gradient-success"
                />
              </div>

              <Card className="glass border-0 shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-gradient font-dejanire text-3xl">🚀 Quick Actions</CardTitle>
                  <CardDescription className="font-dejanire text-lg text-muted-foreground">
                    Common administrative tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Button
                    onClick={() => setActiveTab('batches')}
                    size="lg"
                    className="h-20 gradient-primary text-primary-foreground font-dejanire text-base hover-lift group"
                  >
                    <div className="text-center">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <div>Manage Batches</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('contacts')}
                    size="lg"
                    className="h-20 gradient-accent text-accent-foreground font-dejanire text-base hover-lift group"
                  >
                    <div className="text-center">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <div>View Messages</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('newsletter')}
                    size="lg"
                    className="h-20 gradient-success text-success-foreground font-dejanire text-base hover-lift group"
                  >
                    <div className="text-center">
                      <Mail className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <div>Newsletter Subs</div>
                    </div>
                  </Button>
                  <div className="h-20 glass border border-muted rounded-2xl flex items-center justify-center font-dejanire text-base text-muted-foreground cursor-not-allowed">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <div>Analytics (Soon)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batches">
              <AdminBatchManager />
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
