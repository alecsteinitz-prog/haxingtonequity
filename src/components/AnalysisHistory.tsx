import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Analysis {
  id: string;
  property_address: string;
  analysis_score: number;
  created_at: string;
  funding_purpose: string;
  funding_amount: string;
  property_type: string;
  adjusted_score?: number;
}

interface AnalysisHistoryProps {
  onBack: () => void;
  onViewDetails: (analysisId: string) => void;
}

export const AnalysisHistory = ({ onBack, onViewDetails }: AnalysisHistoryProps) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('deal_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analyses:', error);
        toast.error('Failed to load analysis history');
        throw error;
      }

      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (score: number) => {
    if (score >= 80) return { label: "Eligible", variant: "default" as const, color: "text-green-600" };
    if (score >= 60) return { label: "Needs Review", variant: "secondary" as const, color: "text-yellow-600" };
    return { label: "Not Eligible", variant: "outline" as const, color: "text-red-600" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Analysis History</h1>
            <p className="text-sm text-muted-foreground">Loading your analyses...</p>
          </div>
        </div>
        
        {/* Loading Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Arrow */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Analysis History</h1>
            <p className="text-sm text-muted-foreground">View all your past deal analyses</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Analysis List */}
        {analyses.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">No analysis yet</h3>
                <p className="text-sm text-muted-foreground">
                  You haven't completed any analyses yet. Start your first one below.
                </p>
              </div>
              <Button onClick={onBack} variant="premium" size="lg">
                Start New Analysis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => {
              const status = getStatusBadge(analysis.analysis_score || 0);
              return (
                <Card key={analysis.id} className="shadow-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(analysis.id)}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {analysis.property_address || 'Property Address Not Provided'}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(analysis.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {analysis.property_type} • {analysis.funding_purpose?.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className={`text-2xl font-bold ${getScoreColor(analysis.analysis_score || 0)}`}>
                            {analysis.analysis_score || 0}%
                          </div>
                          <Badge variant={status.variant} className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Funding Amount: <strong className="text-foreground">{analysis.funding_amount}</strong>
                        </span>
                        <Button variant="ghost" size="sm" className="text-primary">
                          View Details
                          <TrendingUp className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
