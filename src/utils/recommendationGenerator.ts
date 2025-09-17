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
  ownOtherProperties: string | boolean;
  currentValue: string;
  repairsNeeded: string | boolean;
  repairLevel: string;
  rehabCosts: string;
  arv: string;
  closingDate: Date | null;
  moneyPlan: string;
  pastDeals: string | boolean;
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

export function generateRecommendations(formData: FormData, scores: ScoreBreakdown): string[] {
  const recommendations: string[] = [];
  
  // Identify the weakest areas (below 70)
  const weakAreas = [
    { name: 'dealStructure', score: scores.dealStructure },
    { name: 'financialReadiness', score: scores.financialReadiness },
    { name: 'experienceLevel', score: scores.experienceLevel },
    { name: 'propertyAnalysis', score: scores.propertyAnalysis }
  ].filter(area => area.score < 70).sort((a, b) => a.score - b.score);

  // Generate specific recommendations for each weak area
  for (const area of weakAreas.slice(0, 4)) {
    const recommendation = generateAreaSpecificRecommendation(area.name, formData, scores);
    if (recommendation) {
      recommendations.push(recommendation);
    }
  }

  return recommendations;
}


function generateAreaSpecificRecommendation(area: string, formData: FormData, scores: ScoreBreakdown): string {
  switch (area) {
    case 'dealStructure':
      return generateDealStructureRecommendation(formData, scores.dealStructure);
    case 'financialReadiness':
      return generateFinancialRecommendation(formData, scores.financialReadiness);
    case 'experienceLevel':
      return generateExperienceRecommendation(formData, scores.experienceLevel);
    case 'propertyAnalysis':
      return generatePropertyRecommendation(formData, scores.propertyAnalysis);
    default:
      return '';
  }
}

function generateDealStructureRecommendation(formData: FormData, score: number): string {
  const loanAmount = parseNumericValue(formData.fundingAmount);
  const currentValue = parseNumericValue(formData.currentValue);
  
  if (score < 70) {
    if (currentValue > 0) {
      const ltv = (loanAmount / currentValue) * 100;
      if (ltv > 80) {
        const targetLoanAmount = (currentValue * 0.75).toLocaleString();
        const additionalDownPayment = (loanAmount - (currentValue * 0.75)).toLocaleString();
        return `Your loan-to-value ratio is ${ltv.toFixed(1)}% (requesting $${loanAmount.toLocaleString()} on a $${currentValue.toLocaleString()} property). To qualify with more lenders, reduce your loan request to approximately $${targetLoanAmount} or increase your down payment by $${additionalDownPayment}.`;
      }
    }
    
    if (loanAmount < 75000) {
      return `Your requested loan amount of $${loanAmount.toLocaleString()} is below the minimum for many lenders (typically $75K-$100K). Consider combining multiple properties or finding a larger deal to meet common lending thresholds.`;
    }
    
    if (loanAmount > 2000000) {
      return `Your requested loan amount of $${loanAmount.toLocaleString()} exceeds typical hard money lender limits. Consider portfolio lenders, breaking the project into phases, or finding equity partners to reduce the loan amount needed.`;
    }
  }

  return `Your deal structure shows room for improvement. Focus on optimizing your loan-to-value ratio and ensuring your loan amount aligns with typical lender ranges ($75K-$2M for most programs).`;
}

function generateFinancialRecommendation(formData: FormData, score: number): string {
  if (score < 70) {
    const income = parseNumericValue(formData.annualIncome);
    const bankBalance = parseNumericValue(formData.bankBalance);
    
    if (formData.creditScore === 'below-640' || formData.creditScore === 'above-640') {
      return `Your credit score range (${formData.creditScore.replace('-', ' ')}) may limit your options. Focus on improving your credit by paying down existing debts below 30% utilization, making all payments on time, and avoiding new credit inquiries. Most lenders prefer 680+ FICO scores for better rates.`;
    }
    
    if (income < 75000) {
      return `Your annual income of $${income.toLocaleString()} may require additional documentation or co-borrower support. Consider adding income sources, providing tax returns for self-employed income, or partnering with someone who has stronger income documentation.`;
    }
    
    if (bankBalance < 25000) {
      return `Your bank balance of $${bankBalance.toLocaleString()} may not demonstrate sufficient reserves. Most lenders prefer to see 3-6 months of property payments in reserves (typically $15K-$50K). Consider building cash reserves or documenting additional liquid assets.`;
    }
    
    if (formData.financialAssets.length <= 1 || formData.financialAssets.includes('None')) {
      return `Your financial assets appear limited. Consider documenting retirement accounts (401K, IRA), investment accounts, or other assets that demonstrate financial stability and ability to cover unexpected costs.`;
    }
  }

  return `Your financial profile needs strengthening. Focus on improving credit score, building cash reserves, and documenting all income sources and assets to present the strongest financial picture to lenders.`;
}

