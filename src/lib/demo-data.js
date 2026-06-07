export const demoQualification = {
  status: 'accept',
  message: "Your problem statement describes a clear operational challenge. Let's explore it in more detail.",
  nextStep: 'discovery',
}

// discoveryFlow[i] is the response when questionCount is i
export const demoDiscoveryFlow = [
  {
    status: 'question',
    message: 'How many suppliers currently send you product data, and roughly how many product updates does your team process each month?',
    problemBrief: null,
  },
  {
    status: 'question',
    message: 'What formats do your suppliers use to send product data — for example, Excel files, CSVs, proprietary exports, or something else?',
    problemBrief: null,
  },
  {
    status: 'question',
    message: 'What does the normalization process look like today — is it entirely manual, partially automated, or a mix?',
    problemBrief: null,
  },
  {
    status: 'question',
    message: "How long does it typically take from receiving a supplier's data to having the products available on your platform?",
    problemBrief: null,
  },
  {
    status: 'brief_ready',
    problemBrief: {
      problem: 'The organization receives product catalog data from more than 50 suppliers in inconsistent formats and must manually normalize it before it can be imported into the platform.',
      businessImpact: 'New products take 3–5 business days to list after supplier data is received. Normalization errors cause downstream issues in inventory and pricing. Approximately 300 hours per month are spent on the process.',
      currentState: 'A small operations team uses spreadsheet templates, manual copy-paste, and some custom scripts to normalize supplier feeds. Coverage is partial and the process is not well-documented.',
      desiredOutcome: 'Reduce normalization time and errors significantly to enable faster time-to-market for new products.',
      scale: '50+ active suppliers, approximately 10,000 product updates per month',
      constraints: ['Limited engineering resources', 'Must integrate with existing ERP and e-commerce platform'],
      stakeholders: ['Operations team', 'Merchandising', 'IT/Engineering'],
      priorAttempts: ['Custom scripts for some suppliers — partial coverage only'],
      successMeasurement: 'At least 50% reduction in normalization time and a meaningful reduction in import errors',
      knownUnknowns: ['Exact cost of current normalization process', 'Supplier willingness to adopt standard data formats'],
      keyAssumptions: ['The problem is primarily a data and tooling challenge, not a supplier relationship issue'],
    },
  },
]

export const demoProblemBrief = {
  problemStatement:
    'The organization currently receives product catalog data from more than 50 suppliers in a variety of inconsistent formats, including Excel spreadsheets, CSV files, and proprietary data exports. Before this data can be imported into the internal platform, a small operations team must manually normalize it — aligning field names, units, product categories, and attribute structures to internal requirements. This process requires an estimated 300 hours of labor per month and introduces an average delay of three to five business days before new products can be listed for sale. Normalization errors create downstream problems in inventory management and product pricing. The organization seeks a solution that reduces normalization time and error rates and enables faster product availability, without requiring significant changes from suppliers or replacement of existing core systems.',
}

export const demoRootCauseAnalysis = {
  primaryRootCause: {
    category: 'DATA_GAP',
    rationale:
      'The core driver is that supplier product data arrives in inconsistent, non-standardized formats with no common schema. This forces labor-intensive manual remediation before the data can be used and is the primary cause of delay and error.',
  },
  contributingFactors: [
    {
      category: 'TOOLING_GAP',
      rationale:
        'The current tooling — spreadsheet templates and ad hoc scripts — provides only partial automation coverage and has not scaled to match supplier volume or data variability.',
    },
  ],
  alternativeCategoriesConsidered: [
    {
      category: 'PROCESS_GAP',
      reasonRejected:
        'While the process has grown informally, the primary constraint is inconsistent input data, not workflow design. Better process documentation would help marginally but would not address the root cause.',
    },
  ],
  confidence: 'HIGH',
  evidence: [
    'Suppliers provide data in multiple incompatible formats (Excel, CSV, proprietary exports)',
    'Current normalization relies primarily on manual effort with partial scripting coverage',
    'Downstream inventory and pricing errors suggest data quality issues at the normalization step',
  ],
  assumptions: [
    'Suppliers are unlikely to standardize their export formats without significant incentive or tooling support',
  ],
}

