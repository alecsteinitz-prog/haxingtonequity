import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ViewAnswersModal } from "./ViewAnswersModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, MapPin, TrendingUp, Eye } from "lucide-react";
import { format } from "date-fns";

interface DealAnalysis {
  id: string;
  funding_amount: string;
  funding_purpose: string;
  property_type: string;
  property_details?: string;
  properties_count: string;
  credit_score: string;
  bank_balance?: string;
  annual_income?: string;
  income_sources?: string;
  financial_assets?: string[];
  property_address: string;
  property_info?: string;
  property_specific_info?: string;
  under_contract?: boolean;
  owns_other_properties?: boolean;
  current_value?: string;
  repairs_needed?: boolean;
  repair_level?: string;
  rehab_costs?: string;
  arv_estimate?: string;
  close_timeline?: string;
  money_plans?: string;
  past_deals?: boolean;
  last_deal_profit?: string;
  good_deal_criteria?: string;
  analysis_score: number;
  created_at: string;
}

interface DealHistoryProps {
  onBack: () => void;
}

export const DealHistory = ({ onBack }: DealHistoryProps) => {
  const [analyses, setAnalyses] = useState<DealAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DealAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('deal_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnswers = (analysis: DealAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Deal History</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse">Loading your deal history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Deal History</h1>
      </div>

      {analyses.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent className="pt-6">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Analysis History</h3>
            <p className="text-muted-foreground">
              You haven't submitted any deal analyses yet. Start by analyzing your first deal!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {analysis.property_address}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(analysis.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {analysis.funding_amount}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={getScoreBadgeVariant(analysis.analysis_score)}
                    className="text-sm font-medium"
                  >
                    {analysis.analysis_score}% Score
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Purpose:</span>
                    <p className="font-medium text-foreground capitalize">{analysis.funding_purpose}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium text-foreground capitalize">{analysis.property_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <p className="font-medium text-foreground">{analysis.current_value || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Close Date:</span>
                    <p className="font-medium text-foreground">
                      {analysis.close_timeline ? format(new Date(analysis.close_timeline), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewAnswers(analysis)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Previous Answers
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <ViewAnswersModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysis={selectedAnalysis}
      />
    </div>
  );
};