import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, TrendingUp, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Badge {
  badge_type: string;
  progress: number;
  target: number;
  is_earned: boolean;
  earned_at: string | null;
}

const BADGE_CONFIG = {
  first_analyzed_deal: {
    title: 'First Analyzed Deal',
    description: 'Complete your first deal analysis',
    icon: Target,
    color: 'text-blue-500',
  },
  first_funded_deal: {
    title: 'First Funded Deal',
    description: 'Get your first deal funded',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  repeat_borrower: {
    title: 'Repeat Borrower',
    description: 'Get funded 3 times',
    icon: Award,
    color: 'text-purple-500',
  },
  deals_shared: {
    title: '5 Deals Shared',
    description: 'Share 5 deals in the community',
    icon: Users,
    color: 'text-orange-500',
  },
};

export const BadgesProgress = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching badges:', error);
        return;
      }

      // Initialize default badges if none exist
      const badgeTypes = Object.keys(BADGE_CONFIG);
      const existingTypes = data?.map(b => b.badge_type) || [];
      const missingTypes = badgeTypes.filter(type => !existingTypes.includes(type));

      const defaultBadges = missingTypes.map(type => ({
        badge_type: type,
        progress: 0,
        target: type === 'deals_shared' ? 5 : type === 'repeat_borrower' ? 3 : 1,
        is_earned: false,
        earned_at: null,
      }));

      setBadges([...(data || []), ...defaultBadges]);
      setLoading(false);
    };

    fetchBadges();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Badges & Progress</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track your achievements and milestones
          </p>
        </div>

        <div className="space-y-4">
          {badges.map((badge) => {
            const config = BADGE_CONFIG[badge.badge_type as keyof typeof BADGE_CONFIG];
            if (!config) return null;

            const Icon = config.icon;
            const progressPercent = (badge.progress / badge.target) * 100;

            return (
              <div
                key={badge.badge_type}
                className={cn(
                  "relative p-4 rounded-lg border bg-card transition-all duration-300",
                  badge.is_earned 
                    ? "border-primary bg-primary/5 animate-scale-in" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-full transition-all duration-300",
                    badge.is_earned 
                      ? "bg-primary/20 animate-pulse" 
                      : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6 transition-colors",
                      badge.is_earned ? "text-primary" : config.color
                    )} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          {config.title}
                          {badge.is_earned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary animate-fade-in">
                              Earned!
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {config.description}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {badge.progress}/{badge.target}
                      </span>
                    </div>

                    <Progress 
                      value={progressPercent} 
                      className={cn(
                        "h-2 transition-all duration-500",
                        badge.is_earned && "animate-pulse"
                      )}
                    />

                    {badge.is_earned && badge.earned_at && (
                      <p className="text-xs text-muted-foreground">
                        Earned on {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
