
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        onClose();
      } else {
        await register({ email, password });
        // If register successful, switch to login or auto-login
        setIsLogin(true);
        setError('Registration successful! Please sign in.');
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      if (isLogin) setIsLoading(false); // Keep loading false if we switched tabs
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-brand-secondary rounded-xl shadow-2xl w-full max-w-md border border-brand-accent overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex border-b border-brand-accent">
              <button
                className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? 'bg-brand-teal/10 text-brand-teal border-b-2 border-brand-teal' : 'text-brand-light hover:text-brand-text'}`}
                onClick={() => { setIsLogin(true); setError(null); }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? 'bg-brand-teal/10 text-brand-teal border-b-2 border-brand-teal' : 'text-brand-light hover:text-brand-text'}`}
                onClick={() => { setIsLogin(false); setError(null); }}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-bold text-brand-text mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-sm text-brand-light mb-6">
                {isLogin ? 'Access your ATLAS workspace.' : 'Start your venture journey today.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-light uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-brand-primary/50 border border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none text-brand-text"
                    placeholder="founder@startup.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-light uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-brand-primary/50 border border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none text-brand-text"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className={`p-3 rounded-lg text-sm ${error.includes('successful') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-teal hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
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
