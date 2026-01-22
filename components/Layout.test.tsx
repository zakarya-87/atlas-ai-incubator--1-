import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, expect } from 'vitest';
import '@testing-library/jest-dom';
import Layout from './Layout';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { BrowserRouter } from 'react-router-dom';

// Mock child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header Component</div>
}));

vi.mock('./SidebarNav', () => ({
  default: () => <div data-testid="sidebar">Sidebar Component</div>
}));

describe('Layout Component', () => {
  const defaultProps = {
    activeModule: 'dashboard' as const,
    onNavigate: vi.fn(),
    onModuleChange: vi.fn(),
    isTourOpen: false,
    setIsTourOpen: vi.fn(),
    isAuthModalOpen: false,
    setIsAuthModalOpen: vi.fn(),
    viewingHistoryRecord: false,
    onReturnToWorkspace: vi.fn(),
    isFocusMode: false,
    onToggleFocusMode: vi.fn()
  };

  const renderLayout = (props = {}) => {
    const combinedProps = { ...defaultProps, ...props };
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <Layout {...combinedProps}>
                <div data-testid="main-content">Main Content</div>
              </Layout>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render core layout elements', () => {
    renderLayout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('should hide sidebar in focus mode', () => {
    renderLayout({ isFocusMode: true });
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('should show exit focus button in focus mode', () => {
    renderLayout({ isFocusMode: true });
    expect(screen.getByText(/Exit Focus/i)).toBeInTheDocument();
  });

  it('should call onToggleFocusMode when exit button is clicked', () => {
    const onToggleFocusMode = vi.fn();
    renderLayout({ isFocusMode: true, onToggleFocusMode });

    fireEvent.click(screen.getByText(/Exit Focus/i));
    expect(onToggleFocusMode).toHaveBeenCalled();
  });

  it('should show historical record banner when viewingHistoryRecord is true', () => {
    renderLayout({ viewingHistoryRecord: true, timestamp: new Date().toISOString() });
    expect(screen.getByText(/Viewing historical version/i)).toBeInTheDocument();
  });

  it('should call onReturnToWorkspace when return button is clicked', () => {
    const onReturnToWorkspace = vi.fn();
    renderLayout({ viewingHistoryRecord: true, onReturnToWorkspace });

    fireEvent.click(screen.getByText(/Return to Workspace/i));
    expect(onReturnToWorkspace).toHaveBeenCalled();
  });
});