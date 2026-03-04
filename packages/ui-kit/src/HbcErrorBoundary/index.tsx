/**
 * HbcErrorBoundary — React class error boundary with retry
 * Blueprint §1d — retry button, onError callback, fallback render prop
 * PH4.6 §Step 5 — Replace hardcoded hex with HBC tokens
 */
import * as React from 'react';
import { HBC_STATUS_COLORS, HBC_PRIMARY_BLUE, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import type { HbcErrorBoundaryProps, HbcErrorBoundaryState } from './types.js';

const defaultFallbackStyles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: HBC_STATUS_COLORS.error,
    margin: 0,
  },
  message: {
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    margin: 0,
    maxWidth: '400px',
  },
  button: {
    padding: '8px 24px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: HBC_PRIMARY_BLUE,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export class HbcErrorBoundary extends React.Component<
  HbcErrorBoundaryProps,
  HbcErrorBoundaryState
> {
  constructor(props: HbcErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): HbcErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div data-hbc-ui="error-boundary" style={defaultFallbackStyles.root}>
          <h3 style={defaultFallbackStyles.title}>Something went wrong</h3>
          <p style={defaultFallbackStyles.message}>
            {this.state.error.message}
          </p>
          <button
            type="button"
            style={defaultFallbackStyles.button}
            onClick={this.handleRetry}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export type { HbcErrorBoundaryProps, HbcErrorBoundaryState } from './types.js';
