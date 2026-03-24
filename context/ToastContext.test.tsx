import React from 'react';
import {
  render,
  screen,
  act,
} from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from './ToastContext';

describe('ToastContext', () => {
  const TestComponent: React.FC = () => {
    const { showToast } = useToast();
    return (
      <div>
        <button onClick={() => showToast('Success message', 'success')}>
          Show Success
        </button>
        <button onClick={() => showToast('Error message', 'error')}>
          Show Error
        </button>
        <button onClick={() => showToast('Warning message', 'warning')}>
          Show Warning
        </button>
        <button onClick={() => showToast('Info message', 'info')}>
          Show Info
        </button>
      </div>
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide showToast function', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Show Success');
    act(() => {
      button.click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should display toast messages', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Error').click();
    });

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should support different toast types', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Warning').click();
    });

    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should support info toast type', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Info').click();
    });

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should throw error when useToast is used outside provider', () => {
    const TestOutsideProvider = () => {
      expect(() => useToast()).toThrow(
        'useToast must be used within a ToastProvider'
      );
      return null;
    };

    render(<TestOutsideProvider />);
  });

  it('should render children correctly', () => {
    render(
      <ToastProvider>
        <div data-testid="child-element">Child Content</div>
      </ToastProvider>
    );

    expect(screen.getByTestId('child-element')).toHaveTextContent(
      'Child Content'
    );
  });

  it('should allow multiple toasts to be displayed', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
      screen.getByText('Show Error').click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
