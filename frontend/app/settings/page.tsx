'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, Store, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [shopId, setShopId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shopId');
      if (stored) {
        setShopId(stored);
      }
    }
  }, []);

  const handleSave = () => {
    if (shopId) {
      localStorage.setItem('shopId', shopId);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage your store configuration</p>
        </div>

        <div className="glass-effect rounded-2xl p-8 card-hover">
          <div className="flex items-center mb-6">
            <Store className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-slate-900">Store Configuration</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Shop ID / Domain
              </label>
              <input
                type="text"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                placeholder="your-store.myshopify.com or shop-id"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-slate-500">
                Enter your Shopify store domain or shop ID. This is used to identify your store.
              </p>
            </div>

            {saved && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Settings saved successfully!</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </button>
              <Link
                href="/install"
                className="px-6 py-3 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-200 hover:border-indigo-300 transition-all duration-200"
              >
                Install via OAuth
              </Link>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-8 mt-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-slate-900">Quick Links</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/install/manual?shopId=demo-shop"
              className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="font-semibold text-slate-900 mb-1">Manual Installation</div>
              <div className="text-sm text-slate-600">Copy script tag for manual installation</div>
            </Link>
            <Link
              href="/popups"
              className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="font-semibold text-slate-900 mb-1">Manage Popups</div>
              <div className="text-sm text-slate-600">Create and edit your popups</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


