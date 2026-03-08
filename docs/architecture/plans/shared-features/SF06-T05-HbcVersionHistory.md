# SF06-T05 — `HbcVersionHistory` Component

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01 (scaffold), T02 (contracts), T04 (hooks), T07 (VersionApi — for rollback)
**Blocks:** T08 (Storybook stories)
**SPFx Compatible:** Yes (via `@hbc/ui-kit/app-shell`) — diff and rollback features are conditionally hidden in SPFx context

---

## Objective

Implement `HbcVersionHistory` — the primary version list panel. It renders a chronological list of version entries (newest first), tag badges, author identity, relative timestamps, change summaries, and an optional rollback CTA. Complexity integration gates the density and depth of the panel. Rollback opens a confirmation modal before executing.

---

## File: `src/components/HbcVersionHistory.tsx`

```tsx
import React, { useState, useCallback } from 'react';
import { useComplexity } from '@hbc/complexity';
import { useVersionHistory } from '../hooks/useVersionHistory';
import { VersionApi } from '../api/VersionApi';
import {
  VERSION_TAG_LABELS,
  VERSION_TAG_COLORS,
  countSupersededVersions,
} from '../utils/versionUtils';
import type {
  IVersionedRecordConfig,
  IVersionMetadata,
  IRestoreSnapshotResult,
  HbcVersionHistoryProps,
} from '../types';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function HbcVersionHistory<T>({
  recordType,
  recordId,
  config,
  onVersionSelect,
  allowRollback = false,
  onRollback,
  currentUser,
}: HbcVersionHistoryProps<T>): React.ReactElement {
  const complexity = useComplexity();
  const { metadata, isLoading, error, showSuperseded, setShowSuperseded, refresh } =
    useVersionHistory(recordType, recordId, config);

  const [rollbackTarget, setRollbackTarget] = useState<IVersionMetadata | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackError, setRollbackError] = useState<Error | null>(null);

  const hasSuperseded = countSupersededVersions(metadata) > 0 ||
    (showSuperseded && metadata.some((m) => m.tag === 'superseded'));

  const handleVersionClick = useCallback(
    (entry: IVersionMetadata) => {
      onVersionSelect?.(entry);
    },
    [onVersionSelect]
  );

  const handleRollbackConfirm = useCallback(async () => {
    if (!rollbackTarget || !currentUser) return;
    setIsRollingBack(true);
    setRollbackError(null);
    try {
      const result = await VersionApi.restoreSnapshot<T>({
        recordType,
        recordId,
        targetSnapshotId: rollbackTarget.snapshotId,
        restoredBy: currentUser,
        config,
      });
      setRollbackTarget(null);
      refresh();
      onRollback?.(result);
    } catch (err) {
      setRollbackError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsRollingBack(false);
    }
  }, [rollbackTarget, currentUser, recordType, recordId, config, refresh, onRollback]);

  // Complexity: Essential = badge only (this component is not rendered at Essential tier)
  // Standard = history panel without diff viewer or rollback
  // Expert = full panel with rollback CTA
  const showRollback = allowRollback && complexity.tier === 'expert' && !!currentUser;
  const showTimestampDetail = complexity.tier === 'expert';

  if (isLoading) {
    return (
      <div className="hbc-version-history hbc-version-history--loading" role="status">
        <div className="hbc-version-history__spinner" aria-label="Loading version history" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hbc-version-history hbc-version-history--error" role="alert">
        <p className="hbc-version-history__error-message">
          Failed to load version history: {error.message}
        </p>
        <button className="hbc-version-history__retry" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="hbc-version-history">
      <div className="hbc-version-history__header">
        <h3 className="hbc-version-history__title">Version History</h3>
        <span className="hbc-version-history__count">
          {metadata.length} version{metadata.length !== 1 ? 's' : ''}
        </span>
      </div>

      {metadata.length === 0 ? (
        <p className="hbc-version-history__empty">No versions recorded yet.</p>
      ) : (
        <ol className="hbc-version-history__list" aria-label="Version history entries">
          {metadata.map((entry) => (
            <VersionEntry
              key={entry.snapshotId}
              entry={entry}
              showTimestampDetail={showTimestampDetail}
              showRollback={showRollback}
              onSelect={() => handleVersionClick(entry)}
              onRollbackRequest={() => setRollbackTarget(entry)}
            />
          ))}
        </ol>
      )}

      {hasSuperseded && (
        <button
          className="hbc-version-history__superseded-toggle"
          onClick={() => setShowSuperseded(!showSuperseded)}
          aria-expanded={showSuperseded}
        >
          {showSuperseded ? 'Hide archived versions' : 'Show archived versions'}
        </button>
      )}

      {rollbackTarget && (
        <RollbackConfirmModal
          target={rollbackTarget}
          isRollingBack={isRollingBack}
          error={rollbackError}
          onConfirm={handleRollbackConfirm}
          onCancel={() => {
            setRollbackTarget(null);
            setRollbackError(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VersionEntry sub-component
// ---------------------------------------------------------------------------

interface VersionEntryProps {
  entry: IVersionMetadata;
  showTimestampDetail: boolean;
  showRollback: boolean;
  onSelect: () => void;
  onRollbackRequest: () => void;
}

function VersionEntry({
  entry,
  showTimestampDetail,
  showRollback,
  onSelect,
  onRollbackRequest,
}: VersionEntryProps): React.ReactElement {
  const tagLabel = VERSION_TAG_LABELS[entry.tag];
  const tagColor = VERSION_TAG_COLORS[entry.tag];
  const isSuperseded = entry.tag === 'superseded';

  return (
    <li
      className={`hbc-version-entry${isSuperseded ? ' hbc-version-entry--superseded' : ''}`}
      aria-label={`Version ${entry.version}, ${tagLabel}`}
    >
      <button
        className="hbc-version-entry__content"
        onClick={onSelect}
        aria-label={`View version ${entry.version}`}
      >
        <div className="hbc-version-entry__header">
          <span className="hbc-version-entry__number">v{entry.version}</span>
          <span
            className={`hbc-version-entry__tag hbc-version-entry__tag--${tagColor}`}
            role="status"
          >
            {tagLabel}
          </span>
        </div>

        <div className="hbc-version-entry__meta">
          <AuthorAvatar displayName={entry.createdBy.displayName} />
          <span className="hbc-version-entry__author">{entry.createdBy.displayName}</span>
          <RelativeTimestamp
            isoTimestamp={entry.createdAt}
            showDetail={showTimestampDetail}
          />
        </div>

        {entry.changeSummary && (
          <p className="hbc-version-entry__summary">{entry.changeSummary}</p>
        )}
      </button>

      {showRollback && !isSuperseded && (
        <button
          className="hbc-version-entry__rollback-cta"
          onClick={(e) => {
            e.stopPropagation();
            onRollbackRequest();
          }}
          aria-label={`Restore to version ${entry.version}`}
        >
          Restore to v{entry.version}
        </button>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// AuthorAvatar sub-component
// ---------------------------------------------------------------------------

interface AuthorAvatarProps {
  displayName: string;
}

function AuthorAvatar({ displayName }: AuthorAvatarProps): React.ReactElement {
  const initials = displayName
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className="hbc-author-avatar"
      aria-hidden="true"
      title={displayName}
    >
      {initials}
    </span>
  );
}

// ---------------------------------------------------------------------------
// RelativeTimestamp sub-component
// ---------------------------------------------------------------------------

interface RelativeTimestampProps {
  isoTimestamp: string;
  showDetail: boolean;
}

function RelativeTimestamp({ isoTimestamp, showDetail }: RelativeTimestampProps): React.ReactElement {
  const date = new Date(isoTimestamp);
  const relativeLabel = formatRelativeTime(date);
  const absoluteLabel = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <time
      className="hbc-version-entry__timestamp"
      dateTime={isoTimestamp}
      title={absoluteLabel}
    >
      {showDetail ? absoluteLabel : relativeLabel}
    </time>
  );
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

// ---------------------------------------------------------------------------
// RollbackConfirmModal sub-component (D-03)
// ---------------------------------------------------------------------------

interface RollbackConfirmModalProps {
  target: IVersionMetadata;
  isRollingBack: boolean;
  error: Error | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function RollbackConfirmModal({
  target,
  isRollingBack,
  error,
  onConfirm,
  onCancel,
}: RollbackConfirmModalProps): React.ReactElement {
  return (
    <div
      className="hbc-rollback-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rollback-modal-title"
    >
      <div className="hbc-rollback-modal__backdrop" onClick={onCancel} aria-hidden="true" />
      <div className="hbc-rollback-modal__panel">
        <h2 id="rollback-modal-title" className="hbc-rollback-modal__title">
          Restore to Version {target.version}?
        </h2>
        <p className="hbc-rollback-modal__body">
          This will create a new version of this record whose content is a copy of{' '}
          <strong>v{target.version}</strong> ({VERSION_TAG_LABELS[target.tag]}).
          Versions between v{target.version} and the current version will be marked as superseded
          and hidden from the default view. This action cannot be undone.
        </p>
        {target.changeSummary && (
          <blockquote className="hbc-rollback-modal__summary">
            "{target.changeSummary}"
          </blockquote>
        )}
        {error && (
          <p className="hbc-rollback-modal__error" role="alert">
            Restore failed: {error.message}
          </p>
        )}
        <div className="hbc-rollback-modal__actions">
          <button
            className="hbc-rollback-modal__cancel"
            onClick={onCancel}
            disabled={isRollingBack}
          >
            Cancel
          </button>
          <button
            className="hbc-rollback-modal__confirm"
            onClick={onConfirm}
            disabled={isRollingBack}
            aria-busy={isRollingBack}
          >
            {isRollingBack ? 'Restoring…' : `Restore to v${target.version}`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## CSS Class Definitions

```css
/* src/components/HbcVersionHistory.css */