export const demoResearchDecision = {
  researchRequired: true,
  rationale:
    'This problem type has an established commercial solution market (Product Information Management and data integration tools). Research is likely to surface relevant vendors, solution patterns, and failure patterns that will materially improve the strategic analysis and recommendation.',
  researchObjectives: [
    'Identify common solution patterns for multi-supplier data normalization',
    'Assess commercial market maturity for PIM and data transformation tools',
    'Identify up to three relevant vendors',
    'Understand common failure patterns in similar initiatives',
  ],
  priorityAreas: ['Commercial software landscape', 'AI-enabled data transformation capabilities', 'Build vs buy considerations'],
}

export const demoExternalResearch = {
  solutionPatterns: [
    'Commercial Product Information Management (PIM) software with supplier onboarding modules',
    'ETL / data integration platforms with configurable transformation rules',
    'AI-enabled data mapping and transformation tools',
    'Supplier portal solutions that enforce standard formats at source',
    'Custom data pipeline development',
  ],
  marketMaturityEvidence: [
    'The PIM market is well-established with multiple enterprise and mid-market vendors',
    'Gartner and Forrester maintain active coverage of the PIM/MDM space',
    'Products like Akeneo, Salsify, and Syndigo have been commercially available for 10+ years',
    'Mid-market SaaS PIM options have expanded in recent years',
    'AI-assisted attribute mapping is increasingly included in newer PIM product releases',
  ],
  vendors: [
    {
      name: 'Akeneo',
      relevance: 'Open-source and SaaS PIM platform with supplier onboarding and data normalization capabilities, widely used in retail and e-commerce.',
      marketPosition: 'Established mid-market to enterprise PIM leader',
      relativeCost: 'Medium',
      costConsiderations: ['SaaS subscription fees', 'Implementation and configuration services', 'Potential SI partner costs', 'Staff training'],
      strengths: ['Strong supplier portal capabilities', 'Active open-source community', 'Broad e-commerce platform integrations'],
      limitations: ['Mid-market tier may require significant configuration effort', 'Full feature set may exceed requirements for smaller teams'],
    },
    {
      name: 'Salsify',
      relevance: 'Product Experience Management platform with strong retail and supplier network features focused on omnichannel product content.',
      marketPosition: 'Enterprise-focused SaaS provider',
      relativeCost: 'High',
      costConsiderations: ['Premium SaaS pricing', 'Per-user or per-product licensing', 'Professional services for implementation', 'Ongoing support contracts'],
      strengths: ['Strong supplier network and onboarding tools', 'Retail-specific feature depth', 'Good API ecosystem'],
      limitations: ['Higher cost may be prohibitive for mid-market organizations', 'Broader feature set may exceed requirements'],
    },
    {
      name: 'Syndigo',
      relevance: 'Content Experience Hub designed for product content distribution and supplier data exchange, with strong normalization features.',
      marketPosition: 'Established enterprise vendor',
      relativeCost: 'High',
      costConsiderations: ['Enterprise pricing', 'Implementation and configuration services', 'Content processing fees'],
      strengths: ['Purpose-built for multi-supplier data exchange', 'Strong data normalization and validation features'],
      limitations: ['Enterprise pricing may not fit smaller organizations', 'Implementation complexity can be high'],
    },
  ],
  failurePatterns: [
    'Underestimating supplier data variability — real-world data often contains more inconsistency than initially mapped',
    'Insufficient supplier onboarding planning — suppliers may resist new formats or require extensive support',
    'Over-scoping the initial implementation — attempting to onboard all suppliers simultaneously rather than in phases',
    'Insufficient change management — operations teams need process training alongside new tooling',
    'Underestimating ongoing maintenance — supplier data formats evolve over time',
  ],
  noActionEvidence: [
    'Organizations with fewer than 20 suppliers sometimes manage indefinitely with spreadsheet tooling',
    'ROI on PIM investment typically requires sufficient supplier and product volume',
    'Some organizations accept normalization cost as a cost of doing business when product turnover is low',
  ],
  aiRelevanceSignals: [
    'Several PIM vendors include AI-assisted attribute mapping and schema matching features',
    'Standalone AI-powered data transformation tools exist (e.g., Flatfile)',
    'AI in this context focuses primarily on pattern matching and field mapping, not generative content',
    'AI adoption in PIM is increasing but is not yet the market standard',
  ],
  researchSources: [
    'Gartner Market Guide for Product Information Management',
    'Forrester Wave: PIM Solutions',
    'Akeneo, Salsify, and Syndigo product documentation and case studies',
    'Industry practitioner commentary',
  ],
}

