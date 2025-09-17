interface FormData {
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
  closingDate: Date | null;
  moneyPlan: string;
  pastDeals: string;
  lastDealProfit: string;
  goodDeal: string;
}

interface ScoreBreakdown {
  dealStructure: number;
  financialReadiness: number;
  experienceLevel: number;
  propertyAnalysis: number;
  overall: number;
}

function parseNumericValue(value: string): number {
  const cleanValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleanValue) || 0;
}

function getCreditScorePoints(creditRange: string): number {
  switch (creditRange) {
    case 'above-720': return 100;
    case 'above-680': return 85;
    case 'above-640': return 70;
    case 'below-640': return 40;
    default: return 60;
  }
}

export function calculateDealStructureScore(formData: FormData): number {
  let score = 0;
  let maxPoints = 100;

  // Loan Amount Appropriateness (30 points)
  const loanAmount = parseNumericValue(formData.fundingAmount);
  if (loanAmount >= 75000 && loanAmount <= 2000000) {
    score += 30; // Optimal range
  } else if (loanAmount >= 50000 && loanAmount <= 5000000) {
    score += 20; // Acceptable range
  } else if (loanAmount > 0) {
    score += 10; // Outside optimal but valid
  }

  // LTV Ratio Analysis (40 points)
  const currentValue = parseNumericValue(formData.currentValue);
  if (currentValue > 0 && loanAmount > 0) {
    const ltv = (loanAmount / currentValue) * 100;
    if (ltv <= 70) score += 40;      // Excellent LTV
    else if (ltv <= 75) score += 35; // Very good LTV
    else if (ltv <= 80) score += 30; // Good LTV
    else if (ltv <= 85) score += 20; // Acceptable LTV
    else if (ltv <= 90) score += 10; // High LTV
    else score += 5;                 // Very high LTV
  } else {
    score += 15; // Partial credit for incomplete data
  }

  // Purpose and Property Type Alignment (30 points)
  if (formData.fundingPurpose === 'purchase' || formData.fundingPurpose === 'refinance') {
    score += 15; // Clear purpose
  }
  if (formData.propertyType === 'residential' || formData.propertyType === 'commercial') {
    score += 15; // Standard investment types
  }

  return Math.min(100, score);
}

export function calculateFinancialReadinessScore(formData: FormData): number {
  let score = 0;

  // Credit Score (30 points)
  const creditPoints = getCreditScorePoints(formData.creditScore);
  score += (creditPoints / 100) * 30;

  // Annual Income (25 points)
  const income = parseNumericValue(formData.annualIncome);
  if (income >= 150000) score += 25;
  else if (income >= 100000) score += 20;
  else if (income >= 75000) score += 15;
  else if (income >= 50000) score += 10;
  else if (income > 0) score += 5;

  // Bank Balance (25 points)
  const bankBalance = parseNumericValue(formData.bankBalance);
  if (bankBalance >= 100000) score += 25;
  else if (bankBalance >= 50000) score += 20;
  else if (bankBalance >= 25000) score += 15;
  else if (bankBalance >= 10000) score += 10;
  else if (bankBalance > 0) score += 5;

  // Financial Assets Diversity (20 points)
  const assetsCount = formData.financialAssets.filter(asset => asset !== 'None').length;
  if (assetsCount >= 3) score += 20;
  else if (assetsCount >= 2) score += 15;
  else if (assetsCount >= 1) score += 10;
  else score += 5;

  return Math.min(100, Math.round(score));
}

export function calculateExperienceLevelScore(formData: FormData): number {
  let score = 0;

  // Past Real Estate Deals (40 points)
  if (formData.pastDeals === 'Yes') {
    score += 40;
  } else {
    score += 5; // New investor base
  }

  // Property Ownership Experience (30 points)
  if (formData.ownOtherProperties === 'Yes') {
    score += 30;
  } else {
    score += 10; // First-time property owner
  }

  // Transaction Volume Experience (30 points)
  switch (formData.propertiesExperience) {
    case '21+': score += 30; break;
    case '11-20': score += 25; break;
    case '4-10': score += 20; break;
    case '1-3': score += 15; break;
    default: score += 5; break;
  }

  return Math.min(100, score);
}

