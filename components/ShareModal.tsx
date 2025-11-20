
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { inviteTeamMember } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'contributor' | 'reviewer'>('contributor');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const ventureId = localStorage.getItem('atlas_venture_id');
    if (!ventureId) {
        showToast("No active venture found.", 'error');
        setIsSending(false);
        return;
    }

    try {
        await inviteTeamMember(ventureId, email, role.toUpperCase());
        showToast(`Invitation sent to ${email}`, 'success');
        setEmail('');
        onClose();
    } catch (err: any) {
        showToast(err.message || "Failed to send invite.", 'error');
    } finally {
        setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-brand-secondary rounded-lg shadow-xl w-full max-w-md border border-brand-accent flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-brand-accent">
              <h3 className="text-xl font-bold text-brand-text">{t('shareModalTitle')}</h3>
              <p className="text-sm text-brand-light mt-1">{t('shareModalDescription')}</p>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label htmlFor="email-invite" className="block text-sm font-semibold mb-1 text-brand-light">
                  {t('shareModalInputLabel')}
                </label>
                <input
                  type="email"
                  id="email-invite"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('shareModalInputPlaceholder')}
                  required
                  disabled={isSending}
                  className="w-full p-2 bg-brand-primary/50 border-2 border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none transition-all duration-300 text-brand-text placeholder-brand-accent disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="role-select" className="block text-sm font-semibold mb-1 text-brand-light">
                    {t('shareModalSelectRole')}
                </label>
                <select 
                    id="role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'contributor' | 'reviewer')}
                    disabled={isSending}
                    className="w-full p-2 bg-brand-primary/50 border-2 border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none transition-all duration-300 text-brand-text disabled:opacity-50"
                >
                    <option value="contributor">{t('shareModalRoleContributor')}</option>
                    <option value="reviewer">{t('shareModalRoleReviewer')}</option>
                </select>
              </div>
              
              <div className="pt-2 flex justify-end items-center gap-4">
                <button type="button" onClick={onClose} disabled={isSending} className="px-4 py-2 text-sm text-brand-light hover:text-white rounded-md hover:bg-brand-accent/50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSending} className="px-6 py-2 text-sm bg-brand-teal rounded-md text-white font-semibold hover:bg-teal-500 transition-colors disabled:opacity-70 flex items-center">
                  {isSending && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {t('shareModalButtonInvite')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