/* Panel container */
.hbc-version-history {
  display: flex;
  flex-direction: column;
  gap: var(--hbc-space-3);
  padding: var(--hbc-space-4);
  background: var(--hbc-color-surface-raised);
  border-radius: var(--hbc-radius-md);
  min-width: 280px;
}

.hbc-version-history--loading,
.hbc-version-history--error {
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.hbc-version-history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hbc-version-history__title {
  font: var(--hbc-font-label-lg);
  color: var(--hbc-color-text-primary);
  margin: 0;
}

.hbc-version-history__count {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-muted);
}

.hbc-version-history__empty {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-muted);
  text-align: center;
  padding: var(--hbc-space-6) 0;
}

.hbc-version-history__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--hbc-space-1);
}

.hbc-version-history__superseded-toggle {
  align-self: flex-start;
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-link);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--hbc-space-1) 0;
  text-decoration: underline;
}

/* Version entry */
.hbc-version-entry {
  display: flex;
  align-items: flex-start;
  gap: var(--hbc-space-2);
  border-radius: var(--hbc-radius-sm);
  transition: background 0.1s ease;
}

.hbc-version-entry--superseded {
  opacity: 0.5;
}

.hbc-version-entry__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--hbc-space-1);
  padding: var(--hbc-space-3);
  text-align: left;
  background: none;
  border: none;
  border-radius: var(--hbc-radius-sm);
  cursor: pointer;
  width: 100%;
}

