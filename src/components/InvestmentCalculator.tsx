import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, DollarSign, Percent, TrendingUp, Plus, X, ArrowLeftRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PropertyScenario {
  id: string;
  name: string;
  propertyPrice: string;
  downPayment: string;
  interestRate: string;
  loanTerm: string;
  results: {
    monthlyPayment: number;
    totalInterest: number;
    estimatedROI: number;
  } | null;
}

export const InvestmentCalculator = () => {
  const [mode, setMode] = useState<"single" | "compare">("single");
  
  // Single mode state
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [results, setResults] = useState<{
    monthlyPayment: number;
    totalInterest: number;
    estimatedROI: number;
  } | null>(null);

  // Comparison mode state
  const [scenarios, setScenarios] = useState<PropertyScenario[]>([
    {
      id: "1",
      name: "Property A",
      propertyPrice: "",
      downPayment: "",
      interestRate: "",
      loanTerm: "",
      results: null
    },
    {
      id: "2",
      name: "Property B",
      propertyPrice: "",
      downPayment: "",
      interestRate: "",
      loanTerm: "",
      results: null
    }
  ]);

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

  const calculateScenario = (scenario: PropertyScenario): PropertyScenario => {
    const price = parseFloat(scenario.propertyPrice);
    const down = parseFloat(scenario.downPayment);
    const rate = parseFloat(scenario.interestRate);
    const term = parseFloat(scenario.loanTerm);

    if (isNaN(price) || isNaN(down) || isNaN(rate) || isNaN(term) || 
        price <= 0 || down < 0 || down > 100 || rate <= 0 || term <= 0) {
      return scenario;
    }

    const downPaymentAmount = price * (down / 100);
    const loanAmount = price - downPaymentAmount;
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term * 12;
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const totalPaid = monthlyPayment * numberOfPayments;
    const totalInterest = totalPaid - loanAmount;
    const estimatedMonthlyRent = price * 0.015;
    const estimatedAnnualROI = ((estimatedMonthlyRent * 12 - (monthlyPayment * 12)) / downPaymentAmount) * 100;

    return {
      ...scenario,
      results: {
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        estimatedROI: Math.round(estimatedAnnualROI * 10) / 10
      }
    };
  };

  const handleCalculateAll = () => {
    const updatedScenarios = scenarios.map(calculateScenario);
    setScenarios(updatedScenarios);
    
    const calculatedCount = updatedScenarios.filter(s => s.results !== null).length;
    if (calculatedCount > 0) {
      toast({
        title: "Comparison Complete",
        description: `Successfully calculated ${calculatedCount} property scenario${calculatedCount > 1 ? 's' : ''}.`
      });
    }
  };

  const updateScenario = (id: string, field: keyof PropertyScenario, value: string) => {
    setScenarios(scenarios.map(scenario => 
      scenario.id === id ? { ...scenario, [field]: value, results: null } : scenario
    ));
  };

  const addScenario = () => {
    if (scenarios.length >= 4) {
      toast({
        title: "Maximum Reached",
        description: "You can compare up to 4 properties at once.",
        variant: "destructive"
      });
      return;
    }

    const newScenario: PropertyScenario = {
      id: Date.now().toString(),
      name: `Property ${String.fromCharCode(65 + scenarios.length)}`,
      propertyPrice: "",
      downPayment: "",
      interestRate: "",
      loanTerm: "",
      results: null
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 2) {
      toast({
        title: "Minimum Required",
        description: "You need at least 2 properties to compare.",
        variant: "destructive"
      });
      return;
    }
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const getBestScenario = () => {
    const calculated = scenarios.filter(s => s.results !== null);
    if (calculated.length === 0) return null;
    
    return calculated.reduce((best, current) => {
      if (!best.results || !current.results) return best;
      return current.results.estimatedROI > best.results.estimatedROI ? current : best;
    });
  };

  const bestScenario = getBestScenario();

  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Quick Investment Calculator</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === "single" ? "premium" : "outline"}
              size="sm"
              onClick={() => setMode("single")}
            >
              Single
            </Button>
            <Button
              variant={mode === "compare" ? "premium" : "outline"}
              size="sm"
              onClick={() => setMode("compare")}
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              Compare
            </Button>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {mode === "single" 
            ? "Estimate your potential returns in seconds"
            : "Compare multiple property scenarios side-by-side"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {mode === "single" ? (
          <>
        {/* Single Mode - Original Layout */}
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
        </>
        ) : (
          <>
        {/* Comparison Mode */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Comparing {scenarios.length} {scenarios.length === 1 ? 'property' : 'properties'}
            </p>
            <Button
              onClick={addScenario}
              variant="outline"
              size="sm"
              disabled={scenarios.length >= 4}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Property
            </Button>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {scenarios.map((scenario, index) => (
              <div
                key={scenario.id}
                className="relative p-4 rounded-lg border border-border bg-card space-y-3"
              >
                {/* Scenario Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-semibold">
                      {scenario.name}
                    </Badge>
                    {bestScenario?.id === scenario.id && scenario.results && (
                      <Badge variant="default" className="text-xs bg-green-500">
                        Best ROI
                      </Badge>
                    )}
                  </div>
                  {scenarios.length > 2 && (
                    <Button
                      onClick={() => removeScenario(scenario.id)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="250000"
                        value={scenario.propertyPrice}
                        onChange={(e) => updateScenario(scenario.id, 'propertyPrice', e.target.value)}
                        className="pl-7 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Down (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="20"
                        value={scenario.downPayment}
                        onChange={(e) => updateScenario(scenario.id, 'downPayment', e.target.value)}
                        className="pl-7 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Rate (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="7.5"
                        value={scenario.interestRate}
                        onChange={(e) => updateScenario(scenario.id, 'interestRate', e.target.value)}
                        className="pl-7 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Term (yrs)</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={scenario.loanTerm}
                      onChange={(e) => updateScenario(scenario.id, 'loanTerm', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Results */}
                {scenario.results && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Monthly</p>
                      <p className="text-lg font-bold text-foreground">
                        ${scenario.results.monthlyPayment.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Interest</p>
                      <p className="text-sm font-semibold text-foreground">
                        ${scenario.results.totalInterest.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">ROI</p>
                      <p className={`text-lg font-bold ${scenario.results.estimatedROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {scenario.results.estimatedROI > 0 ? '+' : ''}{scenario.results.estimatedROI}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Calculate All Button */}
          <div className="flex justify-center pt-2">
            <Button 
              onClick={handleCalculateAll}
              variant="premium"
              size="lg"
              className="w-full md:w-auto"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate & Compare All
            </Button>
          </div>

          {/* Comparison Summary */}
          {bestScenario && bestScenario.results && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm text-foreground">Best Investment</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{bestScenario.name}</span> offers the highest estimated ROI at{' '}
                <span className="font-bold text-green-600">
                  {bestScenario.results.estimatedROI > 0 ? '+' : ''}{bestScenario.results.estimatedROI}%
                </span>
                {' '}with a monthly payment of{' '}
                <span className="font-semibold text-foreground">
                  ${bestScenario.results.monthlyPayment.toLocaleString()}
                </span>.
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            * ROI calculation assumes 1.5% monthly rental yield. Actual returns may vary.
          </p>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
};
