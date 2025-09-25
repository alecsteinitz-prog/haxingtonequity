import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Strategy and topic keywords for content analysis
const STRATEGY_KEYWORDS = {
  'fix_and_flip': ['flip', 'rehab', 'renovate', 'renovation', 'fix', 'ARV', 'after repair value', 'contractor'],
  'brrrr': ['BRRRR', 'buy rehab rent refinance', 'cash flow', 'rental', 'tenant', 'rent'],
  'wholesale': ['wholesale', 'assignment', 'contract', 'motivated seller', 'bird dog', 'off market'],
  'buy_and_hold': ['buy and hold', 'rental property', 'cash flow', 'appreciation', 'passive income'],
  'commercial': ['commercial', 'office', 'retail', 'industrial', 'multifamily', 'apartment'],
  'land_development': ['land', 'development', 'subdivision', 'zoning', 'entitlement']
};

const TOPIC_KEYWORDS = {
  'financing': ['loan', 'lending', 'interest rate', 'down payment', 'mortgage', 'credit'],
  'analysis': ['analysis', 'numbers', 'ROI', 'cap rate', 'NOI', 'cash on cash'],
  'marketing': ['marketing', 'lead generation', 'advertising', 'direct mail', 'cold calling'],
  'negotiation': ['negotiate', 'offer', 'counter', 'deal structure', 'terms'],
  'legal': ['contract', 'legal', 'attorney', 'title', 'closing', 'due diligence'],
  'management': ['property management', 'tenant', 'maintenance', 'vacancy', 'screening']
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Generating recommendations for user:', userId);

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user interactions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get all posts from last 72 hours for freshness + some older trending posts
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const { data: recentPosts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        likes_count,
        created_at,
        user_id,
        strategy_tags,
        content_topics,
        profiles!posts_user_id_fkey (
          display_name,
          first_name,
          last_name,
          avatar_url,
          experience_level
        )
      `)
      .gte('created_at', threeDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // Get trending posts (high engagement) from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: trendingPosts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        likes_count,
        created_at,
        user_id,
        strategy_tags,
        content_topics,
        profiles!posts_user_id_fkey (
          display_name,
          first_name,
          last_name,
          avatar_url,
          experience_level
        )
      `)
      .gte('created_at', sevenDaysAgo.toISOString())
      .gte('likes_count', 2)
      .order('likes_count', { ascending: false })
      .limit(50);

    // Combine and deduplicate posts
    const allPosts = [...(recentPosts || []), ...(trendingPosts || [])];
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );

    // If user has no interactions yet, return trending posts (cold start)
    if (!interactions || interactions.length === 0) {
      console.log('Cold start - returning trending posts');
      const scoredPosts = uniquePosts.map(post => ({
        ...post,
        recommendation_score: calculateTrendingScore(post)
      })).sort((a, b) => b.recommendation_score - a.recommendation_score);
      
      return new Response(JSON.stringify({ posts: scoredPosts.slice(0, 50) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate user preference weights from interactions
    const userPrefs = calculateUserPreferences(interactions || [], preferences);
    console.log('User preferences:', userPrefs);

    // Score posts based on user preferences
    const scoredPosts = uniquePosts.map(post => {
      const score = calculatePersonalizedScore(post, userPrefs, interactions || []);
      return {
        ...post,
        recommendation_score: score
      };
    }).sort((a, b) => b.recommendation_score - a.recommendation_score);

    // Add diversity - mix in some different content (20% of feed)
    const diversePosts = addDiversityToFeed(scoredPosts, userPrefs);

    console.log(`Returning ${diversePosts.length} personalized posts`);
    
    return new Response(JSON.stringify({ posts: diversePosts.slice(0, 50) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in recommendation engine:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateTrendingScore(post: any): number {
  const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursOld * 2); // Decreases over time
  const engagementScore = Math.min(50, post.likes_count * 10); // Max 50 points
  
  return recencyScore + engagementScore;
}

function calculateUserPreferences(interactions: any[], existingPrefs?: any) {
  const strategyWeights: Record<string, number> = {};
  const topicWeights: Record<string, number> = {};
  
  // Base weights from existing preferences
  if (existingPrefs?.preferred_strategies) {
    Object.assign(strategyWeights, existingPrefs.preferred_strategies);
  }
  if (existingPrefs?.preferred_topics) {
    Object.assign(topicWeights, existingPrefs.preferred_topics);
  }

  // Calculate weights from interactions
  const interactionWeights = {
    'like': 3,
    'save': 5,
    'share': 4,
    'view': 1,
    'dwell_time': 2
  };

  interactions.forEach(interaction => {
    const weight = interactionWeights[interaction.interaction_type as keyof typeof interactionWeights] || 1;
    
    // For now, we'll analyze content on the fly
    // In production, you'd want to pre-calculate and store these tags
    if (interaction.post_content) {
      const strategies = analyzeContentForStrategies(interaction.post_content);
      const topics = analyzeContentForTopics(interaction.post_content);
      
      strategies.forEach(strategy => {
        strategyWeights[strategy] = (strategyWeights[strategy] || 0) + weight;
      });
      
      topics.forEach(topic => {
        topicWeights[topic] = (topicWeights[topic] || 0) + weight;
      });
    }
  });

  // Normalize weights
  const totalStrategyWeight = Object.values(strategyWeights).reduce((sum, w) => sum + w, 0);
  const totalTopicWeight = Object.values(topicWeights).reduce((sum, w) => sum + w, 0);
  
  if (totalStrategyWeight > 0) {
    Object.keys(strategyWeights).forEach(key => {
      strategyWeights[key] = strategyWeights[key] / totalStrategyWeight;
    });
  }
  
  if (totalTopicWeight > 0) {
    Object.keys(topicWeights).forEach(key => {
      topicWeights[key] = topicWeights[key] / totalTopicWeight;
    });
  }

  return { strategies: strategyWeights, topics: topicWeights };
}

function analyzeContentForStrategies(content: string): string[] {
  const lowerContent = content.toLowerCase();
  const foundStrategies: string[] = [];
  
  Object.entries(STRATEGY_KEYWORDS).forEach(([strategy, keywords]) => {
    const matches = keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
    if (matches) {
      foundStrategies.push(strategy);
    }
  });
  
  return foundStrategies;
}

function analyzeContentForTopics(content: string): string[] {
  const lowerContent = content.toLowerCase();
  const foundTopics: string[] = [];
  
  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    const matches = keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
    if (matches) {
      foundTopics.push(topic);
    }
  });
  
  return foundTopics;
}

function calculatePersonalizedScore(post: any, userPrefs: any, interactions: any[]): number {
  // Base recency score (0-40 points)
  const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 40 - hoursOld * 0.5);
  
  // Engagement score (0-20 points)
  const engagementScore = Math.min(20, post.likes_count * 2);
  
  // User interaction penalty (avoid showing same content)
  const hasInteracted = interactions.some(i => i.post_id === post.id);
  const interactionPenalty = hasInteracted ? -30 : 0;
  
  // Content matching score (0-40 points)
  let contentScore = 0;
  
  // Analyze post content for strategies and topics
  const postStrategies = analyzeContentForStrategies(post.content);
  const postTopics = analyzeContentForTopics(post.content);
  
  // Score based on strategy preferences
  postStrategies.forEach(strategy => {
    const weight = userPrefs.strategies[strategy] || 0;
    contentScore += weight * 25; // Max 25 points per strategy
  });
  
  // Score based on topic preferences
  postTopics.forEach(topic => {
    const weight = userPrefs.topics[topic] || 0;
    contentScore += weight * 15; // Max 15 points per topic
  });
  
  // Limit content score to 40 points max
  contentScore = Math.min(40, contentScore);
  
  const totalScore = recencyScore + engagementScore + contentScore + interactionPenalty;
  return Math.max(0, totalScore); // Never go below 0
}

function addDiversityToFeed(scoredPosts: any[], userPrefs: any): any[] {
  const topPosts = scoredPosts.slice(0, Math.floor(scoredPosts.length * 0.8));
  const diversePosts = scoredPosts.slice(Math.floor(scoredPosts.length * 0.8));
  
  // Shuffle diverse posts to add randomness
  for (let i = diversePosts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [diversePosts[i], diversePosts[j]] = [diversePosts[j], diversePosts[i]];
  }
  
  // Interleave top posts with diverse posts
  const result: any[] = [];
  const diverseCount = Math.min(10, diversePosts.length);
  
  for (let i = 0; i < topPosts.length; i++) {
    result.push(topPosts[i]);
    
    // Every 4th post, add a diverse post
    if (i % 4 === 3 && result.filter(p => diversePosts.includes(p)).length < diverseCount) {
      const nextDiverse = diversePosts.find(p => !result.includes(p));
      if (nextDiverse) {
        result.push(nextDiverse);
      }
    }
  }
  
  return result;
}