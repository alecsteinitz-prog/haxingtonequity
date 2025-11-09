import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { validateContent, sanitizeInput, logSecurityEvent } from "@/utils/inputValidation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Image, X } from "lucide-react";
import { Input } from "./ui/input";

interface CreatePostProps {
  onPostCreated: () => void;
}

const CATEGORIES = [
  { value: "fix-flip", label: "Fix & Flip" },
  { value: "buy-hold", label: "Buy & Hold" },
  { value: "funding-tips", label: "Funding Tips" },
  { value: "market-insights", label: "Market Insights" },
];

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("fix-flip");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post.",
        variant: "destructive"
      });
      return;
    }

    // SECURITY: Validate and sanitize content
    const validationErrors = validateContent(content);
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let photoUrl: string | null = null;

      // Upload photo if present
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      // SECURITY: Sanitize content before saving
      const sanitizedContent = sanitizeInput(content.trim());
      
      // SECURITY: Log content creation for monitoring
      logSecurityEvent('post_created', { 
        user_id: user.id, 
        content_length: sanitizedContent.length 
      });

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: sanitizedContent,
          category,
          photo_url: photoUrl
        });

      if (error) throw error;

      setContent("");
      setCategory("fix-flip");
      setPhotoFile(null);
      setPhotoPreview(null);
      onPostCreated();
      
      toast({
        title: "Post Created",
        description: "Your strategy has been shared with the community!",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Sign in to share your strategies with the community.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your real estate strategy, lesson learned, or funding win..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                className="min-h-[100px] resize-none"
              />
              
              {photoPreview && (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="rounded-md max-h-64 w-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Photo
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {content.length}/500 characters
                </span>
                <Button 
                  type="submit" 
                  disabled={!content.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? "Posting..." : "Share Strategy"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};