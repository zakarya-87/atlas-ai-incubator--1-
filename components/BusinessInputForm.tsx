import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { FaUpload, FaTimes } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import type { AnyTool } from '../types';

interface BusinessInputFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (image?: string) => void;
  isLoading: boolean;
  activeTool: AnyTool;
  extraFields?: React.ReactNode;
}

const BusinessInputForm: React.FC<BusinessInputFormProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  activeTool,
  extraFields,
}) => {
  const { t } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInputQuality = () => {
    const length = value.trim().length;
    if (length === 0) return null;
    if (length < 30) return 'Poor';
    if (length < 80) return 'Fair';
    return 'Good';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(imagePreview || undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        // Handle file read error gracefully
        console.error('Error reading file');
      };
      reader.readAsDataURL(file);
    } else {
      // Handle invalid file type
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      role="form"
      aria-label={
        activeTool === 'swot'
          ? 'SWOT Analysis Input Form'
          : 'Competitor Analysis Input Form'
      }
    >
      <div>
        <label
          htmlFor="business-description"
          className="block text-lg font-semibold text-brand-light mb-2"
        >
          {activeTool === 'swot'
            ? t('businessDescriptionLabel')
            : t('competitorInfoLabel')}
        </label>
        <div className="relative">
          <textarea
            id="business-description"
            aria-label={
              activeTool === 'swot'
                ? t('businessDescriptionLabel')
                : t('competitorInfoLabel')
            }
            aria-describedby="char-count"
            className="w-full h-40 p-4 bg-brand-primary/50 border-2 border-brand-accent rounded-xl focus:ring-2 focus:ring-brand-teal focus:outline-none transition-all duration-300 resize-y text-brand-text placeholder-brand-accent/60 leading-relaxed font-sans"
            placeholder={t('businessDescriptionPlaceholder')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (
                (e.ctrlKey || e.metaKey) &&
                e.key === 'Enter' &&
                !isLoading &&
                value.trim().length >= 10
              ) {
                onSubmit(imagePreview || undefined);
              }
            }}
            disabled={isLoading}
            rows={5}
          />
          <div
            id="char-count"
            aria-live="polite"
            role={isLoading ? undefined : 'status'}
            className="text-sm text-brand-light/50 absolute bottom-2 right-2"
          >
            {getInputQuality() && (
              <span className="mr-2">{getInputQuality()}</span>
            )}
            {value.length} / 2000
          </div>
        </div>
      </div>

      {activeTool === 'competitorAnalysis' && (
        <div className="p-4 bg-brand-secondary/30 rounded-lg border border-dashed border-brand-accent/50">
          <label
            htmlFor="image-upload"
            className="block text-sm font-semibold text-brand-light mb-2"
          >
            <FaUpload className="inline-block mr-2" />
            {t('uploadScreenshotLabel')}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
            aria-describedby="image-upload-description"
            disabled={isLoading}
          />
          <p
            id="image-upload-description"
            className="text-xs text-brand-light/50 mt-1"
          >
            {t('uploadScreenshotDescription')}
          </p>
          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview}
                alt="Uploaded screenshot preview"
                className="max-w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
                aria-label="Remove image"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      )}

      {extraFields}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <p
          className="text-sm text-brand-light text-center sm:text-left order-2 sm:order-1"
          role="note"
        >
          {t('inputHintPrefix')}{' '}
          <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            Enter
          </kbd>{' '}
          {t('inputHintSuffix')}
        </p>
        <motion.button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-brand-teal hover:bg-teal-500 disabled:bg-brand-accent disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 order-1 sm:order-2 flex items-center justify-center"
          disabled={isLoading || value.trim().length < 10}
          whileHover={{ scale: !isLoading ? 1.05 : 1 }}
          whileTap={{ scale: !isLoading ? 0.95 : 1 }}
          aria-label={isLoading ? t('buttonGenerating') : t('buttonGenerate')}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center text-brand-light">
              <LoadingSpinner />
              <p className="mt-4 text-lg font-semibold">{t('loadingTitle')}</p>
              <p className="text-sm">{t('loadingText')}</p>
            </div>
          ) : (
            t('buttonGenerate')
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default BusinessInputForm;
