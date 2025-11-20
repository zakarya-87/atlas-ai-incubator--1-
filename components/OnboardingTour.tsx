import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';

export interface TourStep {
  target?: string;
  titleKey: TranslationKey;
  contentKey: TranslationKey;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onFinish }) => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = useMemo(() => steps[currentStep], [steps, currentStep]);

  useEffect(() => {
    const updateRect = () => {
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        } else {
            // If element is not on the page, just center the tooltip
            setTargetRect(null);
        }
      } else {
        setTargetRect(null); // For centered steps like welcome/end
      }
    };

    // Delay to allow UI to settle before calculating position
    const timeoutId = setTimeout(updateRect, 100);
    window.addEventListener('resize', updateRect);
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updateRect);
    }
  }, [step]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const tooltipStyle = useMemo((): React.CSSProperties => {
    if (!targetRect || step.placement === 'center') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    const offset = 12; // 12px gap between element and tooltip
    const isRtl = language === 'ar';

    switch (step.placement) {
      case 'bottom':
        return { top: targetRect.bottom + offset, left: targetRect.left + targetRect.width / 2, transform: 'translateX(-50%)' };
      case 'top':
        return { top: targetRect.top - offset, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
      case 'left':
        return { top: targetRect.top + targetRect.height / 2, left: isRtl ? targetRect.right + offset : targetRect.left - offset, transform: isRtl ? 'translateY(-50%)' : 'translate(-100%, -50%)' };
      case 'right':
        return { top: targetRect.top + targetRect.height / 2, left: isRtl ? targetRect.left - offset : targetRect.right + offset, transform: isRtl ? 'translate(-100%, -50%)' : 'translateY(-50%)' };
      default:
        return { top: targetRect.bottom + offset, left: targetRect.left };
    }
  }, [targetRect, step.placement, language]);

  const spotlightStyle: React.CSSProperties = targetRect ? {
    position: 'fixed',
    left: `${targetRect.left - 8}px`,
    top: `${targetRect.top - 8}px`,
    width: `${targetRect.width + 16}px`,
    height: `${targetRect.height + 16}px`,
    boxShadow: '0 0 0 9999px rgba(13, 27, 42, 0.7)',
    borderRadius: '8px',
    transition: 'all 0.3s ease-in-out',
    pointerEvents: 'none',
    zIndex: 100,
  } : {};
  
  return (
    <div className="fixed inset-0 z-[100]">
        <div className="fixed inset-0 bg-brand-primary/50 backdrop-blur-sm" />
        {targetRect && <div style={spotlightStyle} />}

        <AnimatePresence>
            <motion.div
                key={currentStep}
                className="fixed z-[101] w-80 max-w-[90vw] bg-brand-secondary rounded-lg shadow-2xl p-4 border border-brand-accent"
                style={tooltipStyle}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
                <h3 className="text-lg font-bold text-brand-teal mb-2">{t(step.titleKey)}</h3>
                <p className="text-sm text-brand-text/90 mb-4">{t(step.contentKey)}</p>
                <div className="flex justify-between items-center">
                    <button onClick={onFinish} className="text-xs text-brand-light hover:text-white transition-colors">{t('tourSkip')}</button>
                    <div className="flex items-center gap-2">
                         <span className="text-xs text-brand-light">{currentStep + 1} / {steps.length}</span>
                        {currentStep > 0 && <button onClick={handlePrev} className="px-3 py-1 text-sm bg-brand-accent/50 hover:bg-brand-accent rounded-md transition-colors">{t('tourPrev')}</button>}
                        <button onClick={handleNext} className="px-4 py-1 text-sm bg-brand-teal hover:bg-teal-500 text-white font-semibold rounded-md transition-colors">
                            {currentStep === steps.length - 1 ? t('tourDone') : t('tourNext')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
  );
};

export default OnboardingTour;
