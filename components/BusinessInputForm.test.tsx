import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import BusinessInputForm from './BusinessInputForm';
import { LanguageProvider } from '../context/LanguageContext';

// Mock FileReader
global.FileReader = class {
  onload: (() => void) | null = null;
  onloadend: (() => void) | null = null;
  result: string | null = null;
  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,${btoa('mock file content')}`;
    if (this.onloadend) this.onloadend();
  }
};

const mockTranslations: Record<string, string> = {
  businessDescriptionLabel: 'Business Description',
  competitorInfoLabel: 'Competitor Info',
  businessDescriptionPlaceholder: 'Describe your business idea...',
  uploadScreenshotLabel: 'Upload Competitor Screenshot',
  uploadScreenshotDescription:
    'Gemini Vision will analyze the uploaded screenshot to provide insights on your competitor.',
  inputHintPrefix: 'Press',
  inputHintSuffix: 'to submit.',
  buttonGenerate: 'Generate Analysis',
  buttonGenerating: 'Generating...',
  loadingTitle: 'Generating Analysis',
  loadingText: 'Please wait while we analyze your input...',
};

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => mockTranslations[key] || key,
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('BusinessInputForm Component (TC010)', () => {
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onSubmit: mockOnSubmit,
    isLoading: false,
    activeTool: 'swot' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with proper labels and placeholders', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} />
      </LanguageProvider>
    );

    expect(screen.getByLabelText(/business description/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/describe your business/i)
    ).toBeInTheDocument();
  });

  it('should handle text input changes', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Test business description' },
    });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('Test business description');
  });

  it('should enable submit button when valid input is provided', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm
          {...defaultProps}
          value="Valid business description"
        />
      </LanguageProvider>
    );

    const submitButton = screen.getByRole('button', { name: /generate/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should disable submit button when input is empty', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="" />
      </LanguageProvider>
    );

    const submitButton = screen.getByRole('button', { name: /generate/i });
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when loading', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm
          {...defaultProps}
          value="Valid input"
          isLoading={true}
        />
      </LanguageProvider>
    );

    const submitButton = screen.getByRole('button', { name: /generating/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call onSubmit when form is submitted', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm
          {...defaultProps}
          value="Valid business description"
        />
      </LanguageProvider>
    );

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should submit form with Ctrl+Enter', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm
          {...defaultProps}
          value="Valid business description"
        />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should submit form with Cmd+Enter on Mac', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm
          {...defaultProps}
          value="Valid business description"
        />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should display character count', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Hello world" />
      </LanguageProvider>
    );

    expect(screen.getByText(/11/)).toBeInTheDocument();
  });

  it('should show image upload for competitor analysis tool', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
      </LanguageProvider>
    );

    expect(
      screen.getByText(/Upload Competitor Screenshot/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Gemini Vision will analyze/i)).toBeInTheDocument();
  });

  it('should handle file upload for competitor analysis', async () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
      </LanguageProvider>
    );

    const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
  });

  it('should submit form with image when image is uploaded', async () => {
    render(
      <LanguageProvider>
        <BusinessInputForm
          {...defaultProps}
          activeTool="competitorAnalysis"
          value="Valid description"
        />
      </LanguageProvider>
    );

    const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should clear uploaded image', async () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
      </LanguageProvider>
    );

    const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText(/remove/i);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByAltText(/preview/i)).not.toBeInTheDocument();
    });
  });

  it('should render extra fields when provided', () => {
    const extraFields = <div>Extra field content</div>;

    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} extraFields={extraFields} />
      </LanguageProvider>
    );

    expect(screen.getByText('Extra field content')).toBeInTheDocument();
  });

  it('should show loading spinner when generating', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm
          {...defaultProps}
          isLoading={true}
          value="Valid input"
        />
      </LanguageProvider>
    );

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });
});
