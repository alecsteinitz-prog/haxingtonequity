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

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchDeals();
    }
  }, [user]);

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
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...updates });
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <Button 
          variant={editMode ? "outline" : "default"}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="deals">Deal History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                    <AvatarFallback className="text-xl">
                      {getInitials(profile.first_name, profile.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
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
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                    <div className="flex items-center space-x-2">
                      {profile.actively_seeking_funding ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Actively Seeking Funding
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Seeking Funding</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-2">{profile.email}</p>
                  
                  {profile.funding_eligibility_score && (
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Eligibility Score: {profile.funding_eligibility_score}%
                      </span>
                      {profile.last_eligibility_update && (
                        <span className="text-xs text-muted-foreground">
                          (Updated {new Date(profile.last_eligibility_update).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-foreground">
                    {profile.profile_bio || "No bio provided yet."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          {editMode && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Profile Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your investment goals..."
                    value={profile.profile_bio || ''}
                    onChange={(e) => setProfile({ ...profile, profile_bio: e.target.value })}
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(profile.profile_bio?.length || 0)}/200 characters
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="seekingFunding"
                    checked={profile.actively_seeking_funding}
                    onCheckedChange={(checked) => 
                      setProfile({ ...profile, actively_seeking_funding: checked })
                    }
                  />
                  <Label htmlFor="seekingFunding">Actively seeking funding</Label>
                </div>
                
                <Button onClick={() => updateProfile(profile)} className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Deal History</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </Button>
          </div>
          
          {deals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No deals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your track record by adding your property deals
                </p>
                <Button>Add Your First Deal</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deals.map((deal) => (
                <DealHistoryCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};