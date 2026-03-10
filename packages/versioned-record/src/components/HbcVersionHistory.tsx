import React, { useState, useCallback } from 'react';
import { useComplexity } from '@hbc/complexity';
import { useVersionHistory } from '../hooks/useVersionHistory';
import { VersionApi } from '../api/VersionApi';
import {
  VERSION_TAG_LABELS,
  VERSION_TAG_COLORS,
} from '../utils/versionUtils';
import type {
  IVersionMetadata,
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
  const { metadata, isLoading, error, showSuperseded, setShowSuperseded, hasSuperseded, refresh } =
    useVersionHistory(recordType, recordId, config);

  const [rollbackTarget, setRollbackTarget] = useState<IVersionMetadata | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackError, setRollbackError] = useState<Error | null>(null);

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
