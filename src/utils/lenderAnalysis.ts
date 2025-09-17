interface LenderCriteria {
  name: string;
  focus: string[];
  minLoanAmount: number;
  maxLoanAmount: number;
  minFico: number;
  maxLtv: number;
  maxLtc: number;
  maxArv: number;
  acceptsOO: boolean;
  geography: string;
  rates: { min: number; max: number };
  terms: { min: number; max: number };
}

interface DealData {
  fundingAmount: string;
  fundingPurpose: string;
  propertyType: string;
  creditScore: string;
  currentValue: string;
  arv: string;
  rehabCosts: string;
  propertyAddress: string;
  pastDeals: string;
  ownOtherProperties: string;
  annualIncome: string;
  bankBalance: string;
}

const LENDERS: LenderCriteria[] = [
  {
    name: "Cogo Capital",
    focus: ["Fix & Flip", "Rental", "Bridge"],
    minLoanAmount: 50000,
    maxLoanAmount: 5000000,
    minFico: 620,
    maxLtv: 90,
    maxLtc: 100,
    maxArv: 75,
    acceptsOO: false,
    geography: "Nationwide",
    rates: { min: 8, max: 12 },
    terms: { min: 6, max: 24 }
  },
  {
    name: "LendingOne",
    focus: ["Bridge", "Fix & Flip", "DSCR", "Construction"],
    minLoanAmount: 70000,
    maxLoanAmount: 50000000,
    minFico: 640,
    maxLtv: 90,
    maxLtc: 75,
    maxArv: 75,
    acceptsOO: false,
    geography: "Nationwide",
    rates: { min: 6, max: 9 },
    terms: { min: 9, max: 360 }
  },
  {
    name: "RCN Capital",
    focus: ["Bridge", "Fix & Flip", "DSCR"],
    minLoanAmount: 75000,
    maxLoanAmount: 10000000,
    minFico: 650,
    maxLtv: 85,
    maxLtc: 100,
    maxArv: 75,
    acceptsOO: false,
    geography: "Most states",
    rates: { min: 8, max: 13 },
    terms: { min: 12, max: 360 }
  },
  {
    name: "Lima One Capital",
    focus: ["Fix & Flip", "DSCR", "Construction"],
    minLoanAmount: 50000,
    maxLoanAmount: 3000000,
    minFico: 620,
    maxLtv: 92.5,
    maxLtc: 92.5,
    maxArv: 75,
    acceptsOO: false,
    geography: "45 states",
    rates: { min: 7, max: 12 },
    terms: { min: 13, max: 30 }
  },
  {
    name: "Kiavi",
    focus: ["Fix & Flip", "Bridge", "Rental"],
    minLoanAmount: 75000,
    maxLoanAmount: 2000000,
    minFico: 660,
    maxLtv: 95,
    maxLtc: 80,
    maxArv: 80,
    acceptsOO: false,
    geography: "Many states",
    rates: { min: 8, max: 11 },
    terms: { min: 12, max: 30 }
  }
];

export interface LenderMatch {
  lender: LenderCriteria;
  score: number;
  qualifies: boolean;
  issues: string[];
  strengths: string[];
}

export interface AnalysisResult {
  overallScore: number;
  qualifyingLenders: LenderMatch[];
  bestMatch: LenderMatch | null;
  recommendations: string[];
  dealStrengths: string[];
  dealWeaknesses: string[];
}

function parseNumericValue(value: string): number {
  const cleanValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleanValue) || 0;
}

function getCreditScore(creditRange: string): number {
  switch (creditRange) {
    case 'Below 600': return 580;
    case '600-649': return 625;
    case '650-699': return 675;
    case '700-749': return 725;
    case '750+': return 775;
    default: return 650;
  }
}

