import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Plus, Trash2, TrendingUp, User, Building, Camera } from 'lucide-react';
import { DealHistoryCard } from '@/components/DealHistoryCard';
import { BadgesProgress } from '@/components/BadgesProgress';

interface Profile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar_url?: string;
  experience_level: string;
  property_focus: string[];
  actively_seeking_funding: boolean;
  profile_bio?: string;
  funding_eligibility_score?: number;
  last_eligibility_update?: string;
}

interface Deal {
  id: string;
  property_type: string;
  city: string;
  state?: string;
  deal_status: string;
  deal_value?: number;
  profit_amount?: number;
  close_date?: string;
  created_at: string;
}

const EXPERIENCE_LEVELS = [
  { value: 'first_deal', label: 'First Deal' },
  { value: '1-3_deals', label: '1-3 Deals' },
  { value: '4-10_deals', label: '4-10 Deals' },
  { value: '11+_deals', label: '11+ Deals' },
];

const PROPERTY_TYPES = [
  'Single Family',
  'Multifamily',
  'Commercial',
  'Fix & Flip',
  'BRRRR',
  'Wholesale',
  'Land Development',
  'Retail',
  'Industrial',
];

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Check if we're in dev mode (mock user ID)
  const isDevMode = user?.id === '00000000-0000-0000-0000-000000000001' || !user;

  useEffect(() => {
    // For development mode, create a mock profile
    if (isDevMode) {
      console.log('[DEV MODE] Creating mock profile for development');
      const mockProfile: Profile = {
        user_id: user?.id || 'mock-user-dev',
        email: user?.email || 'developer@haxingtonequity.com',
        first_name: 'Dev',
        last_name: 'User',
        display_name: 'Dev User',
        avatar_url: '',
        experience_level: '4-10_deals',
        property_focus: ['Single Family', 'Fix & Flip', 'BRRRR'],
        actively_seeking_funding: true,
        profile_bio: 'This is a development mode profile. Sign in with a real account to see your actual data.',
        funding_eligibility_score: 85,
        last_eligibility_update: new Date().toISOString()
      };
      
      const mockDeals: Deal[] = [
        {
          id: 'mock-deal-1',
          property_type: 'Single Family',
          city: 'Austin',
          state: 'TX',
          deal_status: 'Closed',
          deal_value: 350000,
          profit_amount: 45000,
          close_date: '2024-06-15',
          created_at: '2024-01-10T00:00:00Z'
        },
        {
          id: 'mock-deal-2',
          property_type: 'Fix & Flip',
          city: 'Dallas',
          state: 'TX',
          deal_status: 'In Progress',
          deal_value: 275000,
          created_at: '2024-09-20T00:00:00Z'
        }
      ];
      
      setProfile(mockProfile);
      setDeals(mockDeals);
      setLoading(false);
      return;
    }
    
    // Normal authenticated flow
    fetchProfile();
    fetchDeals();
  }, [user, isDevMode]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
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

  const fetchDeals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('deal_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deal history');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    
    // DEV MODE: Just update local state without saving to database
    if (isDevMode) {
      console.log('[DEV MODE] Profile update (not saved):', updates);
      setProfile({ ...profile, ...updates });
      toast.success('DEV MODE: Profile updated locally', {
        description: 'Changes will not be saved (dev mode)',
      });
      setEditMode(false);
      return;
    }

    try {
      // SECURITY: Validate and sanitize profile updates
      const { validatePersonalData, sanitizeInput, logSecurityEvent } = await import('@/utils/inputValidation');
      
      const validationErrors = validatePersonalData(updates);
      if (validationErrors.length > 0) {
        toast.error(`Validation Error: ${validationErrors.join(', ')}`);
        return;
      }

      // SECURITY: Sanitize text fields
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.first_name) sanitizedUpdates.first_name = sanitizeInput(sanitizedUpdates.first_name);
      if (sanitizedUpdates.last_name) sanitizedUpdates.last_name = sanitizeInput(sanitizedUpdates.last_name);
      if (sanitizedUpdates.display_name) sanitizedUpdates.display_name = sanitizeInput(sanitizedUpdates.display_name);
      if (sanitizedUpdates.profile_bio) sanitizedUpdates.profile_bio = sanitizeInput(sanitizedUpdates.profile_bio);

      // SECURITY: Log profile updates for monitoring
      logSecurityEvent('profile_updated', { 
        user_id: user.id, 
        fields_updated: Object.keys(updates) 
      });

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...sanitizedUpdates });
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // DEV MODE: Disable avatar upload
    if (isDevMode) {
      toast.info('DEV MODE: Avatar upload disabled', {
        description: 'Sign in with a real account to upload avatars',
      });
      return;
    }
    
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: data.publicUrl });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* DEV MODE Banner */}
      {isDevMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            🔧 DEV MODE: Viewing mock profile data. Sign in with a real account to see your actual profile.
          </p>
        </div>
      )}
      
      {/* Profile Header */}
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <Avatar className="h-32 w-32 mx-auto">
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            <AvatarFallback className="text-2xl">
              {getInitials(profile.first_name, profile.last_name)}
            </AvatarFallback>
          </Avatar>
          {editMode && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
              <Camera className="h-8 w-8 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {profile.first_name} {profile.last_name}
          </h1>
          <h5 className="text-lg text-muted-foreground mt-2">
            @{profile.display_name.toLowerCase().replace(/\s+/g, '')}
          </h5>
        </div>

        {/* Professional About Me Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your professional bio here... Tell potential investors about your background, experience, and investment goals."
                  value={profile.profile_bio || ''}
                  onChange={(e) => setProfile({ ...profile, profile_bio: e.target.value })}
                  rows={6}
                  maxLength={2000}
                  className="w-full"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Professional bio for potential investors</span>
                  <span>{(profile.profile_bio?.length || 0)}/2000 characters</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                {profile.profile_bio ? (
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.profile_bio}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No professional bio added yet. Click "Edit Profile" to add your professional background and investment goals.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Button 
            variant={editMode ? "outline" : "default"}
            onClick={() => editMode ? updateProfile(profile) : setEditMode(true)}
          >
            {editMode ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="experience" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Experience</CardTitle>
              <CardDescription>Your experience level and property focus areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Experience Level</Label>
                <Select 
                  value={profile.experience_level} 
                  onValueChange={(value) => updateProfile({ experience_level: value })}
                  disabled={!editMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Property Focus Areas</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {PROPERTY_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type}
                        checked={profile.property_focus.includes(type)}
                        onChange={(e) => {
                          const newFocus = e.target.checked
                            ? [...profile.property_focus, type]
                            : profile.property_focus.filter(t => t !== type);
                          setProfile({ ...profile, property_focus: newFocus });
                          if (!editMode) {
                            updateProfile({ property_focus: newFocus });
                          }
                        }}
                        disabled={!editMode}
                        className="rounded"
                      />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {profile.funding_eligibility_score && (
                <div className="flex items-center justify-center space-x-2 p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    Funding Eligibility Score: {profile.funding_eligibility_score}%
                  </span>
                  {profile.last_eligibility_update && (
                    <span className="text-sm text-muted-foreground">
                      (Updated {new Date(profile.last_eligibility_update).toLocaleDateString()})
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
         </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <BadgesProgress />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="displayName">Username</Label>
                <Input
                  id="displayName"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="seekingFunding"
                  checked={profile.actively_seeking_funding}
                  onCheckedChange={(checked) => 
                    setProfile({ ...profile, actively_seeking_funding: checked })
                  }
                  disabled={!editMode}
                />
                <Label htmlFor="seekingFunding">Actively seeking funding</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
     </div>
   );
 };