import { HbcEmptyState, HbcSpinner, HbcButton } from '@hbc/ui-kit/homepage';

export function FoleonLoadingState({ label }: { label?: string }): React.ReactNode {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 24,
      }}
    >
      <HbcSpinner size="md" />
      <span>{label ?? 'Loading Foleon publications…'}</span>
    </div>
  );
}

interface FoleonEmptyProps {
  readonly title: string;
  readonly description?: string;
}

export function FoleonEmpty(props: FoleonEmptyProps): React.ReactNode {
  return <HbcEmptyState title={props.title} description={props.description} />;
}

interface FoleonErrorProps {
  readonly title: string;
  readonly description?: string;
  readonly externalUrl?: string;
  readonly onRetry?: () => void;
}

export function FoleonError(props: FoleonErrorProps): React.ReactNode {
  return (
    <div
      role="alert"
      style={{
        padding: 24,
        border: '1px solid var(--hbc-error-border, #f0b0b0)',
        borderRadius: 6,
        background: 'var(--hbc-error-surface, #fff5f5)',
        color: 'var(--hbc-error-text, #8a1f1f)',
      }}
    >
      <h3 style={{ margin: '0 0 8px' }}>{props.title}</h3>
      {props.description ? <p style={{ margin: '0 0 12px' }}>{props.description}</p> : null}
      <div style={{ display: 'flex', gap: 8 }}>
        {props.onRetry ? (
          <HbcButton variant="secondary" onClick={props.onRetry}>
            Retry
          </HbcButton>
        ) : null}
        {props.externalUrl ? (
          <HbcButton
            variant="secondary"
            onClick={(): void => {
              window.open(props.externalUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            Open externally
          </HbcButton>
        ) : null}
      </div>
    </div>
  );
}
