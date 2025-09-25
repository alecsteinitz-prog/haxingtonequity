import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Brain, CalendarIcon, ClipboardPaste } from "lucide-react";
import heLogo from "@/assets/he-logo-new.png";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfileSync } from "@/hooks/useProfileSync";
import { useAuth } from "@/contexts/AuthContext";

interface FundingFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export const FundingForm = ({ onBack, onSubmit }: FundingFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { syncEligibilityScore } = useProfileSync();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fundingAmount: "",
    fundingPurpose: "",
    propertyType: "",
    propertiesExperience: "",
    creditScore: "",
    bankBalance: "",
    annualIncome: "",
    incomeSources: "",
    financialAssets: [] as string[],
    propertyAddress: "",
    propertyInfo: "",
    propertyDetails: "",
    underContract: "",
    ownOtherProperties: "",
    currentValue: "",
    repairsNeeded: "",
    repairLevel: "",
    rehabCosts: "",
    arv: "",
    closingDate: null as Date | null,
    moneyPlan: "",
    pastDeals: "",
    lastDealProfit: "",
    goodDeal: "",
  });

  const totalSteps = 6;
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
    
    // Map form data to correct structure for analysis
    const mappedFormData = {
      fundingAmount: formData.fundingAmount,
      fundingPurpose: formData.fundingPurpose,
      propertyType: formData.propertyType,
      propertiesExperience: formData.propertiesExperience,
      creditScore: formData.creditScore,
      bankBalance: formData.bankBalance,
      annualIncome: formData.annualIncome,
      incomeSources: formData.incomeSources,
      financialAssets: formData.financialAssets,
      propertyAddress: formData.propertyAddress,
      propertyInfo: formData.propertyInfo,
      propertyDetails: formData.propertyDetails,
      underContract: formData.underContract,
      ownOtherProperties: formData.ownOtherProperties,
      currentValue: formData.currentValue,
      repairsNeeded: formData.repairsNeeded,
      repairLevel: formData.repairLevel,
      rehabCosts: formData.rehabCosts,
      arv: formData.arv,
      closingDate: formData.closingDate,
      moneyPlan: formData.moneyPlan,
      pastDeals: formData.pastDeals,
      lastDealProfit: formData.lastDealProfit,
      goodDeal: formData.goodDeal
    };
    
    // Perform real lender analysis
    setTimeout(async () => {
      const { analyzeDeal } = await import('../utils/lenderAnalysis');
      const analysisResult = analyzeDeal(mappedFormData);
      const score = analysisResult.overallScore;
      
      // SECURITY: Validate user authentication before saving financial data
      if (!user) {
        toast.error('Authentication required for financial data submission');
        setIsAnalyzing(false);
        return;
      }

      // Save to database
      try {
        // SECURITY: Validate and sanitize input data
        const { validateFinancialData, validatePropertyData, sanitizeInput } = await import('@/utils/inputValidation');
        
        const financialErrors = validateFinancialData(formData);
        const propertyErrors = validatePropertyData(formData);
        
        if (financialErrors.length > 0 || propertyErrors.length > 0) {
          const allErrors = [...financialErrors, ...propertyErrors];
          toast.error(`Validation Error: ${allErrors.join(', ')}`);
          setIsAnalyzing(false);
          return;
        }

        // Save to deal_analyses table with proper user association and input sanitization
        const { error: analysisError } = await supabase
          .from('deal_analyses')
          .insert({
            user_id: user.id, // SECURITY: Always associate financial data with authenticated user
            funding_amount: sanitizeInput(formData.fundingAmount),
            funding_purpose: sanitizeInput(formData.fundingPurpose),
            property_type: sanitizeInput(formData.propertyType),
            property_details: sanitizeInput(formData.propertyDetails),
            properties_count: sanitizeInput(formData.propertiesExperience),
            credit_score: sanitizeInput(formData.creditScore),
            bank_balance: sanitizeInput(formData.bankBalance),
            annual_income: sanitizeInput(formData.annualIncome),
            income_sources: sanitizeInput(formData.incomeSources),
            financial_assets: formData.financialAssets,
            property_address: sanitizeInput(formData.propertyAddress),
            property_info: formData.propertyInfo ? sanitizeInput(formData.propertyInfo) : null,
            property_specific_info: sanitizeInput(formData.propertyDetails),
            under_contract: formData.underContract === 'Yes',
            owns_other_properties: formData.ownOtherProperties === 'Yes',
            current_value: formData.currentValue ? sanitizeInput(formData.currentValue) : null,
            repairs_needed: formData.repairsNeeded === 'Yes',
            repair_level: formData.repairLevel ? sanitizeInput(formData.repairLevel) : null,
            rehab_costs: formData.rehabCosts ? sanitizeInput(formData.rehabCosts) : null,
            arv_estimate: formData.arv ? sanitizeInput(formData.arv) : null,
            close_timeline: formData.closingDate ? formData.closingDate.toISOString() : null,
            money_plans: formData.moneyPlan ? sanitizeInput(formData.moneyPlan) : null,
            past_deals: formData.pastDeals === 'Yes',
            last_deal_profit: formData.lastDealProfit ? sanitizeInput(formData.lastDealProfit) : null,
            good_deal_criteria: formData.goodDeal ? sanitizeInput(formData.goodDeal) : null,
            analysis_score: score
          });

        if (analysisError) {
          console.error('Error saving analysis:', analysisError);
        }

        // Save to deal_history table for the profile page
        const dealValue = formData.currentValue ? parseFloat(formData.currentValue.replace(/[$,]/g, '')) : null;
        const { error: dealError } = await supabase
          .from('deal_history')
          .insert({
            user_id: user.id, // SECURITY: Always associate deal history with authenticated user
            property_type: formData.propertyType,
            city: formData.propertyAddress ? formData.propertyAddress.split(',')[0] : 'Unknown',
            state: formData.propertyAddress ? formData.propertyAddress.split(',')[1]?.trim() : null,
            deal_status: 'pending_approval',
            deal_value: dealValue,
            close_date: formData.closingDate ? formData.closingDate.toISOString().split('T')[0] : null,
            profit_amount: null // Will be filled when deal is completed
          });

        if (dealError) {
          console.error('Error saving deal history:', dealError);
        } else {
          toast.success('Deal added to your history!');
        }
      } catch (error) {
        console.error('Error saving analysis:', error);
      }
      
      // Sync eligibility score with profile
      await syncEligibilityScore(score, analysisResult);
      
      setIsAnalyzing(false);
      onSubmit({ ...formData, score, analysisResult });
    }, 3000);
  };

  const updateFormData = (field: string, value: string | string[] | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAsset = (asset: string) => {
    setFormData(prev => ({
      ...prev,
      financialAssets: prev.financialAssets.includes(asset)
        ? prev.financialAssets.filter(a => a !== asset)
        : [...prev.financialAssets, asset]
    }));
  };

  const handlePasteAnswers = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const pastedData = JSON.parse(clipboardText);
      
      // Map the pasted data to form fields
      const mappedData = {
        fundingAmount: pastedData.fundingAmount || "",
        fundingPurpose: pastedData.fundingPurpose || "",
        propertyType: pastedData.propertyType || "",
        propertiesExperience: pastedData.propertiesCount || "",
        creditScore: pastedData.creditScore || "",
        bankBalance: pastedData.bankBalance || "",
        annualIncome: pastedData.annualIncome || "",
        incomeSources: pastedData.incomeSources || "",
        financialAssets: pastedData.financialAssets || [],
        propertyAddress: pastedData.propertyAddress || "",
        propertyInfo: pastedData.propertyInfo || "",
        propertyDetails: pastedData.propertySpecificInfo || "",
        underContract: pastedData.underContract ? "yes" : "no",
        ownOtherProperties: pastedData.ownsOtherProperties ? "yes" : "no",
        currentValue: pastedData.currentValue || "",
        repairsNeeded: pastedData.repairsNeeded ? "yes" : "no",
        repairLevel: pastedData.repairLevel || "",
        rehabCosts: pastedData.rehabCosts || "",
        arv: pastedData.arvEstimate || "",
        closingDate: pastedData.closeTimeline ? new Date(pastedData.closeTimeline) : null,
        moneyPlan: pastedData.moneyPlans || "",
        pastDeals: pastedData.pastDeals ? "yes" : "no",
        lastDealProfit: pastedData.lastDealProfit || "",
        goodDeal: pastedData.goodDealCriteria || ""
      };
      
      setFormData(prev => ({ ...prev, ...mappedData }));
      toast.success("Previous answers pasted successfully!");
    } catch (error) {
      toast.error("Failed to paste answers. Please make sure you copied valid form data.");
    }
  };

  if (isAnalyzing) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-gradient-subtle border-0 shadow-premium">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center w-72 h-72 mx-auto -mb-20">
              <img src={heLogo} alt="Haxington Equity" className="w-60 h-48 object-contain animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Your Eligibility</h2>
            <p className="text-muted-foreground mb-6">
              Our AI is reviewing your submission against our funding requirements
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
            <h1 className="text-xl font-bold">Investor Funding Eligibility Form</h1>
            <p className="text-sm text-muted-foreground">Submit your details to find out if you meet our requirements - Step {currentStep} of {totalSteps}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePasteAnswers}
            className="flex items-center gap-2"
          >
            <ClipboardPaste className="h-4 w-4" />
            Paste Previous
          </Button>
        </div>
        <Progress value={progress} className="mb-2" />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {currentStep === 1 && "Funding Requirements"}
            {currentStep === 2 && "Financial Profile"}
            {currentStep === 3 && "Property Information"}
            {currentStep === 4 && "Property Details"}
            {currentStep === 5 && "Investment Goals"}
            {currentStep === 6 && "Deal Analysis"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">How much do you need?*</Label>
                <RadioGroup 
                  value={formData.fundingAmount} 
                  onValueChange={(value) => updateFormData("fundingAmount", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="100k-200k" id="r1" />
                    <Label htmlFor="r1">$100k - $200k</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="201k-500k" id="r2" />
                    <Label htmlFor="r2">$201k - $500k</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="501k-1m" id="r3" />
                    <Label htmlFor="r3">$501k - $1M</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1m-5m" id="r4" />
                    <Label htmlFor="r4">$1M - $5M</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5m+" id="r5" />
                    <Label htmlFor="r5">+5M$</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">What do you need funding for?*</Label>
                <RadioGroup 
                  value={formData.fundingPurpose} 
                  onValueChange={(value) => updateFormData("fundingPurpose", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="purchase" id="p1" />
                    <Label htmlFor="p1">Purchase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="refinance" id="p2" />
                    <Label htmlFor="p2">Refinance</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">What type of investment property are you funding?*</Label>
                <RadioGroup 
                  value={formData.propertyType} 
                  onValueChange={(value) => updateFormData("propertyType", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="residential" id="t1" />
                    <Label htmlFor="t1">Residential</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="commercial" id="t2" />
                    <Label htmlFor="t2">Commercial</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Residential: Single Family Units, Multi Family Units<br/>
                  Commercial: Retail, Warehouse, Office Building, Mixed Use
                </p>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">How many properties have you bought or sold?*</Label>
                <RadioGroup 
                  value={formData.propertiesExperience} 
                  onValueChange={(value) => updateFormData("propertiesExperience", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-3" id="e1" />
                    <Label htmlFor="e1">1 - 3</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4-10" id="e2" />
                    <Label htmlFor="e2">4 - 10</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="11-20" id="e3" />
                    <Label htmlFor="e3">11 - 20</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="21+" id="e4" />
                    <Label htmlFor="e4">21+</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">What does your credit look like?*</Label>
                <RadioGroup 
                  value={formData.creditScore} 
                  onValueChange={(value) => updateFormData("creditScore", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="above-720" id="c1" />
                    <Label htmlFor="c1">Above 720</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="above-680" id="c2" />
                    <Label htmlFor="c2">Above 680</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="above-640" id="c3" />
                    <Label htmlFor="c3">Above 640</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="below-640" id="c4" />
                    <Label htmlFor="c4">Below 640</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Loans are based off the property, but credit can still help.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankBalance">What is your average balance in bank?*</Label>
                <Input 
                  id="bankBalance"
                  placeholder="Enter amount"
                  value={formData.bankBalance}
                  onChange={(e) => updateFormData("bankBalance", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualIncome">What is your annual income?*</Label>
                <Input 
                  id="annualIncome"
                  placeholder="Enter annual income"
                  value={formData.annualIncome}
                  onChange={(e) => updateFormData("annualIncome", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomeSources">How many sources of income do you have and what are they?*</Label>
                <Textarea 
                  id="incomeSources"
                  placeholder="Describe your income sources"
                  value={formData.incomeSources}
                  onChange={(e) => updateFormData("incomeSources", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you have any financial assets?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["401K", "Bitcoin", "IRA", "None"].map((asset) => (
                    <div key={asset} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={asset}
                        checked={formData.financialAssets.includes(asset)}
                        onChange={() => toggleAsset(asset)}
                        className="rounded border border-input"
                      />
                      <Label htmlFor={asset}>{asset}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">What is the address of the property?*</Label>
                <Input 
                  id="propertyAddress"
                  placeholder="Enter property address"
                  value={formData.propertyAddress}
                  onChange={(e) => updateFormData("propertyAddress", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyInfo">Provide us general information about the property.*</Label>
                <Textarea 
                  id="propertyInfo"
                  placeholder="Enter general property information"
                  value={formData.propertyInfo}
                  onChange={(e) => updateFormData("propertyInfo", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyDetails">Provide us specific information about the property.*</Label>
                <Textarea 
                  id="propertyDetails"
                  placeholder="Enter specific property details"
                  value={formData.propertyDetails}
                  onChange={(e) => updateFormData("propertyDetails", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Is your property under contract?*</Label>
                <RadioGroup 
                  value={formData.underContract} 
                  onValueChange={(value) => updateFormData("underContract", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="uc1" />
                    <Label htmlFor="uc1">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="uc2" />
                    <Label htmlFor="uc2">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you own any other properties?*</Label>
                <RadioGroup 
                  value={formData.ownOtherProperties} 
                  onValueChange={(value) => updateFormData("ownOtherProperties", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="op1" />
                    <Label htmlFor="op1">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="op2" />
                    <Label htmlFor="op2">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="currentValue">What is the current value of the property?*</Label>
                <Input 
                  id="currentValue"
                  placeholder="Enter current property value"
                  value={formData.currentValue}
                  onChange={(e) => updateFormData("currentValue", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repairsNeeded">Are there any repairs needed to be done?*</Label>
                <Textarea 
                  id="repairsNeeded"
                  placeholder="Describe any repairs needed"
                  value={formData.repairsNeeded}
                  onChange={(e) => updateFormData("repairsNeeded", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repairLevel">If yes, what level of repair is comfortable for you?</Label>
                <Input 
                  id="repairLevel"
                  placeholder="Enter comfort level for repairs"
                  value={formData.repairLevel}
                  onChange={(e) => updateFormData("repairLevel", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rehabCosts">What are the rehab costs of the property?*</Label>
                <Input 
                  id="rehabCosts"
                  placeholder="Answer N/A if no repairs are needed"
                  value={formData.rehabCosts}
                  onChange={(e) => updateFormData("rehabCosts", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arv">How would you estimate the ARV of the property?*</Label>
                <Input 
                  id="arv"
                  placeholder="ARV: After-Repair Value. Answer N/A if no repairs are needed"
                  value={formData.arv}
                  onChange={(e) => updateFormData("arv", e.target.value)}
                />
              </div>
            </>
          )}

          {currentStep === 5 && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">How quickly you need to close?*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.closingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.closingDate ? format(formData.closingDate, "PPP") : <span>Choose a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.closingDate || undefined}
                      onSelect={(date) => updateFormData("closingDate", date || null)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moneyPlan">If the deal is successful, what do you plan to do with the money?*</Label>
                <Textarea 
                  id="moneyPlan"
                  placeholder="Describe your plans for the money"
                  value={formData.moneyPlan}
                  onChange={(e) => updateFormData("moneyPlan", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Have you done any deals in the past year?*</Label>
                <RadioGroup 
                  value={formData.pastDeals} 
                  onValueChange={(value) => updateFormData("pastDeals", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pd1" />
                    <Label htmlFor="pd1">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pd2" />
                    <Label htmlFor="pd2">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastDealProfit">What was the profit of your last deal?*</Label>
                <Input 
                  id="lastDealProfit"
                  placeholder="Fill out N/A if this is your first deal"
                  value={formData.lastDealProfit}
                  onChange={(e) => updateFormData("lastDealProfit", e.target.value)}
                />
              </div>
            </>
          )}

          {currentStep === 6 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="goodDeal">What consists a good deal for you?*</Label>
                <Textarea 
                  id="goodDeal"
                  placeholder="Provide us your preferred % of value, your preferred minimum profit, your preferred minimum cash flow"
                  value={formData.goodDeal}
                  onChange={(e) => updateFormData("goodDeal", e.target.value)}
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
                  <img src={heLogo} alt="HE" className="w-6 h-4 mr-2 object-contain" />
                  Analyze Your Deal
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