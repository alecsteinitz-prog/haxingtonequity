import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Calendar, RefreshCw } from "lucide-react";

interface AnalysisResultsProps {
  score: number;
  onBack: () => void;
  onResubmit: () => void;
  analysisResult?: any;
}

export const AnalysisResults = ({ score, onBack, onResubmit, analysisResult }: AnalysisResultsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-8 h-8 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  const getScoreMessage = (score: number) => {
    const qualifyingCount = analysisResult?.qualifyingLenders?.length || 0;
    if (score >= 80) return `Excellent! You qualify with ${qualifyingCount} lenders.`;
    if (score >= 60) return `Good foundation. You qualify with ${qualifyingCount} lenders.`;
    return qualifyingCount > 0 ? `You qualify with ${qualifyingCount} lenders but need improvements.` : "This deal needs significant adjustments to qualify.";
  };

  const getRecommendations = (score: number) => {
    if (analysisResult?.recommendations?.length > 0) {
      return analysisResult.recommendations;
    }
    
    if (score >= 80) {
      return [
        "Your deal structure is solid",
        "Financial projections look strong", 
        "Experience level meets requirements",
        "Property analysis is favorable"
      ];
    }
    if (score >= 60) {
      return [
        "Consider increasing your down payment",
        "Provide additional financial documentation",
        "Clarify your exit strategy timeline",
        "Consider partnering with experienced investor"
      ];
    }
    return [
      "Increase down payment to 25%+ of purchase price",
      "Gain more real estate experience or find mentor",
      "Improve debt-to-income ratio",
      "Reassess property value and renovation costs"
    ];
  };

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Analysis Results</h1>
            <p className="text-sm text-muted-foreground">AI-powered feasibility assessment</p>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <Card className="mb-6 shadow-premium bg-gradient-subtle border-0">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            {getScoreIcon(score)}
          </div>
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}%
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            Funding Feasibility Score
          </p>
          <p className="text-muted-foreground mb-6">
            {getScoreMessage(score)}
          </p>
          <Progress value={score} className="mb-4" />
          
          {score >= 80 ? (
            <Button variant="gold" size="lg" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Book Funding Call
            </Button>
          ) : (
            <Button variant="premium-outline" size="lg" className="w-full" onClick={onResubmit}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Improve & Resubmit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="mb-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Deal Structure</span>
            <div className="flex items-center gap-2">
              <Progress value={Math.min(score + 10, 100)} className="w-20 h-2" />
              <Badge variant={score >= 70 ? "default" : "secondary"} className="text-xs">
                {Math.min(score + 10, 100)}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Financial Readiness</span>
            <div className="flex items-center gap-2">
              <Progress value={Math.max(score - 15, 0)} className="w-20 h-2" />
              <Badge variant={score >= 85 ? "default" : "secondary"} className="text-xs">
                {Math.max(score - 15, 0)}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Experience Level</span>
            <div className="flex items-center gap-2">
              <Progress value={Math.min(score + 5, 100)} className="w-20 h-2" />
              <Badge variant={score >= 75 ? "default" : "secondary"} className="text-xs">
                {Math.min(score + 5, 100)}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Property Analysis</span>
            <div className="flex items-center gap-2">
              <Progress value={score} className="w-20 h-2" />
              <Badge variant={score >= 80 ? "default" : "secondary"} className="text-xs">
                {score}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualifying Lenders */}
      {analysisResult?.qualifyingLenders?.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Qualifying Lenders</CardTitle>
            <CardDescription>
              Lenders that match your deal criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.qualifyingLenders.slice(0, 3).map((match: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{match.lender.name}</h4>
                  <Badge variant="default">{match.score}% Match</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Focus: {match.lender.focus.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rates: {match.lender.rates.min}%-{match.lender.rates.max}% | 
                  Loan Range: ${(match.lender.minLoanAmount / 1000).toFixed(0)}K-${(match.lender.maxLoanAmount / 1000000).toFixed(1)}M
                </p>
                {match.strengths.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 font-medium">✓ {match.strengths[0]}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {score >= 80 ? "Why This Deal Works" : "Improvement Recommendations"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {getRecommendations(score).map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                score >= 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {index + 1}
              </div>
              <p className="text-sm text-foreground">{recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};