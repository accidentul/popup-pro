'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { popupsApi, Popup } from '@/lib/api';
import { Plus, Edit, Trash2, Eye, Zap, Sparkles, Home, BarChart3, Settings, DollarSign } from 'lucide-react';

export default function PopupsPage() {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;

    try {
      await popupsApi.delete(id, shopId);
      loadPopups();
    } catch (error) {
      console.error('Failed to delete popup:', error);
      alert('Failed to delete popup');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        </div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-6"></div>
            <p className="text-slate-300 text-lg">Loading popups...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
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

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                ExitIntent Pro
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href="/" className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/10 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link href="/popups" className="px-4 py-2 text-white font-medium transition-colors rounded-lg bg-white/10 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Popups
              </Link>
              <Link href="/analytics" className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/10 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link href="/pricing" className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/10 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </Link>
              <Link href="/settings" className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/10 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-black mb-3">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                  Your Popups
                </span>
              </h1>
              <p className="text-xl text-slate-300">Manage and track your exit-intent popups</p>
            </div>
            <Link
              href="/popups/new"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in"
            >
              <Plus className="h-6 w-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create New Popup
            </Link>
          </div>

          {popups.length === 0 ? (
            <div className="p-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-center shadow-2xl animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Zap className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-4xl font-black mb-4 text-white">No popups yet</h3>
              <p className="text-slate-300 mb-8 text-lg max-w-md mx-auto">Create your first exit-intent popup to start capturing abandoning visitors and recovering lost revenue</p>
              <Link
                href="/popups/new"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="h-6 w-6 mr-2" />
                Create Your First Popup
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popups.map((popup, idx) => (
                <div
                  key={popup.id}
                  className="group p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-lg animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">
                        {popup.name}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                        popup.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : popup.status === 'paused'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}>
                        {popup.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {popup.description && (
                    <p className="text-slate-400 mb-4 text-sm line-clamp-2">{popup.description}</p>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <Eye className="h-5 w-5 mr-3 text-cyan-400" />
                      <span className="font-bold text-white text-lg">{popup.viewCount || 0}</span>
                      <span className="ml-2 text-slate-400">views</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap className="h-5 w-5 mr-3 text-emerald-400" />
                      <span className="text-slate-300 capitalize">{popup.triggerType?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <Link
                      href={`/popups/${popup.id}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-cyan-500/20 text-cyan-300 rounded-xl font-semibold hover:bg-cyan-500/30 border border-cyan-500/30 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(popup.id)}
                      className="px-4 py-3 bg-red-500/20 text-red-300 rounded-xl font-semibold hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