export function calculatePropertyAnalysisScore(formData: FormData): number {
  let score = 0;

  // LTV Analysis (30 points)
  const loanAmount = parseNumericValue(formData.fundingAmount);
  const currentValue = parseNumericValue(formData.currentValue);
  if (currentValue > 0) {
    const ltv = (loanAmount / currentValue) * 100;
    if (ltv <= 70) score += 30;
    else if (ltv <= 75) score += 25;
    else if (ltv <= 80) score += 20;
    else if (ltv <= 85) score += 15;
    else if (ltv <= 90) score += 10;
    else score += 5;
  } else {
    score += 10; // Incomplete data
  }

  // ARV Analysis for Fix & Flip (25 points)
  if (formData.fundingPurpose.toLowerCase().includes('flip') || formData.repairsNeeded === 'Yes') {
    const arv = parseNumericValue(formData.arv);
    if (arv > 0) {
      const loanToArv = (loanAmount / arv) * 100;
      if (loanToArv <= 70) score += 25;
      else if (loanToArv <= 75) score += 20;
      else if (loanToArv <= 80) score += 15;
      else score += 10;
    } else {
      score += 5; // No ARV provided for flip
    }
  } else {
    score += 20; // Not applicable, give most points
  }

  // Repair Cost Analysis (25 points)
  if (formData.repairsNeeded === 'Yes') {
    const rehabCosts = parseNumericValue(formData.rehabCosts);
    if (currentValue > 0 && rehabCosts > 0) {
      const repairRatio = (rehabCosts / currentValue) * 100;
      if (repairRatio <= 15) score += 25;
      else if (repairRatio <= 25) score += 20;
      else if (repairRatio <= 35) score += 15;
      else score += 10;
    } else {
      score += 10; // Incomplete repair data
    }
  } else {
    score += 25; // No repairs needed
  }

  // Property Details Completeness (20 points)
  let completenessScore = 0;
  if (formData.propertyAddress.trim()) completenessScore += 5;
  if (formData.propertyInfo.trim()) completenessScore += 5;
  if (formData.propertyDetails.trim()) completenessScore += 5;
  if (formData.currentValue.trim()) completenessScore += 5;
  score += completenessScore;

  return Math.min(100, score);
}

export function calculateOverallScore(breakdown: Omit<ScoreBreakdown, 'overall'>): number {
  // Weighted average based on importance for lending decisions
  const weights = {
    dealStructure: 0.25,     // 25% - Deal fundamentals
    financialReadiness: 0.35, // 35% - Most important for lenders
    experienceLevel: 0.20,    // 20% - Important but can be overcome
    propertyAnalysis: 0.20    // 20% - Property-specific factors
  };

  const weightedScore = 
    (breakdown.dealStructure * weights.dealStructure) +
    (breakdown.financialReadiness * weights.financialReadiness) +
    (breakdown.experienceLevel * weights.experienceLevel) +
    (breakdown.propertyAnalysis * weights.propertyAnalysis);

  return Math.round(weightedScore);
}

export function calculateAllScores(formData: FormData): ScoreBreakdown {
  const dealStructure = calculateDealStructureScore(formData);
  const financialReadiness = calculateFinancialReadinessScore(formData);
  const experienceLevel = calculateExperienceLevelScore(formData);
  const propertyAnalysis = calculatePropertyAnalysisScore(formData);
  
  const overall = calculateOverallScore({
    dealStructure,
    financialReadiness,
    experienceLevel,
    propertyAnalysis
  });

  return {
    dealStructure,
    financialReadiness,
    experienceLevel,
    propertyAnalysis,
    overall
  };
}