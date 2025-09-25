import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LenderCriteria {
  id: string;
  name: string;
  baseRate: number;
  minCreditScore: number;
  maxLTV: number; // Loan to Value ratio
  minExperience: string; // 'first_deal', 'experienced', 'expert'
  maxLoanAmount: number;
  minLoanAmount: number;
  preferredPropertyTypes: string[];
  requiresProfit: boolean;
  regions: string[];
  specialPrograms: string[];
  rateAdjustments: {
    creditScore: { threshold: number; adjustment: number }[];
    experience: { level: string; adjustment: number }[];
    loanAmount: { threshold: number; adjustment: number }[];
    propertyType: { type: string; adjustment: number }[];
  };
}

// Comprehensive lender database with real-world inspired criteria
const LENDERS: LenderCriteria[] = [
  {
    id: "premier_capital",
    name: "Premier Capital Solutions",
    baseRate: 7.5,
    minCreditScore: 680,
    maxLTV: 75,
    minExperience: "experienced",
    maxLoanAmount: 2000000,
    minLoanAmount: 100000,
    preferredPropertyTypes: ["Single Family", "Multi-Family", "Commercial"],
    requiresProfit: true,
    regions: ["nationwide"],
    specialPrograms: ["fix_and_flip", "rental_portfolio"],
    rateAdjustments: {
      creditScore: [
        { threshold: 750, adjustment: -0.5 },
        { threshold: 720, adjustment: -0.25 }
      ],
      experience: [
        { level: "expert", adjustment: -0.75 },
        { level: "experienced", adjustment: -0.25 }
      ],
      loanAmount: [
        { threshold: 500000, adjustment: -0.25 },
        { threshold: 1000000, adjustment: -0.5 }
      ],
      propertyType: [
        { type: "Single Family", adjustment: 0 },
        { type: "Multi-Family", adjustment: 0.25 }
      ]
    }
  },
  {
    id: "first_deal_lending",
    name: "First Deal Lending Co.",
    baseRate: 9.2,
    minCreditScore: 620,
    maxLTV: 70,
    minExperience: "first_deal",
    maxLoanAmount: 750000,
    minLoanAmount: 50000,
    preferredPropertyTypes: ["Single Family", "Duplex"],
    requiresProfit: false,
    regions: ["nationwide"],
    specialPrograms: ["first_time_investor", "mentorship"],
    rateAdjustments: {
      creditScore: [
        { threshold: 720, adjustment: -0.75 },
        { threshold: 680, adjustment: -0.5 }
      ],
      experience: [
        { level: "first_deal", adjustment: 0 }
      ],
      loanAmount: [
        { threshold: 300000, adjustment: -0.25 }
      ],
      propertyType: [
        { type: "Single Family", adjustment: 0 },
        { type: "Duplex", adjustment: 0.25 }
      ]
    }
  },
  {
    id: "bridge_funding_pros",
    name: "Bridge Funding Professionals",
    baseRate: 8.8,
    minCreditScore: 650,
    maxLTV: 80,
    minExperience: "experienced",
    maxLoanAmount: 1500000,
    minLoanAmount: 75000,
    preferredPropertyTypes: ["Single Family", "Multi-Family", "Commercial", "Mixed Use"],
    requiresProfit: false,
    regions: ["nationwide"],
    specialPrograms: ["bridge_loans", "construction"],
    rateAdjustments: {
      creditScore: [
        { threshold: 740, adjustment: -0.5 },
        { threshold: 700, adjustment: -0.25 }
      ],
      experience: [
        { level: "expert", adjustment: -0.5 },
        { level: "experienced", adjustment: 0 }
      ],
      loanAmount: [
        { threshold: 500000, adjustment: -0.3 }
      ],
      propertyType: [
        { type: "Commercial", adjustment: 0.5 },
        { type: "Mixed Use", adjustment: 0.75 }
      ]
    }
  },
  {
    id: "speedy_cash_lending",
    name: "Speedy Cash Lending",
    baseRate: 10.5,
    minCreditScore: 580,
    maxLTV: 65,
    minExperience: "first_deal",
    maxLoanAmount: 500000,
    minLoanAmount: 25000,
    preferredPropertyTypes: ["Single Family", "Duplex", "Triplex"],
    requiresProfit: false,
    regions: ["nationwide"],
    specialPrograms: ["fast_close", "no_income_verification"],
    rateAdjustments: {
      creditScore: [
        { threshold: 650, adjustment: -1.0 },
        { threshold: 620, adjustment: -0.5 }
      ],
      experience: [
        { level: "experienced", adjustment: -0.5 },
        { level: "expert", adjustment: -1.0 }
      ],
      loanAmount: [
        { threshold: 200000, adjustment: -0.25 }
      ],
      propertyType: [
        { type: "Single Family", adjustment: 0 }
      ]
    }
  },
  {
    id: "luxury_property_capital",
    name: "Luxury Property Capital",
    baseRate: 6.8,
    minCreditScore: 740,
    maxLTV: 70,
    minExperience: "expert",
    maxLoanAmount: 5000000,
    minLoanAmount: 500000,
    preferredPropertyTypes: ["Single Family", "Commercial", "Luxury"],
    requiresProfit: true,
    regions: ["CA", "NY", "FL", "TX"],
    specialPrograms: ["luxury_properties", "portfolio_expansion"],
    rateAdjustments: {
      creditScore: [
        { threshold: 800, adjustment: -0.5 },
        { threshold: 760, adjustment: -0.25 }
      ],
      experience: [
        { level: "expert", adjustment: 0 }
      ],
      loanAmount: [
        { threshold: 1000000, adjustment: -0.25 },
        { threshold: 2000000, adjustment: -0.5 }
      ],
      propertyType: [
        { type: "Luxury", adjustment: -0.25 },
        { type: "Commercial", adjustment: 0.25 }
      ]
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealAnalysisId } = await req.json();
    console.log('Analyzing deal for ID:', dealAnalysisId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the deal analysis
    const { data: dealData, error: dealError } = await supabase
      .from('deal_analyses')
      .select('*')
      .eq('id', dealAnalysisId)
      .single();

    if (dealError || !dealData) {
      throw new Error('Deal analysis not found');
    }

    console.log('Deal data retrieved:', dealData);

    // Extract key metrics from deal data
    const creditScore = parseInt(dealData.credit_score) || 0;
    const fundingAmount = parseFloat(dealData.funding_amount?.replace(/[$,]/g, '') || '0');
    const currentValue = parseFloat(dealData.current_value?.replace(/[$,]/g, '') || '0');
    const experience = dealData.properties_count || 'first_deal';
    const propertyType = dealData.property_type;
    const hasProfit = dealData.past_deals === true;
    const ltv = currentValue > 0 ? (fundingAmount / currentValue) * 100 : 0;

    console.log('Extracted metrics:', {
      creditScore,
      fundingAmount,
      currentValue,
      experience,
      propertyType,
      hasProfit,
      ltv
    });

    // Analyze each lender
    const lenderAnalysis = LENDERS.map(lender => {
      let qualifies = true;
      const disqualificationReasons: string[] = [];
      let adjustedRate = lender.baseRate;

      // Check basic qualifications
      if (creditScore < lender.minCreditScore) {
        qualifies = false;
        disqualificationReasons.push(`Credit score ${creditScore} below minimum ${lender.minCreditScore}`);
      }

      if (ltv > lender.maxLTV) {
        qualifies = false;
        disqualificationReasons.push(`LTV ${ltv.toFixed(1)}% exceeds maximum ${lender.maxLTV}%`);
      }

      if (fundingAmount < lender.minLoanAmount) {
        qualifies = false;
        disqualificationReasons.push(`Loan amount $${fundingAmount.toLocaleString()} below minimum $${lender.minLoanAmount.toLocaleString()}`);
      }

      if (fundingAmount > lender.maxLoanAmount) {
        qualifies = false;
        disqualificationReasons.push(`Loan amount $${fundingAmount.toLocaleString()} exceeds maximum $${lender.maxLoanAmount.toLocaleString()}`);
      }

      // Check experience requirements
      const experienceOrder = { 'first_deal': 0, 'experienced': 1, 'expert': 2 };
      const requiredExp = experienceOrder[lender.minExperience as keyof typeof experienceOrder];
      const applicantExp = experienceOrder[experience as keyof typeof experienceOrder] || 0;
      
      if (applicantExp < requiredExp) {
        qualifies = false;
        disqualificationReasons.push(`Experience level ${experience} below required ${lender.minExperience}`);
      }

      // Check property type
      if (!lender.preferredPropertyTypes.includes(propertyType)) {
        qualifies = false;
        disqualificationReasons.push(`Property type ${propertyType} not in preferred types: ${lender.preferredPropertyTypes.join(', ')}`);
      }

      // Check profit requirement
      if (lender.requiresProfit && !hasProfit) {
        qualifies = false;
        disqualificationReasons.push('Lender requires previous profitable deals');
      }

      // Calculate rate adjustments for qualifying lenders
      if (qualifies) {
        // Credit score adjustments
        lender.rateAdjustments.creditScore.forEach(adj => {
          if (creditScore >= adj.threshold) {
            adjustedRate += adj.adjustment;
          }
        });

        // Experience adjustments
        lender.rateAdjustments.experience.forEach(adj => {
          if (experience === adj.level) {
            adjustedRate += adj.adjustment;
          }
        });

        // Loan amount adjustments
        lender.rateAdjustments.loanAmount.forEach(adj => {
          if (fundingAmount >= adj.threshold) {
            adjustedRate += adj.adjustment;
          }
        });

        // Property type adjustments
        lender.rateAdjustments.propertyType.forEach(adj => {
          if (propertyType === adj.type) {
            adjustedRate += adj.adjustment;
          }
        });
      }

      return {
        lender: lender.name,
        lenderId: lender.id,
        qualifies,
        baseRate: lender.baseRate,
        adjustedRate: Math.max(adjustedRate, 4.0), // Minimum 4% rate
        disqualificationReasons,
        specialPrograms: lender.specialPrograms,
        maxLoanAmount: lender.maxLoanAmount,
        maxLTV: lender.maxLTV
      };
    });

    // Get qualifying lenders and sort by rate
    const qualifyingLenders = lenderAnalysis
      .filter(analysis => analysis.qualifies)
      .sort((a, b) => a.adjustedRate - b.adjustedRate);

    const disqualifiedLenders = lenderAnalysis
      .filter(analysis => !analysis.qualifies);

    // Use OpenAI for intelligent analysis and recommendations
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    let aiInsights = '';

    if (openAIApiKey) {
      try {
        const prompt = `
        Analyze this real estate deal and provide strategic insights:
        
        Deal Details:
        - Credit Score: ${creditScore}
        - Funding Amount: $${fundingAmount.toLocaleString()}
        - Property Value: $${currentValue.toLocaleString()}
        - LTV: ${ltv.toFixed(1)}%
        - Experience: ${experience}
        - Property Type: ${propertyType}
        - Has Profitable Deals: ${hasProfit}
        
        Qualifying Lenders: ${qualifyingLenders.length}
        Best Rate Available: ${qualifyingLenders[0]?.adjustedRate || 'N/A'}%
        
        Provide a concise analysis covering:
        1. Deal strength assessment
        2. Rate competitiveness 
        3. Strategic recommendations
        4. Risk factors to consider
        
        Keep response under 200 words and focus on actionable insights.
        `;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert real estate lending advisor.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.3
          }),
        });

        const aiData = await aiResponse.json();
        aiInsights = aiData.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('Error getting AI insights:', error);
      }
    }

    // Prepare response
    const result = {
      dealMetrics: {
        creditScore,
        fundingAmount,
        currentValue,
        ltv: Math.round(ltv * 10) / 10,
        experience,
        propertyType,
        hasProfit
      },
      topRecommendation: qualifyingLenders[0] || null,
      alternativeLenders: qualifyingLenders.slice(1, 4),
      disqualifiedLenders: disqualifiedLenders.map(lender => ({
        lender: lender.lender,
        reasons: lender.disqualificationReasons
      })),
      summary: {
        totalLendersAnalyzed: LENDERS.length,
        qualifyingLenders: qualifyingLenders.length,
        bestRate: qualifyingLenders[0]?.adjustedRate || null,
        avgQualifyingRate: qualifyingLenders.length > 0 
          ? Math.round((qualifyingLenders.reduce((sum, l) => sum + l.adjustedRate, 0) / qualifyingLenders.length) * 100) / 100
          : null
      },
      aiInsights,
      analyzedAt: new Date().toISOString()
    };

    console.log('Analysis complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lender-matching function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Failed to analyze lender matching'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});