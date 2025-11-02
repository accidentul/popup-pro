'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { popupsApi, Popup } from '@/lib/api';
import { Plus, Beaker, TrendingUp, Target, BarChart3 } from 'lucide-react';

export default function ABTestingPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopId') || 'demo-shop';
    }
    return 'demo-shop';
  });

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      const response = await popupsApi.getAll(shopId);
      setPopups(response.data);
    } catch (error) {
      console.error('Failed to load popups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-slate-900">A/B Testing</h1>
            <p className="text-slate-600">Test different popup variations to optimize conversions</p>
          </div>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Create New Test
          </button>
        </div>

        <div className="glass-effect rounded-2xl p-8 mb-8 card-hover">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Beaker className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3 text-slate-900">What is A/B Testing?</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                A/B testing allows you to test different popup variations to see which performs better.
                Split your traffic between multiple popups and track their conversion rates to determine
                the winner. This helps you optimize your popups for maximum conversions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Target className="h-5 w-5 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Split Traffic</div>
                    <div className="text-sm text-slate-600">50/50 or custom splits</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Track Performance</div>
                    <div className="text-sm text-slate-600">Real-time metrics</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Find Winners</div>
                    <div className="text-sm text-slate-600">Data-driven decisions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {popups.length < 2 ? (
          <div className="glass-effect rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Beaker className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900">Create More Popups</h3>
            <p className="text-slate-600 mb-6">
              You need at least 2 popups to create an A/B test. Create more popups to get started!
            </p>
            <Link
              href="/popups/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Popup
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popups.map((popup) => (
              <div key={popup.id} className="glass-effect rounded-2xl p-6 card-hover">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{popup.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    popup.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : popup.status === 'draft'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {popup.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">{popup.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1 text-indigo-600" />
                    <span className="font-semibold text-slate-900">{popup.viewCount || 0}</span>
                    <span className="ml-1">views</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-purple-600" />
                    <span className="capitalize">{popup.triggerType?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
