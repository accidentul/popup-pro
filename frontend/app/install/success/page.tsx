'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InstallSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shop = searchParams.get('shop');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-effect rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900">Installation Successful!</h1>
          <p className="text-xl text-slate-600 mb-8">
            ExitIntent Pro has been successfully installed on{' '}
            <span className="font-semibold text-slate-900">{shop}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-green-50 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <div className="font-semibold text-slate-900">Shop Connected</div>
              <div className="text-sm text-slate-600">OAuth authentication complete</div>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <div className="font-semibold text-slate-900">Script Installed</div>
              <div className="text-sm text-slate-600">Popup script added to your store</div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/popups/new"
              className="block w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              Create Your First Popup
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/popups"
              className="block w-full px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-200 hover:border-indigo-300 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


