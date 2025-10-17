
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Calendar, User, MessageSquare, Eye, Check, Trash2 } from 'lucide-react';

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact submissions:', error);
        toast.error('Failed to load contact submissions');
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        toast.error('Failed to mark as read');
        return;
      }

      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, is_read: true } : sub)
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete submission');
        return;
      }

      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      setSelectedSubmission(null);
      toast.success('Submission deleted');
    } catch (error) {
      toast.error('Failed to delete submission');
    }
  };

  const unreadCount = submissions.filter(sub => !sub.is_read).length;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e3bd30] mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading contact submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Submissions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {submissions.length} total submissions, {unreadCount} unread
          </p>
        </div>
        <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
          {unreadCount} Unread
        </Badge>
      </div>

      {selectedSubmission ? (
        // Detailed view
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 font-medium"
                >
                  ← Back
                </Button>
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">
                    {selectedSubmission.subject}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    From: {selectedSubmission.first_name} {selectedSubmission.last_name}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!selectedSubmission.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(selectedSubmission.id)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 font-medium"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{selectedSubmission.first_name} {selectedSubmission.last_name}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{selectedSubmission.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedSubmission.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={selectedSubmission.is_read ? "secondary" : "destructive"}>
                  {selectedSubmission.is_read ? "Read" : "Unread"}
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // List view
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-0">
            {submissions.length > 0 ? (
              <div className="space-y-1">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      !submission.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {submission.subject}
                        </h4>
                        {!submission.is_read && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        From: {submission.first_name} {submission.last_name} ({submission.email})
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 truncate max-w-md">
                        {submission.message}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No contact submissions yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactSubmissions;
