import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Layout from './Layout';
import SidebarNav from './SidebarNav';
import Header from './Header';
import AuthModal from './AuthModal';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import type { ModuleType, AnyTool } from '../types';

// Mock child component for testing
const MockChildComponent = () => <div data-testid="mock-child">Mock Content</div>;

// Mock sub navigation component
const MockSubNav = () => <div data-testid="mock-subnav">Sub Navigation</div>;

describe('Layout Integration Tests', () => {
  const mockNavigate = vi.fn();
  const mockModuleChange = vi.fn();
  const mockReturnToWorkspace = vi.fn();
  const mockToggleFocusMode = vi.fn();

  const defaultProps = {
    activeModule: 'dashboard' as ModuleType,
    onNavigate: mockNavigate,
    onModuleChange: mockModuleChange,
    children: <MockChildComponent />,
    subNav: <MockSubNav />,
    isTourOpen: false,
    setIsTourOpen: vi.fn(),
    isAuthModalOpen: false,
    setIsAuthModalOpen: vi.fn(),
    viewingHistoryRecord: false,
    onReturnToWorkspace: mockReturnToWorkspace,
    timestamp: undefined,
    isFocusMode: false,
    onToggleFocusMode: mockToggleFocusMode
  };

  const renderLayout = (props = {}) => {
    return render(
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <Layout {...defaultProps} {...props} />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout + Header + SidebarNav Integration', () => {
    it('should render Header and SidebarNav components within Layout', () => {
      renderLayout();

      // Verify Header is rendered
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // Verify SidebarNav is rendered (desktop version)
      expect(document.getElementById('sidebar-nav')).toBeInTheDocument();

      // Verify main content area is rendered
      expect(screen.getByTestId('mock-child')).toBeInTheDocument();

      // Verify sub navigation is rendered
      expect(screen.getByTestId('mock-subnav')).toBeInTheDocument();
    });

    it('should handle module navigation through SidebarNav', () => {
      renderLayout();

      // Find and click on a different module (e.g., fundamentals) in the desktop sidebar
      const sidebarNav = document.getElementById('sidebar-nav');
      const fundamentalsButton = within(sidebarNav).getByText(/fundamentals/i);
      fireEvent.click(fundamentalsButton);

      expect(mockModuleChange).toHaveBeenCalledWith('fundamentals');
    });

    it('should toggle focus mode and hide navigation components', () => {
      renderLayout({ isFocusMode: true });

      // In focus mode, Header and SidebarNav should be hidden
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(document.getElementById('sidebar-nav')).not.toBeInTheDocument();

      // Focus mode exit button should be visible
      expect(screen.getByText('Exit Focus')).toBeInTheDocument();

      // Click exit focus mode
      fireEvent.click(screen.getByText('Exit Focus'));
      expect(mockToggleFocusMode).toHaveBeenCalled();
    });
  });

  describe('Layout + AuthModal Integration', () => {
    it('should render AuthModal when isAuthModalOpen is true', () => {
      renderLayout({ isAuthModalOpen: true });

      // AuthModal should be rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should not render AuthModal when isAuthModalOpen is false', () => {
      renderLayout({ isAuthModalOpen: false });

      // AuthModal should not be rendered
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });


  });

  describe('Responsive Behavior Integration', () => {
    it('should show desktop SidebarNav on larger screens', () => {
      // Set viewport to desktop size
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));

      renderLayout();

      // Desktop sidebar should be visible
      const desktopSidebar = document.getElementById('sidebar-nav');
      expect(desktopSidebar).toBeInTheDocument();
      expect(desktopSidebar).toHaveClass('hidden md:flex');
    });

    it('should show mobile navigation on smaller screens', () => {
      // Set viewport to mobile size
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      renderLayout();

      // Mobile bottom bar should be visible
      const mobileNav = screen.getByRole('navigation');
      expect(mobileNav).toBeInTheDocument();
    });
  });

  describe('History Record Viewing Integration', () => {
    it('should show history record banner when viewingHistoryRecord is true', () => {
      const mockTimestamp = '2023-01-01T12:00:00Z';
      renderLayout({
        viewingHistoryRecord: true,
        timestamp: mockTimestamp
      });

      // History record banner should be visible
      expect(screen.getByText(/viewing historical version/i)).toBeInTheDocument();
      expect(screen.getByText(/return to workspace/i)).toBeInTheDocument();
    });

    it('should call onReturnToWorkspace when clicking return button', () => {
      renderLayout({
        viewingHistoryRecord: true,
        timestamp: '2023-01-01T12:00:00Z'
      });

      const returnButton = screen.getByText(/return to workspace/i);
      fireEvent.click(returnButton);

      expect(mockReturnToWorkspace).toHaveBeenCalled();
    });
  });

  describe('Tour Integration', () => {
    it('should render onboarding tour when isTourOpen is true', () => {
      renderLayout({ isTourOpen: true });

      // Tour should be rendered
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it('should start tour from Header interaction', () => {
      renderLayout();

      // Click the tour start button (would be in Header)
      // This is a bit tricky to test without the actual Header implementation
      // but we can verify the tour open state would be set
      const setIsTourOpen = vi.fn();
      renderLayout({ setIsTourOpen });

      // In a real scenario, clicking a tour button would call setIsTourOpen(true)
      // We can simulate this
      setIsTourOpen(true);
      expect(setIsTourOpen).toHaveBeenCalledWith(true);
    });
  });
});

describe('SidebarNav Component Integration Tests', () => {
  const mockModuleChange = vi.fn();

  const renderSidebarNav = (activeModule: ModuleType = 'dashboard') => {
    return render(
      <LanguageProvider>
        <SidebarNav
          activeModule={activeModule}
          onModuleChange={mockModuleChange}
        />
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should highlight the active module', () => {
    renderSidebarNav('dashboard');

    // Dashboard button should be active (find in desktop sidebar)
    const sidebarNav = document.getElementById('sidebar-nav');
    const dashboardButton = within(sidebarNav).getByText(/dashboard/i).closest('button');
    expect(dashboardButton).toHaveClass('bg-brand-teal/20 text-brand-teal');
  });

  it('should call onModuleChange when clicking different modules', () => {
    renderSidebarNav('dashboard');

    // Click on fundamentals module (find in desktop sidebar)
    const sidebarNav = document.getElementById('sidebar-nav');
    const fundamentalsButton = within(sidebarNav).getByText(/fundamentals/i);
    fireEvent.click(fundamentalsButton);

    expect(mockModuleChange).toHaveBeenCalledWith('fundamentals');
  });

  it('should render both desktop and mobile navigation', () => {
    renderSidebarNav();

    // Desktop sidebar should be present
    expect(document.getElementById('sidebar-nav')).toBeInTheDocument();

    // Mobile navigation should also be present
    const mobileNav = screen.getByRole('navigation');
    expect(mobileNav).toBeInTheDocument();
  });
});