'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { popupsApi, Popup, discountCodesApi } from '@/lib/api';
import PopupBuilder from '@/components/PopupBuilder';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPopupPage() {
  const router = useRouter();
  const params = useParams();
  const popupId = params.id as string;
  const [shopId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopId') || 'demo-shop';
    }
    return 'demo-shop';
  });
  const [popup, setPopup] = useState<Popup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPopup();
  }, [popupId]);

  const loadPopup = async () => {
    try {
      const response = await popupsApi.getById(popupId, shopId);
      setPopup(response.data);
    } catch (error) {
      console.error('Failed to load popup:', error);
      alert('Failed to load popup');
      router.push('/popups');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (popupData: any) => {
    setSaving(true);
    try {
      await popupsApi.update(popupId, shopId, popupData);
      router.push('/popups');
    } catch (error) {
      console.error('Failed to update popup:', error);
      alert('Failed to update popup');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading popup...</p>
        </div>
      </div>
    );
  }

  if (!popup) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="sticky top-0 z-40 glass-effect border-b border-slate-200/50 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/popups"
            className="inline-flex items-center text-slate-600 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Popups
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Edit Popup</h1>
        </div>
      </div>
      <PopupBuilder onSave={handleSave} saving={saving} initialData={popup} />
    </div>
  );
}
