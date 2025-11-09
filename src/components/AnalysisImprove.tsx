import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryImprovement {
  name: string;
  weight: number;
  currentScore: number;
  tips: string[];
}

interface AnalysisImproveProps {
  onBack: () => void;
  onStartAnalysis: () => void;
}

export const AnalysisImprove = ({ onBack, onStartAnalysis }: AnalysisImproveProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [categories, setCategories] = useState<CategoryImprovement[]>([
    {
      name: "Deal Structure",
      weight: 25,
      currentScore: 0,
      tips: [
        "Lower LTV to ≤70% to improve approval odds",
        "Increase down payment by 5-10%",
        "Consider a shorter loan term for better rates"
      ]
    },
    {
      name: "Experience Level",
      weight: 20,
      currentScore: 0,
      tips: [
        "Document all past deals with photos and financials",
        "Add references from previous lenders or partners",
        "Complete industry certification courses"
      ]
    },
    {
      name: "Financial Readiness",
      weight: 25,
      currentScore: 0,
      tips: [
        "Increase cash reserves to cover 6+ months",
        "Pay down existing debt to improve DTI ratio",
        "Add additional income documentation"
      ]
    },
    {
      name: "Property Analysis",
      weight: 20,
      currentScore: 0,
      tips: [
        "Add detailed rehab line-item breakdown",
        "Upload 2-3 comparable properties within 0.5 miles",
        "Include professional property inspection report",
        "Provide contractor bids for major repairs"
      ]
    },
    {
      name: "Market Conditions",
      weight: 10,
      currentScore: 0,
      tips: [
        "Research local market trends and add documentation",
        "Include neighborhood appreciation data",
        "Add recent sold comps from last 90 days"
      ]
    }
  ]);

  useEffect(() => {
    if (user) {
      fetchLatestAnalysis();
    }
  }, [user]);

  const fetchLatestAnalysis = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('deal_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentScore(data.analysis_score || 0);
        
        // Simulate category scores based on overall score
        const baseScore = data.analysis_score || 0;
        setCategories(prev => prev.map(cat => ({
          ...cat,
          currentScore: Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10)))
        })));
      }
    } catch (error) {
      console.error('Error fetching latest analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const potentialScore = Math.min(100, currentScore + 10);

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Boost Your Score</h1>
          <p className="text-sm text-muted-foreground">Actionable tips to improve your feasibility</p>
        </div>
        <Button variant="premium" onClick={onStartAnalysis}>
          Re-run Analysis
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Current Score Card */}
      <Card className="shadow-card border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Score</p>
              <p className="text-4xl font-bold text-foreground">{currentScore}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Potential Score</p>
              <p className="text-4xl font-bold text-primary">{potentialScore}%</p>
            </div>
          </div>
          <Progress value={currentScore} className="mb-2" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Up to +10% improvement possible</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Improvements */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Weighted Analysis Categories</h2>
        
        {categories.map((category, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {category.name}
                </CardTitle>
                <Badge variant="secondary">{category.weight}% Weight</Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={category.currentScore} className="flex-1" />
                <span className="text-sm font-medium text-foreground min-w-12 text-right">
                  {Math.round(category.currentScore)}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium text-foreground">Actionable Improvements:</p>
              {category.tips.map((tip, tipIndex) => (
                <div key={tipIndex} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Card */}
      <Card className="shadow-card bg-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Ready to improve your score?</h3>
            <p className="text-sm text-muted-foreground">
              Apply these tips and re-run your analysis to see your updated score
            </p>
          </div>
          <Button variant="premium" size="lg" onClick={onStartAnalysis} className="w-full">
            Re-run Analysis with Improvements
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
