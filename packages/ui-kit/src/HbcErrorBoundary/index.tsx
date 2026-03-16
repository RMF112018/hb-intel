/**
 * HbcErrorBoundary — React class error boundary with retry
 * Blueprint §1d — retry button, onError callback, fallback render prop
 * WS1-T07 — Migrated default fallback to Griffel (was inline CSSProperties)
 */
import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_STATUS_COLORS, HBC_PRIMARY_BLUE, HBC_SURFACE_LIGHT, HBC_HEADER_TEXT } from '../theme/tokens.js';
import { HBC_RADIUS_MD } from '../theme/radii.js';
import { heading2, body } from '../theme/typography.js';
import type { HbcErrorBoundaryProps, HbcErrorBoundaryState } from './types.js';

/* ── Griffel fallback styles ─────────────────────────────────── */
const useFallbackStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '48px',
    paddingBottom: '48px',
    paddingLeft: '24px',
    paddingRight: '24px',
    textAlign: 'center',
    gap: '16px',
  },
  title: {
    ...heading2,
    color: HBC_STATUS_COLORS.error,
    margin: '0',
  },
  message: {
    ...body,
    color: HBC_SURFACE_LIGHT['text-muted'],
    margin: '0',
    maxWidth: '400px',
  },
  button: {
    ...body,
    fontWeight: '600',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '24px',
    paddingRight: '24px',
    color: HBC_HEADER_TEXT,
    backgroundColor: HBC_PRIMARY_BLUE,
    ...shorthands.borderStyle('none'),
    borderRadius: HBC_RADIUS_MD,
    cursor: 'pointer',
  },
});

/* ── Default fallback (function component for Griffel hook) ─── */
const DefaultFallback: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => {
  const styles = useFallbackStyles();

  return (
    <div data-hbc-ui="error-boundary" className={styles.root}>
      <h3 className={styles.title}>Something went wrong</h3>
      <p className={styles.message}>{error.message}</p>
      <button type="button" className={styles.button} onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
};

/* ── Error boundary (class component) ────────────────────────── */
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

      return <DefaultFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export type { HbcErrorBoundaryProps, HbcErrorBoundaryState } from './types.js';
