/** HbcErrorBoundary — Blueprint §1d error boundary */

export interface HbcErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode;
  /** Custom fallback render prop — receives error and retry function */
  fallback?: (error: Error, retry: () => void) => React.ReactNode;
  /** Callback fired when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface HbcErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
