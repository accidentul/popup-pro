'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { popupsApi, discountCodesApi } from '@/lib/api';
import PopupBuilder from '@/components/PopupBuilder';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewPopupPage() {
  const router = useRouter();
  const [shopId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopId') || 'demo-shop';
    }
    return 'demo-shop';
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (popupData: any) => {
    setSaving(true);
    try {
      const response = await popupsApi.create({
        ...popupData,
        shopId,
      });

      if (popupData.offer?.type === 'discount' && !popupData.offer.discountCodeId) {
        const discountCode = await discountCodesApi.create({
          shopId,
          type: popupData.offer.discountType || 'percentage',
          value: popupData.offer.discountAmount || 10,
          popupId: response.data.id,
        });

        await popupsApi.update(response.data.id, shopId, {
          offer: {
            ...popupData.offer,
            discountCodeId: discountCode.data.id,
          },
        });
      }

      router.push('/popups');
    } catch (error) {
      console.error('Failed to create popup:', error);
      alert('Failed to create popup');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/popups"
            className="inline-flex items-center text-slate-300 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Popups
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                  Create New Popup
                </span>
              </h1>
              <p className="text-slate-400 mt-1">Design your exit-intent popup to capture abandoning visitors</p>
            </div>
          </div>
        </div>
      </div>

      <PopupBuilder onSave={handleSave} saving={saving} />
    </div>
  );
}
