import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FeedbackModal } from './FeedbackModal';
import { useValidation } from '@/hooks/useValidation';
import { 
  TrendingUp, 
  Star, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Brain,
  Target,
  Award,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';

interface LenderMatchingResultsProps {
  dealAnalysisId: string;
}

interface LenderResult {
  lender: string;
  lenderId: string;
  qualifies: boolean;
  baseRate: number;
  adjustedRate: number;
  disqualificationReasons: string[];
  specialPrograms: string[];
  maxLoanAmount: number;
  maxLTV: number;
}

interface MatchingResults {
  dealMetrics: {
    creditScore: number;
    fundingAmount: number;
    currentValue: number;
    ltv: number;
    experience: string;
    propertyType: string;
    hasProfit: boolean;
  };
  topRecommendation: LenderResult | null;
  alternativeLenders: LenderResult[];
  disqualifiedLenders: Array<{ lender: string; reasons: string[] }>;
  summary: {
    totalLendersAnalyzed: number;
    qualifyingLenders: number;
    bestRate: number | null;
    avgQualifyingRate: number | null;
  };
  aiInsights: string;
  analyzedAt: string;
}

export const LenderMatchingResults = ({ dealAnalysisId }: LenderMatchingResultsProps) => {
  const [results, setResults] = useState<MatchingResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { toast } = useToast();

  // Background validation for lender matching results
  useValidation({
    analysisId: dealAnalysisId,
    analysisType: 'lender_match',
    data: results?.dealMetrics || {},
    enabled: !!results
  });

  const analyzeLenders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('lender-matching', {
        body: { dealAnalysisId }
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Analysis Complete",
        description: `Found ${data.summary.qualifyingLenders} qualifying lenders`,
      });
    } catch (error) {
      console.error('Error analyzing lenders:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze lender options. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRateColorClass = (rate: number) => {
    if (rate <= 7) return 'text-green-600';
    if (rate <= 9) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getExperienceBadgeVariant = (experience: string) => {
    switch (experience) {
      case 'expert': return 'default';
      case 'experienced': return 'secondary';
      default: return 'outline';
    }
  };

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lender Matching Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Get personalized lender recommendations based on your deal specifics
            </p>
            <Button 
              onClick={analyzeLenders} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze Lender Options
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deal Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deal Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{results.dealMetrics.creditScore}</div>
              <div className="text-sm text-muted-foreground">Credit Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${results.dealMetrics.fundingAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Funding Needed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{results.dealMetrics.ltv}%</div>
              <div className="text-sm text-muted-foreground">LTV</div>
            </div>
            <div className="text-center">
              <Badge variant={getExperienceBadgeVariant(results.dealMetrics.experience)}>
                {results.dealMetrics.experience.replace('_', ' ')}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Experience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Recommendation */}
      {results.topRecommendation && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Star className="h-5 w-5" />
              Top Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{results.topRecommendation.lender}</h3>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getRateColorClass(results.topRecommendation.adjustedRate)}`}>
                    {results.topRecommendation.adjustedRate.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Final Rate</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Base Rate</div>
                  <div className="font-semibold">{results.topRecommendation.baseRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Max LTV</div>
                  <div className="font-semibold">{results.topRecommendation.maxLTV}%</div>
                </div>
              </div>

              {results.topRecommendation.specialPrograms.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Special Programs</div>
                  <div className="flex flex-wrap gap-2">
                    {results.topRecommendation.specialPrograms.map((program, index) => (
                      <Badge key={index} variant="secondary">
                        {program.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Lenders */}
      {results.alternativeLenders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Alternative Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.alternativeLenders.map((lender, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{lender.lender}</h4>
                    <div className={`text-lg font-bold ${getRateColorClass(lender.adjustedRate)}`}>
                      {lender.adjustedRate.toFixed(2)}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Base Rate: </span>
                      <span className="font-medium">{lender.baseRate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max LTV: </span>
                      <span className="font-medium">{lender.maxLTV}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Loan: </span>
                      <span className="font-medium">${lender.maxLoanAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.summary.qualifyingLenders}</div>
              <div className="text-sm text-muted-foreground">Qualifying Lenders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{results.summary.totalLendersAnalyzed}</div>
              <div className="text-sm text-muted-foreground">Total Analyzed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${results.summary.bestRate ? getRateColorClass(results.summary.bestRate) : ''}`}>
                {results.summary.bestRate ? `${results.summary.bestRate.toFixed(2)}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Best Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {results.summary.avgQualifyingRate ? `${results.summary.avgQualifyingRate.toFixed(2)}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rate</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">Qualification Rate</div>
            <Progress 
              value={(results.summary.qualifyingLenders / results.summary.totalLendersAnalyzed) * 100} 
              className="w-full h-3"
            />
            <div className="text-sm text-muted-foreground mt-2">
              {Math.round((results.summary.qualifyingLenders / results.summary.totalLendersAnalyzed) * 100)}% of lenders qualify
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {results.aiInsights && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="h-5 w-5" />
              AI Strategic Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-blue-900">
              {results.aiInsights.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disqualified Lenders */}
      {results.disqualifiedLenders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Non-Qualifying Lenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.disqualifiedLenders.map((lender, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{lender.lender}</span>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    {lender.reasons.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Analysis completed at {new Date(results.analyzedAt).toLocaleString()}
      </div>

      {/* Send Feedback Link */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setFeedbackModalOpen(true)}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline inline-flex items-center gap-1"
        >
          <MessageCircle className="w-3 h-3" />
          Send Feedback
        </button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        analysisId={dealAnalysisId}
      />
    </div>
  );
};