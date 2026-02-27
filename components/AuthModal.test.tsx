import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AuthModal from './AuthModal';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AuthModal Component', () => {
  const mockOnClose = vi.fn();

  const renderAuthModal = (isOpen = true) => {
    return render(
      <AuthProvider>
        <LanguageProvider>
          <AuthModal isOpen={isOpen} onClose={mockOnClose} />
        </LanguageProvider>
      </AuthProvider>
    );
  };

  it('should not render when isOpen is false', () => {
    const { container } = renderAuthModal(false);
    expect(container.firstChild).toBeNull();
  });

  it('should render login form when isOpen is true', () => {
    renderAuthModal();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    // Check for form elements by placeholder and type
    expect(
      screen.getByPlaceholderText('founder@startup.com')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Sign In' })[0]
    ).toBeInTheDocument();
  });

  it('should call onClose when modal backdrop is clicked', () => {
    renderAuthModal();
    // Click on the backdrop (the modal container)
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should allow switching between login and signup modes', () => {
    renderAuthModal();

    // Should start in login mode
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();

    // Click signup button (the tab)
    const signupTab = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(signupTab);
    expect(
      screen.getByRole('heading', { name: 'Create Account' })
    ).toBeInTheDocument();

    // Click back to login tab
    const signinTab = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signinTab);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('should have form inputs with proper attributes', () => {
    renderAuthModal();

    const inputs = screen.getAllByRole('textbox'); // Email input
    const passwordInputs = screen.getAllByDisplayValue(''); // All empty inputs

    // Check that we have email and password inputs
    expect(inputs.length).toBeGreaterThan(0);
    expect(passwordInputs.length).toBeGreaterThan(1);

    // Verify input types and attributes exist
    const emailInput = screen.getByPlaceholderText('founder@startup.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render with proper accessibility attributes', () => {
    renderAuthModal();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('should render welcome messages', () => {
    renderAuthModal();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText(/Access your ATLAS workspace/)).toBeInTheDocument();
  });
});
