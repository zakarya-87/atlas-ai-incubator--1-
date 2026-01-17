import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';

describe('Header Component', () => {
  const mockAuthContext = {
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn()
  };

  const mockLanguageContext = {
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key
  };

  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <LanguageContext.Provider value={mockLanguageContext}>
            <ToastProvider>
              <Header />
            </ToastProvider>
          </LanguageContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('should render header with logo and navigation', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByAltText('ATLAS AI Logo')).toBeInTheDocument();
  });

  it('should display user info when authenticated', () => {
    renderHeader();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should show login button when not authenticated', () => {
    const unauthContext = {
      ...mockAuthContext,
      user: null
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={unauthContext}>
          <LanguageContext.Provider value={mockLanguageContext}>
            <ToastProvider>
              <Header />
            </ToastProvider>
          </LanguageContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should call login when login button is clicked', () => {
    const unauthContext = {
      ...mockAuthContext,
      user: null
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={unauthContext}>
          <LanguageContext.Provider value={mockLanguageContext}>
            <ToastProvider>
              <Header />
            </ToastProvider>
          </LanguageContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(unauthContext.login).toHaveBeenCalled();
  });

  it('should show loading state when auth is loading', () => {
    const loadingContext = {
      ...mockAuthContext,
      loading: true
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={loadingContext}>
          <LanguageContext.Provider value={mockLanguageContext}>
            <ToastProvider>
              <Header />
            </ToastProvider>
          </LanguageContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show language switcher', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /English/i })).toBeInTheDocument();
  });

  it('should call setLanguage when language is changed', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /Français/i }));
    expect(mockLanguageContext.setLanguage).toHaveBeenCalledWith('fr');
  });

  it('should show user menu dropdown', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
  });

  it('should call logout when logout is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /logout/i }));

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  it('should be responsive on mobile devices', () => {
    // Set viewport to mobile size
    global.innerWidth = 400;
    global.dispatchEvent(new Event('resize'));

    renderHeader();
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('should show mobile menu when hamburger is clicked', () => {
    global.innerWidth = 400;
    global.dispatchEvent(new Event('resize'));

    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
