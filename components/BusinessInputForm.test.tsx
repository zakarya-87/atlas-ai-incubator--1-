import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import BusinessInputForm from './BusinessInputForm';
import { LanguageProvider } from '../context/LanguageContext';

// Mock FileReader
global.FileReader = class {
  onload: (() => void) | null = null;
  onloadend: (() => void) | null = null;
  result: string | null = null;
  readAsDataURL(file: File) {
    // Simulate async file reading
    this.result = `data:${file.type};base64,${btoa('mock file content')}`;
    // Call onloadend immediately for testing
    if (this.onloadend) this.onloadend();
  }
};

// Mock the language context
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key, // Return key as-is for testing
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

    expect(screen.getByText('inputLabelSwot')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('inputPlaceholderSwot')).toBeInTheDocument();
  });

  it('should handle text input changes', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test business description' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should enable submit button when valid input is provided', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Valid business description" />
      </LanguageProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'buttonGenerate' });
    expect(submitButton).not.toBeDisabled();
  });

  it('should disable submit button when input is empty', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="" />
      </LanguageProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'buttonGenerate' });
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when loading', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Valid input" isLoading={true} />
      </LanguageProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'buttonGenerating' });
    expect(submitButton).toBeDisabled();
  });

  it('should call onSubmit when form is submitted', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Valid business description" />
      </LanguageProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'buttonGenerate' });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(undefined);
  });

  it('should submit form with Ctrl+Enter', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Valid business description" />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(mockOnSubmit).toHaveBeenCalledWith(undefined);
  });

  it('should submit form with Cmd+Enter on Mac', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Valid business description" />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(mockOnSubmit).toHaveBeenCalledWith(undefined);
  });

  it('should display character count', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Hello world" />
      </LanguageProvider>
    );

    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('should show input quality indicators', () => {
    const { rerender } = render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="" />
      </LanguageProvider>
    );

    expect(screen.getByText('inputQualityEmpty')).toBeInTheDocument();

    rerender(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Short text" />
      </LanguageProvider>
    );

    expect(screen.getByText('inputQualityWeak')).toBeInTheDocument();

    rerender(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value={"This is a very long business description that exceeds the 300 character limit and should definitely show excellent quality. ".repeat(5)} />
      </LanguageProvider>
    );

    expect(screen.getByText('inputQualityExcellent')).toBeInTheDocument();
  });

  it('should add prompt templates when helper buttons are clicked', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Existing text" />
      </LanguageProvider>
    );

    const helperButton = screen.getByRole('button', { name: '+ promptHelperAudience' });
    fireEvent.click(helperButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: 'Existing text\n\npromptTemplateAudience' }
      })
    );
  });

  it('should clear input when clear button is clicked', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Text to clear" />
      </LanguageProvider>
    );

    const clearButton = screen.getByRole('button', { name: 'inputClear' });
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: '' }
      })
    );
  });

  it('should show image upload for competitor analysis tool', () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
      </LanguageProvider>
    );

    expect(screen.getByText('Upload Competitor Screenshot (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Gemini Vision will analyze the visual features of the uploaded image.')).toBeInTheDocument();
  });

  it('should handle file upload for competitor analysis', async () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
      </LanguageProvider>
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();
  });

  it('should submit form with image when image is uploaded', async () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" value="Valid description" />
      </LanguageProvider>
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitButton = screen.getByRole('button', { name: 'buttonGenerate' });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.stringContaining('data:image/png;base64'));
  });

  it('should clear uploaded image', async () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} activeTool="competitorAnalysis" />
      </LanguageProvider>
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    const clearButton = document.querySelector('button svg')?.parentElement as HTMLButtonElement; // Find button containing the X icon
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
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
        <BusinessInputForm {...defaultProps} isLoading={true} value="Valid input" />
      </LanguageProvider>
    );

    expect(screen.getByText('buttonGenerating')).toBeInTheDocument();
    const spinner = document.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should focus textarea after adding template', async () => {
    render(
      <LanguageProvider>
        <BusinessInputForm {...defaultProps} value="Existing text" />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    const focusSpy = vi.spyOn(textarea, 'focus');

    const helperButton = screen.getByRole('button', { name: '+ promptHelperAudience' });
    fireEvent.click(helperButton);

    await waitFor(() => {
      expect(focusSpy).toHaveBeenCalled();
    });
  });
});