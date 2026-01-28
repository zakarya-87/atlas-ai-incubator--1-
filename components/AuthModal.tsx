import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const credentials = { email, password };
      if (isLogin) {
        await login(credentials);
      } else {
        await register(credentials);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || (isLogin ? t('loginFailed') : t('signUpFailed')));
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="bg-brand-secondary rounded-xl shadow-2xl w-full max-w-md border border-brand-accent overflow-hidden"
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex border-b border-brand-accent">
              <button
                className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? 'bg-brand-teal/10 text-brand-teal border-b-2 border-brand-teal' : 'text-brand-light hover:text-brand-text'}`}
                onClick={() => setIsLogin(true)}
                tabIndex={0}
              >
                {t('signIn')}
              </button>
              <button
                className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? 'bg-brand-teal/10 text-brand-teal border-b-2 border-brand-teal' : 'text-brand-light hover:text-brand-text'}`}
                onClick={() => setIsLogin(false)}
                tabIndex={0}
              >
                {t('signUp')}
              </button>
            </div>
            <div className="p-8">
              <h3
                id="auth-modal-title"
                className="text-2xl font-bold text-brand-text mb-2"
              >
                {isLogin ? t('welcomeBack') : t('createAccount')}
              </h3>
              <p className="text-sm text-brand-light mb-6">
                {isLogin ? t('accessWorkspace') : t('getStarted')}
              </p>
              {error && (
                <p className="text-red-400 text-sm mb-4" role="alert">
                  {error}
                </p>
              )}
              <form onSubmit={handleAuthAction} className="space-y-4">
                <div>
                  <label
                    className="block text-xs font-bold text-brand-light uppercase mb-1"
                    htmlFor="email"
                  >
                    {t('email')}
                  </label>
                  <input
                    id="email"
                    aria-label={t('email')}
                    aria-required="true"
                    className="w-full p-3 bg-brand-primary/50 border border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none text-brand-text"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold text-brand-light uppercase mb-1"
                    htmlFor="password"
                  >
                    {t('password')}
                  </label>
                  <input
                    id="password"
                    aria-label={t('password')}
                    className="w-full p-3 bg-brand-primary/50 border border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none text-brand-text"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-teal hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex={0}
                  aria-label={`Submit ${isLogin ? t('signIn') : t('signUp')}`}
                >
                  {isLogin ? t('signIn') : t('signUp')}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
