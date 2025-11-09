import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  analyses_count: number;
}

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('weekly_leaderboard')
        .select('*');

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
        return;
      }

      setEntries(data || []);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.display_name || 
           `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || 
           'Anonymous User';
  };

  const getInitials = (entry: LeaderboardEntry) => {
    const name = getDisplayName(entry);
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Weekly Top Analyzers</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Be the first to analyze deals this week and claim your spot!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Weekly Top Analyzers</h3>
        </div>

        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.user_id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-all duration-300",
                index < 3 
                  ? "bg-primary/5 border border-primary/20" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <Avatar className={cn(
                    "h-10 w-10",
                    index === 0 && "ring-2 ring-primary ring-offset-2"
                  )}>
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="text-sm">
                      {getInitials(entry)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {index < 3 && (
                    <div className={cn(
                      "absolute -bottom-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold",
                      index === 0 && "bg-yellow-500 text-white",
                      index === 1 && "bg-gray-400 text-white",
                      index === 2 && "bg-orange-600 text-white"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {getDisplayName(entry)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {entry.analyses_count} {entry.analyses_count === 1 ? 'analysis' : 'analyses'} this week
                  </p>
                </div>
              </div>

              {index >= 3 && (
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
