import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FundingFormData {
  fundingAmount: string;
  fundingPurpose: string;
  propertyType: string;
  propertiesExperience: string;
  creditScore: string;
  bankBalance: string;
  annualIncome: string;
  incomeSources: string;
  financialAssets: string[];
  propertyAddress: string;
  propertyInfo: string;
  propertyDetails: string;
  underContract: string;
  ownOtherProperties: string;
  currentValue: string;
  repairsNeeded: string;
  repairLevel: string;
  rehabCosts: string;
  arv: string;
  closingDate: string | null;
  moneyPlan: string;
  pastDeals: string;
  lastDealProfit: string;
  goodDeal: string;
  score: number;
  analysisResult: any;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData }: { formData: FundingFormData } = await req.json();

    console.log("Processing funding form submission for:", formData.userEmail);

    // Format the email content
    const emailContent = `
      <h1>New Funding Application Submitted</h1>
      
      <h2>Applicant Information</h2>
      <p><strong>Name:</strong> ${formData.userName}</p>
      <p><strong>Email:</strong> ${formData.userEmail}</p>
      <p><strong>AI Analysis Score:</strong> ${formData.score}%</p>
      
      <h2>Funding Requirements</h2>
      <p><strong>Amount Needed:</strong> ${formData.fundingAmount}</p>
      <p><strong>Purpose:</strong> ${formData.fundingPurpose}</p>
      <p><strong>Property Type:</strong> ${formData.propertyType}</p>
      
      <h2>Financial Profile</h2>
      <p><strong>Properties Experience:</strong> ${formData.propertiesExperience}</p>
      <p><strong>Credit Score:</strong> ${formData.creditScore}</p>
      <p><strong>Bank Balance:</strong> ${formData.bankBalance}</p>
      <p><strong>Annual Income:</strong> ${formData.annualIncome}</p>
      <p><strong>Income Sources:</strong> ${formData.incomeSources}</p>
      <p><strong>Financial Assets:</strong> ${formData.financialAssets.join(', ')}</p>
      
      <h2>Property Information</h2>
      <p><strong>Address:</strong> ${formData.propertyAddress}</p>
      <p><strong>General Info:</strong> ${formData.propertyInfo}</p>
      <p><strong>Details:</strong> ${formData.propertyDetails}</p>
      <p><strong>Under Contract:</strong> ${formData.underContract}</p>
      <p><strong>Owns Other Properties:</strong> ${formData.ownOtherProperties}</p>
      
      <h2>Property Details</h2>
      <p><strong>Current Value:</strong> ${formData.currentValue}</p>
      <p><strong>Repairs Needed:</strong> ${formData.repairsNeeded}</p>
      ${formData.repairLevel ? `<p><strong>Repair Level:</strong> ${formData.repairLevel}</p>` : ''}
      ${formData.rehabCosts ? `<p><strong>Rehab Costs:</strong> ${formData.rehabCosts}</p>` : ''}
      ${formData.arv ? `<p><strong>ARV Estimate:</strong> ${formData.arv}</p>` : ''}
      
      <h2>Investment Goals</h2>
      ${formData.closingDate ? `<p><strong>Closing Date:</strong> ${formData.closingDate}</p>` : ''}
      ${formData.moneyPlan ? `<p><strong>Money Plan:</strong> ${formData.moneyPlan}</p>` : ''}
      <p><strong>Past Deals:</strong> ${formData.pastDeals}</p>
      ${formData.lastDealProfit ? `<p><strong>Last Deal Profit:</strong> ${formData.lastDealProfit}</p>` : ''}
      ${formData.goodDeal ? `<p><strong>Good Deal Criteria:</strong> ${formData.goodDeal}</p>` : ''}
      
      <h2>AI Analysis Summary</h2>
      <p><strong>Overall Score:</strong> ${formData.score}%</p>
      ${formData.analysisResult?.qualifyingLenders?.length > 0 ? 
        `<p><strong>Qualifying Lenders:</strong> ${formData.analysisResult.qualifyingLenders.length}</p>` : 
        '<p><strong>Qualifying Lenders:</strong> None</p>'
      }
      ${formData.analysisResult?.recommendations?.length > 0 ? 
        `<h3>AI Recommendations:</h3><ul>${formData.analysisResult.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}</ul>` : 
        ''
      }
    `;

    // Use Resend API directly via fetch
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Funding Application <onboarding@resend.dev>",
        to: ["igli.haxhillari@haxingtonequity.com"],
        subject: `New Funding Application - ${formData.userName} (Score: ${formData.score}%)`,
        html: emailContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Email service error: ${resendResponse.status} ${errorData}`);
    }

    const emailResult = await resendResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Form submitted successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in submit-funding-form function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to submit form" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);