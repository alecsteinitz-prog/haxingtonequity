import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign, Percent, TrendingUp } from "lucide-react";

export const InvestmentCalculator = () => {
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [results, setResults] = useState<{
    monthlyPayment: number;
    totalInterest: number;
    estimatedROI: number;
  } | null>(null);

  const calculateInvestment = () => {
    const price = parseFloat(propertyPrice);
    const down = parseFloat(downPayment);
    const rate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);

    if (isNaN(price) || isNaN(down) || isNaN(rate) || isNaN(term) || 
        price <= 0 || down < 0 || down > 100 || rate <= 0 || term <= 0) {
      return;
    }

    // Calculate loan amount
    const downPaymentAmount = price * (down / 100);
    const loanAmount = price - downPaymentAmount;

    // Calculate monthly payment using mortgage formula
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term * 12;
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Calculate total interest
    const totalPaid = monthlyPayment * numberOfPayments;
    const totalInterest = totalPaid - loanAmount;

    // Estimate ROI (simplified: assumes 1.5% monthly rental yield)
    const estimatedMonthlyRent = price * 0.015;
    const estimatedAnnualROI = ((estimatedMonthlyRent * 12 - (monthlyPayment * 12)) / downPaymentAmount) * 100;

    setResults({
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      estimatedROI: Math.round(estimatedAnnualROI * 10) / 10
    });
  };

  const handleReset = () => {
    setPropertyPrice("");
    setDownPayment("");
    setInterestRate("");
    setLoanTerm("");
    setResults(null);
  };

  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Quick Investment Calculator</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Estimate your potential returns in seconds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyPrice" className="text-sm font-medium">
              Property Price
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="propertyPrice"
                type="number"
                placeholder="250000"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPayment" className="text-sm font-medium">
              Down Payment (%)
            </Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="downPayment"
                type="number"
                placeholder="20"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate" className="text-sm font-medium">
              Loan Interest Rate (%)
            </Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                placeholder="7.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTerm" className="text-sm font-medium">
              Loan Term (years)
            </Label>
            <Input
              id="loanTerm"
              type="number"
              placeholder="30"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={calculateInvestment}
            variant="premium"
            className="flex-1"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </Button>
          {results && (
            <Button 
              onClick={handleReset}
              variant="outline"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Results Box */}
        {results && (
          <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Investment Analysis</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Monthly Payment</p>
                <p className="text-2xl font-bold text-foreground">
                  ${results.monthlyPayment.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Total Interest</p>
                <p className="text-2xl font-bold text-foreground">
                  ${results.totalInterest.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Estimated ROI</p>
                <p className={`text-2xl font-bold ${results.estimatedROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {results.estimatedROI > 0 ? '+' : ''}{results.estimatedROI}%
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-primary/10">
              * ROI calculation assumes 1.5% monthly rental yield. Actual returns may vary based on property location, market conditions, and management costs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
