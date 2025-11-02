'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  limits: {
    maxPopups: number;
    maxViewsPerMonth: number;
    features: {
      abTesting: boolean;
      advancedAnalytics: boolean;
      customDomains: boolean;
      prioritySupport: boolean;
      apiAccess: boolean;
    };
  };
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState('');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shopId');
      if (stored) {
        setShopId(stored);
        loadPlans(stored);
      } else {
        loadPlans('demo-shop');
      }
    }
  }, []);

  const loadPlans = async (shop: string) => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        fetch(`http://localhost:3001/subscriptions/plans`),
        fetch(`http://localhost:3001/subscriptions/status?shopId=${shop}`),
      ]);

      const plansData = await plansRes.json();
      const statusData = await statusRes.json();

      // Merge plan data with limits
      const plansWithLimits = await Promise.all(
        plansData.plans.map(async (plan: any) => {
          const limitsRes = await fetch(`http://localhost:3001/subscriptions/limits?shopId=${shop}`);
          const limits = await limitsRes.json();
          return {
            ...plan,
            limits: limits,
          };
        })
      );

      setPlans(plansWithLimits);
      setCurrentPlan(statusData.subscription);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!shopId) {
      router.push('/install');
      return;
    }

    setUpgrading(planId);
    try {
      const response = await fetch(`http://localhost:3001/subscriptions/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, planType: planId }),
      });

      const data = await response.json();
      
      if (data.confirmationUrl) {
        // Redirect to Shopify billing confirmation
        window.location.href = data.confirmationUrl;
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
      alert('Failed to start upgrade. Please try again.');
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Choose Your Plan
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include core features with usage-based limits.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.planType === plan.id;
            const isPopular = plan.id === 'professional';
            
            return (
              <div
                key={plan.id}
                className={`glass-effect rounded-2xl p-8 card-hover relative ${
                  isPopular ? 'ring-2 ring-indigo-500 scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-600 ml-2">/{plan.interval}</span>
                  </div>
                  {plan.limits.maxPopups === -1 ? (
                    <p className="text-sm text-slate-600">Unlimited popups</p>
                  ) : (
                    <p className="text-sm text-slate-600">{plan.limits.maxPopups} popup(s)</p>
                  )}
                  {plan.limits.maxViewsPerMonth === -1 ? (
                    <p className="text-sm text-slate-600">Unlimited views</p>
                  ) : (
                    <p className="text-sm text-slate-600">{plan.limits.maxViewsPerMonth.toLocaleString()} views/month</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    {plan.limits.features.abTesting ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={plan.limits.features.abTesting ? 'text-slate-900' : 'text-slate-400'}>
                      A/B Testing
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {plan.limits.features.advancedAnalytics ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={plan.limits.features.advancedAnalytics ? 'text-slate-900' : 'text-slate-400'}>
                      Advanced Analytics
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {plan.limits.features.prioritySupport ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={plan.limits.features.prioritySupport ? 'text-slate-900' : 'text-slate-400'}>
                      Priority Support
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {plan.limits.features.apiAccess ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={plan.limits.features.apiAccess ? 'text-slate-900' : 'text-slate-400'}>
                      API Access
                    </span>
                  </li>
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-slate-200 text-slate-600 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id || !shopId}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {upgrading === plan.id ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : plan.price === 0 ? (
                      'Current Plan'
                    ) : (
                      <>
                        Upgrade
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="glass-effect rounded-2xl p-8 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How does billing work?</h3>
              <p className="text-slate-600">
                Billing is handled securely through Shopify. You'll be charged monthly through your Shopify account.
                Upgrades take effect immediately, and you can cancel anytime.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What happens if I exceed my limits?</h3>
              <p className="text-slate-600">
                If you exceed your monthly view limit, popups will stop showing until the next billing cycle or until you upgrade.
                You'll receive email notifications when you're approaching your limits.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I change plans later?</h3>
              <p className="text-slate-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and billing is prorated automatically.
              </p>
            </div>
          </div>
        </div>

        {!shopId && (
          <div className="text-center mt-8">
            <Link
              href="/install"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Install App First
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


