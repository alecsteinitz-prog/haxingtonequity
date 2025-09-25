import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LenderMatchingResults } from './LenderMatchingResults';
import { Target, Brain } from 'lucide-react';

interface LenderMatchingDashboardProps {
  dealAnalysisId?: string;
}

export const LenderMatchingDashboard = ({ dealAnalysisId }: LenderMatchingDashboardProps) => {
  const [showResults, setShowResults] = useState(false);

  if (!dealAnalysisId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lender Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Complete a deal analysis first to get personalized lender recommendations
            </p>
            <Button disabled variant="outline">
              Analysis Required
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showResults) {
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
              Get AI-powered lender recommendations based on your deal specifics
            </p>
            <Button 
              onClick={() => setShowResults(true)}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Find Best Lenders
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <LenderMatchingResults dealAnalysisId={dealAnalysisId} />;
};