'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Store, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export default function InstallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shop, setShop] = useState('');
  const [step, setStep] = useState<'input' | 'installing' | 'success' | 'error'>('input');
  const [error, setError] = useState('');
  const [shopStatus, setShopStatus] = useState<any>(null);

  useEffect(() => {
    const shopParam = searchParams.get('shop');
    const errorParam = searchParams.get('error');

    if (shopParam) {
      setShop(shopParam);
      checkShopStatus(shopParam);
    }

    if (errorParam) {
      setError(getErrorMessage(errorParam));
      setStep('error');
    }
  }, [searchParams]);

  const checkShopStatus = async (shopDomain: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shopify/status?shop=${shopDomain}`);
      const data = await response.json();
      setShopStatus(data);

      if (data.installed) {
        setStep('success');
      }
    } catch (error) {
      console.error('Failed to check shop status:', error);
    }
  };

  const handleInstall = async () => {
    if (!shop || !shop.includes('.')) {
      setError('Please enter a valid Shopify store domain (e.g., your-store.myshopify.com)');
      return;
    }

    setStep('installing');
    setError('');

    // Redirect to Shopify OAuth
    const installUrl = `${API_BASE_URL}/shopify/install?shop=${shop}`;
    window.location.href = installUrl;
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'no_shop':
        return 'No shop domain provided';
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      default:
        return 'An error occurred during installation';
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background - Match landing page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.18),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.16),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.18),transparent_55%)]"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 rounded-2xl mb-6 shadow-2xl">
              <Store className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                Install ExitIntent Pro
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300">Connect your Shopify store in just a few clicks</p>
          </div>

          {/* Installation Steps */}
          {step === 'input' && (
            <div className="p-8 md:p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold mb-3 text-white">
                    Your Shopify Store Domain
                  </label>
                  <input
                    type="text"
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                    placeholder="your-store.myshopify.com"
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg"
                  />
                  <p className="mt-3 text-sm text-slate-400">
                    Enter your store's myshopify.com domain
                  </p>
                </div>

                {error && (
                  <div className="p-5 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-red-300 text-lg">Installation Error</div>
                      <div className="text-sm text-red-200 mt-1">{error}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleInstall}
                  disabled={!shop}
                  className="group w-full px-10 py-5 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  Install ExitIntent Pro
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Benefits */}
                <div className="mt-10 pt-10 border-t border-white/10">
                  <h3 className="font-bold mb-6 text-white text-xl flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                    What you'll get:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white mb-1">Automatic Setup</div>
                        <div className="text-sm text-slate-400">Script installed automatically</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white mb-1">Secure Integration</div>
                        <div className="text-sm text-slate-400">OAuth2 authentication</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white mb-1">Ready to Use</div>
                        <div className="text-sm text-slate-400">Start creating popups immediately</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'installing' && (
            <div className="p-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-center shadow-2xl animate-fade-in">
              <Loader2 className="h-16 w-16 text-cyan-400 animate-spin mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-3 text-white">Installing...</h2>
              <p className="text-slate-300 text-lg">Redirecting to Shopify to authorize the app</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 md:p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6 shadow-2xl">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                    Installation Complete!
                  </span>
                </h2>
                <p className="text-slate-300 text-lg">ExitIntent Pro has been successfully installed on your store</p>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4 p-5 bg-emerald-500/10 backdrop-blur-sm rounded-xl border border-emerald-500/30">
                  <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                  <span className="text-white font-semibold text-lg">Shop connected successfully</span>
                </div>
                {shopStatus?.scriptInstalled ? (
                  <div className="flex items-center gap-4 p-5 bg-emerald-500/10 backdrop-blur-sm rounded-xl border border-emerald-500/30">
                    <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                    <span className="text-white font-semibold text-lg">Popup script installed</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-5 bg-yellow-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/30">
                    <Shield className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold text-lg block">Development Mode</span>
                      <span className="text-slate-300 text-sm">Script tag installation skipped (requires public HTTPS URL)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/popups/new')}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Create Your First Popup
                </button>
                <button
                  onClick={() => router.push('/popups')}
                  className="flex-1 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="p-8 md:p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-full mb-6 shadow-2xl">
                  <XCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">Installation Failed</h2>
                <p className="text-red-200 mb-6 text-lg">{error}</p>
              </div>
              <button
                onClick={() => {
                  setStep('input');
                  setError('');
                }}
                className="w-full px-8 py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


