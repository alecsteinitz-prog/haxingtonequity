import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, Copy, Flag, MoreHorizontal, UserPlus, UserCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CommentsSection } from "./CommentsSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  user_id: string;
  photo_url?: string;
  category?: string;
  profiles: {
    display_name: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    experience_level?: string;
  };
  user_liked?: boolean;
  user_saved?: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onSaveStrategy: (post: Post) => void;
  onReport: (postId: string) => void;
}

export const PostCard = ({ 
  post, 
  currentUserId, 
  onLikeToggle, 
  onSaveStrategy, 
  onReport 
}: PostCardProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();
  const authorName = post.profiles.display_name || 
    `${post.profiles.first_name} ${post.profiles.last_name}`;

  useEffect(() => {
    if (currentUserId && post.user_id !== currentUserId) {
      checkFollowStatus();
    }
  }, [currentUserId, post.user_id]);

  const checkFollowStatus = async () => {
    if (!currentUserId) return;

    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", post.user_id)
      .single();

    setIsFollowing(!!data);
  };

  const handleFollowToggle = async () => {
    if (!currentUserId) return;

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", post.user_id);
        
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${authorName}`,
        });
      } else {
        await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: post.user_id
          });
        
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You're now following ${authorName}`,
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "fix-flip": return "Fix & Flip";
      case "buy-hold": return "Buy & Hold";
      case "funding-tips": return "Funding Tips";
      case "market-insights": return "Market Insights";
      default: return null;
    }
  };
  
  const getExperienceBadgeVariant = (level?: string) => {
    switch (level) {
      case "first_deal":
        return "secondary";
      case "experienced":
        return "default";
      case "expert":
        return "default";
      default:
        return "outline";
    }
  };

  const getExperienceLabel = (level?: string) => {
    switch (level) {
      case "first_deal":
        return "First Deal";
      case "experienced":
        return "Experienced";
      case "expert":
        return "Expert";
      default:
        return "Investor";
    }
  };

  const isOwnPost = currentUserId === post.user_id;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback>
                {authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium leading-none">{authorName}</p>
                {currentUserId && !isOwnPost && (
                  <Button
                    variant={isFollowing ? "secondary" : "outline"}
                    size="sm"
                    onClick={handleFollowToggle}
                    className="h-6 px-2 text-xs"
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getExperienceBadgeVariant(post.profiles.experience_level)}>
                  {getExperienceLabel(post.profiles.experience_level)}
                </Badge>
                {post.category && (
                  <Badge variant="outline">{getCategoryLabel(post.category)}</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          {!isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReport(post.id)} className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mb-4 space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          {post.photo_url && (
            <img 
              src={post.photo_url} 
              alt="Post content" 
              className="rounded-lg max-h-96 w-full object-cover"
            />
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLikeToggle(post.id, post.user_liked || false)}
                  className={cn(
                    "flex items-center gap-2",
                    post.user_liked && "text-red-500"
                  )}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4",
                      post.user_liked && "fill-current"
                    )} 
                  />
                  <span>{post.likes_count}</span>
                </Button>
              )}
              
              {!currentUserId && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes_count}</span>
                </div>
              )}
            </div>

            {currentUserId && !isOwnPost && (
              <Button
                variant={post.user_saved ? "secondary" : "outline"}
                size="sm"
                onClick={() => onSaveStrategy(post)}
                disabled={post.user_saved}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {post.user_saved ? "Saved" : "Copy Strategy"}
              </Button>
            )}
          </div>

          {/* Comments Section */}
          <CommentsSection postId={post.id} />
        </div>
      </CardContent>
    </Card>
  );
};