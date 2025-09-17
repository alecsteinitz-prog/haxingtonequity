import { formatDistanceToNow } from "date-fns";
import { Heart, Copy, Flag, MoreHorizontal } from "lucide-react";
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

interface Post {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  user_id: string;
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
  const authorName = post.profiles.display_name || 
    `${post.profiles.first_name} ${post.profiles.last_name}`;
  
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
            <div>
              <p className="font-medium leading-none">{authorName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getExperienceBadgeVariant(post.profiles.experience_level)}>
                  {getExperienceLabel(post.profiles.experience_level)}
                </Badge>
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
        <div className="mb-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Actions */}
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
      </CardContent>
    </Card>
  );
};