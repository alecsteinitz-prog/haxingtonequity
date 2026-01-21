import { LearningPath, GlossaryTerm } from './types';

export const learningPaths: LearningPath[] = [
  {
    id: 'investor',
    name: 'Real Estate Investor',
    icon: '🏘️',
    description: 'Learn about private lending, DSCR loans, and funding strategies for building your portfolio.',
    color: 'hsl(var(--primary))',
    modules: [
      {
        id: 'inv-1',
        title: 'Understanding Private Lending',
        description: 'Learn how private lenders operate and when to use them.',
        duration: '5 min',
        relatedTerms: ['private-lending', 'hard-money'],
        content: [
          { type: 'text', content: 'Private lending is a form of financing where individuals or companies lend money to real estate investors, typically secured by the property itself.' },
          { type: 'tip', content: 'Private lenders focus more on the deal than your credit score, making them ideal for investors with less-than-perfect credit.' },
          { type: 'example', content: 'An investor finds a property worth $200,000 selling for $120,000. A private lender provides $100,000 at 12% interest for 12 months, allowing the investor to flip the property for profit.' },
        ]
      },
      {
        id: 'inv-2',
        title: 'DSCR Loans Explained',
        description: 'Master Debt Service Coverage Ratio loans for rental properties.',
        duration: '7 min',
        relatedTerms: ['dscr', 'rental-income', 'ltv'],
        content: [
          { type: 'text', content: 'DSCR (Debt Service Coverage Ratio) loans are designed for investment properties. They qualify you based on the property\'s rental income rather than your personal income.' },
          { type: 'tip', content: 'Most lenders require a minimum DSCR of 1.0-1.25, meaning the rental income should cover 100-125% of the mortgage payment.' },
          { type: 'example', content: 'Property rents for $2,500/month. Monthly mortgage payment is $2,000. DSCR = $2,500 ÷ $2,000 = 1.25. This property qualifies!' },
        ]
      },
      {
        id: 'inv-3',
        title: 'Fix & Flip Financing',
        description: 'Explore funding options for renovation projects.',
        duration: '6 min',
        relatedTerms: ['arv', 'hard-money', 'bridge-loan'],
        content: [
          { type: 'text', content: 'Fix and flip financing typically comes through hard money or bridge loans. These short-term loans (6-18 months) are based on the property\'s After Repair Value (ARV).' },
          { type: 'tip', content: 'Most hard money lenders will fund up to 70-75% of the ARV, covering both purchase price and renovation costs.' },
          { type: 'example', content: 'Purchase price: $150K, Rehab: $50K, ARV: $280K. Lender offers 70% of ARV = $196K, covering your $200K total project cost almost entirely.' },
        ]
      },
      {
        id: 'inv-4',
        title: 'Building Lender Relationships',
        description: 'Learn how to establish trust with lenders for better terms.',
        duration: '5 min',
        relatedTerms: ['equity-partner', 'ltv'],
        content: [
          { type: 'text', content: 'Strong lender relationships lead to better rates, faster closings, and higher leverage. Communication and track record are key.' },
          { type: 'tip', content: 'Always provide lenders with detailed scope of work, accurate ARV estimates, and clear exit strategies.' },
          { type: 'example', content: 'After successfully completing 3 deals with a private lender, they increased loan-to-value from 70% to 80% and reduced the rate from 12% to 10%.' },
        ]
      },
    ]
  },
  {
    id: 'developer',
    name: 'Property Developer',
    icon: '🧾',
    description: 'Master construction loans, project financing, and managing capital for development projects.',
    color: 'hsl(var(--accent))',
    modules: [
      {
        id: 'dev-1',
        title: 'Construction Loan Basics',
        description: 'Understand how construction financing works.',
        duration: '8 min',
        relatedTerms: ['construction-loan', 'draw-schedule', 'ltc'],
        content: [
          { type: 'text', content: 'Construction loans are short-term financing used to build or substantially renovate properties. Funds are disbursed in "draws" as construction milestones are completed.' },
          { type: 'tip', content: 'Lenders typically require 20-25% down payment and release funds after inspecting completed work phases.' },
          { type: 'example', content: 'A $500K construction loan with 5 draws: Foundation (20%), Framing (25%), Mechanicals (20%), Interior (20%), Final (15%).' },
        ]
      },
      {
        id: 'dev-2',
        title: 'Project Cost Analysis',
        description: 'Learn to accurately estimate and present project costs.',
        duration: '7 min',
        relatedTerms: ['arv', 'ltc', 'contingency'],
        content: [
          { type: 'text', content: 'Accurate cost estimation is critical for securing financing. Include hard costs (materials, labor), soft costs (permits, design), and contingency (typically 10-15%).' },
          { type: 'tip', content: 'Always get 3 contractor bids and use the middle estimate for your projections. Lenders appreciate conservative numbers.' },
          { type: 'example', content: 'Land: $100K, Hard costs: $300K, Soft costs: $50K, Contingency: $45K. Total project: $495K. Target ARV: $750K for healthy margins.' },
        ]
      },
      {
        id: 'dev-3',
        title: 'Managing Draw Schedules',
        description: 'Master the art of construction loan disbursements.',
        duration: '6 min',
        relatedTerms: ['draw-schedule', 'construction-loan'],
        content: [
          { type: 'text', content: 'Draw schedules outline when and how loan funds are released. Each draw requires inspection and documentation of completed work.' },
          { type: 'tip', content: 'Keep detailed photo documentation and receipts for every phase. This speeds up draw approvals significantly.' },
          { type: 'example', content: 'Submit draw request with: photos, invoices, lien waivers from subs. Inspector verifies work. Funds released within 3-5 business days.' },
        ]
      },
      {
        id: 'dev-4',
        title: 'Exit Strategies for Developers',
        description: 'Plan your profitable exit before breaking ground.',
        duration: '5 min',
        relatedTerms: ['arv', 'refinance', 'equity-partner'],
        content: [
          { type: 'text', content: 'Every development project needs a clear exit strategy: sell upon completion, refinance into permanent financing, or hold as rental portfolio.' },
          { type: 'tip', content: 'Have a backup exit strategy. If the market shifts, can you rent instead of sell? Run both scenarios before starting.' },
          { type: 'example', content: 'Primary exit: Sell 4 townhomes at $350K each = $1.4M. Backup: Rent each for $2,200/month and refinance into DSCR loan.' },
        ]
      },
    ]
  },
  {
    id: 'first-time',
    name: 'First-Time Borrower',
    icon: '💼',
    description: 'Learn about credit requirements, loan documentation, and what lenders expect from new borrowers.',
    color: 'hsl(var(--secondary))',
    modules: [
      {
        id: 'ftb-1',
        title: 'Credit Score Essentials',
        description: 'Understand how credit impacts your loan options.',
        duration: '5 min',
        relatedTerms: ['credit-score', 'dscr'],
        content: [
          { type: 'text', content: 'Your credit score affects loan rates, terms, and approval odds. Most investment property loans require 620+ for conventional, but hard money may accept lower.' },
          { type: 'tip', content: 'Check your credit 3-6 months before applying. Dispute errors and pay down credit card balances to boost your score quickly.' },
          { type: 'example', content: '680 credit score: 8% rate on investment property. 740 credit score: 6.5% rate. On a $300K loan, that\'s $375/month savings!' },
        ]
      },
      {
        id: 'ftb-2',
        title: 'Documentation Checklist',
        description: 'Prepare the paperwork lenders require.',
        duration: '6 min',
        relatedTerms: ['ltv', 'dscr'],
        content: [
          { type: 'text', content: 'Standard loan documentation includes: 2 years tax returns, bank statements, ID, purchase contract, property details, and proof of funds for down payment.' },
          { type: 'tip', content: 'Create a "loan file" folder with digital copies of all documents. Being organized speeds up the process dramatically.' },
          { type: 'example', content: 'Borrower had documents ready on day 1. Loan closed in 14 days. Another borrower took 3 weeks just to gather paperwork—missed the deal.' },
        ]
      },
      {
        id: 'ftb-3',
        title: 'Understanding Loan Terms',
        description: 'Decode the language lenders use.',
        duration: '7 min',
        relatedTerms: ['ltv', 'arv', 'dscr', 'hard-money'],
        content: [
          { type: 'text', content: 'Key terms to know: LTV (Loan-to-Value), APR (Annual Percentage Rate), Points (upfront fees), Prepayment Penalty, and Amortization Schedule.' },
          { type: 'tip', content: 'Always calculate the total cost of the loan, not just the interest rate. A lower rate with 3 points might cost more than higher rate with 1 point.' },
          { type: 'example', content: '$200K loan at 10% + 2 points ($4K) for 12 months = $24K total cost. Same loan at 11% + 0 points = $22K total. Higher rate was cheaper!' },
        ]
      },
      {
        id: 'ftb-4',
        title: 'Making Your First Pitch',
        description: 'Present your deal to lenders with confidence.',
        duration: '5 min',
        relatedTerms: ['arv', 'equity-partner', 'private-lending'],
        content: [
          { type: 'text', content: 'A strong loan pitch includes: property details, purchase price, renovation scope, ARV with comps, timeline, budget, and your exit strategy.' },
          { type: 'tip', content: 'Lead with the numbers. Lenders want to see you understand the deal\'s profitability and risks before they consider your experience.' },
          { type: 'example', content: '"I\'m acquiring a 3/2 SFH for $150K. $40K rehab, 90-day timeline. ARV $250K supported by 3 comps. Exit: sell or refi into DSCR at 75% LTV."' },
        ]
      },
    ]
  },
];

