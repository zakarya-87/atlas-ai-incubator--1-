
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000';

const getAuthToken = () => localStorage.getItem('atlas_auth_token') || '';

export const createCheckoutSession = async (planId: string): Promise<{ url: string }> => {
    const token = getAuthToken();
    const response = await fetch(`${BACKEND_URL}/subscriptions/checkout`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ planId })
    });

    if (!response.ok) throw new Error('Failed to create checkout session');
    return response.json();
};

export const createPortalSession = async (): Promise<{ url: string }> => {
    const token = getAuthToken();
    const response = await fetch(`${BACKEND_URL}/subscriptions/portal`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
    });

    if (!response.ok) throw new Error('Failed to create portal session');
    return response.json();
};

export const getSubscriptionStatus = async (): Promise<{ status: string; plan: string }> => {
    const token = getAuthToken();
    const response = await fetch(`${BACKEND_URL}/subscriptions/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return { status: 'free', plan: 'basic' };
    return response.json();
};