function generateExperienceRecommendation(formData: FormData, score: number): string {
  if (score < 70) {
    const hasPastDeals = formData.pastDeals === 'Yes' || formData.pastDeals === 'yes' || formData.pastDeals === true;
    const ownsOtherProperties = formData.ownOtherProperties === 'Yes' || formData.ownOtherProperties === 'yes' || formData.ownOtherProperties === true;
    
    if (!hasPastDeals && !ownsOtherProperties) {
      return `As a first-time real estate investor (no past deals, no current properties), consider: 1) Partnering with an experienced investor who has completed 5+ deals, 2) Starting with a smaller, less complex property to build track record, 3) Documenting any construction, renovation, or property management experience, or 4) Exploring owner-occupied financing options first.`;
    }
    
    if (!hasPastDeals && ownsOtherProperties) {
      return `While you own other properties, having no completed investment deals may concern some lenders. Consider documenting your property management experience, any improvements you've made to existing properties, or partner with someone who has active deal experience.`;
    }
    
    if (hasPastDeals && !ownsOtherProperties) {
      return `Your past deal experience is valuable, but not currently owning investment properties may raise questions about your ongoing commitment. Consider explaining your investment strategy and timeline, or highlighting successful exits from previous deals.`;
    }
    
    if (formData.propertiesExperience === '1-3' || formData.propertiesExperience === '') {
      return `Your limited transaction history (${formData.propertiesExperience || 'unspecified'} properties) may restrict lending options. Focus on smaller deals to build track record, document any property-related experience, and consider partnership with more experienced investors for larger projects.`;
    }
  }

  return `Your experience level could be stronger for this type of deal. Focus on building documented real estate experience through smaller transactions or strategic partnerships.`;
}

function generatePropertyRecommendation(formData: FormData, score: number): string {
  const loanAmount = parseNumericValue(formData.fundingAmount);
  const currentValue = parseNumericValue(formData.currentValue);
  const rehabCosts = parseNumericValue(formData.rehabCosts);
  const arv = parseNumericValue(formData.arv);
  const needsRepairs = formData.repairsNeeded === 'Yes' || formData.repairsNeeded === 'yes' || formData.repairsNeeded === true;
  
  if (score < 70) {
    if (currentValue > 0) {
      const ltv = (loanAmount / currentValue) * 100;
      if (ltv > 80) {
        return `Your property's loan-to-value ratio is ${ltv.toFixed(1)}% ($${loanAmount.toLocaleString()} loan on $${currentValue.toLocaleString()} property). Most lenders prefer 75-80% LTV. Increase your down payment or find a higher-value property to improve this ratio.`;
      }
    }
    
    if (needsRepairs && rehabCosts > 0 && currentValue > 0) {
      const repairRatio = (rehabCosts / currentValue) * 100;
      if (repairRatio > 25) {
        return `Your repair costs ($${rehabCosts.toLocaleString()}) represent ${repairRatio.toFixed(1)}% of the property value. Most lenders prefer rehab costs under 25% of property value. Consider properties requiring less extensive renovation or get detailed contractor estimates to justify the scope.`;
      }
    }
    
    if (formData.fundingPurpose.toLowerCase().includes('flip') && arv > 0) {
      const loanToArv = (loanAmount / arv) * 100;
      if (loanToArv > 75) {
        return `Your loan-to-ARV ratio is ${loanToArv.toFixed(1)}% ($${loanAmount.toLocaleString()} loan on $${arv.toLocaleString()} ARV). Most lenders limit this to 70-75%. Either reduce your loan request or get a professional appraisal to support a higher ARV estimate.`;
      }
    }
    
    const missingInfo = [];
    if (!formData.propertyAddress.trim()) missingInfo.push('property address');
    if (!formData.currentValue.trim()) missingInfo.push('current property value');
    if (!formData.propertyInfo.trim()) missingInfo.push('property details');
    
    if (missingInfo.length > 0) {
      return `Your property analysis is incomplete. Please provide: ${missingInfo.join(', ')}. Complete property documentation helps lenders assess risk and may improve your qualification chances.`;
    }
  }

  return `Your property analysis needs improvement. Focus on optimizing loan-to-value ratios, providing complete property documentation, and ensuring repair cost estimates are realistic and well-documented.`;
}

export function generateSuccessMessages(formData: FormData, scores: ScoreBreakdown): string[] {
  const messages: string[] = [];
  
  if (scores.overall >= 80) {
    if (scores.financialReadiness >= 85) {
      messages.push(`Your strong financial profile (${formData.creditScore.replace('-', ' ')} credit, $${parseNumericValue(formData.annualIncome).toLocaleString()} income) positions you well with most lenders.`);
    }
    
    if (scores.experienceLevel >= 80) {
      const experience = formData.propertiesExperience || 'some';
      const hasPastDeals = formData.pastDeals === 'Yes' || formData.pastDeals === 'yes' || formData.pastDeals === true;
      messages.push(`Your real estate experience (${experience} properties, ${hasPastDeals ? 'with' : 'without'} past deals) demonstrates capability to execute this investment.`);
    }
    
    if (scores.dealStructure >= 85) {
      messages.push(`Your deal structure is solid with appropriate loan amount and conservative leverage ratios.`);
    }
    
    if (scores.propertyAnalysis >= 85) {
      messages.push(`Your property analysis shows strong fundamentals with realistic valuation and repair estimates.`);
    }
  }
  
  return messages.slice(0, 4);
}