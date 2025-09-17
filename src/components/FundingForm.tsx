import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Brain } from "lucide-react";

interface FundingFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export const FundingForm = ({ onBack, onSubmit }: FundingFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    propertyAddress: "",
    loanType: "",
    purchasePrice: "",
    loanAmount: "",
    downPayment: "",
    propertyType: "",
    experience: "",
    timeline: "",
    purpose: "",
    additionalInfo: "",
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      const mockScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      onSubmit({ ...formData, score: mockScore });
    }, 3000);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isAnalyzing) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-gradient-subtle border-0 shadow-premium">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-gold animate-pulse">
              <Brain className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Your Deal</h2>
            <p className="text-muted-foreground mb-6">
              Our AI is reviewing your submission against 1000+ lender requirements
            </p>
            <Progress value={66} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              This usually takes less than 2 minutes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Funding Analysis</h1>
            <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>
        <Progress value={progress} className="mb-2" />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {currentStep === 1 && "Property Details"}
            {currentStep === 2 && "Loan Information"}
            {currentStep === 3 && "Your Experience"}
            {currentStep === 4 && "Timeline & Goals"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input 
                  id="propertyAddress"
                  placeholder="123 Main St, City, State"
                  value={formData.propertyAddress}
                  onChange={(e) => updateFormData("propertyAddress", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => updateFormData("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-family">Single Family Home</SelectItem>
                    <SelectItem value="multi-family">Multi-Family (2-4 units)</SelectItem>
                    <SelectItem value="commercial">Commercial Property</SelectItem>
                    <SelectItem value="condo">Condominium</SelectItem>
                    <SelectItem value="land">Raw Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input 
                  id="purchasePrice"
                  placeholder="$250,000"
                  value={formData.purchasePrice}
                  onChange={(e) => updateFormData("purchasePrice", e.target.value)}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="loanType">Loan Type</Label>
                <Select value={formData.loanType} onValueChange={(value) => updateFormData("loanType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fix-flip">Fix & Flip</SelectItem>
                    <SelectItem value="bridge">Bridge Loan</SelectItem>
                    <SelectItem value="rental">Long-Term Rental</SelectItem>
                    <SelectItem value="construction">Construction Loan</SelectItem>
                    <SelectItem value="commercial">Commercial Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Requested Loan Amount</Label>
                <Input 
                  id="loanAmount"
                  placeholder="$200,000"
                  value={formData.loanAmount}
                  onChange={(e) => updateFormData("loanAmount", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment Available</Label>
                <Input 
                  id="downPayment"
                  placeholder="$50,000"
                  value={formData.downPayment}
                  onChange={(e) => updateFormData("downPayment", e.target.value)}
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="experience">Real Estate Experience</Label>
                <Select value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">First Deal (0 properties)</SelectItem>
                    <SelectItem value="intermediate">Some Experience (1-5 properties)</SelectItem>
                    <SelectItem value="experienced">Experienced (6-15 properties)</SelectItem>
                    <SelectItem value="expert">Expert (16+ properties)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Investment Purpose</Label>
                <Select value={formData.purpose} onValueChange={(value) => updateFormData("purpose", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's your goal?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flip">Buy, renovate, and sell</SelectItem>
                    <SelectItem value="rental">Buy and hold for rental income</SelectItem>
                    <SelectItem value="development">New construction/development</SelectItem>
                    <SelectItem value="refinance">Refinance existing property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="timeline">Funding Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => updateFormData("timeline", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you need funding?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (within 1 week)</SelectItem>
                    <SelectItem value="2weeks">Within 2 weeks</SelectItem>
                    <SelectItem value="month">Within 1 month</SelectItem>
                    <SelectItem value="flexible">Flexible timing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea 
                  id="additionalInfo"
                  placeholder="Any additional details about your deal, challenges, or specific requirements..."
                  value={formData.additionalInfo}
                  onChange={(e) => updateFormData("additionalInfo", e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <Button 
              onClick={handleNext} 
              variant="premium" 
              size="lg" 
              className="w-full"
              disabled={isAnalyzing}
            >
              {currentStep === totalSteps ? (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Deal
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};