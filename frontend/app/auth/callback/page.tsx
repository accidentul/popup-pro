'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShopifyCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) {
      return;
    }

    const query = searchParams.toString();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

    if (query) {
      hasRedirectedRef.current = true;
      // Redirect the browser to the backend callback so it can finish OAuth and redirect back
      window.location.replace(`${apiBaseUrl}/shopify/auth/callback?${query}`);
    } else {
      router.replace('/install?error=missing_params');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h1 className="text-2xl font-semibold text-white">Connecting your Shopify store…</h1>
        <p className="text-slate-400">
          Please wait while we complete the installation. You’ll be redirected automatically.
        </p>
      </div>
    </div>
  );
}


