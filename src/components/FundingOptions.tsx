import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Briefcase, TrendingUp } from "lucide-react";

interface LoanProduct {
  id: string;
  name: string;
  type: string;
  ltv: string;
  ltc: string;
  term: string;
  rate: string;
  description: string;
  highlights: string[];
}

interface FundingOptionsProps {
  onBack: () => void;
}

export const FundingOptions = ({ onBack }: FundingOptionsProps) => {
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const loanProducts: LoanProduct[] = [
    {
      id: "bridge",
      name: "Bridge Loan",
      type: "Short-Term",
      ltv: "Up to 75%",
      ltc: "Up to 90%",
      term: "6-24 months",
      rate: "8-12%",
      description: "Fast funding for quick acquisitions and transitional properties",
      highlights: [
        "Quick approval (5-10 days)",
        "Flexible underwriting",
        "Interest-only payments",
        "No prepayment penalty"
      ]
    },
    {
      id: "fix-flip",
      name: "Fix & Flip",
      type: "Short-Term",
      ltv: "Up to 80%",
      ltc: "Up to 100%",
      term: "12-18 months",
      rate: "9-14%",
      description: "Comprehensive financing for purchase and renovation",
      highlights: [
        "Includes rehab funds",
        "Draw schedules available",
        "No personal income required",
        "Based on ARV"
      ]
    },
    {
      id: "rental",
      name: "Long-Term Rental",
      type: "Long-Term",
      ltv: "Up to 80%",
      ltc: "N/A",
      term: "30 years",
      rate: "5-8%",
      description: "Permanent financing for buy-and-hold investors",
      highlights: [
        "30-year fixed rates",
        "Portfolio loans available",
        "Cash-out refinance options",
        "Non-QM programs"
      ]
    },
    {
      id: "construction",
      name: "Construction Loan",
      type: "Short-Term",
      ltv: "Up to 75%",
      ltc: "Up to 95%",
      term: "12-24 months",
      rate: "8-13%",
      description: "Ground-up construction and major renovations",
      highlights: [
        "Interest-only draws",
        "Professional project oversight",
        "Experienced builder required",
        "Soft costs included"
      ]
    },
    {
      id: "commercial",
      name: "Commercial Real Estate",
      type: "Long-Term",
      ltv: "Up to 75%",
      ltc: "N/A",
      term: "5-25 years",
      rate: "6-10%",
      description: "Financing for office, retail, industrial, and multifamily",
      highlights: [
        "Amortization up to 25 years",
        "DSCR-based underwriting",
        "Recourse and non-recourse",
        "SBA options available"
      ]
    }
  ];

  const handleToggleSelect = (loanId: string) => {
    setSelectedLoans(prev => {
      if (prev.includes(loanId)) {
        return prev.filter(id => id !== loanId);
      } else {
        return [...prev, loanId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedLoans.length >= 2) {
      setShowComparison(true);
    }
  };

  const selectedProducts = loanProducts.filter(loan => selectedLoans.includes(loan.id));

  if (showComparison) {
    return (
      <div className="min-h-screen bg-background px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowComparison(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loan Comparison</h1>
            <p className="text-sm text-muted-foreground">Side-by-side comparison of selected loans</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-4">
          {selectedProducts.map((loan) => (
            <Card key={loan.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{loan.name}</CardTitle>
                  <Badge variant="secondary">{loan.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">LTV</p>
                    <p className="font-semibold text-foreground">{loan.ltv}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate Range</p>
                    <p className="font-semibold text-foreground">{loan.rate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Term</p>
                    <p className="font-semibold text-foreground">{loan.term}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LTC</p>
                    <p className="font-semibold text-foreground">{loan.ltc}</p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Key Features:</p>
                  <ul className="space-y-2">
                    {loan.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="premium" className="w-full" onClick={() => window.location.href = `/prequal/start?loan=${loan.id}`}>
                  Get Pre-Qualified: {loan.name}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Loan Options</h1>
          <p className="text-sm text-muted-foreground">Discover the best financing for your deal</p>
        </div>
      </div>

      {/* Selection Info */}
      {selectedLoans.length > 0 && (
        <Card className="shadow-card border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {selectedLoans.length} loan{selectedLoans.length > 1 ? 's' : ''} selected
                </span>
              </div>
              {selectedLoans.length >= 2 && (
                <Button variant="premium" onClick={handleCompare}>
                  Compare Loans Side-by-Side
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Products */}
      <div className="space-y-4">
        {loanProducts.map((loan) => (
          <Card key={loan.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedLoans.includes(loan.id)}
                    onCheckedChange={() => handleToggleSelect(loan.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg font-semibold">{loan.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="mb-2">{loan.type}</Badge>
                    <p className="text-sm text-muted-foreground">{loan.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">LTV Range</p>
                  <p className="font-semibold text-foreground">{loan.ltv}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rate Range</p>
                  <p className="font-semibold text-foreground">{loan.rate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Term</p>
                  <p className="font-semibold text-foreground">{loan.term}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">LTC Range</p>
                  <p className="font-semibold text-foreground">{loan.ltc}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Key Highlights:</p>
                <ul className="space-y-1">
                  {loan.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      {selectedLoans.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Select 2 or more loans to compare side-by-side
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
