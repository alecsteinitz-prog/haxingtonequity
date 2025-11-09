import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface CommentsSectionProps {
  postId: string;
}

export const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [postId, showComments]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          display_name,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data as any);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      
      toast({
        title: "Comment Posted",
        description: "Your comment has been added!",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
      </Button>

      {showComments && (
        <div className="space-y-4 border-t pt-4">
          {/* Comments List */}
          {comments.map((comment) => {
            const authorName = comment.profiles.display_name || 
              `${comment.profiles.first_name} ${comment.profiles.last_name}`;
            
            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles.avatar_url} />
                  <AvatarFallback>
                    {authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-medium text-sm">{authorName}</p>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 inline-block">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add Comment */}
          {user && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
                <Button
                  size="icon"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
