
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Search, Users, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';

interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  created_at: string;
}

const NewsletterSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<NewsletterSubscription[]>([]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    const filtered = subscriptions.filter(sub =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to fetch newsletter subscriptions');
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscriptionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating subscription:', error);
        toast.error('Failed to update subscription status');
      } else {
        toast.success(`Subscription ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating subscription');
    }
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.is_active).length;
  const totalSubscriptions = subscriptions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e3bd30]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#e3bd30]/20 bg-gradient-to-br from-[#e3bd30]/5 to-[#f4d03f]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-[#e3bd30]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#e3bd30]">{totalSubscriptions}</div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-400/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Subscriptions
            </CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-400/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Inactive Subscriptions
            </CardTitle>
            <ToggleLeft className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalSubscriptions - activeSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#e3bd30]">
                <Mail className="w-5 h-5" />
                Newsletter Subscriptions
              </CardTitle>
              <CardDescription>
                Manage all newsletter subscriptions from your website
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No subscriptions found matching your search.' : 'No newsletter subscriptions yet.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.email}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={subscription.is_active ? "default" : "secondary"}
                          className={subscription.is_active ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {subscription.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {format(new Date(subscription.subscribed_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSubscriptionStatus(subscription.id, subscription.is_active)}
                          className={subscription.is_active 
                            ? "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300 font-medium flex items-center gap-2" 
                            : "bg-green-50 hover:bg-green-100 text-green-700 border-green-300 font-medium flex items-center gap-2"
                          }
                        >
                          {subscription.is_active ? (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterSubscriptions;
