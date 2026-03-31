import React, { useState } from 'react';
import { 
  Menu, X, ArrowRight, BarChart3, Target, TrendingUp, 
  Palette, Banknote, CheckCircle, BrainCircuit, FileText, 
  Sparkles, Check, Zap, MessageSquare, Monitor
} from 'lucide-react';

const dynamicBgStyles = `
  @keyframes orb1 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(120px, -80px) scale(1.15); }
    66%  { transform: translate(-60px, 100px) scale(0.9); }
    100% { transform: translate(80px, 40px) scale(1.05); }
  }
  @keyframes orb2 {
    0%   { transform: translate(0px, 0px) scale(1); }
    25%  { transform: translate(-140px, 60px) scale(1.2); }
    50%  { transform: translate(40px, 120px) scale(0.85); }
    75%  { transform: translate(-80px, -60px) scale(1.1); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes orb3 {
    0%   { transform: translate(0px, 0px) scale(0.95); }
    40%  { transform: translate(160px, -110px) scale(1.25); }
    70%  { transform: translate(-100px, -40px) scale(0.85); }
    100% { transform: translate(0px, 0px) scale(0.95); }
  }
  @keyframes orb4 {
    0%   { transform: translate(0px, 0px) scale(1.1); }
    30%  { transform: translate(-120px, 80px) scale(0.8); }
    60%  { transform: translate(80px, 150px) scale(1.2); }
    100% { transform: translate(0px, 0px) scale(1.1); }
  }
  @keyframes orb5 {
    0%   { transform: translate(0px, 0px) scale(1); }
    50%  { transform: translate(200px, -140px) scale(1.3); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes gridDrift {
    0%   { transform: translate(0px, 0px); }
    50%  { transform: translate(-30px, -20px); }
    100% { transform: translate(0px, 0px); }
  }
  @keyframes floatDot1 {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
    50%       { transform: translateY(-28px) translateX(12px); opacity: 0.9; }
  }
  @keyframes floatDot2 {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
    50%       { transform: translateY(20px) translateX(-16px); opacity: 0.8; }
  }
  @keyframes floatDot3 {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
    50%       { transform: translateY(-18px) translateX(-10px); opacity: 1; }
  }
  @keyframes scanLine {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.06; }
    90%  { opacity: 0.06; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
`;

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] font-['Noto_Sans',system-ui,sans-serif] overflow-x-hidden selection:bg-[#00A896]/30 selection:text-[#E0E1DD]">
      <style dangerouslySetInnerHTML={{ __html: dynamicBgStyles }} />
      
      {/* 1. NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl font-bold tracking-wider text-white">ATLAS</span>
              <div className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></div>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Pricing', 'Enterprise'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[#778DA9] hover:text-[#E0E1DD] transition-colors text-sm font-medium"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-[#E0E1DD] hover:text-white transition-colors text-sm font-medium px-4 py-2">
                Sign In
              </button>
              <button className="bg-[#00A896] hover:bg-[#00A896]/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(0,168,150,0.4)]">
                Start Free
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#E0E1DD] hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0D1B2A]/95 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
              {['Features', 'How It Works', 'Pricing', 'Enterprise'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block px-3 py-3 text-[#E0E1DD] hover:bg-white/5 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <button className="w-full text-center border border-white/20 text-[#E0E1DD] px-5 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors">
                  Sign In
                </button>
                <button className="w-full text-center bg-[#00A896] text-white px-5 py-3 rounded-lg font-semibold shadow-lg shadow-[#00A896]/20">
                  Start Free
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Base deep bg */}
          <div className="absolute inset-0 bg-[#0D1B2A]" />

          {/* Hero image — very subtle texture underneath orbs */}
          <img
            src="/__mockup/images/atlas-hero-bg.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-luminosity"
          />

          {/* Orb 1 — large teal, top-left, slowest */}
          <div
            className="absolute rounded-full blur-[130px] pointer-events-none"
            style={{
              width: 700, height: 700,
              top: '-5%', left: '-5%',
              background: 'radial-gradient(circle, rgba(0,168,150,0.22) 0%, transparent 70%)',
              animation: 'orb1 22s ease-in-out infinite',
            }}
          />
          {/* Orb 2 — deep blue, top-right */}
          <div
            className="absolute rounded-full blur-[110px] pointer-events-none"
            style={{
              width: 600, height: 600,
              top: '5%', right: '-8%',
              background: 'radial-gradient(circle, rgba(0,80,255,0.14) 0%, transparent 70%)',
              animation: 'orb2 18s ease-in-out infinite',
            }}
          />
          {/* Orb 3 — teal accent, bottom-center */}
          <div
            className="absolute rounded-full blur-[150px] pointer-events-none"
            style={{
              width: 800, height: 800,
              bottom: '-20%', left: '25%',
              background: 'radial-gradient(circle, rgba(0,168,150,0.16) 0%, transparent 65%)',
              animation: 'orb3 26s ease-in-out infinite',
            }}
          />
          {/* Orb 4 — blue-purple, mid-left */}
          <div
            className="absolute rounded-full blur-[120px] pointer-events-none"
            style={{
              width: 500, height: 500,
              top: '35%', left: '5%',
              background: 'radial-gradient(circle, rgba(60,0,180,0.10) 0%, transparent 70%)',
              animation: 'orb4 14s ease-in-out infinite',
            }}
          />
          {/* Orb 5 — small bright teal, center-right */}
          <div
            className="absolute rounded-full blur-[80px] pointer-events-none"
            style={{
              width: 300, height: 300,
              top: '30%', right: '20%',
              background: 'radial-gradient(circle, rgba(0,200,180,0.25) 0%, transparent 70%)',
              animation: 'orb5 10s ease-in-out infinite',
            }}
          />

          {/* Drifting mesh grid */}
          <div
            className="absolute inset-[-60px] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(224,225,221,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(224,225,221,0.03) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
              animation: 'gridDrift 30s ease-in-out infinite',
            }}
          />

          {/* Floating particles */}
          {[
            { top: '15%', left: '22%', size: 3, anim: 'floatDot1 6s ease-in-out infinite', delay: '0s' },
            { top: '28%', left: '68%', size: 2, anim: 'floatDot2 8s ease-in-out infinite', delay: '1s' },
            { top: '55%', left: '14%', size: 4, anim: 'floatDot3 7s ease-in-out infinite', delay: '2s' },
            { top: '72%', left: '45%', size: 2, anim: 'floatDot1 9s ease-in-out infinite', delay: '0.5s' },
            { top: '40%', left: '80%', size: 3, anim: 'floatDot2 5s ease-in-out infinite', delay: '1.5s' },
            { top: '18%', left: '85%', size: 2, anim: 'floatDot3 10s ease-in-out infinite', delay: '3s' },
            { top: '62%', left: '72%', size: 3, anim: 'floatDot1 7s ease-in-out infinite', delay: '2.5s' },
            { top: '82%', left: '30%', size: 2, anim: 'floatDot2 6s ease-in-out infinite', delay: '4s' },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                top: p.top, left: p.left,
                width: p.size, height: p.size,
                background: '#00A896',
                boxShadow: `0 0 ${p.size * 4}px rgba(0,168,150,0.8)`,
                animation: p.anim,
                animationDelay: p.delay,
              }}
            />
          ))}

          {/* Slow horizontal scan line — subtle CRT effect */}
          <div
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,168,150,0.15), transparent)',
              animation: 'scanLine 12s linear infinite',
            }}
          />

          {/* Bottom fade into page */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center mt-12 sm:mt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-[#00A896]" />
            <span className="text-xs font-medium text-[#E0E1DD] uppercase tracking-wider">Introducing ATLAS 2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white mb-6 leading-[1.1]">
            ATLAS <span className="text-[#00A896]">AI</span> Incubator
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-medium text-[#778DA9] mb-8 max-w-3xl mx-auto leading-tight">
            AI-Powered Strategic Planning
          </h2>
          
          <p className="text-lg md:text-xl text-[#E0E1DD] max-w-2xl mx-auto mb-10 leading-relaxed opacity-90">
            Transform raw startup concepts into structured, validated ventures. 
            23 intelligent agents working for your vision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <button className="w-full sm:w-auto group relative flex items-center justify-center gap-2 bg-[#00A896] hover:bg-[#00A896]/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,168,150,0.5)] overflow-hidden">
              <span className="relative z-10">Start Building Free</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-[#415A77] hover:border-[#E0E1DD] hover:bg-white/5 text-[#E0E1DD] px-8 py-4 rounded-xl text-lg font-semibold transition-all">
              Watch Demo
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-sm font-medium text-[#778DA9]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></div>
              23 AI Tools
            </div>
            <div className="w-px h-4 bg-[#415A77] hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></div>
              5 Languages
            </div>
            <div className="w-px h-4 bg-[#415A77] hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></div>
              Real-Time Analysis
            </div>
          </div>
        </div>
        
      </section>

      {/* 3. FEATURES STRIP */}
      <section className="bg-[#1B263B] py-8 border-y border-[#415A77]/30 relative z-20">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide no-scrollbar snap-x">
            {[
              "Market Intelligence", 
              "Competitor Analysis", 
              "Financial Modeling", 
              "Brand Identity", 
              "Funding Strategy", 
              "Problem Validation"
            ].map((feature, i) => (
              <div key={i} className="flex-none snap-center flex items-center gap-2 sm:gap-4 whitespace-nowrap">
                <span className="text-[#E0E1DD] font-medium text-sm sm:text-base">{feature}</span>
                {i < 5 && <div className="w-1.5 h-1.5 rounded-full bg-[#415A77] hidden sm:block"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[#0D1B2A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From Concept to Venture in Minutes</h2>
            <p className="text-[#778DA9] max-w-2xl mx-auto">Our multi-agent system processes your ideas through rigorous strategic frameworks automatically.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[#415A77] to-transparent z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-[#1B263B] border border-[#415A77] flex items-center justify-center mb-6 shadow-xl group-hover:border-[#00A896] group-hover:scale-110 transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#00A896] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(0,168,150,0.5)]">1</div>
                <MessageSquare className="w-10 h-10 text-[#E0E1DD] group-hover:text-[#00A896] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Describe Your Venture</h3>
              <p className="text-[#778DA9] leading-relaxed">Input your core concept, target audience, and initial hypothesis in plain English.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group mt-8 md:mt-0">
              <div className="w-24 h-24 rounded-2xl bg-[#1B263B] border border-[#415A77] flex items-center justify-center mb-6 shadow-xl group-hover:border-[#00A896] group-hover:scale-110 transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#00A896] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(0,168,150,0.5)]">2</div>
                <BrainCircuit className="w-10 h-10 text-[#E0E1DD] group-hover:text-[#00A896] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Agents Analyze</h3>
              <p className="text-[#778DA9] leading-relaxed">23 specialized AI agents collaborate to validate, model, and research your market.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group mt-8 md:mt-0">
              <div className="w-24 h-24 rounded-2xl bg-[#1B263B] border border-[#415A77] flex items-center justify-center mb-6 shadow-xl group-hover:border-[#00A896] group-hover:scale-110 transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#00A896] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(0,168,150,0.5)]">3</div>
                <FileText className="w-10 h-10 text-[#E0E1DD] group-hover:text-[#00A896] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Receive Structured Reports</h3>
              <p className="text-[#778DA9] leading-relaxed">Get comprehensive, actionable business plans, financial models, and pitch materials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOOLS SHOWCASE */}
      <section id="features" className="py-24 bg-[#0D1B2A] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-[#00A896]/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute left-0 bottom-1/4 w-[500px] h-[500px] bg-[#415A77]/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">23 AI-Powered Tools, <br/><span className="text-[#778DA9]">One Platform</span></h2>
              <p className="text-lg text-[#E0E1DD] opacity-90">An entire startup studio packed into a single dashboard. Everything you need from ideation to series A.</p>
            </div>
            <button className="text-[#00A896] hover:text-[#E0E1DD] font-medium flex items-center gap-2 group transition-colors self-start md:self-auto">
              View All Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: "Market Analysis", desc: "Deep market sizing and opportunity mapping" },
              { icon: Target, title: "Competitor Intelligence", desc: "AI-powered competitive landscape analysis" },
              { icon: TrendingUp, title: "Financial Modeling", desc: "Revenue projections and burn rate planning" },
              { icon: Palette, title: "Brand Identity", desc: "Logo concepts, color systems, and voice" },
              { icon: Banknote, title: "Funding Strategy", desc: "Investor targeting and pitch optimization" },
              { icon: CheckCircle, title: "Problem Validation", desc: "Evidence-based problem-solution fit" }
            ].map((tool, i) => (
              <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/10 hover:border-[#00A896]/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="w-14 h-14 rounded-xl bg-[#0D1B2A] border border-[#415A77] flex items-center justify-center mb-6 group-hover:border-[#00A896] transition-colors">
                  <tool.icon className="w-6 h-6 text-[#00A896]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00A896] transition-colors">{tool.title}</h3>
                <p className="text-[#778DA9]">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATS / SOCIAL PROOF */}
      <section className="py-20 bg-[#0A141F] border-y border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-white/5">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">500+</span>
              <span className="text-sm font-medium text-[#778DA9] uppercase tracking-wider">Ventures Analyzed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">23</span>
              <span className="text-sm font-medium text-[#778DA9] uppercase tracking-wider">AI Agents</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">3</span>
              <span className="text-sm font-medium text-[#778DA9] uppercase tracking-wider">AI Providers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">5</span>
              <span className="text-sm font-medium text-[#778DA9] uppercase tracking-wider">Languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section id="pricing" className="py-24 bg-[#0D1B2A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#778DA9] max-w-2xl mx-auto text-lg">Scale your strategic planning without scaling your budget.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Card */}
            <div className="bg-[#1B263B] border border-[#415A77] rounded-3xl p-8 flex flex-col hover:border-[#778DA9] transition-colors">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-[#778DA9]">Perfect for exploring your first ideas.</p>
              </div>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">Free</span>
                <span className="text-[#778DA9]">forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-[#E0E1DD]"><Check className="w-5 h-5 text-[#415A77] shrink-0 mt-0.5" /> 5 analysis credits per month</li>
                <li className="flex items-start gap-3 text-[#E0E1DD]"><Check className="w-5 h-5 text-[#415A77] shrink-0 mt-0.5" /> Core validation tools</li>
                <li className="flex items-start gap-3 text-[#E0E1DD]"><Check className="w-5 h-5 text-[#415A77] shrink-0 mt-0.5" /> Community access</li>
                <li className="flex items-start gap-3 text-[#778DA9]"><X className="w-5 h-5 shrink-0 mt-0.5" /> Export reports</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-semibold border border-[#415A77] text-[#E0E1DD] hover:bg-white/5 transition-colors">
                Get Started Free
              </button>
            </div>

            {/* Pro Card */}
            <div className="bg-[#1B263B] border border-[#00A896] rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(0,168,150,0.15)] transform md:-translate-y-4">
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <div className="bg-gradient-to-r from-[#00A896] to-[#008f80] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                  Most Popular
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-[#778DA9]">For serious founders and incubators.</p>
              </div>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">$29</span>
                <span className="text-[#778DA9]">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-white"><Check className="w-5 h-5 text-[#00A896] shrink-0 mt-0.5" /> Unlimited analyses</li>
                <li className="flex items-start gap-3 text-white"><Check className="w-5 h-5 text-[#00A896] shrink-0 mt-0.5" /> All 23 AI tools</li>
                <li className="flex items-start gap-3 text-white"><Check className="w-5 h-5 text-[#00A896] shrink-0 mt-0.5" /> Priority AI processing</li>
                <li className="flex items-start gap-3 text-white"><Check className="w-5 h-5 text-[#00A896] shrink-0 mt-0.5" /> Export full reports (PDF/Doc)</li>
                <li className="flex items-start gap-3 text-white"><Check className="w-5 h-5 text-[#00A896] shrink-0 mt-0.5" /> Team collaboration (up to 3)</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-[#00A896] to-[#008f80] text-white hover:from-[#00bda9] hover:to-[#00A896] shadow-lg shadow-[#00A896]/20 transition-all hover:scale-[1.02]">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA BANNER */}
      <section className="py-20 bg-gradient-to-br from-[#00A896] to-[#005c6e] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white blur-[2px]"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border-[40px] border-white blur-[2px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Launch Your Venture?</h2>
          <p className="text-xl text-white/90 mb-10 font-medium">Start with ATLAS today — no credit card required.</p>
          <button className="bg-white text-[#005c6e] px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-2xl shadow-xl flex items-center gap-3 mx-auto group">
            Start Building Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#050B14] pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold tracking-wider text-white">ATLAS</span>
                <div className="w-2 h-2 rounded-full bg-[#00A896]"></div>
              </div>
              <p className="text-[#778DA9] mb-8 text-sm leading-relaxed">
                Transform raw startup concepts into structured, validated ventures with AI.
              </p>
              <div className="text-[#415A77] text-sm">
                &copy; 2026 ATLAS AI Incubator.
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase">Product</h4>
              <ul className="space-y-4 text-sm text-[#778DA9]">
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase">Resources</h4>
              <ul className="space-y-4 text-sm text-[#778DA9]">
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Strategic Guides</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Example Ventures</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase">Company</h4>
              <ul className="space-y-4 text-sm text-[#778DA9]">
                <li><a href="#" className="hover:text-[#00A896] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#00A896] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
