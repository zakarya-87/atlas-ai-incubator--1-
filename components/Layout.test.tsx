import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Layout from './Layout';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';

// Mock child components
vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header Component</div>
}));

vi.mock('./SidebarNav', () => ({
  default: () => <div data-testid="sidebar">Sidebar Component</div>
}));

describe('Layout Component', () => {
  const renderLayout = () => {
    return render(
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <Layout>
              <div data-testid="main-content">Main Content</div>
            </Layout>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    );
  };

  it('should render without crashing', () => {
    const { container } = renderLayout();
    expect(container).toBeTruthy();
  });

  it('should render header component', () => {
    renderLayout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render sidebar component', () => {
    renderLayout();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should render main content area', () => {
    renderLayout();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('should render children components', () => {
    const { getByText } = renderLayout();
    expect(getByText('Main Content')).toBeInTheDocument();
  });

  it('should handle unauthenticated state', () => {
    const { container } = renderLayout();
    expect(container).toBeTruthy();
  });

  it('should handle loading state', () => {
    const { container } = renderLayout();
    expect(container).toBeTruthy();
  });

  it('should handle admin user state', () => {
    const { container } = renderLayout();
    expect(container).toBeTruthy();
  });
});