.hbc-version-entry__content:hover {
  background: var(--hbc-color-surface-hover);
}

.hbc-version-entry__header {
  display: flex;
  align-items: center;
  gap: var(--hbc-space-2);
}

.hbc-version-entry__number {
  font: var(--hbc-font-label-md);
  color: var(--hbc-color-text-primary);
}

/* Tag badge colors */
.hbc-version-entry__tag {
  font: var(--hbc-font-label-xs);
  padding: 2px var(--hbc-space-2);
  border-radius: var(--hbc-radius-full);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hbc-version-entry__tag--green  { background: var(--hbc-color-success-100); color: var(--hbc-color-success-700); }
.hbc-version-entry__tag--red    { background: var(--hbc-color-danger-100);  color: var(--hbc-color-danger-700);  }
.hbc-version-entry__tag--blue   { background: var(--hbc-color-info-100);    color: var(--hbc-color-info-700);    }
.hbc-version-entry__tag--purple { background: var(--hbc-color-purple-100);  color: var(--hbc-color-purple-700);  }
.hbc-version-entry__tag--grey   { background: var(--hbc-color-neutral-100); color: var(--hbc-color-neutral-600); }

.hbc-version-entry__meta {
  display: flex;
  align-items: center;
  gap: var(--hbc-space-2);
}

.hbc-version-entry__author {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-secondary);
}

