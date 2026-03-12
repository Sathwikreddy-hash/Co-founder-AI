export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
}

export interface Startup {
  id: string;
  userId: string;
  name: string;
  idea: string;
  problem: string;
  targetUsers: string;
  market: string;
  competitors: string;
  status: 'idea' | 'validation' | 'market' | 'mvp' | 'launch';
  createdAt: string;
}

export interface Analysis {
  id: string;
  startupId: string;
  userId: string;
  report: {
    summary: string;
    problemValidation: string;
    marketOpportunity: string;
    uvp: string;
    businessModel: string;
    pricingStrategy: string;
    gtmPlan: string;
  };
  validation: {
    demandScore: number;
    competitionLevel: string;
    growthPotential: number;
    urgencyScore: number;
    viabilityScore: number;
    insights: string;
  };
  competitors: {
    name: string;
    offer: string;
    pricing: string;
    strengths: string;
    weaknesses: string;
    gaps: string;
  }[];
  mvp: {
    features: string[];
    priorities: string[];
    techStack: string[];
    userFlow: string;
  };
  roadmap: {
    period: string;
    goals: string[];
  }[];
  fundingStrategy: {
    stage: string;
    targetAmount: string;
    investorTypes: string[];
    pitchFocus: string[];
    potentialInvestors: string[];
    advice: string;
  };
  coFounderAdvice: string[];
  startupScore: {
    total: number;
    marketDemand: number;
    competitionIntensity: number;
    problemUrgency: number;
    growthPotential: number;
  };
  nextActions: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  createdAt: string;
}

export interface DailyBriefing {
  id: string;
  startupId: string;
  userId: string;
  date: string;
  marketUpdates: string[];
  competitorActivity: string[];
  opportunities: string[];
  risks: string[];
  recommendedActions: string[];
  createdAt: string;
}

export interface MarketIntelligence {
  id: string;
  startupId: string;
  userId: string;
  signals: {
    type: 'growth' | 'competitor' | 'funding' | 'tech' | 'social';
    title: string;
    description: string;
    source?: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  createdAt: string;
}

export interface WeeklyReport {
  id: string;
  startupId: string;
  userId: string;
  weekRange: string;
  progress: string;
  keyInsights: string[];
  risksDiscovered: string[];
  strategyAdjustments: string[];
  nextWeekPriorities: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  startupId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AgentAction {
  id: string;
  userId: string;
  startupId: string;
  type: 'send_email' | 'create_task' | 'market_research' | 'draft_content';
  status: 'pending' | 'approved' | 'denied' | 'completed' | 'failed';
  details: any;
  result?: any;
  createdAt: string;
}