export const fundingGlossary: GlossaryTerm[] = [
  {
    id: 'dscr',
    term: 'DSCR',
    definition: 'Debt Service Coverage Ratio — A measure of how well your rental income covers your loan payments. Calculated by dividing monthly rental income by monthly mortgage payment.',
    example: 'A DSCR of 1.25 means your property earns 25% more income than the loan payment. If rent is $2,500 and mortgage is $2,000, DSCR = 1.25.',
    category: 'Loan Metrics',
    relatedLessons: ['inv-2', 'ftb-3']
  },
  {
    id: 'arv',
    term: 'ARV',
    definition: 'After Repair Value — The estimated market value of a property after all renovations and improvements are completed.',
    example: 'You buy a fixer-upper for $150K, invest $50K in repairs. Comparable renovated homes sell for $280K. Your ARV is $280K.',
    category: 'Property Valuation',
    relatedLessons: ['inv-3', 'dev-2']
  },
  {
    id: 'ltv',
    term: 'LTV',
    definition: 'Loan-to-Value Ratio — The percentage of the property\'s value that the lender is willing to finance. Lower LTV means more equity required from you.',
    example: 'Property value: $200K. Lender offers 75% LTV = $150K loan. You need $50K as down payment.',
    category: 'Loan Metrics',
    relatedLessons: ['inv-4', 'ftb-3']
  },
  {
    id: 'ltc',
    term: 'LTC',
    definition: 'Loan-to-Cost Ratio — The percentage of total project cost (purchase + renovation) that a lender will finance.',
    example: 'Purchase: $100K + Rehab: $50K = $150K total cost. 80% LTC = $120K loan.',
    category: 'Loan Metrics',
    relatedLessons: ['dev-1', 'dev-2']
  },
  {
    id: 'bridge-loan',
    term: 'Bridge Loan',
    definition: 'A short-term loan (typically 6-24 months) used to "bridge" the gap between buying a property and securing long-term financing or selling.',
    example: 'You need to close on a new property before selling your current one. A bridge loan provides funds for 12 months until your sale closes.',
    category: 'Loan Types',
    relatedLessons: ['inv-3']
  },
  {
    id: 'hard-money',
    term: 'Hard Money Loan',
    definition: 'A short-term, asset-based loan from private lenders. Higher interest rates but faster approval and more flexible qualification.',
    example: 'Traditional bank declines your loan. Hard money lender approves based on the property\'s value and your exit strategy, closing in 7 days.',
    category: 'Loan Types',
    relatedLessons: ['inv-1', 'inv-3', 'ftb-3']
  },
  {
    id: 'equity-partner',
    term: 'Equity Partner',
    definition: 'An investor who provides capital in exchange for a share of ownership and profits rather than interest payments.',
    example: 'Partner invests $100K for 40% equity. Project profits $150K. Partner receives $60K (40%). You keep $90K (60%).',
    category: 'Funding Sources',
    relatedLessons: ['inv-4', 'dev-4', 'ftb-4']
  },
  {
    id: 'private-lending',
    term: 'Private Lending',
    definition: 'Loans from individuals or private companies rather than banks. More flexible terms but typically higher interest rates.',
    example: 'A local investor lends you $200K at 10% interest for 12 months, secured by the property. Faster and more flexible than bank financing.',
    category: 'Funding Sources',
    relatedLessons: ['inv-1', 'ftb-4']
  },
  {
    id: 'construction-loan',
    term: 'Construction Loan',
    definition: 'Short-term financing for building or major renovations. Funds are released in stages (draws) as construction progresses.',
    example: 'Building a duplex for $400K. Lender releases funds: 20% at foundation, 30% at framing, 30% at finish, 20% at completion.',
    category: 'Loan Types',
    relatedLessons: ['dev-1', 'dev-3']
  },
  {
    id: 'draw-schedule',
    term: 'Draw Schedule',
    definition: 'A timeline outlining when portions of a construction loan are released based on completed work milestones.',
    example: 'Draw 1: $50K after foundation. Draw 2: $75K after framing. Draw 3: $50K after mechanicals. Draw 4: $25K at completion.',
    category: 'Construction',
    relatedLessons: ['dev-1', 'dev-3']
  },
  {
    id: 'contingency',
    term: 'Contingency',
    definition: 'Extra budget (typically 10-20%) set aside for unexpected costs or changes during a project.',
    example: '$200K renovation budget + 15% contingency = $30K extra for surprises like hidden water damage or material price increases.',
    category: 'Project Planning',
    relatedLessons: ['dev-2']
  },
  {
    id: 'refinance',
    term: 'Refinance',
    definition: 'Replacing your current loan with a new one, typically to get better terms, lower rates, or pull out equity.',
    example: 'After renovating, property appraised at $300K. Refinance at 75% LTV = $225K new loan. Pay off original $150K loan, pocket $75K.',
    category: 'Exit Strategies',
    relatedLessons: ['dev-4']
  },
  {
    id: 'rental-income',
    term: 'Rental Income',
    definition: 'The gross monthly or annual income generated from renting out a property to tenants.',
    example: 'Duplex rents: Unit A $1,200 + Unit B $1,100 = $2,300 gross monthly rental income.',
    category: 'Income',
    relatedLessons: ['inv-2']
  },
  {
    id: 'credit-score',
    term: 'Credit Score',
    definition: 'A numerical rating (300-850) representing your creditworthiness based on credit history, payment behavior, and debt levels.',
    example: '750+ = Excellent rates. 700-749 = Good rates. 650-699 = Higher rates. Below 650 = May need hard money or private lending.',
    category: 'Borrower Qualification',
    relatedLessons: ['ftb-1']
  },
];