export const demoResearchSynthesis = {
  marketMaturity: {
    rating: 'MATURE',
    rationale:
      'The PIM and data integration market is well-established with multiple enterprise and mid-market vendors. Solutions have been commercially available for over a decade and analyst firms maintain active coverage.',
  },
  vendorLandscape: {
    rating: 'STRONG_VENDOR_LANDSCAPE',
    rationale:
      'Multiple relevant vendors were identified across enterprise and mid-market segments. The market is competitive with differentiated offerings across price points and capability levels.',
  },
  solutionPatterns: {
    mostCommon: ['Commercial PIM software with supplier onboarding modules', 'ETL / data integration platforms with transformation rules'],
    secondary: ['AI-assisted data mapping tools', 'Supplier portal format enforcement', 'Custom pipeline development'],
  },
  failurePatternSummary: [
    'Underestimating supplier data variability during initial scoping',
    'Insufficient supplier onboarding and change management planning',
    'Over-scoping the initial implementation phase',
    'Ongoing maintenance burden from evolving supplier formats',
  ],
  aiMarketSignals: {
    rating: 'AI_EMERGING',
    rationale:
      'AI-assisted data mapping features are increasingly present in PIM products but are not yet the market standard. AI adoption in this space is growing but remains supplementary rather than central to most deployments.',
  },
  keyResearchFindings: [
    'The PIM market is mature with established commercial options at multiple price points',
    'Commercial software is the dominant solution pattern for organizations with 20+ suppliers',
    'AI-assisted mapping features exist but are typically embedded within commercial platforms rather than standalone products',
    'Supplier onboarding and change management are consistent implementation risk factors',
    'Phased implementation by supplier volume or complexity is commonly recommended',
  ],
  researchConfidence: {
    rating: 'MEDIUM',
    rationale:
      "Evidence is drawn from analyst research, vendor documentation, and practitioner commentary. Specific vendor pricing and implementation details were not verified against this organization's specific context.",
  },
  assumptions: [
    'Research reflects general market conditions and may not account for recent product changes',
    'Vendor cost characterizations are relative estimates, not specific to this organization',
  ],
}

