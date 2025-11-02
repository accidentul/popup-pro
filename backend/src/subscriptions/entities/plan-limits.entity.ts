export interface PlanLimits {
  maxPopups: number;
  maxViewsPerMonth: number;
  features: {
    abTesting: boolean;
    advancedAnalytics: boolean;
    customDomains: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
  };
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxPopups: 1,
    maxViewsPerMonth: 100,
    features: {
      abTesting: false,
      advancedAnalytics: false,
      customDomains: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  starter: {
    maxPopups: 3,
    maxViewsPerMonth: 5000,
    features: {
      abTesting: false,
      advancedAnalytics: false,
      customDomains: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  professional: {
    maxPopups: -1, // Unlimited
    maxViewsPerMonth: -1, // Unlimited
    features: {
      abTesting: false,
      advancedAnalytics: true,
      customDomains: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  enterprise: {
    maxPopups: -1, // Unlimited
    maxViewsPerMonth: -1, // Unlimited
    features: {
      abTesting: true,
      advancedAnalytics: true,
      customDomains: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
};

export const PLAN_PRICING: Record<string, { price: number; currency: string; interval: string }> = {
  free: { price: 0, currency: 'USD', interval: 'month' },
  starter: { price: 12, currency: 'USD', interval: 'month' },
  professional: { price: 25, currency: 'USD', interval: 'month' },
  enterprise: { price: 49, currency: 'USD', interval: 'month' },
};

