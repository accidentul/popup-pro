'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BillingCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const shopId = searchParams.get('shopId');
    const chargeId = searchParams.get('charge_id');

    if (!shopId || !chargeId) {
      setStatus('error');
      setError('Missing required parameters');
      return;
    }

    // Activate the billing charge
    const activateCharge = async () => {
      try {
        const response = await fetch(`http://localhost:3001/subscriptions/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId, chargeId }),
        });

        if (response.ok) {
          setStatus('success');
          // Redirect to pricing page after 3 seconds
          setTimeout(() => {
            router.push('/pricing');
          }, 3000);
        } else {
          throw new Error('Failed to activate charge');
        }
      } catch (err) {
        setStatus('error');
        setError('Failed to activate subscription. Please try again.');
      }
    };

    activateCharge();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-effect rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Activating Subscription...</h2>
            <p className="text-slate-600">Please wait while we activate your plan</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Subscription Activated!</h2>
            <p className="text-slate-600 mb-6">
              Your plan has been successfully activated. Redirecting to pricing page...
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Pricing
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Activation Failed</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}


