import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Calendar,
  ArrowRight,
  Lightbulb,
  Target,
  Users,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DashboardStats {
  ongoingProjects: number;
  totalFunded: number;
  avgScore: number;
  recentAnalyses: Array<{
    id: string;
    property_address: string;
    analysis_score: number;
    created_at: string;
    funding_purpose: string;
  }>;
  categoryData: Array<{
    category: string;
    count: number;
    avgScore: number;
  }>;
  latestInsight: string;
}

interface PerformanceDashboardProps {
  onStartAnalysis: () => void;
  onViewHistory: () => void;
  onNavigateToFundingOptions?: () => void;
}

export const PerformanceDashboard = ({ onStartAnalysis, onViewHistory, onNavigateToFundingOptions }: PerformanceDashboardProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    ongoingProjects: 0,
    totalFunded: 0,
    avgScore: 0,
    recentAnalyses: [],
    categoryData: [],
    latestInsight: ""
  });
  const [loading, setLoading] = useState(true);
  const [activeQuickAction, setActiveQuickAction] = useState<'history' | 'loans' | null>(null);

  useEffect(() => {
    console.log('PerformanceDashboard: user state changed', user ? 'User exists' : 'No user');
    if (user) {
      fetchDashboardData();
    } else {
      console.log('PerformanceDashboard: No user, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    console.log('fetchDashboardData: Starting fetch');
    if (!user) {
      console.log('fetchDashboardData: No user found');
      setLoading(false);
      return;
    }

    console.log('fetchDashboardData: Fetching for user', user.id);
    try {
      // Fetch all deal analyses for the user
      const { data: analyses, error } = await supabase
        .from('deal_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('fetchDashboardData: Supabase error', error);
        throw error;
      }

      console.log('fetchDashboardData: Fetched analyses', analyses?.length || 0);

      if (analyses && analyses.length > 0) {
        // Calculate stats
        const ongoing = analyses.filter(a => !a.updated_at || 
          new Date(a.updated_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        ).length;

        const totalFunding = analyses.reduce((sum, a) => {
          const amount = parseFloat(a.funding_amount?.replace(/[$,]/g, '') || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const avgScore = analyses.reduce((sum, a) => sum + (a.analysis_score || 0), 0) / analyses.length;

        // Get recent 3 analyses
        const recent = analyses.slice(0, 3).map(a => ({
          id: a.id,
          property_address: a.property_address || 'Unknown',
          analysis_score: a.analysis_score || 0,
          created_at: a.created_at,
          funding_purpose: a.funding_purpose || 'General'
        }));

        // Calculate category breakdown
        const categoryMap = new Map<string, { count: number; totalScore: number }>();
        analyses.forEach(a => {
          const category = a.funding_purpose || 'Other';
          const current = categoryMap.get(category) || { count: 0, totalScore: 0 };
          categoryMap.set(category, {
            count: current.count + 1,
            totalScore: current.totalScore + (a.analysis_score || 0)
          });
        });

        const categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category: category === 'fix_flip' ? 'Fix & Flip' : 
                   category === 'buy_hold' ? 'Buy & Hold' : 
                   category === 'bridge_loan' ? 'Bridge Loan' : category,
          count: data.count,
          avgScore: Math.round(data.totalScore / data.count)
        }));

        // Generate AI insight based on latest analysis
        const latestScore = analyses[0]?.analysis_score || 0;
        let insight = "";
        if (latestScore >= 80) {
          insight = `Excellent! Your last analysis scored ${latestScore}%. You're well-positioned for funding approval.`;
        } else if (latestScore >= 60) {
          insight = `Your last analysis scored ${latestScore}%. Consider improving your credit score or increasing down payment to boost feasibility.`;
        } else {
          insight = `Your last analysis scored ${latestScore}%. Focus on strengthening deal structure and financial readiness for better results.`;
        }

        setStats({
          ongoingProjects: ongoing,
          totalFunded: totalFunding,
          avgScore: Math.round(avgScore),
          recentAnalyses: recent,
          categoryData,
          latestInsight: insight
        });
      } else {
        console.log('fetchDashboardData: No analyses found');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      console.log('fetchDashboardData: Setting loading to false');
      setLoading(false);
    }
  };

  const chartConfig = {
    avgScore: {
      label: "Average Score",
      color: "hsl(var(--primary))",
    },
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your Investment Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time performance metrics and insights</p>
      </div>

      {/* Summary Widgets - Moved to top */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs font-medium">Ongoing Projects</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.ongoingProjects}</p>
            <p className="text-xs text-muted-foreground mt-1">deals in progress</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Funding Approved</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              ${(stats.totalFunded / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground mt-1">total analyzed</p>
          </CardContent>
        </Card>

        <Card className="shadow-card col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Average Feasibility Score</span>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-foreground">{stats.avgScore}%</p>
              <Badge variant={stats.avgScore >= 80 ? "default" : "secondary"} className="mb-1">
                {stats.avgScore >= 80 ? "Excellent" : stats.avgScore >= 60 ? "Good" : "Fair"}
              </Badge>
            </div>
            <Progress value={stats.avgScore} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Ready to Get Started Section */}
      {stats.recentAnalyses.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Ready to get started?</h3>
              <p className="text-sm text-muted-foreground">
                Complete your first deal analysis to unlock personalized insights
              </p>
            </div>
            <Button onClick={onStartAnalysis} variant="premium" className="mt-4">
              Start Your First Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Bar */}
      <Card className="shadow-card border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            
            <div 
              role="tablist" 
              className="flex flex-wrap items-center gap-4"
              aria-label="Quick action navigation"
            >
              <button
                role="tab"
                aria-selected={activeQuickAction === 'history'}
                onClick={() => {
                  console.log('Quick Action: View My Analysis History clicked');
                  setActiveQuickAction('history');
                  onViewHistory();
                }}
                className={cn(
                  "relative px-5 py-3 rounded-full font-semibold text-sm transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "hover:bg-primary/10",
                  activeQuickAction === 'history'
                    ? "bg-[#F6EDEF] text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary after:rounded-full"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View My Analysis History
                </span>
              </button>
              
              <button
                role="tab"
                aria-selected={activeQuickAction === 'loans'}
                onClick={() => {
                  console.log('Quick Action: Discover Loan Options clicked');
                  setActiveQuickAction('loans');
                  onNavigateToFundingOptions?.();
                }}
                className={cn(
                  "relative px-5 py-3 rounded-full font-semibold text-sm transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "hover:bg-primary/10",
                  activeQuickAction === 'loans'
                    ? "bg-[#F6EDEF] text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary after:rounded-full"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Discover Our Loan Options
                </span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Success Rate Chart */}
      {stats.categoryData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Deal Success Rate by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgScore" radius={[8, 8, 0, 0]}>
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.avgScore)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Analysis Activity */}
      {stats.recentAnalyses.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Analysis Activity
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onViewHistory}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentAnalyses.map((analysis) => (
              <div 
                key={analysis.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                onClick={onViewHistory}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground line-clamp-1">
                    {analysis.property_address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={analysis.analysis_score >= 80 ? "default" : "secondary"}>
                  {analysis.analysis_score}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Insights Box */}
      {stats.latestInsight && (
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground mb-1">AI Insights</h3>
                <p className="text-sm text-muted-foreground">{stats.latestInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
