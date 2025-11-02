'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, Check, Code, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ManualInstallPage() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId') || 'your-shop-id';
  const [copied, setCopied] = useState(false);
  
  const apiBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin.replace(':3000', ':3001')
    : 'http://localhost:3001';
  
  const scriptUrl = `${apiBaseUrl}/scripts/popup.js?shopId=${shopId}`;
  const scriptTag = `<script src="${scriptUrl}" async></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/install"
          className="inline-flex items-center text-slate-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Installation
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4">
            <Code className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900">Manual Installation</h1>
          <p className="text-xl text-slate-600">Copy and paste this code into your Shopify theme</p>
        </div>

        <div className="glass-effect rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Step 1: Copy the Script Tag</h2>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono">
              <code>{scriptTag}</code>
            </pre>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Step 2: Add to Your Shopify Theme</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">Go to Shopify Admin</div>
                <div className="text-sm text-slate-600">Navigate to Online Store → Themes</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">Edit Theme Code</div>
                <div className="text-sm text-slate-600">Click "Actions" → "Edit code" on your active theme</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">Open theme.liquid</div>
                <div className="text-sm text-slate-600">Find and open the "theme.liquid" file in the Layout folder</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">4</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">Paste Before &lt;/head&gt;</div>
                <div className="text-sm text-slate-600">Paste the copied script tag just before the closing &lt;/head&gt; tag</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">5</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">Save Changes</div>
                <div className="text-sm text-slate-600">Click "Save" and your popups will be live!</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-900 mb-1">Need Help?</div>
              <div className="text-sm text-yellow-800">
                If you're using OAuth installation, the script is installed automatically. 
                This manual method is for custom integrations or advanced users.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/popups"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


