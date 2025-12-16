
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Edit3, Save, X, MapPin, Phone, Mail, Shield } from 'lucide-react';

interface UserProfile {
  full_name: string;
  email: string;
  mobile_number: string;
  state: string;
  city: string;
  is_admin: boolean;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          mobile_number: profile.mobile_number,
          state: profile.state,
          city: profile.city,
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#e3bd30] border-t-transparent"></div>
              <p className="text-gray-600 dark:text-white/60">Loading your profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full">
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
          <CardContent className="text-center py-16">
            <div className="text-gray-600 dark:text-white/60 space-y-2">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-white/40" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Not Found</h3>
              <p>Unable to load your profile information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-black/30">
                  <User className="w-10 h-10 text-black" />
                </div>
                {profile.is_admin && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#e3bd30]" />
                  </div>
                )}
              </div>
              <div className="text-black">
                <h2 className="text-2xl font-bold">{profile.full_name || 'Welcome!'}</h2>
                <p className="text-black/80 font-medium">
                  {profile.is_admin ? 'Administrator' : 'Member'}
                </p>
                {profile.is_admin && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/20 text-black/90 border border-black/30">
                      ID: {user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {profile.is_admin && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-black/40 text-black hover:bg-black/20 bg-white/30 font-medium"
                >
                  <a href="/admin">Admin Panel</a>
                </Button>
              )}
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                    className="bg-black/80 hover:bg-black text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                    className="border-black/40 text-black hover:bg-black/20 bg-white/30"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-black/40 text-black hover:bg-black/20 bg-white/30 font-medium"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-8 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#e3bd30]" />
                Personal Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-white/80 text-sm font-medium mb-2 block">
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#e3bd30] focus:ring-[#e3bd30]/50"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
                      {profile.full_name || <span className="text-gray-500 dark:text-gray-400">Not provided</span>}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-gray-700 dark:text-white/80 text-sm font-medium mb-2 block flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </Label>
                  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-800 dark:text-white/80">
                    {profile.email}
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(cannot be changed)</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-700 dark:text-white/80 text-sm font-medium mb-2 block flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Mobile Number
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profile.mobile_number || ''}
                      onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#e3bd30] focus:ring-[#e3bd30]/50"
                      placeholder="Enter your mobile number"
                    />
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
                      {profile.mobile_number || <span className="text-gray-500 dark:text-gray-400">Not provided</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#e3bd30]" />
                Location Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-white/80 text-sm font-medium mb-2 block">State</Label>
                  {isEditing ? (
                    <Input
                      value={profile.state || ''}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#e3bd30] focus:ring-[#e3bd30]/50"
                      placeholder="Enter your state"
                    />
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
                      {profile.state || <span className="text-gray-500 dark:text-gray-400">Not provided</span>}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-gray-700 dark:text-white/80 text-sm font-medium mb-2 block">City</Label>
                  {isEditing ? (
                    <Input
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#e3bd30] focus:ring-[#e3bd30]/50"
                      placeholder="Enter your city"
                    />
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
                      {profile.city || <span className="text-gray-500 dark:text-gray-400">Not provided</span>}
                    </div>
                  )}
                </div>

                {/* Profile Stats */}
                <div className="mt-8 p-6 bg-gradient-to-r from-[#e3bd30]/20 to-[#f4d03f]/20 border border-[#e3bd30]/30 rounded-xl">
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Account Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
                      <span className="text-[#e3bd30] font-medium">
                        {profile.is_admin ? 'Administrator' : 'Premium Member'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Profile Status:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
