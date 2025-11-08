import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, TrendingUp, Calendar, DollarSign, Percent, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface LoanOption {
  id: string;
  type: string;
  maxLTV: string;
  interestRate: string;
  termLength: string;
  prepaymentNotes: string;
  bestFor: string[];
  color: string;
}

interface LoanRecommendationsProps {
  formData: any;
  score: number;
  onGetPreQualified: (loanType: string) => void;
}

export const LoanRecommendations = ({ formData, score, onGetPreQualified }: LoanRecommendationsProps) => {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);

  const generateLoanOptions = (): LoanOption[] => {
    const propertyType = formData?.propertyType || "single-family";
    const fundingPurpose = formData?.fundingPurpose || "purchase";
    const experienceLevel = formData?.credit_score || "good";

    const allLoans: LoanOption[] = [
      {
        id: "bridge",
        type: "Bridge Loan",
        maxLTV: "75-80% LTV",
        interestRate: "9.5% - 12.5%",
        termLength: "6-24 months",
        prepaymentNotes: "Typically no prepayment penalty",
        bestFor: ["Quick closings", "Value-add projects", "Experienced investors"],
        color: "bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "fix-flip",
        type: "Fix & Flip Loan",
        maxLTV: "90% LTC (70% Purchase + 100% Rehab)",
        interestRate: "10% - 13%",
        termLength: "12-18 months",
        prepaymentNotes: "No prepayment penalty after 6 months",
        bestFor: ["Renovation projects", "Quick turnaround", "Cosmetic to heavy rehab"],
        color: "bg-green-500/10 border-green-500/20"
      },
      {
        id: "dscr",
        type: "DSCR Rental Loan",
        maxLTV: "80% LTV",
        interestRate: "7.5% - 9.5%",
        termLength: "30 years (fixed or ARM)",
        prepaymentNotes: "2-3 year prepayment penalty typical",
        bestFor: ["Buy & hold", "Rental properties", "Long-term investors"],
        color: "bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "blanket",
        type: "Blanket Loan",
        maxLTV: "65-75% LTV",
        interestRate: "8% - 11%",
        termLength: "12-36 months",
        prepaymentNotes: "Varies by lender",
        bestFor: ["Multiple properties", "Portfolio expansion", "Experienced investors"],
        color: "bg-orange-500/10 border-orange-500/20"
      },
      {
        id: "construction",
        type: "Ground-Up Construction",
        maxLTV: "85% LTC",
        interestRate: "11% - 14%",
        termLength: "12-24 months",
        prepaymentNotes: "No prepayment penalty",
        bestFor: ["New construction", "Development projects", "Experienced builders"],
        color: "bg-red-500/10 border-red-500/20"
      }
    ];

    // Filter and sort loans based on deal characteristics
    let recommendedLoans = allLoans;

    if (fundingPurpose === "rehab" || fundingPurpose === "flip") {
      recommendedLoans = [
        allLoans.find(l => l.id === "fix-flip")!,
        allLoans.find(l => l.id === "bridge")!,
        ...allLoans.filter(l => l.id !== "fix-flip" && l.id !== "bridge")
      ];
    } else if (fundingPurpose === "rental" || fundingPurpose === "buy-hold") {
      recommendedLoans = [
        allLoans.find(l => l.id === "dscr")!,
        allLoans.find(l => l.id === "bridge")!,
        ...allLoans.filter(l => l.id !== "dscr" && l.id !== "bridge")
      ];
    } else if (fundingPurpose === "construction") {
      recommendedLoans = [
        allLoans.find(l => l.id === "construction")!,
        allLoans.find(l => l.id === "bridge")!,
        ...allLoans.filter(l => l.id !== "construction" && l.id !== "bridge")
      ];
    }

    return recommendedLoans.slice(0, 4);
  };

  const loanOptions = generateLoanOptions();

  const toggleLoanSelection = (loanId: string) => {
    if (selectedLoans.includes(loanId)) {
      setSelectedLoans(selectedLoans.filter(id => id !== loanId));
    } else {
      if (selectedLoans.length < 3) {
        setSelectedLoans([...selectedLoans, loanId]);
      } else {
        toast.info("You can compare up to 3 loan options at once.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Your Loan Recommendations</h2>
        </div>
        <p className="text-muted-foreground">
          Based on your deal analysis and {score}% feasibility score, these loan products match your investment profile.
        </p>
      </div>

      {/* Compare Toggle */}
      <Card className="shadow-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                id="compare-mode"
                checked={compareMode}
                onCheckedChange={setCompareMode}
              />
              <Label htmlFor="compare-mode" className="font-medium cursor-pointer">
                Compare Loans Side-by-Side
              </Label>
            </div>
            {compareMode && (
              <Badge variant="secondary">
                {selectedLoans.length}/3 selected
              </Badge>
            )}
          </div>
          {compareMode && selectedLoans.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Select up to 3 loan options to compare
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loan Cards */}
      <div className={`grid gap-4 md:grid-cols-2`}>
        {loanOptions.map((loan, index) => (
          <Card 
            key={loan.id} 
            className={`shadow-card relative ${compareMode ? 'cursor-pointer' : ''} ${
              selectedLoans.includes(loan.id) ? 'ring-2 ring-primary' : ''
            } ${loan.color}`}
            onClick={() => compareMode && toggleLoanSelection(loan.id)}
          >
            {index === 0 && !compareMode && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground shadow-md">
                  Recommended
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {loan.type}
                {compareMode && selectedLoans.includes(loan.id) && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Percent className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Max LTV/LTC</p>
                    <p className="text-sm text-muted-foreground">{loan.maxLTV}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Interest Rate</p>
                    <p className="text-sm text-muted-foreground">{loan.interestRate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Term Length</p>
                    <p className="text-sm text-muted-foreground">{loan.termLength}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Prepayment</p>
                    <p className="text-sm text-muted-foreground">{loan.prepaymentNotes}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-2">Best For:</p>
                <div className="flex flex-wrap gap-2">
                  {loan.bestFor.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {!compareMode && (
                <Button 
                  className="w-full"
                  variant={index === 0 ? "default" : "outline"}
                  onClick={() => onGetPreQualified(loan.type)}
                >
                  Get Pre-Qualified
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section for Compare Mode */}
      {compareMode && selectedLoans.length > 0 && (
        <Card className="shadow-card bg-gradient-subtle border-primary/20">
          <CardContent className="py-6 text-center space-y-4">
            <div>
              <p className="font-semibold mb-2">Ready to move forward?</p>
              <p className="text-sm text-muted-foreground">
                Select one of your compared loans to start the pre-qualification process
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {loanOptions
                .filter(loan => selectedLoans.includes(loan.id))
                .map((loan) => (
                  <Button
                    key={loan.id}
                    variant="default"
                    onClick={() => onGetPreQualified(loan.type)}
                  >
                    Get Pre-Qualified: {loan.type}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Card className="shadow-card bg-muted/50 border-0">
        <CardContent className="py-4">
          <p className="text-sm text-center text-muted-foreground">
            💡 Your loan recommendations are based on this project's AI analysis and your investor profile
          </p>
        </CardContent>
      </Card>
    </div>
  );
};