import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowRight, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface FundingAnalysisCardProps {
  onStartAnalysis: () => void;
}

export const FundingAnalysisCard = ({ onStartAnalysis }: FundingAnalysisCardProps) => {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Main CTA Card */}
      <Card className="bg-gradient-subtle border-0 shadow-card">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-gold">
            <Brain className="w-8 h-8 text-accent-foreground" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            AI-Powered Deal Analysis
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Get instant funding feasibility with our first-of-its-kind AI analyzer
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">&lt; 2min</p>
              <p className="text-xs text-muted-foreground">Analysis Time</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">0-100%</p>
              <p className="text-xs text-muted-foreground">Feasibility Score</p>
            </div>
          </div>
          
          <Button 
            onClick={onStartAnalysis}
            variant="premium" 
            size="lg" 
            className="w-full"
          >
            Start Funding Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            No commitment required • Free analysis
          </p>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Submit Deal Details</p>
                <p className="text-xs text-muted-foreground">Property info, loan type, experience level</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-sm">AI Analysis</p>
                <p className="text-xs text-muted-foreground">Trained on 1000+ lender requirements</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-sm">Get Results</p>
                <p className="text-xs text-muted-foreground">Score + detailed improvement plan</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown Preview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Analysis Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Deal Structure</span>
            <Badge variant="secondary" className="text-xs">25%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Experience Level</span>
            <Badge variant="secondary" className="text-xs">20%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Financial Readiness</span>
            <Badge variant="secondary" className="text-xs">25%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Property Analysis</span>
            <Badge variant="secondary" className="text-xs">20%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Market Conditions</span>
            <Badge variant="secondary" className="text-xs">10%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};