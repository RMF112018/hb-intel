/**
 * TeamViewerDetailDrawer — right-side bio/resume slide-out.
 *
 * Real implementation. Only rendered by `TeamViewer.tsx` when the
 * `profileDetailDrawer` feature flag is enabled. Kudos-grade shell
 * mechanics without Kudos article/feed semantics:
 *
 *   - fixed right-side panel with scrollable body
 *   - modal dialog semantics (`role="dialog"`, `aria-modal`)
 *   - focus management: close button receives initial focus; focus is
 *     restored to the previously-focused element on close
 *   - Escape key and backdrop click both dismiss
 *   - reduced-motion honored: no slide transition, just fade
 */
import * as React from 'react';
import {
  AnimatePresence,
  ExternalLink,
  Mail,
  Link2,
  motion,
  useHomepageReducedMotion,
} from '@hbc/ui-kit/homepage';
import type { TeamViewerPerson } from '../teamViewerContracts.js';
import styles from '../teamViewerSurface.module.css';

export interface TeamViewerDetailDrawerProps {
  person: TeamViewerPerson | undefined;
  onClose: () => void;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function DrawerInitials({ name, size }: { name: string; size: number }): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--tv-accent-from, #1e3a8a), var(--tv-accent-to, #3b82f6))',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: 20,
        flex: '0 0 auto',
      }}
    >
      {initialsOf(name) || '—'}
    </div>
  );
}

function DrawerAvatar({ person }: { person: TeamViewerPerson }): React.JSX.Element {
  const size = 56;
  const [errored, setErrored] = React.useState(false);
  React.useEffect(() => setErrored(false), [person.photoUrl]);
  if (!person.photoUrl || errored) {
    return <DrawerInitials name={person.displayName} size={size} />;
  }
  return (
    <img
      src={person.photoUrl}
      alt=""
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto' }}
    />
  );
}

export function TeamViewerDetailDrawer({
  person,
  onClose,
}: TeamViewerDetailDrawerProps): React.JSX.Element {
  const reducedMotion = useHomepageReducedMotion();
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);
  const restoreRef = React.useRef<HTMLElement | null>(null);
  const open = Boolean(person);

  // Capture the element to restore focus to on close.
  React.useEffect(() => {
    if (open) {
      restoreRef.current = (typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null);
    }
  }, [open]);

  // Focus the close button + wire Escape.
  React.useEffect(() => {
    if (!open) return;
    // Defer focus to next frame so the drawer has mounted.
    const id = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Restore focus on unmount / close.
  React.useEffect(() => {
    if (open) return;
    const target = restoreRef.current;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {person ? (
        <React.Fragment key="team-viewer-drawer">
          <motion.div
            className={styles.drawerBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-viewer-detail-title"
            data-hbc-testid="team-viewer-detail-drawer"
            className={styles.drawerRoot}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
          >
            <header className={styles.drawerHeader}>
              <div className={styles.drawerIdentity}>
                <DrawerAvatar person={person} />
                <div style={{ minWidth: 0 }}>
                  <h2 id="team-viewer-detail-title" className={styles.drawerTitle}>
                    {person.displayName}
                  </h2>
                  {person.jobTitle ? (
                    <div className={styles.drawerSubtitle}>{person.jobTitle}</div>
                  ) : null}
                </div>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close profile"
                data-hbc-testid="team-viewer-detail-close"
                className={styles.drawerClose}
              >
                <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>✕</span>
              </button>
            </header>

            <div className={styles.drawerBody}>
              {person.bio ? (
                <section aria-label="Biography">
                  <p className={styles.drawerSectionLabel}>About</p>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{person.bio}</p>
                </section>
              ) : null}

              {person.resumeRichText ? (
                <section aria-label="Resume" data-hbc-testid="team-viewer-detail-resume">
                  <p className={styles.drawerSectionLabel}>Resume</p>
                  <div
                    className={styles.drawerResumeBody}
                    // Resume HTML must be sanitized upstream at the data boundary.
                    dangerouslySetInnerHTML={{ __html: person.resumeRichText }}
                  />
                </section>
              ) : null}

              {(person.resumeDocumentUrl || person.profileUrl || person.email) ? (
                <section aria-label="Links" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p className={styles.drawerSectionLabel}>Contact &amp; Links</p>
                  {person.resumeDocumentUrl ? (
                    <a
                      href={person.resumeDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-hbc-testid="team-viewer-detail-resume-doc"
                      className={styles.drawerLink}
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      Open resume document
                    </a>
                  ) : null}
                  {person.profileUrl ? (
                    <a
                      href={person.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.drawerLink}
                    >
                      <Link2 size={14} aria-hidden="true" />
                      View profile
                    </a>
                  ) : null}
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className={styles.drawerLink}>
                      <Mail size={14} aria-hidden="true" />
                      {person.email}
                    </a>
                  ) : null}
                </section>
              ) : null}

              {!person.bio && !person.resumeRichText && !person.resumeDocumentUrl && !person.profileUrl && !person.email ? (
                <p style={{ color: 'var(--tv-text-muted, #4b5563)', margin: 0 }}>
                  No additional profile information is available for this team member yet.
                </p>
              ) : null}
            </div>
          </motion.aside>
        </React.Fragment>
      ) : null}
    </AnimatePresence>
  );
}
