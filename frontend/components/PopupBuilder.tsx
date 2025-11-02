'use client';

import { useState } from 'react';
import { Palette, Type, Layout, Zap, Eye, Sparkles, Target, Gift, Save } from 'lucide-react';

interface PopupBuilderProps {
  onSave: (data: any) => void;
  saving?: boolean;
  initialData?: any;
}

export default function PopupBuilder({ onSave, saving = false, initialData }: PopupBuilderProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [triggerType, setTriggerType] = useState(initialData?.triggerType || 'exit_intent');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  
  const [design, setDesign] = useState({
    backgroundColor: initialData?.design?.backgroundColor || '#ffffff',
    textColor: initialData?.design?.textColor || '#1e293b',
    heading: initialData?.design?.heading || 'Special Offer!',
    subheading: initialData?.design?.subheading || 'Get 20% off your order',
    buttonText: initialData?.design?.buttonText || 'Claim Offer',
    buttonColor: initialData?.design?.buttonColor || '#6366f1',
    imageUrl: initialData?.design?.imageUrl || '',
    layout: initialData?.design?.layout || 'centered',
    width: initialData?.design?.width || 500,
    borderRadius: initialData?.design?.borderRadius || 12,
    padding: initialData?.design?.padding || 32,
  });

  const [offer, setOffer] = useState(initialData?.offer || {
    type: 'email_capture',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      triggerType,
      status,
      design,
      offer,
    });
  };

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Settings */}
              <div className="group p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-2xl animate-fade-in">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Basic Settings</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-white flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-cyan-400" />
                      Popup Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg font-medium"
                      placeholder="e.g., Summer Sale Popup"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-white flex items-center">
                      <Type className="h-4 w-4 mr-2 text-cyan-400" />
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none font-medium"
                      rows={3}
                      placeholder="Optional description for internal reference..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-white flex items-center">
                        <Target className="h-4 w-4 mr-2 text-emerald-400" />
                        Trigger Type
                      </label>
                      <select
                        value={triggerType}
                        onChange={(e) => setTriggerType(e.target.value)}
                        className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                      >
                        <option value="exit_intent" className="bg-slate-800">Exit Intent (Desktop)</option>
                        <option value="mobile_scroll" className="bg-slate-800">Mobile Scroll</option>
                        <option value="time_delay" className="bg-slate-800">Time Delay</option>
                        <option value="scroll_percentage" className="bg-slate-800">Scroll Percentage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-3 text-white flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-emerald-400" />
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                      >
                        <option value="draft" className="bg-slate-800">Draft</option>
                        <option value="active" className="bg-slate-800">Active</option>
                        <option value="paused" className="bg-slate-800">Paused</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Design Settings */}
              <div className="group p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-2xl animate-fade-in animation-delay-200">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Design & Styling</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-white">Background Color</label>
                      <div className="flex items-center gap-3">
                        <div className="relative group/color">
                          <input
                            type="color"
                            value={design.backgroundColor}
                            onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                            className="w-16 h-16 border-4 border-white/20 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 rounded-xl ring-2 ring-cyan-500 opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                        <input
                          type="text"
                          value={design.backgroundColor}
                          onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                          className="flex-1 px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-white">Text Color</label>
                      <div className="flex items-center gap-3">
                        <div className="relative group/color">
                          <input
                            type="color"
                            value={design.textColor}
                            onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                            className="w-16 h-16 border-4 border-white/20 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 rounded-xl ring-2 ring-cyan-500 opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                        <input
                          type="text"
                          value={design.textColor}
                          onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                          className="flex-1 px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-white">Heading</label>
                    <input
                      type="text"
                      value={design.heading}
                      onChange={(e) => setDesign({ ...design, heading: e.target.value })}
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg font-bold"
                      placeholder="Enter heading text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-white">Subheading</label>
                    <input
                      type="text"
                      value={design.subheading}
                      onChange={(e) => setDesign({ ...design, subheading: e.target.value })}
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium"
                      placeholder="Enter subheading text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-white">Button Text</label>
                      <input
                        type="text"
                        value={design.buttonText}
                        onChange={(e) => setDesign({ ...design, buttonText: e.target.value })}
                        className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-white">Button Color</label>
                      <div className="flex items-center gap-3">
                        <div className="relative group/color">
                          <input
                            type="color"
                            value={design.buttonColor}
                            onChange={(e) => setDesign({ ...design, buttonColor: e.target.value })}
                            className="w-16 h-16 border-4 border-white/20 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 rounded-xl ring-2 ring-cyan-500 opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                        <input
                          type="text"
                          value={design.buttonColor}
                          onChange={(e) => setDesign({ ...design, buttonColor: e.target.value })}
                          className="flex-1 px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-slate-300 uppercase tracking-wide">Width (px)</label>
                      <input
                        type="number"
                        value={design.width}
                        onChange={(e) => setDesign({ ...design, width: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold text-center"
                        min={200}
                        max={1200}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-slate-300 uppercase tracking-wide">Radius (px)</label>
                      <input
                        type="number"
                        value={design.borderRadius}
                        onChange={(e) => setDesign({ ...design, borderRadius: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold text-center"
                        min={0}
                        max={50}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-slate-300 uppercase tracking-wide">Padding (px)</label>
                      <input
                        type="number"
                        value={design.padding}
                        onChange={(e) => setDesign({ ...design, padding: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold text-center"
                        min={10}
                        max={100}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Settings */}
              <div className="group p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-2xl animate-fade-in animation-delay-400">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Offer Settings</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-3 text-white flex items-center">
                      <Layout className="h-4 w-4 mr-2 text-purple-400" />
                      Offer Type
                    </label>
                    <select
                      value={offer.type}
                      onChange={(e) => setOffer({ ...offer, type: e.target.value })}
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                    >
                      <option value="email_capture" className="bg-slate-800">✉️ Email Capture</option>
                      <option value="discount" className="bg-slate-800">💰 Discount Code</option>
                      <option value="newsletter" className="bg-slate-800">📧 Newsletter Signup</option>
                      <option value="free_shipping" className="bg-slate-800">🚚 Free Shipping</option>
                    </select>
                  </div>

                  {offer.type === 'discount' && (
                    <div className="grid grid-cols-2 gap-6 p-6 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl border border-purple-500/30 animate-fade-in">
                      <div>
                        <label className="block text-sm font-bold mb-3 text-white">Discount Type</label>
                        <select
                          value={offer.discountType || 'percentage'}
                          onChange={(e) => setOffer({ ...offer, discountType: e.target.value })}
                          className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                        >
                          <option value="percentage" className="bg-slate-800">Percentage (%)</option>
                          <option value="fixed" className="bg-slate-800">Fixed Amount ($)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-3 text-white">Discount Amount</label>
                        <input
                          type="number"
                          value={offer.discountAmount || 10}
                          onChange={(e) => setOffer({ ...offer, discountAmount: parseInt(e.target.value) })}
                          className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-bold text-center text-2xl"
                          min={0}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl animate-fade-in animation-delay-600">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Live Preview</h2>
                      <p className="text-slate-400 text-sm">Real-time updates</p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 min-h-[500px] flex items-center justify-center border border-white/5 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.08),transparent_50%)]"></div>

                    <div
                      style={{
                        backgroundColor: design.backgroundColor,
                        color: design.textColor,
                        width: `${Math.min(design.width, 350)}px`,
                        borderRadius: `${design.borderRadius}px`,
                        padding: `${design.padding}px`,
                        textAlign: design.layout === 'centered' ? 'center' : design.layout,
                      }}
                      className="relative shadow-2xl transition-all duration-500 transform hover:scale-105"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-sky-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative">
                        <h3 className="text-3xl font-black mb-4" style={{ color: design.textColor }}>
                          {design.heading || 'Special Offer!'}
                        </h3>
                        <p className="mb-8 text-lg opacity-90" style={{ color: design.textColor }}>
                          {design.subheading || 'Get 20% off your order'}
                        </p>
                        <button
                          style={{
                            backgroundColor: design.buttonColor,
                            color: '#ffffff',
                          }}
                          className="px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                        >
                          {design.buttonText || 'Claim Offer'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                    <p className="text-emerald-300 text-sm font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Preview updates in real-time as you design
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-end gap-4 animate-fade-in">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="group px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="group px-12 py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving Popup...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Save Popup
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
