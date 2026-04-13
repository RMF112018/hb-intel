/**
 * TeamViewerDetailDrawer — right-side bio/resume slide-out.
 *
 * Real implementation. Only rendered by `TeamViewer.tsx` when the
 * `profileDetailDrawer` feature flag is enabled. The orchestrator
 * controls visibility; this component owns focus management and
 * dismissal mechanics.
 */
import * as React from 'react';
import type { TeamViewerPerson } from '../teamViewerContracts.js';

export interface TeamViewerDetailDrawerProps {
  person: TeamViewerPerson | undefined;
  onClose: () => void;
}

export function TeamViewerDetailDrawer({
  person,
  onClose,
}: TeamViewerDetailDrawerProps): React.JSX.Element | null {
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!person) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [person, onClose]);

  if (!person) return null;

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-viewer-detail-title"
      data-hbc-testid="team-viewer-detail-drawer"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(420px, 100vw)',
        background: 'var(--hbc-surface-1, #ffffff)',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
        padding: 24,
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 id="team-viewer-detail-title" style={{ margin: 0, fontSize: '1.25rem' }}>
            {person.displayName}
          </h2>
          {person.jobTitle ? (
            <div style={{ color: 'var(--hbc-text-muted, #4b5563)' }}>{person.jobTitle}</div>
          ) : null}
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          data-hbc-testid="team-viewer-detail-close"
        >
          Close
        </button>
      </header>

      {person.bio ? (
        <section aria-label="Biography" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{person.bio}</p>
        </section>
      ) : null}

      {person.resumeRichText ? (
        <section
          aria-label="Resume"
          data-hbc-testid="team-viewer-detail-resume"
          // Resume HTML must be sanitized upstream at the data boundary.
          dangerouslySetInnerHTML={{ __html: person.resumeRichText }}
        />
      ) : null}

      {person.resumeDocumentUrl ? (
        <p>
          <a
            href={person.resumeDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-hbc-testid="team-viewer-detail-resume-doc"
          >
            Open resume document
          </a>
        </p>
      ) : null}
    </aside>
  );
}