function analyzeLenderMatch(lender: LenderCriteria, deal: DealData): LenderMatch {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  const loanAmount = parseNumericValue(deal.fundingAmount);
  const creditScore = getCreditScore(deal.creditScore);
  const currentValue = parseNumericValue(deal.currentValue);
  const arvValue = parseNumericValue(deal.arv);
  const rehabCosts = parseNumericValue(deal.rehabCosts);
  const income = parseNumericValue(deal.annualIncome);

  // Check loan amount range
  if (loanAmount < lender.minLoanAmount) {
    issues.push(`Loan amount $${loanAmount.toLocaleString()} below minimum $${lender.minLoanAmount.toLocaleString()}`);
    score -= 30;
  } else if (loanAmount > lender.maxLoanAmount) {
    issues.push(`Loan amount $${loanAmount.toLocaleString()} exceeds maximum $${lender.maxLoanAmount.toLocaleString()}`);
    score -= 40;
  } else {
    strengths.push(`Loan amount within range`);
  }

  // Check credit score
  if (creditScore < lender.minFico) {
    issues.push(`Credit score ${creditScore} below minimum ${lender.minFico}`);
    score -= 25;
  } else {
    strengths.push(`Credit score meets requirements`);
    if (creditScore > lender.minFico + 50) {
      strengths.push(`Strong credit score`);
      score += 5;
    }
  }

  // Check LTV/LTC ratios
  if (currentValue > 0) {
    const ltv = (loanAmount / currentValue) * 100;
    if (ltv > lender.maxLtv) {
      issues.push(`LTV ${ltv.toFixed(1)}% exceeds maximum ${lender.maxLtv}%`);
      score -= 20;
    } else {
      strengths.push(`LTV ratio acceptable`);
    }
  }

  // Check ARV ratio for fix & flip
  if (deal.fundingPurpose.toLowerCase().includes('flip') && arvValue > 0) {
    const loanToArv = (loanAmount / arvValue) * 100;
    if (loanToArv > lender.maxArv) {
      issues.push(`Loan-to-ARV ${loanToArv.toFixed(1)}% exceeds maximum ${lender.maxArv}%`);
      score -= 15;
    } else {
      strengths.push(`ARV ratio looks good`);
    }
  }

  // Check experience for investor-only lenders
  if (!lender.acceptsOO) {
    if (deal.pastDeals === 'No' && deal.ownOtherProperties === 'No') {
      issues.push(`Lender requires investment experience`);
      score -= 20;
    } else {
      strengths.push(`Investment experience qualifies`);
    }
  }

  // Check purpose alignment
  const purposeMatches = lender.focus.some(focus => 
    deal.fundingPurpose.toLowerCase().includes(focus.toLowerCase().replace('&', '').replace(' ', ''))
  );
  
  if (!purposeMatches) {
    issues.push(`Purpose doesn't align with lender focus`);
    score -= 15;
  } else {
    strengths.push(`Purpose aligns with lender specialty`);
  }

  // Income verification bonus
  if (income > 100000) {
    strengths.push(`Strong income profile`);
    score += 5;
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const qualifies = finalScore >= 70 && issues.length === 0;

  return {
    lender,
    score: finalScore,
    qualifies,
    issues,
    strengths
  };
}

export function analyzeDeal(dealData: DealData): AnalysisResult {
  const lenderMatches = LENDERS.map(lender => analyzeLenderMatch(lender, dealData));
  
  const qualifyingLenders = lenderMatches.filter(match => match.qualifies);
  const bestMatch = lenderMatches.reduce((best, current) => 
    current.score > (best?.score || 0) ? current : best, null as LenderMatch | null);

  // Calculate overall score
  const avgScore = lenderMatches.reduce((sum, match) => sum + match.score, 0) / lenderMatches.length;
  const qualificationBonus = qualifyingLenders.length * 5;
  const overallScore = Math.min(100, Math.max(0, avgScore + qualificationBonus));

  // Generate recommendations
  const recommendations: string[] = [];
  const dealStrengths: string[] = [];
  const dealWeaknesses: string[] = [];

  // Common issues across lenders
  const commonIssues = new Map<string, number>();
  lenderMatches.forEach(match => {
    match.issues.forEach(issue => {
      commonIssues.set(issue, (commonIssues.get(issue) || 0) + 1);
    });
  });

  // Common strengths
  const commonStrengths = new Map<string, number>();
  lenderMatches.forEach(match => {
    match.strengths.forEach(strength => {
      commonStrengths.set(strength, (commonStrengths.get(strength) || 0) + 1);
    });
  });

  // Add most common issues as detailed recommendations
  Array.from(commonIssues.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([issue]) => {
      if (issue.includes('credit score')) {
        const currentScore = getCreditScore(dealData.creditScore);
        recommendations.push(`Your current credit score range (${dealData.creditScore}) translates to approximately ${currentScore} FICO. Most lenders require 620-650 minimum, with better rates at 700+. Focus on paying down existing debts, making all payments on time, and avoiding new credit inquiries. Wait 3-6 months while working on credit improvement before reapplying.`);
      } else if (issue.includes('LTV')) {
        const loanAmount = parseNumericValue(dealData.fundingAmount);
        const currentValue = parseNumericValue(dealData.currentValue);
        const currentLTV = currentValue > 0 ? ((loanAmount / currentValue) * 100).toFixed(1) : 'N/A';
        recommendations.push(`Your current loan-to-value ratio is ${currentLTV}% (loan: $${loanAmount.toLocaleString()}, property value: $${currentValue.toLocaleString()}). Most lenders cap LTV at 75-90%. Consider increasing your down payment to reduce the loan amount to approximately $${(currentValue * 0.75).toLocaleString()} or finding a higher-value property.`);
      } else if (issue.includes('ARV')) {
        const loanAmount = parseNumericValue(dealData.fundingAmount);
        const arvValue = parseNumericValue(dealData.arv);
        const currentLoanToARV = arvValue > 0 ? ((loanAmount / arvValue) * 100).toFixed(1) : 'N/A';
        const targetLoanAmount = (arvValue * 0.75).toLocaleString();
        recommendations.push(`Your loan-to-ARV ratio is ${currentLoanToARV}% (loan: $${loanAmount.toLocaleString()}, ARV: $${arvValue.toLocaleString()}). Most lenders limit this to 70-75%. Either reduce your loan request to approximately $${targetLoanAmount} or get a professional appraisal to validate a higher ARV estimate.`);
      } else if (issue.includes('experience')) {
        const pastDeals = dealData.pastDeals === 'Yes' ? 'have' : 'have not';
        const ownProperties = dealData.ownOtherProperties === 'Yes' ? 'do own' : 'do not own';
        recommendations.push(`You ${pastDeals} completed past deals and ${ownProperties} other properties. Most investor-focused lenders require demonstrated experience. Consider: 1) Partnering with seasoned investors who have 5+ deals, 2) Starting with owner-occupied financing if applicable, 3) Building track record with smaller deals first, or 4) Highlighting any construction/renovation experience you have.`);
      } else if (issue.includes('amount')) {
        const requestedAmount = parseNumericValue(dealData.fundingAmount);
        recommendations.push(`Your requested funding amount of $${requestedAmount.toLocaleString()} falls outside many lender parameters. Review the qualifying lenders above to see their loan ranges. Consider adjusting your loan request, finding properties that fit within common ranges ($75K-$2M), or exploring portfolio lenders for larger amounts.`);
      } else if (issue.includes('purpose')) {
        recommendations.push(`Your funding purpose "${dealData.fundingPurpose}" may not align with some lender specialties. Fix-and-flip lenders focus on quick turnarounds (6-18 months), while DSCR lenders prefer buy-and-hold rental properties. Ensure your exit strategy matches the lender type you're targeting.`);
      }
    });

  // Add most common strengths
  Array.from(commonStrengths.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([strength]) => dealStrengths.push(strength));

  // Add unique weaknesses
  Array.from(commonIssues.entries())
    .slice(0, 3)
    .forEach(([issue]) => dealWeaknesses.push(issue));

  if (qualifyingLenders.length === 0) {
    recommendations.unshift('Focus on improving deal structure to qualify with more lenders');
  }

  if (qualifyingLenders.length > 3) {
    dealStrengths.unshift('Strong deal with multiple lender options');
  }

  return {
    overallScore,
    qualifyingLenders,
    bestMatch,
    recommendations: recommendations.slice(0, 4),
    dealStrengths: dealStrengths.slice(0, 4),
    dealWeaknesses: dealWeaknesses.slice(0, 3)
  };
}