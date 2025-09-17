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
  
  const calculateDealStructureScore = (result: any) => {
    if (!result?.qualifyingLenders) return Math.min(score + 10, 100);
    
    // Base score on loan amount fit and purpose alignment
    let structureScore = 0;
    const totalLenders = 5; // Total lenders in our database
    const qualifyingCount = result.qualifyingLenders.length;
    
    // Score based on how many lenders accept the deal structure
    structureScore = (qualifyingCount / totalLenders) * 100;
    
    // Bonus for good LTV ratios across lenders
    const avgLenderScore = result.qualifyingLenders.reduce((sum: number, match: any) => sum + match.score, 0) / Math.max(result.qualifyingLenders.length, 1);
    
    return Math.min(100, Math.round((structureScore + avgLenderScore) / 2));
  };

  const calculateFinancialScore = (result: any) => {
    if (!result?.qualifyingLenders) return Math.max(score - 15, 0);
    
    // Analyze credit score and income strength
    let financialScore = 60; // Base score
    
    // Credit score analysis
    const creditIssues = result.qualifyingLenders.some((match: any) => 
      match.issues.some((issue: string) => issue.includes('credit score'))
    );
    if (!creditIssues) financialScore += 20;
    
    // Income/asset strength
    const hasStrongIncome = result.dealStrengths?.some((strength: string) => 
      strength.includes('income') || strength.includes('Strong')
    );
    if (hasStrongIncome) financialScore += 20;
    
    return Math.min(100, financialScore);
  };

  const calculateExperienceScore = (result: any) => {
    if (!result?.qualifyingLenders) return Math.min(score + 5, 100);
    
    // Base score on experience requirements
    let experienceScore = 50;
    
    const experienceIssues = result.qualifyingLenders.some((match: any) => 
      match.issues.some((issue: string) => issue.includes('experience'))
    );
    
    if (!experienceIssues) {
      experienceScore += 40; // Strong experience
    } else {
      // Some experience but not enough for all lenders
      experienceScore += 20;
    }
    
    return Math.min(100, experienceScore);
  };

  const calculatePropertyScore = (result: any) => {
    if (!result?.qualifyingLenders) return score;
    
    // Analyze property-related issues
    let propertyScore = 70; // Base score
    
    const ltvIssues = result.qualifyingLenders.some((match: any) => 
      match.issues.some((issue: string) => issue.includes('LTV'))
    );
    const arvIssues = result.qualifyingLenders.some((match: any) => 
      match.issues.some((issue: string) => issue.includes('ARV'))
    );
    
    if (!ltvIssues) propertyScore += 15;
    if (!arvIssues) propertyScore += 15;
    
    return Math.min(100, propertyScore);
  };
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
        "Your deal structure demonstrates strong fundamentals with appropriate loan-to-value ratios, realistic profit margins, and clear exit strategy. This solid foundation makes you an attractive borrower to multiple lenders.",
        "Your financial projections appear well-researched and conservative, showing realistic timelines and costs. Lenders appreciate borrowers who demonstrate thorough due diligence and realistic expectations about project outcomes.",
        "Your experience level and track record meet most lender requirements. Continue documenting your successes and building relationships with preferred lenders for even better terms on future deals.",
        "The property analysis shows strong fundamentals with good location, realistic ARV estimates, and appropriate renovation scope. This type of thorough property evaluation is exactly what lenders want to see."
      ];
    }
    if (score >= 60) {
      return [
        "Increase your down payment to 25-30% of the purchase price to improve your loan-to-value ratio. This demonstrates stronger financial commitment and reduces lender risk, often resulting in better interest rates and terms.",
        "Strengthen your loan application with additional financial documentation including bank statements, tax returns, and proof of liquid reserves. Lenders want to see 6+ months of PITI payments in reserves for investment properties.",
        "Develop a more detailed exit strategy with specific timelines, marketing plans, and contingency scenarios. Lenders need confidence in your ability to repay the loan whether through sale, refinance, or rental income.",
        "Consider partnering with an experienced investor who can provide mentorship, additional capital, or guarantor support. Many lenders are more comfortable with deals that include experienced team members."
      ];
    }
    return [
      "Significantly increase your down payment to 25-30% of purchase price and ensure you have additional reserves. Most lenders require substantial skin in the game for investment properties, especially for newer investors.",
      "Gain more hands-on real estate experience through smaller deals, wholesaling, or partnering with experienced investors. Document any construction, property management, or real estate-related experience you have.",
      "Improve your debt-to-income ratio by paying down existing debts or increasing income. Most lenders prefer DTI below 45% and strong cash flow from other sources to support the investment.",
      "Reassess your property analysis with professional appraisals, detailed renovation estimates from contractors, and conservative ARV projections. Overly optimistic numbers are a red flag for lenders."
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
          {analysisResult ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">Deal Structure</span>
                <div className="flex items-center gap-2">
                  <Progress value={calculateDealStructureScore(analysisResult)} className="w-20 h-2" />
                  <Badge variant={calculateDealStructureScore(analysisResult) >= 70 ? "default" : "secondary"} className="text-xs">
                    {calculateDealStructureScore(analysisResult)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Financial Readiness</span>
                <div className="flex items-center gap-2">
                  <Progress value={calculateFinancialScore(analysisResult)} className="w-20 h-2" />
                  <Badge variant={calculateFinancialScore(analysisResult) >= 70 ? "default" : "secondary"} className="text-xs">
                    {calculateFinancialScore(analysisResult)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Experience Level</span>
                <div className="flex items-center gap-2">
                  <Progress value={calculateExperienceScore(analysisResult)} className="w-20 h-2" />
                  <Badge variant={calculateExperienceScore(analysisResult) >= 70 ? "default" : "secondary"} className="text-xs">
                    {calculateExperienceScore(analysisResult)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Property Analysis</span>
                <div className="flex items-center gap-2">
                  <Progress value={calculatePropertyScore(analysisResult)} className="w-20 h-2" />
                  <Badge variant={calculatePropertyScore(analysisResult) >= 70 ? "default" : "secondary"} className="text-xs">
                    {calculatePropertyScore(analysisResult)}%
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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
            <div key={index} className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${
                score >= 80 ? "bg-success/20 text-success border-2 border-success/30" : "bg-warning/20 text-warning border-2 border-warning/30"
              }`}>
                {index + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed pt-1">{recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};