export const demoStrategicAnalysis = {
  problemSignificance: {
    rating: 'HIGH',
    rationale:
      '300 hours of monthly labor, 3–5 day listing delays, and downstream inventory and pricing errors represent significant operational cost and business risk. At 50+ suppliers and ~10,000 monthly updates, the problem is likely to worsen without intervention.',
  },
  solutionLandscape: {
    alternativesEvaluated: [
      {
        approach: 'NO_ACTION',
        fit: 'NOT_RECOMMENDED',
        rationale: 'Current costs are substantial and the problem will compound as supplier volume grows. No action is not defensible at this scale.',
        keyTradeoffs: ['Avoids investment risk', 'Problem likely worsens over time', 'Ongoing labor and error costs continue to accumulate'],
      },
      {
        approach: 'PROCESS_IMPROVEMENT',
        fit: 'LOW',
        rationale: 'Process improvements could reduce some inefficiency but cannot address fundamental data format variability. Better documentation and workflow management would help marginally as a complement, not a solution.',
        keyTradeoffs: ['Low cost and low risk', 'Limited impact on core problem', 'Valuable as a complement to technology investment'],
      },
      {
        approach: 'COMMERCIAL_SOFTWARE',
        fit: 'HIGH',
        rationale: 'PIM solutions are specifically designed for this problem. The mature vendor landscape offers multiple options appropriate for this scale. Commercial software directly addresses the DATA_GAP root cause by providing a standardized destination schema and supplier onboarding tools.',
        keyTradeoffs: ['Significant upfront investment', 'Implementation complexity', 'Ongoing subscription cost', 'Directly addresses root cause', 'Reduces long-term operational burden'],
      },
      {
        approach: 'AI_ENABLED_COMMERCIAL_SOFTWARE',
        fit: 'MEDIUM',
        rationale: 'AI-assisted data mapping features could reduce configuration time during implementation. However, AI capabilities in this space are supplementary features within commercial platforms, not standalone solutions. The benefit is incremental rather than transformative.',
        keyTradeoffs: ['Potential reduction in initial mapping effort', 'AI feature quality varies across vendors', 'May increase product cost', 'Still requires full commercial platform investment'],
      },
      {
        approach: 'TRADITIONAL_AUTOMATION',
        fit: 'MEDIUM',
        rationale: 'ETL pipelines and custom transformation scripts could handle known supplier formats. This has been partially attempted and shows limitations in handling variability and scaling to new suppliers. It is viable but not sustainable at this scale with limited engineering resources.',
        keyTradeoffs: ['Lower direct cost than commercial PIM', 'Requires ongoing engineering maintenance', 'Does not solve supplier onboarding scalably', 'Prior attempts demonstrate limited coverage'],
      },
      {
        approach: 'CUSTOM_SOFTWARE',
        fit: 'LOW',
        rationale: 'Custom development would replicate functionality available in mature commercial products without the benefit of vendor maintenance or community support. Not advisable given limited engineering resources.',
        keyTradeoffs: ['Full implementation control', 'High development and maintenance cost', 'Inappropriate given engineering resource constraints', 'Reinvents established functionality'],
      },
    ],
    alternativesNotEvaluated: [
      {
        approach: 'TRAINING_AND_DOCUMENTATION',
        reason: 'The problem is not caused by a knowledge gap. Training would not address data format variability.',
      },
      {
        approach: 'CUSTOM_AI_SOFTWARE',
        reason: 'Custom AI development is disproportionate to the problem. Commercial options exist and engineering resources are limited.',
      },
    ],
  },
  buildVsBuy: {
    recommendedApproach: 'BUY',
    rationale:
      'The PIM market is mature with established vendors. Building a comparable system would require significant engineering investment and ongoing maintenance, replicating functionality already available commercially. Limited engineering resources reinforce the buy recommendation.',
  },
  economicConsiderations: {
    implementationCost: 'HIGH',
    operationalCost: 'MEDIUM',
    timeToValue: 'MEDIUM',
    opportunityCost: 'HIGH',
    rationale:
      'PIM implementation requires meaningful upfront investment in licensing, configuration, and supplier onboarding. Ongoing SaaS subscription costs are significant but should be weighed against approximately 300 hours of monthly labor. Time-to-value is typically 3–6 months for phased implementations. The opportunity cost of delay is high given the ongoing labor and error burden.',
  },
  humanImpact: {
    capabilityEnhancement:
      'Implementation would free the operations team from repetitive data normalization tasks, enabling focus on higher-value supplier relationship and data quality governance work.',
    capabilityRisk: 'Low risk. The team retains oversight and exception handling responsibilities. The solution augments rather than replaces human work.',
    humanJudgmentRequirements:
      'Human judgment remains necessary for exception handling, new supplier onboarding decisions, and data quality governance. These contributions should be preserved and supported.',
    knowledgeRetentionConsiderations:
      'Institutional knowledge of supplier data quirks and business rules should be documented during implementation to ensure it is captured in PIM configuration rather than remaining tacit.',
  },
  aiAssessment: {
    rating: 'AI_LIMITED_VALUE',
    rationale:
      'AI adds incremental value in this context — primarily through assisted field mapping during implementation. The core problem is data format variability, not intelligent interpretation. Standard PIM capabilities are sufficient to address the root cause. AI-enabled options may be worth evaluating if offered at no additional cost premium.',
  },
  strategicInsights: [
    'Commercial PIM software directly addresses the DATA_GAP root cause by providing a consistent destination schema and supplier onboarding tooling.',
    'Prior custom scripting attempts validate that automation is feasible but also demonstrate the scalability limitations of custom approaches at this supplier volume.',
    'Phased implementation — starting with the highest-volume or most problematic suppliers — is likely to produce faster ROI and reduce implementation risk.',
    'Change management and supplier onboarding planning will be critical success factors.',
    'Process improvement should accompany technology implementation to codify business rules and data quality standards.',
  ],
  assumptions: [
    'Current labor estimate of 300 hours/month is provided by the organization and has not been independently verified',
    'Engineering resource constraints may affect implementation timeline',
    'Supplier cooperation with onboarding process is assumed to be achievable with appropriate planning',
  ],
}

