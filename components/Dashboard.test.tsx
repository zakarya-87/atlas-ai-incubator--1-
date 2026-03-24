import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Dashboard from './Dashboard';

// Mock services
vi.mock('../services/authService', () => ({
  fetchUserProfile: vi.fn().mockResolvedValue({
    credits: 50,
    subscriptionStatus: 'active',
  }),
}));

vi.mock('../services/geminiService', () => ({
  fetchVentureHistory: vi.fn().mockResolvedValue([
    { id: '1', toolNameKey: 'swot', timestamp: new Date().toISOString() },
    { id: '2', toolNameKey: 'pestel', timestamp: new Date().toISOString() },
  ]),
  fetchIntegrations: vi.fn().mockResolvedValue([
    { provider: 'ga', status: 'connected' },
    { provider: 'meta', status: 'disconnected' },
  ]),
}));

// Mock auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'founder@startup.com' },
    isAuthenticated: true,
    isAdmin: false,
  }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

// Mock language context
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const messages: Record<string, string> = {
        dashboardWelcome: 'Welcome back,',
        dashboardCredits: 'Credits Remaining',
        dashboardQuickActions: 'Quick Actions',
        dashboardRecentActivity: 'Recent Activity',
        dashboardIntegrations: 'Integrations Status',
        dashboardActionIdea: 'Validate New Idea',
        dashboardActionStrategy: 'Create SWOT',
        dashboardActionFinance: 'Forecast Financials',
        dashboardActionFunding: 'Generate Pitch Deck',
        dashboardViewAll: 'View All',
        integrationsGA: 'Google Analytics',
        integrationsMeta: 'Meta Ads',
        dashboardConnected: 'Connected',
        dashboardDisconnected: 'Disconnected',
        swot: 'SWOT Analysis',
        pestel: 'PESTEL Analysis',
      };
      return messages[key] || key;
    },
  }),
  LanguageProvider: ({ children }: any) => <>{children}</>,
}));

describe('Dashboard Component', () => {
  const mockOnNavigate = vi.fn();
  const defaultProps = {
    ventureId: 'venture-123',
    onNavigate: mockOnNavigate,
  };

  const renderDashboard = () => {
    return render(<Dashboard {...defaultProps} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Dashboard).toBeDefined();
  });

  it('should render without errors', async () => {
    renderDashboard();
    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();
  });

  it('should render dashboard components', async () => {
    renderDashboard();
    expect(await screen.findByText(/Credits Remaining/i)).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Integrations Status')).toBeInTheDocument();
  });

  it('should render quick action buttons and trigger navigation', async () => {
    renderDashboard();
    const swotButton = await screen.findByText('Create SWOT');
    fireEvent.click(swotButton.closest('button')!);
    expect(mockOnNavigate).toHaveBeenCalledWith('strategy', 'swot');
  });

  it('should list recent activity from history', async () => {
    renderDashboard();
    // In our mock, we have SWOT and PESTEL in history
    expect(await screen.findByText('SWOT Analysis')).toBeInTheDocument();
    expect(screen.getByText('PESTEL Analysis')).toBeInTheDocument();
  });

  it('should show integration status', async () => {
    renderDashboard();
    expect(await screen.findByText('Google Analytics')).toBeInTheDocument();
    expect(screen.getByText('Meta Ads')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should handle navigation to view all history', async () => {
    renderDashboard();
    const viewAllButton = await screen.findByText('View All');
    fireEvent.click(viewAllButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('audit', 'trail');
  });
});

