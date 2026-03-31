import React, { useState } from 'react';
import {
  HiMenu, HiX, HiArrowRight, HiArrowLeft, HiCheckCircle,
  HiDocumentText, HiCheck, HiSparkles, HiChatAlt,
  HiDesktopComputer,
} from 'react-icons/hi';
import {
  MdBarChart, MdTrendingUp, MdPalette,
  MdAttachMoney, MdPsychology, MdOutlineTrackChanges,
} from 'react-icons/md';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../locales';

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

interface LandingPageProps {
  onSignIn: () => void;
  onEnterApp: () => void;
  isAuthenticated: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onEnterApp, isAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const ArrowIcon = isRTL ? HiArrowLeft : HiArrowRight;

  const handlePrimary = () => isAuthenticated ? onEnterApp() : onSignIn();

  const navLinks = [
    { label: t('landingNavFeatures'), href: '#features' },
    { label: t('landingNavHowItWorks'), href: '#how-it-works' },
    { label: t('landingNavPricing'), href: '#pricing' },
  ];

  const tools = [
    { icon: <MdBarChart className="w-6 h-6 text-[#00A896]" />, title: t('landingTool1Title'), desc: t('landingTool1Desc') },
    { icon: <MdOutlineTrackChanges className="w-6 h-6 text-[#00A896]" />, title: t('landingTool2Title'), desc: t('landingTool2Desc') },
    { icon: <MdTrendingUp className="w-6 h-6 text-[#00A896]" />, title: t('landingTool3Title'), desc: t('landingTool3Desc') },
    { icon: <MdPalette className="w-6 h-6 text-[#00A896]" />, title: t('landingTool4Title'), desc: t('landingTool4Desc') },
    { icon: <MdAttachMoney className="w-6 h-6 text-[#00A896]" />, title: t('landingTool5Title'), desc: t('landingTool5Desc') },
    { icon: <HiCheckCircle className="w-6 h-6 text-[#00A896]" />, title: t('landingTool6Title'), desc: t('landingTool6Desc') },
  ];

  const features = [
    t('landingFeature1'), t('landingFeature2'), t('landingFeature3'),
    t('landingFeature4'), t('landingFeature5'), t('landingFeature6'),
  ];

  const starterFeatures = [
    t('landingPricingStarterF1'),
    t('landingPricingStarterF2'),
    t('landingPricingStarterF3'),
  ];

  const proFeatures = [
    t('landingPricingProF1'),
    t('landingPricingProF2'),
    t('landingPricingProF3'),
    t('landingPricingProF4'),
    t('landingPricingProF5'),
  ];