.hbc-version-entry__timestamp {
  font: var(--hbc-font-body-xs);
  color: var(--hbc-color-text-muted);
}

.hbc-version-entry__summary {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hbc-version-entry__rollback-cta {
  align-self: center;
  font: var(--hbc-font-label-sm);
  color: var(--hbc-color-text-link);
  background: none;
  border: 1px solid var(--hbc-color-border-default);
  border-radius: var(--hbc-radius-sm);
  padding: var(--hbc-space-1) var(--hbc-space-3);
  cursor: pointer;
  white-space: nowrap;
}

.hbc-version-entry__rollback-cta:hover {
  background: var(--hbc-color-surface-hover);
}

/* Author avatar */
.hbc-author-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--hbc-color-primary-200);
  color: var(--hbc-color-primary-800);
  font: var(--hbc-font-label-xs);
  flex-shrink: 0;
}

/* Rollback modal */
.hbc-rollback-modal {
  position: fixed;
  inset: 0;
  z-index: var(--hbc-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hbc-rollback-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.hbc-rollback-modal__panel {
  position: relative;
  background: var(--hbc-color-surface-overlay);
  border-radius: var(--hbc-radius-lg);
  padding: var(--hbc-space-6);
  max-width: 480px;
  width: 90vw;
  box-shadow: var(--hbc-shadow-modal);
  display: flex;
  flex-direction: column;
  gap: var(--hbc-space-4);
}

.hbc-rollback-modal__title {
  font: var(--hbc-font-heading-sm);
  color: var(--hbc-color-text-primary);
  margin: 0;
}

.hbc-rollback-modal__body {
  font: var(--hbc-font-body-md);
  color: var(--hbc-color-text-secondary);
  margin: 0;
}

.hbc-rollback-modal__summary {
  font: var(--hbc-font-body-sm);
  font-style: italic;
  color: var(--hbc-color-text-muted);
  border-left: 3px solid var(--hbc-color-border-default);
  padding-left: var(--hbc-space-3);
  margin: 0;
}

.hbc-rollback-modal__error {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-danger-700);
  background: var(--hbc-color-danger-50);
  border-radius: var(--hbc-radius-sm);
  padding: var(--hbc-space-2) var(--hbc-space-3);
  margin: 0;
}

.hbc-rollback-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--hbc-space-3);
}

.hbc-rollback-modal__cancel {
  font: var(--hbc-font-label-md);
  padding: var(--hbc-space-2) var(--hbc-space-4);
  border: 1px solid var(--hbc-color-border-default);
  border-radius: var(--hbc-radius-sm);
  background: none;
  cursor: pointer;
}

.hbc-rollback-modal__confirm {
  font: var(--hbc-font-label-md);
  padding: var(--hbc-space-2) var(--hbc-space-4);
  border: none;
  border-radius: var(--hbc-radius-sm);
  background: var(--hbc-color-danger-600);
  color: var(--hbc-color-text-on-dark);
  cursor: pointer;
}

.hbc-rollback-modal__confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## Complexity Integration