export const demoRecommendation = {
  recommendedPath: {
    primaryApproach: 'COMMERCIAL_SOFTWARE',
    supportingApproaches: ['PROCESS_IMPROVEMENT'],
  },
  rootCauseAlignment:
    'The identified root cause is a DATA_GAP — supplier data arrives in inconsistent, non-standardized formats that require costly manual remediation. Commercial PIM software addresses this directly by providing a standardized destination schema, supplier onboarding tools, and automated transformation capabilities. Process improvement supports this by formalizing the data governance and business rules the system will enforce.',
  rationale:
    'The evidence strongly supports a commercial PIM solution. The market is mature, multiple relevant vendors exist, and this problem type is precisely what PIM software is designed to address. The scale of the problem — 300 hours per month, 50+ suppliers, approximately 10,000 monthly product updates — justifies the investment. Prior custom scripting efforts confirm that automation is effective in this context but that a scalable platform is required. AI-enabled features may accelerate initial field mapping but are not the primary driver of value.',
  alternativesNotSelected: [
    {
      approach: 'TRADITIONAL_AUTOMATION',
      reasonNotSelected:
        'Prior custom scripting has demonstrated limited coverage and scalability. Engineering resources are constrained, and this approach does not provide a sustainable path to onboarding new suppliers efficiently.',
    },
    {
      approach: 'AI_ENABLED_COMMERCIAL_SOFTWARE',
      reasonNotSelected:
        'AI-assisted mapping features provide incremental value but are not required to address the core problem. Standard PIM capabilities are sufficient. If an evaluated vendor includes AI features at no additional cost premium, they may be worth utilizing.',
    },
  ],
  risks: [
    'Implementation complexity and timeline: PIM implementations typically require 3–6 months. Underestimating this delays ROI.',
    'Supplier onboarding resistance: Some suppliers may resist new submission formats, slowing full coverage.',
    'Change management: The operations team will need to adapt their workflow; insufficient training may limit adoption.',
    'Data complexity underestimation: Supplier data often contains more variability than initially mapped, increasing configuration effort.',
    'Ongoing maintenance: Supplier formats evolve over time, requiring continued platform maintenance.',
  ],
  confidence: {
    rating: 'HIGH',
    rationale:
      'The root cause is clear, the market is mature, and commercial PIM software directly addresses the identified problem. The scale and cost of the current process justifies investment. Remaining uncertainty relates to specific vendor selection and implementation complexity, not the direction of the recommendation.',
  },
  nextStep:
    'Conduct a structured evaluation of three to four PIM vendors — including Akeneo, Salsify, and at least one mid-market alternative — using requirements derived from a documented analysis of current normalization workflows and supplier data.',
}