  const footerCols = [
    {
      heading: t('landingFooterProduct'),
      links: [t('landingFooterFeatures'), t('landingNavPricing'), t('landingFooterApiRef'), t('landingFooterRoadmap')],
    },
    {
      heading: t('landingFooterResources'),
      links: [t('landingFooterDocs'), t('landingFooterBlog'), t('landingFooterGuides'), t('landingFooterExamples')],
    },
    {
      heading: t('landingFooterCompany'),
      links: [t('landingFooterAbout'), t('landingFooterCareers'), t('landingFooterPrivacy'), t('landingFooterTerms')],
    },
  ];

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] font-sans overflow-x-hidden"
      style={{ fontFamily: isRTL ? "'Noto Sans Arabic', 'Noto Sans', sans-serif" : undefined }}
    >
      <style dangerouslySetInnerHTML={{ __html: dynamicBgStyles }} />

      {/* 1. NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl font-bold tracking-wider text-white">ATLAS</span>
              <div className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></div>
            </div>

            <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-8`}>
              {navLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-[#778DA9] hover:text-[#E0E1DD] transition-colors text-sm font-medium"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
              {/* Language switcher */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                {languages.map(({ key, name }) => (
                  <button
                    key={key}
                    onClick={() => setLanguage(key)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                      language === key
                        ? 'bg-[#00A896] text-white shadow-inner'
                        : 'text-[#778DA9] hover:text-[#E0E1DD] hover:bg-white/5'
                    }`}
                    aria-pressed={language === key}
                    title={name}
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>

              {!isAuthenticated && (
                <button
                  onClick={onSignIn}
                  className="text-[#E0E1DD] hover:text-white transition-colors text-sm font-medium px-4 py-2"
                >
                  {t('signIn')}
                </button>
              )}
              <button
                onClick={handlePrimary}
                className="bg-[#00A896] hover:bg-[#00A896]/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(0,168,150,0.4)]"
              >
                {isAuthenticated ? t('landingOpenDashboard') : t('landingStartFree')}
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#E0E1DD] hover:text-white p-2"
              >
                {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0D1B2A]/95 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
              {navLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="block px-3 py-3 text-[#E0E1DD] hover:bg-white/5 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              {/* Mobile language switcher */}
              <div className="flex items-center gap-2 pt-2 pb-1">
                {languages.map(({ key, name }) => (
                  <button
                    key={key}
                    onClick={() => { setLanguage(key); setIsMobileMenuOpen(false); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      language === key
                        ? 'bg-[#00A896] text-white'
                        : 'bg-white/5 border border-white/10 text-[#778DA9] hover:text-[#E0E1DD]'
                    }`}
                    aria-pressed={language === key}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-3">
                {!isAuthenticated && (
                  <button
                    onClick={onSignIn}
                    className="w-full text-center border border-white/20 text-[#E0E1DD] px-5 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors"
                  >
                    {t('signIn')}
                  </button>
                )}
                <button
                  onClick={handlePrimary}
                  className="w-full text-center bg-[#00A896] text-white px-5 py-3 rounded-lg font-semibold shadow-lg shadow-[#00A896]/20"
                >
                  {isAuthenticated ? t('landingOpenDashboard') : t('landingStartFree')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#0D1B2A]" />

          <img
            src="/atlas-hero-bg.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-luminosity"
          />

          <div className="absolute rounded-full pointer-events-none" style={{ width: 700, height: 700, top: '-5%', left: '-5%', filter: 'blur(130px)', background: 'radial-gradient(circle, rgba(0,168,150,0.22) 0%, transparent 70%)', animation: 'orb1 22s ease-in-out infinite' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 600, height: 600, top: '5%', right: '-8%', filter: 'blur(110px)', background: 'radial-gradient(circle, rgba(0,80,255,0.14) 0%, transparent 70%)', animation: 'orb2 18s ease-in-out infinite' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 800, height: 800, bottom: '-20%', left: '25%', filter: 'blur(150px)', background: 'radial-gradient(circle, rgba(0,168,150,0.16) 0%, transparent 65%)', animation: 'orb3 26s ease-in-out infinite' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 500, height: 500, top: '35%', left: '5%', filter: 'blur(120px)', background: 'radial-gradient(circle, rgba(60,0,180,0.10) 0%, transparent 70%)', animation: 'orb4 14s ease-in-out infinite' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, top: '30%', right: '20%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(0,200,180,0.25) 0%, transparent 70%)', animation: 'orb5 10s ease-in-out infinite' }} />

          <div className="absolute pointer-events-none" style={{ inset: '-60px', backgroundImage: 'linear-gradient(rgba(224,225,221,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(224,225,221,0.03) 1px, transparent 1px)', backgroundSize: '72px 72px', animation: 'gridDrift 30s ease-in-out infinite' }} />

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
            <div key={i} className="absolute rounded-full pointer-events-none" style={{ top: p.top, left: p.left, width: p.size, height: p.size, background: '#00A896', boxShadow: `0 0 ${p.size * 4}px rgba(0,168,150,0.8)`, animation: p.anim, animationDelay: p.delay }} />
          ))}

          <div className="absolute left-0 right-0 h-[2px] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,168,150,0.15), transparent)', animation: 'scanLine 12s linear infinite' }} />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center mt-12 sm:mt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <HiSparkles className="w-4 h-4 text-[#00A896]" />
            <span className="text-xs font-medium text-[#E0E1DD] uppercase tracking-wider">{t('landingBadge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white mb-6 leading-[1.1]">
            ATLAS <span className="text-[#00A896]">AI</span> Incubator
          </h1>

          <h2 className="text-2xl md:text-3xl font-medium text-[#778DA9] mb-8 max-w-3xl mx-auto leading-tight">
            {t('landingHeroSubtitle')}
          </h2>

          <p className="text-lg md:text-xl text-[#E0E1DD] max-w-2xl mx-auto mb-10 leading-relaxed opacity-90">
            {t('landingHeroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <button
              onClick={handlePrimary}
              className="w-full sm:w-auto group relative flex items-center justify-center gap-2 bg-[#00A896] hover:bg-[#00A896]/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,168,150,0.5)] overflow-hidden"
            >
              <span className="relative z-10">
                {isAuthenticated ? t('landingOpenDashboard') : t('landingHeroCtaPrimary')}
              </span>
              <ArrowIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={onSignIn}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-[#415A77] hover:border-[#E0E1DD] hover:bg-white/5 text-[#E0E1DD] px-8 py-4 rounded-xl text-lg font-semibold transition-all"
              >
                {t('signIn')}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-sm font-medium text-[#778DA9]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></div>
              {t('landingHeroStat1')}
            </div>
            <div className="w-px h-4 bg-[#415A77] hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></div>
              {t('landingHeroStat2')}
            </div>
            <div className="w-px h-4 bg-[#415A77] hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A896]"></div>
              {t('landingHeroStat3')}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES STRIP */}
      <section className="bg-[#1B263B] py-8 border-y border-[#415A77]/30 relative z-20">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 overflow-x-auto pb-4 sm:pb-0">
            {features.map((feature, i) => (
              <div key={i} className="flex-none flex items-center gap-2 sm:gap-4 whitespace-nowrap">
                <span className="text-[#E0E1DD] font-medium text-sm sm:text-base">{feature}</span>
                {i < features.length - 1 && <div className="w-1.5 h-1.5 rounded-full bg-[#415A77] hidden sm:block"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[#0D1B2A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landingHiwTitle')}</h2>
            <p className="text-[#778DA9] max-w-2xl mx-auto">{t('landingHiwSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[#415A77] to-transparent z-0" />
            {[
              { icon: <HiChatAlt className="w-10 h-10" />, step: 1, title: t('landingHiwStep1Title'), desc: t('landingHiwStep1Desc') },
              { icon: <MdPsychology className="w-10 h-10" />, step: 2, title: t('landingHiwStep2Title'), desc: t('landingHiwStep2Desc') },
              { icon: <HiDocumentText className="w-10 h-10" />, step: 3, title: t('landingHiwStep3Title'), desc: t('landingHiwStep3Desc') },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="relative z-10 flex flex-col items-center text-center group mt-8 md:mt-0">
                <div className="w-24 h-24 rounded-2xl bg-[#1B263B] border border-[#415A77] flex items-center justify-center mb-6 shadow-xl group-hover:border-[#00A896] group-hover:scale-110 transition-all duration-300 relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#00A896] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(0,168,150,0.5)]">{step}</div>
                  <span className="text-[#E0E1DD] group-hover:text-[#00A896] transition-colors">{icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-[#778DA9] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOOLS SHOWCASE */}
      <section id="features" className="py-24 bg-[#0D1B2A] relative overflow-hidden">
        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-[#00A896]/10 rounded-full pointer-events-none" style={{ filter: 'blur(150px)' }} />
        <div className="absolute left-0 bottom-1/4 w-[500px] h-[500px] bg-[#415A77]/20 rounded-full pointer-events-none" style={{ filter: 'blur(120px)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {t('landingToolsTitle')}<br /><span className="text-[#778DA9]">{t('landingToolsTitleSub')}</span>
              </h2>
              <p className="text-lg text-[#E0E1DD] opacity-90">{t('landingToolsDesc')}</p>
            </div>
            <button
              onClick={handlePrimary}
              className="text-[#00A896] hover:text-[#E0E1DD] font-medium flex items-center gap-2 group transition-colors self-start md:self-auto"
            >
              {t('landingViewAllTools')} <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <div
                key={i}
                onClick={handlePrimary}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/10 hover:border-[#00A896]/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="w-14 h-14 rounded-xl bg-[#0D1B2A] border border-[#415A77] flex items-center justify-center mb-6 group-hover:border-[#00A896] transition-colors">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00A896] transition-colors">{tool.title}</h3>
                <p className="text-[#778DA9]">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATS */}
      <section className="py-20 bg-[#0A141F] border-y border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-white/5">
            {[
              { value: '500+', label: t('landingStatVenturesLabel') },
              { value: '23', label: t('landingStatAgentsLabel') },
              { value: '3', label: t('landingStatProvidersLabel') },
              { value: '5', label: t('landingStatLanguagesLabel') },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{value}</span>
                <span className="text-sm font-medium text-[#778DA9] uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section id="pricing" className="py-24 bg-[#0D1B2A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('landingPricingTitle')}</h2>
            <p className="text-[#778DA9] max-w-2xl mx-auto text-lg">{t('landingPricingSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="bg-[#1B263B] border border-[#415A77] rounded-3xl p-8 flex flex-col hover:border-[#778DA9] transition-colors">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t('landingPricingStarterTitle')}</h3>
                <p className="text-[#778DA9]">{t('landingPricingStarterDesc')}</p>
              </div>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">{t('landingPricingFree')}</span>
                <span className="text-[#778DA9]">{t('landingPricingForever')}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {starterFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#E0E1DD]">
                    <HiCheck className="w-5 h-5 text-[#415A77] shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-[#778DA9]">
                  <HiX className="w-5 h-5 shrink-0 mt-0.5" /> {t('landingPricingStarterF4')}
                </li>
              </ul>
              <button
                onClick={handlePrimary}
                className="w-full py-4 rounded-xl font-semibold border border-[#415A77] text-[#E0E1DD] hover:bg-white/5 transition-colors"
              >
                {isAuthenticated ? t('landingOpenDashboard') : t('landingPricingGetStarted')}
              </button>
            </div>

            {/* Pro */}
            <div className="bg-[#1B263B] border border-[#00A896] rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(0,168,150,0.15)] md:-translate-y-4">
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <div className="bg-gradient-to-r from-[#00A896] to-[#008f80] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                  {t('landingPricingMostPopular')}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t('landingPricingProTitle')}</h3>
                <p className="text-[#778DA9]">{t('landingPricingProDesc')}</p>
              </div>
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">$29</span>
                <span className="text-[#778DA9]">{t('landingPricingProMonth')}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {proFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white">
                    <HiCheck className="w-5 h-5 text-[#00A896] shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handlePrimary}
                className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-[#00A896] to-[#008f80] text-white hover:from-[#00bda9] hover:to-[#00A896] shadow-lg shadow-[#00A896]/20 transition-all hover:scale-[1.02]"
              >
                {isAuthenticated ? t('landingOpenDashboard') : t('landingPricingUpgradePro')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA BANNER */}
      <section className="py-20 bg-gradient-to-br from-[#00A896] to-[#005c6e] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white" style={{ filter: 'blur(2px)' }} />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border-[40px] border-white" style={{ filter: 'blur(2px)' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">{t('landingCtaTitle')}</h2>
          <p className="text-xl text-white/90 mb-10 font-medium">{t('landingCtaSubtitle')}</p>
          <button
            onClick={handlePrimary}
            className="bg-white text-[#005c6e] px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-2xl shadow-xl inline-flex items-center gap-3 group"
          >
            {isAuthenticated ? t('landingOpenDashboard') : t('landingCtaButton')}
            <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                <div className="w-2 h-2 rounded-full bg-[#00A896]" />
              </div>
              <p className="text-[#778DA9] mb-8 text-sm leading-relaxed">
                {t('landingFooterDesc')}
              </p>
              <div className="text-[#415A77] text-sm">{t('landingFooterCopyright')}</div>
            </div>

            {footerCols.map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase">{heading}</h4>
                <ul className="space-y-4 text-sm text-[#778DA9]">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-[#00A896] transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
