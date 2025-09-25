import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { validateContent, sanitizeInput, logSecurityEvent } from "@/utils/inputValidation";

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
          content: sanitizedContent
        });

      if (error) throw error;

      setContent("");
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
                maxLength={140}
                className="min-h-[100px] resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {content.length}/140 characters
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