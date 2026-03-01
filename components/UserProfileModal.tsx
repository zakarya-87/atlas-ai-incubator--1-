import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '../services/authService';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
} from '../services/subscriptionService';
import { useToast } from '../context/ToastContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    'details' | 'security' | 'billing'
  >('details');
  const [subStatus, setSubStatus] = useState({ status: 'free', plan: 'basic' });

  useEffect(() => {
    if (isOpen) {
      loadProfile();
      loadSubscription();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const profile = await fetchUserProfile();
      setFullName(profile.fullName || '');
      setEmail(profile.email);
    } catch (error) {
      console.error('Failed to load profile');
    }
  };

  const loadSubscription = async () => {
    try {
      const status = await getSubscriptionStatus();
      setSubStatus(status);
    } catch (e) {}
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updateData: any = {};
      if (activeTab === 'details') updateData.fullName = fullName;
      if (activeTab === 'security') {
        if (password.length < 6)
          throw new Error('Password must be at least 6 characters');
        updateData.password = password;
      }

      await updateUserProfile(updateData);
      showToast('Profile updated successfully!', 'success');
      setPassword(''); // Clear password field
    } catch (err: any) {
      setMessage({ text: err.message || 'Update failed', type: 'error' });
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    try {
      const { url } = await createCheckoutSession(planId);
      window.location.href = url;
    } catch (e) {
      showToast('Failed to start checkout', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortal = async () => {
    setIsLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (e) {
      showToast('Failed to open billing portal', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-brand-secondary rounded-xl shadow-2xl w-full max-w-md border border-brand-accent overflow-hidden flex flex-col h-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-brand-accent flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-text">
                Account Settings
              </h3>
              <button
                onClick={onClose}
                className="text-brand-light hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="flex border-b border-brand-accent/50">
              <button
                className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'details' ? 'bg-brand-teal/10 text-brand-teal border-b-2 border-brand-teal' : 'text-brand-light hover:text-brand-text'}`}
                onClick={() => {
                  setActiveTab('details');
                  setMessage(null);
                }}
              >
                Details
              </button>
              <button
                className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'security' ? 'bg-brand-teal/10 text-brand-teal border-b-2 border-brand-teal' : 'text-brand-light hover:text-brand-text'}`}
                onClick={() => {
                  setActiveTab('security');
                  setMessage(null);
                }}
              >
                Security
              </button>
              <button
                className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'billing' ? 'bg-brand-teal/10 text-brand-teal border-b-2 border-brand-teal' : 'text-brand-light hover:text-brand-text'}`}
                onClick={() => {
                  setActiveTab('billing');
                  setMessage(null);
                }}
              >
                Billing
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'billing' ? (
                <div className="space-y-6">
                  <div className="bg-brand-primary/30 p-4 rounded-lg border border-brand-accent/30">
                    <p className="text-sm text-brand-light">Current Plan</p>
                    <div className="flex justify-between items-end">
                      <h4 className="text-2xl font-bold text-brand-text capitalize">
                        {subStatus.plan}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${subStatus.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                      >
                        {subStatus.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {subStatus.plan === 'basic' ? (
                    <div className="space-y-3">
                      <h4 className="font-bold text-brand-text">
                        Upgrade to Pro
                      </h4>
                      <ul className="text-sm text-brand-light space-y-2">
                        <li>✓ Unlimited AI Generations</li>
                        <li>✓ Advanced Export (PDF/CSV)</li>
                        <li>✓ Priority Support</li>
                      </ul>
                      <button
                        onClick={() => handleSubscribe('pro')}
                        className="w-full py-2 bg-brand-teal hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg transition-all mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Upgrade - $29/mo'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handlePortal}
                      className="w-full py-2 bg-brand-accent hover:bg-brand-light text-white font-bold rounded-lg shadow-lg transition-all"
                      disabled={isLoading}
                    >
                      Manage Subscription
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  {activeTab === 'details' && (
                    <>
                      <div>
                          <label
                            htmlFor="profile-email"
                            className="block text-xs font-bold text-brand-light uppercase mb-1"
                          >
                          Email Address
                        </label>
                        <input
                            id="profile-email"
                            name="email"
                            autoComplete="email"
                          type="email"
                          value={email}
                          disabled
                          className="w-full p-3 bg-brand-primary/30 border border-brand-accent/50 rounded-lg text-brand-light cursor-not-allowed"
                        />
                        <p className="text-[10px] text-brand-light/50 mt-1">
                          Email cannot be changed.
                        </p>
                      </div>
                      <div>
                          <label
                            htmlFor="profile-name"
                            className="block text-xs font-bold text-brand-light uppercase mb-1"
                          >
                          Full Name
                        </label>
                        <input
                            id="profile-name"
                            name="fullName"
                            autoComplete="name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full p-3 bg-brand-primary/50 border border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none text-brand-text"
                          placeholder="John Doe"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'security' && (
                    <div>
                        <label
                          htmlFor="profile-password"
                          className="block text-xs font-bold text-brand-light uppercase mb-1"
                        >
                        New Password
                      </label>
                      <input
                          id="profile-password"
                          name="password"
                          autoComplete="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-brand-primary/50 border border-brand-accent rounded-lg focus:ring-2 focus:ring-brand-teal focus:outline-none text-brand-text"
                        placeholder="••••••••"
                      />
                      <p className="text-[10px] text-brand-light/50 mt-1">
                        Leave blank to keep current password.
                      </p>
                    </div>
                  )}

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-brand-teal hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;
