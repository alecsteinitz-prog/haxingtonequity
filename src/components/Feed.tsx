import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PostCardWithTracking } from "./PostCardWithTracking";
import { CreatePost } from "./CreatePost";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TrendingUp, Clock, Edit3, Plus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";
import { ReferralBanner } from "./ReferralBanner";
import { Leaderboard } from "./Leaderboard";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "fix-flip", label: "Fix & Flip" },
  { value: "buy-hold", label: "Buy & Hold" },
  { value: "funding-tips", label: "Funding Tips" },
  { value: "market-insights", label: "Market Insights" },
];

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
  } | null;
  user_liked?: boolean;
  user_saved?: boolean;
}

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "for_you">("for_you");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackLike, trackSave } = useInteractionTracking();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // If "For You" is selected and user is authenticated, use recommendation engine
      if (sortBy === "for_you" && user) {
        const { data: recommendedPosts, error: recError } = await supabase.functions.invoke(
          'recommendation-engine',
          { body: { userId: user.id } }
        );

        if (recError) {
          console.error('Recommendation engine error:', recError);
          // Fallback to latest posts
          return fetchRegularPosts();
        }

        if (recommendedPosts?.posts) {
          await enrichPostsWithUserData(recommendedPosts.posts);
          return;
        }
      }

      // Regular post fetching for latest/popular or non-authenticated users
      await fetchRegularPosts();
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegularPosts = async () => {
    // Get posts with user profile data
    let query = supabase
      .from("posts")
      .select(`
        id,
        content,
        likes_count,
        created_at,
        user_id,
        photo_url,
        category,
        profiles!posts_user_id_fkey (
          display_name,
          first_name,
          last_name,
          avatar_url,
          experience_level
        )
      `);

    // Apply category filter
    if (categoryFilter !== "all") {
      query = query.eq("category", categoryFilter);
    }

    const { data: postsData, error: postsError } = await query
      .order(sortBy === "latest" ? "created_at" : "likes_count", { ascending: false })
      .limit(50);

    if (postsError) throw postsError;
    await enrichPostsWithUserData(postsData);
  };

  const enrichPostsWithUserData = async (postsData: any[]) => {
    // Get user's likes for these posts
    let userLikes: string[] = [];
    let userSavedStrategies: string[] = [];
    
    if (user && postsData) {
      const postIds = postsData.map(post => post.id);
      
      const { data: likesData } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);
      
      const { data: savedData } = await supabase
        .from("saved_strategies")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);
      
      userLikes = likesData?.map(like => like.post_id) || [];
      userSavedStrategies = savedData?.map(saved => saved.post_id) || [];
    }

    // Combine the data and filter out posts without profiles
    const enrichedPosts = postsData
      ?.filter(post => post.profiles !== null)
      ?.map(post => ({
        ...post,
        profiles: post.profiles!,
        user_liked: userLikes.includes(post.id),
        user_saved: userSavedStrategies.includes(post.id)
      })) || [];

    setPosts(enrichedPosts);
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy, categoryFilter, user]);

  const handlePostCreated = () => {
    fetchPosts();
    setShowCreatePost(false);
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }

      // Track interaction for recommendations
      if (!isLiked) {
        trackLike(postId);
      }

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              user_liked: !isLiked,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveStrategy = async (post: Post) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("saved_strategies")
        .insert({
          user_id: user.id,
          post_id: post.id,
          original_content: post.content,
          original_author_name: post.profiles.display_name || `${post.profiles.first_name} ${post.profiles.last_name}`
        });

      if (error) throw error;

      // Track interaction for recommendations
      trackSave(post.id);

      // Update local state
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, user_saved: true } : p
      ));

      toast({
        title: "Strategy Saved",
        description: "This strategy has been saved to your collection.",
      });
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Already Saved",
          description: "You've already saved this strategy.",
        });
      } else {
        console.error("Error saving strategy:", error);
        toast({
          title: "Error",
          description: "Failed to save strategy. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleReport = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_reported: true })
        .eq("id", postId);

      if (error) throw error;

      // Remove from local state
      setPosts(posts.filter(post => post.id !== postId));
      
      toast({
        title: "Post Reported",
        description: "Thank you for reporting. The post has been flagged for review.",
      });
    } catch (error) {
      console.error("Error reporting post:", error);
      toast({
        title: "Error",
        description: "Failed to report post. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* New Post Button */}
      <div className="text-center">
        <Button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="flex items-center gap-2"
          size="lg"
          variant={showCreatePost ? "outline" : "default"}
        >
          <Plus className="h-5 w-5" />
          {showCreatePost ? "Cancel" : "New Post"}
        </Button>
      </div>

      {/* Create Post Section */}
      {showCreatePost && <CreatePost onPostCreated={handlePostCreated} />}

      {/* Header and Sort Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Community Feed</h2>
        <Select value={sortBy} onValueChange={(value: "latest" | "popular" | "for_you") => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="for_you">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                For You
              </div>
            </SelectItem>
            <SelectItem value="latest">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Latest
              </div>
            </SelectItem>
            <SelectItem value="popular">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Most Liked
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filters */}
      <div className="w-full -mx-4 px-4 md:mx-0 md:px-0">
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full">
          <TabsList className="w-full justify-start">
            {CATEGORIES.map((category) => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Referral Banner */}
      <ReferralBanner />

      {/* Leaderboard */}
      <Leaderboard />

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share your strategy!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCardWithTracking
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLikeToggle={handleLikeToggle}
              onSaveStrategy={handleSaveStrategy}
              onReport={handleReport}
            />
          ))
        )}
      </div>
    </div>
  );
};