import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Profile = { id: string; full_name?: string | null; email?: string | null };
type Batch = { id: string; title: string; price?: number | null };
type Enrollment = { id: string; user_id: string; batch_id: string; payment_status: string };

const AdminAccessManager = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');

  const { data: profiles, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['profiles-search', userSearch],
    queryFn: async () => {
      // Server-side filtering to avoid loading all users and to work with RLS
      const term = (userSearch || '').trim();
      let query = supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true }).limit(50);
      if (term.length >= 2) {
        // Use supported OR syntax; avoid casting in the logic string to prevent parse errors
        const like = `*${term}*`;
        query = query.or(`full_name.ilike.${like},email.ilike.${like}`);
        // If the term looks like a UUID, add an exact match on id separately
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(term)) {
          query = query.or(`id.eq.${term}`);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: batches } = useQuery<Batch[]>({
    queryKey: ['batches-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('batches').select('id, title, price').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: recentEnrollments } = useQuery<any[]>({
    queryKey: ['recent-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, user_id, batch_id, payment_status, enrolled_at, batches(title)')
        .order('enrolled_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    const term = userSearch.toLowerCase().trim();
    if (!term) return profiles;
    return profiles.filter((p) =>
      [p.full_name || '', p.email || '', p.id].some((v) => v.toLowerCase().includes(term))
    );
  }, [profiles, userSearch]);

  const grantAccess = async () => {
    if (!selectedUserId || !selectedBatchId) return;
    const { error } = await supabase
      .from('enrollments')
      // onConflict handles dupes if a unique constraint exists on (user_id,batch_id)
      .upsert({ user_id: selectedUserId, batch_id: selectedBatchId, payment_status: 'paid' } as any, { onConflict: 'user_id,batch_id' });
    if (error) throw error;
    setSelectedBatchId('');
    setSelectedUserId('');
    await queryClient.invalidateQueries({ queryKey: ['recent-enrollments'] });
    await queryClient.refetchQueries({ queryKey: ['recent-enrollments'] });
    // Let other parts of the app refresh enrollments quickly
    await queryClient.invalidateQueries({ queryKey: ['user-enrollments'] });
  };

  const revokeAccess = async (enrollmentId: string) => {
    const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['recent-enrollments'] });
    await queryClient.refetchQueries({ queryKey: ['recent-enrollments'] });
    await queryClient.invalidateQueries({ queryKey: ['user-enrollments'] });
  };

  // Optional realtime: invalidate recent list when enrollments change
  useEffect(() => {
    const channel = supabase
      .channel('admin-access-enrollments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['recent-enrollments'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="space-y-8">
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-dejanire">Grant Batch Access</CardTitle>
          <CardDescription>Manually give a user access to a batch (marks as paid)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Search User</div>
            <Input placeholder="Search by name, email, or user id" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
            {profilesError && (
              <div className="text-xs text-red-500">{String(profilesError.message || profilesError)}</div>
            )}
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {filteredProfiles?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {(p.full_name || 'Unnamed User') + ' • ' + (p.email || p.id.substring(0, 8))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Select Batch</div>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {batches?.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.title} {b.price ? `• ₹${Number(b.price).toLocaleString('en-IN')}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={grantAccess} disabled={!selectedUserId || !selectedBatchId} className="w-full h-11 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black">
              Grant Access
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-dejanire">Recent Manual Access</CardTitle>
          <CardDescription>Latest enrollments for quick management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEnrollments && recentEnrollments.length > 0 ? (
            recentEnrollments.map((e) => (
              <div key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <div className="font-medium">
                    {e.profiles?.full_name || e.user_id.substring(0, 8)}
                  </div>
                  <div className="text-sm text-muted-foreground">{e.batches?.title || e.batch_id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={e.payment_status === 'paid' ? 'gradient-success text-white border-0' : 'gradient-warning text-black border-0'}>
                    {e.payment_status}
                  </Badge>
                  <Button variant="outline" className="border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => revokeAccess(e.id)}>
                    Revoke
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No recent entries</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAccessManager;


