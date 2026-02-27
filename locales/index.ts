import { en } from './en';
import { fr } from './fr';
import { ar } from './ar';

export const translations = {
  en,
  fr,
  ar,
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;

export const languages: { key: Language; name: string }[] = [
  { key: 'en', name: 'English' },
  { key: 'fr', name: 'Français' },
  { key: 'ar', name: 'العربية' },
];
