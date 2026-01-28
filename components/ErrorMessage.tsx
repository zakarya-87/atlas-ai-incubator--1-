import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ErrorMessageProps {
  code: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const Icons = {
  // A circle with an exclamation mark for retryable errors
  RetryableError: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  // A triangle with an exclamation mark for user input warnings
  Warning: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  // A circle with a cross for critical/unrecoverable errors
  CriticalError: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  code,
  message,
  onRetry,
  isRetrying,
}) => {
  const { t } = useLanguage();

  const [title, description] = message.includes('::')
    ? message.split('::', 2)
    : [t('errorTitle'), message];

  const errorConfig = useMemo(() => {
    switch (code) {
      case 'errorEmptyDescription':
        return {
          icon: <Icons.Warning />,
          colorClasses: 'text-yellow-400 bg-yellow-500/10',
          showRetry: false,
        };
      case 'errorApiKeyInvalid':
        return {
          icon: <Icons.CriticalError />,
          colorClasses: 'text-red-400 bg-red-500/10',
          showRetry: false,
        };
      default: // All other API errors are considered potentially temporary and thus retryable
        const retryableErrors = [
          'errorApiServerError',
          'errorNetwork',
          'errorApiGeneric',
          'errorApiFailure',
          'errorInvalidData',
          'errorRateLimit',
        ];
        return {
          icon: <Icons.RetryableError />,
          colorClasses: 'text-red-400 bg-red-500/10',
          showRetry: !!(onRetry && retryableErrors.includes(code)),
        };
    }
  }, [code, onRetry]);

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 rounded-lg w-full max-w-lg mx-auto ${errorConfig.colorClasses}`}
    >
      {errorConfig.icon}
      <p className="text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
      {errorConfig.showRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-4 px-6 py-2 bg-brand-accent hover:bg-brand-light disabled:bg-brand-secondary disabled:cursor-wait text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isRetrying ? t('buttonGenerating') : t('buttonRetry')}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
