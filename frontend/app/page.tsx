'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Zap, TrendingUp, Target, BarChart3, Sparkles, Shield, Rocket,
  CheckCircle, Star, ChevronDown, Play, Image as ImageIcon, X, Maximize2
} from 'lucide-react';

export default function Home() {
  const [shopId, setShopId] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const storedShopId = localStorage.getItem('shopId');
    if (storedShopId) {
      setShopId(storedShopId);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Exit-Intent Detection',
      description: 'Smart detection that knows when visitors are about to leave. Works seamlessly on desktop and mobile.',
      gradient: 'from-sky-500 via-cyan-500 to-emerald-400',
    },
    {
      icon: Target,
      title: 'Drag & Drop Builder',
      description: 'Create stunning popups in minutes with our intuitive visual builder. No coding required.',
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track views, conversions, and revenue with detailed insights and performance metrics.',
      gradient: 'from-blue-500 via-sky-500 to-cyan-400',
    },
    {
      icon: TrendingUp,
      title: 'A/B Testing',
      description: 'Test different designs and offers to find what converts best for your audience.',
      gradient: 'from-emerald-400 via-teal-500 to-sky-500',
    },
    {
      icon: Shield,
      title: 'Email Integration',
      description: 'Seamlessly integrate with your email marketing platform to grow your subscriber list.',
      gradient: 'from-lime-400 via-emerald-500 to-teal-500',
    },
    {
      icon: Rocket,
      title: 'Discount Codes',
      description: 'Automatically generate and track discount codes to incentivize conversions.',
      gradient: 'from-orange-400 via-amber-500 to-lime-400',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, Fashion Forward',
      image: '👩‍💼',
      text: 'ExitIntent Pro recovered 15% of our abandoning visitors. Best ROI we\'ve seen from any marketing tool.',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Founder, TechGear Store',
      image: '👨‍💻',
      text: 'The popup builder is incredibly intuitive. We created our first converting popup in under 10 minutes.',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Marketing Director, Beauty Box',
      image: '👩‍🎨',
      text: 'A/B testing helped us find the perfect offer. Conversion rate increased by 23% in the first month.',
      rating: 5,
    },
  ];

  const galleryImages = [
    { id: 1, src: '/api/placeholder/800/600', alt: 'Dashboard Preview', description: 'Modern analytics dashboard' },
    { id: 2, src: '/api/placeholder/800/600', alt: 'Popup Builder', description: 'Drag-and-drop builder interface' },
    { id: 3, src: '/api/placeholder/800/600', alt: 'Mobile Popup', description: 'Mobile-optimized popups' },
    { id: 4, src: '/api/placeholder/800/600', alt: 'Analytics View', description: 'Real-time performance metrics' },
  ];

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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                ExitIntent Pro
              </span>
            </div>
            <div className="flex items-center space-x-6">
              {shopId ? (
                <>
                  <Link href="/popups" className="text-slate-300 hover:text-white transition-colors font-medium">
                    Dashboard
                  </Link>
                  <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors font-medium">
                    Pricing
                  </Link>
                  <Link
                    href="/popups/new"
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
                  >
                    Create Popup
                  </Link>
                </>
              ) : (
                <Link
                  href="/install"
                  className="px-8 py-3 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-7xl mx-auto text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
            <span className="text-white/90 font-medium">Turn Abandoning Visitors Into Customers</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 animate-fade-in-up">
            <span className="block bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
              Stop Cart
            </span>
            <span className="block bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent mt-2">
              Abandonment
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl mt-4 bg-gradient-to-r from-white/80 to-white/60 bg-clip-text text-transparent font-bold">
              Before It Happens
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Capture <span className="font-bold text-white">10-15%</span> of abandoning visitors with intelligent exit-intent popups.
            <br className="hidden md:block" />
            Boost conversions, grow your email list, and recover lost revenue—all automatically.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animation-delay-400">
            {shopId ? (
              <>
                <Link
                  href="/popups/new"
                  className="group px-10 py-5 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center backdrop-blur-xl"
                >
                  Create Your First Popup
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link
                  href="/analytics"
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
                >
                  View Analytics
                </Link>
              </>
            ) : (
                <Link
                  href="/install"
                  className="group px-12 py-6 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center backdrop-blur-xl"
                >
                Start Free Trial
                <ArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-2 transition-transform" />
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
            {[
              { value: '10-15%', label: 'Conversion Recovery Rate', icon: TrendingUp },
              { value: '69%', label: 'Average Cart Abandonment', icon: Target },
              { value: '3x', label: 'ROI on Recovered Sales', icon: Zap },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                <stat.icon className="h-8 w-8 text-cyan-300 mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-4xl font-black bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-white/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Maximize Conversions
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to help you capture more leads and recover lost sales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                See It In Action
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Beautiful, conversion-optimized popups that work seamlessly across all devices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {galleryImages.map((image, idx) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image.src)}
                className="group relative aspect-video bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 border border-white/10 hover:border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 to-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Maximize2 className="h-12 w-12 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-bold text-lg mb-1">{image.alt}</h3>
                  <p className="text-slate-300 text-sm">{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Loved by Thousands of
              </span>
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Shopify Merchants
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.18),transparent_55%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.18),transparent_55%)]"></div>
            
            <div className="relative text-center">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                Ready to Recover Lost Revenue?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of Shopify stores using ExitIntent Pro to turn abandoning visitors into customers.
              </p>
              <Link
                href={shopId ? "/popups/new" : "/install"}
                className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
              >
                {shopId ? "Create Popup" : "Start Free Trial"}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>© 2024 ExitIntent Pro. Built for Shopify merchants.</p>
        </div>
      </footer>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-6xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Gallery"
              className="rounded-2xl shadow-2xl max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
