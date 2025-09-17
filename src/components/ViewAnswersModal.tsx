import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DealAnalysis {
  id: string;
  funding_amount: string;
  funding_purpose: string;
  property_type: string;
  property_details?: string;
  properties_count: string;
  credit_score: string;
  bank_balance?: string;
  annual_income?: string;
  income_sources?: string;
  financial_assets?: string[];
  property_address: string;
  property_info?: string;
  property_specific_info?: string;
  under_contract?: boolean;
  owns_other_properties?: boolean;
  current_value?: string;
  repairs_needed?: boolean;
  repair_level?: string;
  rehab_costs?: string;
  arv_estimate?: string;
  close_timeline?: string;
  money_plans?: string;
  past_deals?: boolean;
  last_deal_profit?: string;
  good_deal_criteria?: string;
  analysis_score?: number;
  created_at: string;
}

interface ViewAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DealAnalysis | null;
}

export const ViewAnswersModal = ({ isOpen, onClose, analysis }: ViewAnswersModalProps) => {
  if (!analysis) return null;

  const handleCopyAnswers = async () => {
    try {
      // Create a clean object with form field mappings
      const formData = {
        fundingAmount: analysis.funding_amount,
        fundingPurpose: analysis.funding_purpose,
        propertyType: analysis.property_type,
        propertyDetails: analysis.property_details || "",
        propertiesCount: analysis.properties_count,
        creditScore: analysis.credit_score,
        bankBalance: analysis.bank_balance || "",
        annualIncome: analysis.annual_income || "",
        incomeSources: analysis.income_sources || "",
        financialAssets: analysis.financial_assets || [],
        propertyAddress: analysis.property_address,
        propertyInfo: analysis.property_info || "",
        propertySpecificInfo: analysis.property_specific_info || "",
        underContract: analysis.under_contract || false,
        ownsOtherProperties: analysis.owns_other_properties || false,
        currentValue: analysis.current_value || "",
        repairsNeeded: analysis.repairs_needed || false,
        repairLevel: analysis.repair_level || "",
        rehabCosts: analysis.rehab_costs || "",
        arvEstimate: analysis.arv_estimate || "",
        closeTimeline: analysis.close_timeline || "",
        moneyPlans: analysis.money_plans || "",
        pastDeals: analysis.past_deals || false,
        lastDealProfit: analysis.last_deal_profit || "",
        goodDealCriteria: analysis.good_deal_criteria || ""
      };

      await navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
      toast.success("Answers copied to clipboard! You can now paste them in a new form.");
    } catch (error) {
      toast.error("Failed to copy answers to clipboard");
    }
  };

  const formatAnswer = (value: any) => {
    if (value === null || value === undefined) return "Not provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    return value.toString();
  };

  const answerSections = [
    {
      title: "Funding Details",
      items: [
        { label: "Funding Amount", value: analysis.funding_amount },
        { label: "Funding Purpose", value: analysis.funding_purpose },
        { label: "Property Type", value: analysis.property_type },
        { label: "Property Details", value: analysis.property_details },
        { label: "Properties Count", value: analysis.properties_count },
      ]
    },
    {
      title: "Financial Information",
      items: [
        { label: "Credit Score", value: analysis.credit_score },
        { label: "Bank Balance", value: analysis.bank_balance },
        { label: "Annual Income", value: analysis.annual_income },
        { label: "Income Sources", value: analysis.income_sources },
        { label: "Financial Assets", value: analysis.financial_assets },
      ]
    },
    {
      title: "Property Information",
      items: [
        { label: "Property Address", value: analysis.property_address },
        { label: "Property Info", value: analysis.property_info },
        { label: "Property Specific Info", value: analysis.property_specific_info },
        { label: "Under Contract", value: analysis.under_contract },
        { label: "Owns Other Properties", value: analysis.owns_other_properties },
        { label: "Current Value", value: analysis.current_value },
      ]
    },
    {
      title: "Renovation Details",
      items: [
        { label: "Repairs Needed", value: analysis.repairs_needed },
        { label: "Repair Level", value: analysis.repair_level },
        { label: "Rehab Costs", value: analysis.rehab_costs },
        { label: "ARV Estimate", value: analysis.arv_estimate },
      ]
    },
    {
      title: "Timeline & Experience",
      items: [
        { label: "Close Timeline", value: analysis.close_timeline ? format(new Date(analysis.close_timeline), "MMM d, yyyy") : null },
        { label: "Money Plans", value: analysis.money_plans },
        { label: "Past Deals", value: analysis.past_deals },
        { label: "Last Deal Profit", value: analysis.last_deal_profit },
        { label: "Good Deal Criteria", value: analysis.good_deal_criteria },
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Previous Answers</span>
            {analysis.analysis_score && (
              <Badge variant="secondary" className="text-sm">
                Score: {analysis.analysis_score}%
              </Badge>
            )}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Submitted on {format(new Date(analysis.created_at), "MMM d, yyyy 'at' h:mm a")}
          </div>
          <Button 
            onClick={handleCopyAnswers}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All Answers
          </Button>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {answerSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        {item.label}
                      </label>
                      <div className="text-sm text-foreground bg-muted/50 rounded-md p-2 min-h-[32px] flex items-center">
                        {formatAnswer(item.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};