| Tier | Behavior |
|---|---|
| `essential` | `HbcVersionHistory` is not rendered; `HbcVersionBadge` only (T06) |
| `standard` | Full version list panel rendered; rollback CTA hidden; diff viewer not offered |
| `expert` | Full panel with rollback CTA (when `allowRollback={true}`) and absolute timestamps |

The component reads `useComplexity()` internally. The consuming module never passes a complexity prop.

---

## Representative Unit Tests

```tsx
// src/components/__tests__/HbcVersionHistory.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HbcVersionHistory } from '../HbcVersionHistory';
import { VersionApi } from '../../api/VersionApi';
import { useComplexity } from '@hbc/complexity';

vi.mock('../../api/VersionApi');
vi.mock('@hbc/complexity');

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

const mockUser = { userId: 'u1', displayName: 'Alice', role: 'Director' };

function renderComponent(overrides = {}) {
  return render(
    <HbcVersionHistory
      recordType="bd-scorecard"
      recordId="rec-1"
      config={mockConfig}
      currentUser={mockUser}
      {...overrides}
    />
  );
}

describe('HbcVersionHistory', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' } as never);
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      {
        snapshotId: 'snap-2',
        version: 2,
        tag: 'approved',
        createdAt: '2026-01-15T10:00:00Z',
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'Director' },
        changeSummary: 'Approved for submission',
      },
      {
        snapshotId: 'snap-1',
        version: 1,
        tag: 'submitted',
        createdAt: '2026-01-10T09:00:00Z',
        createdBy: { userId: 'u2', displayName: 'Bob', role: 'PM' },
        changeSummary: 'Initial submission',
      },
    ]);
  });

  it('renders version list entries', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('v2')).toBeInTheDocument();
      expect(screen.getByText('v1')).toBeInTheDocument();
    });
  });

  it('renders tag badges with correct labels', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });
  });

  it('shows rollback CTAs when allowRollback=true and tier=expert', async () => {
    renderComponent({ allowRollback: true });
    await waitFor(() => {
      expect(screen.getAllByText(/Restore to v/)).toHaveLength(2);
    });
  });

  it('hides rollback CTAs when tier=standard', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' } as never);
    renderComponent({ allowRollback: true });
    await waitFor(() => {
      expect(screen.queryByText(/Restore to v/)).not.toBeInTheDocument();
    });
  });

  it('opens rollback confirmation modal on CTA click', async () => {
    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getAllByText(/Restore to v/));
    fireEvent.click(screen.getAllByText(/Restore to v/)[0]!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/This will create a new version/)).toBeInTheDocument();
  });

  it('cancels rollback modal without calling VersionApi', async () => {
    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getAllByText(/Restore to v/));
    fireEvent.click(screen.getAllByText(/Restore to v/)[0]!);
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(VersionApi.restoreSnapshot).not.toHaveBeenCalled();
  });

  it('calls VersionApi.restoreSnapshot on modal confirm', async () => {
    vi.mocked(VersionApi.restoreSnapshot).mockResolvedValue({
      restoredSnapshot: { snapshotId: 'snap-3', version: 3 } as never,
      supersededSnapshotIds: ['snap-2'],
    });
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([]);

    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getAllByText(/Restore to v/));
    fireEvent.click(screen.getAllByText(/Restore to v/)[0]!);
    fireEvent.click(screen.getByText(/Restore to v2/));

    await waitFor(() =>
      expect(VersionApi.restoreSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({ targetSnapshotId: 'snap-2' })
      )
    );
  });

  it('shows "Show archived versions" toggle when superseded versions exist', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      {
        snapshotId: 'snap-1',
        version: 1,
        tag: 'superseded',
        createdAt: '2026-01-01T00:00:00Z',
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
    ]);

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Show archived versions')).toBeInTheDocument();
    });
  });
});
```

---

## Verification Commands

```bash
cd packages/versioned-record

pnpm test -- --reporter=verbose src/components/__tests__/HbcVersionHistory.test.tsx
pnpm typecheck
```
