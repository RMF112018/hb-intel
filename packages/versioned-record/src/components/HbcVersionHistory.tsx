import React, { useState, useCallback } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XXL,
  HBC_RADIUS_SM,
  HBC_RADIUS_MD,
  HBC_RADIUS_LG,
  HBC_RADIUS_FULL,
  HBC_PRIMARY_BLUE,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_GRAY,
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  elevationLevel3,
  Z_INDEX,
} from '@hbc/ui-kit/theme';
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
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_MD}px`,
    padding: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderRadius: HBC_RADIUS_MD,
    minWidth: '280px',
  },
  rootLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
  },
  rootError: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: '0',
  },
  count: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  empty: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    textAlign: 'center',
    paddingTop: `${HBC_SPACE_XXL}px`,
    paddingBottom: `${HBC_SPACE_XXL}px`,
  },
  list: {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  supersededToggle: {
    alignSelf: 'flex-start',
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_PRIMARY_BLUE,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
    textDecoration: 'underline',
  },
  errorMessage: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_STATUS_COLORS.error,
    margin: '0',
  },
  retryBtn: {
    fontSize: '13px',
    fontWeight: 600,
    color: HBC_PRIMARY_BLUE,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: '0',
    paddingRight: '0',
    textDecoration: 'underline',
  },
  spinner: {
    width: '24px',
    height: '24px',
  },

  // VersionEntry
  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_SM,
    transitionProperty: 'background',
    transitionDuration: '0.1s',
    transitionTimingFunction: 'ease',
  },
  entrySuperseded: {
    opacity: 0.5,
  },
  entryContent: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    padding: `${HBC_SPACE_MD}px`,
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: HBC_RADIUS_SM,
    cursor: 'pointer',
    width: '100%',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  entryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  entryNumber: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  entryTag: {
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '16px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_FULL,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tagGreen: { backgroundColor: HBC_STATUS_RAMP_GREEN[90], color: HBC_STATUS_RAMP_GREEN[30] },
  tagRed: { backgroundColor: HBC_STATUS_RAMP_RED[90], color: HBC_STATUS_RAMP_RED[30] },
  tagBlue: { backgroundColor: HBC_STATUS_RAMP_INFO[90], color: HBC_STATUS_RAMP_INFO[30] },
  tagPurple: { backgroundColor: HBC_STATUS_RAMP_INFO[90], color: HBC_STATUS_RAMP_INFO[10] },
  tagGrey: { backgroundColor: HBC_STATUS_RAMP_GRAY[90], color: HBC_STATUS_RAMP_GRAY[30] },
  entryMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  entryAuthor: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  entryTimestamp: {
    fontSize: '12px',
    lineHeight: '16px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  entrySummary: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    margin: '0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rollbackCta: {
    alignSelf: 'center',
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: '18px',
    color: HBC_PRIMARY_BLUE,
    backgroundColor: 'transparent',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_SM,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },

  // AuthorAvatar
  avatar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: HBC_STATUS_RAMP_INFO[90],
    color: HBC_STATUS_RAMP_INFO[10],
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '16px',
    flexShrink: 0,
  },

  // RollbackConfirmModal
  modal: {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    zIndex: Z_INDEX.modal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalPanel: {
    position: 'relative',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: HBC_RADIUS_LG,
    padding: `${HBC_SPACE_XXL}px`,
    maxWidth: '480px',
    width: '90vw',
    boxShadow: elevationLevel3,
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_LG}px`,
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '22px',
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: '0',
  },
  modalBody: {
    fontSize: '14px',
    lineHeight: '20px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    margin: '0',
  },
  modalSummary: {
    fontSize: '13px',
    lineHeight: '18px',
    fontStyle: 'italic',
    color: HBC_SURFACE_LIGHT['text-muted'],
    borderLeft: `3px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    margin: '0',
  },
  modalError: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_STATUS_RAMP_RED[30],
    backgroundColor: HBC_STATUS_RAMP_RED[90],
    borderRadius: HBC_RADIUS_SM,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    margin: '0',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: `${HBC_SPACE_MD}px`,
  },
  modalCancel: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  modalConfirm: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    border: 'none',
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: HBC_STATUS_RAMP_RED[30],
    color: '#FFFFFF',
    cursor: 'pointer',
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

const TAG_COLOR_MAP: Record<string, 'tagGreen' | 'tagRed' | 'tagBlue' | 'tagPurple' | 'tagGrey'> = {
  green: 'tagGreen',
  red: 'tagRed',
  blue: 'tagBlue',
  purple: 'tagPurple',
  grey: 'tagGrey',
};

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
  const classes = useStyles();
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

  const showRollback = allowRollback && complexity.tier === 'expert' && !!currentUser;
  const showTimestampDetail = complexity.tier === 'expert';

  if (isLoading) {
    return (
      <div className={mergeClasses(classes.root, classes.rootLoading)} role="status">
        <div className={classes.spinner} aria-label="Loading version history" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={mergeClasses(classes.root, classes.rootError)} role="alert">
        <p className={classes.errorMessage}>
          Failed to load version history: {error.message}
        </p>
        <button className={classes.retryBtn} onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <h3 className={classes.title}>Version History</h3>
        <span className={classes.count}>
          {metadata.length} version{metadata.length !== 1 ? 's' : ''}
        </span>
      </div>

      {metadata.length === 0 ? (
        <p className={classes.empty}>No versions recorded yet.</p>
      ) : (
        <ol className={classes.list} aria-label="Version history entries">
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
          className={classes.supersededToggle}
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
  const classes = useStyles();
  const tagLabel = VERSION_TAG_LABELS[entry.tag];
  const tagColor = VERSION_TAG_COLORS[entry.tag];
  const isSuperseded = entry.tag === 'superseded';

  return (
    <li
      className={mergeClasses(classes.entry, isSuperseded && classes.entrySuperseded)}
      aria-label={`Version ${entry.version}, ${tagLabel}`}
    >
      <button
        className={classes.entryContent}
        onClick={onSelect}
        aria-label={`View version ${entry.version}`}
      >
        <div className={classes.entryHeader}>
          <span className={classes.entryNumber}>v{entry.version}</span>
          <span
            className={mergeClasses(classes.entryTag, classes[TAG_COLOR_MAP[tagColor] ?? 'tagGrey'])}
            role="status"
          >
            {tagLabel}
          </span>
        </div>

        <div className={classes.entryMeta}>
          <AuthorAvatar displayName={entry.createdBy.displayName} />
          <span className={classes.entryAuthor}>{entry.createdBy.displayName}</span>
          <RelativeTimestamp
            isoTimestamp={entry.createdAt}
            showDetail={showTimestampDetail}
          />
        </div>

        {entry.changeSummary && (
          <p className={classes.entrySummary}>{entry.changeSummary}</p>
        )}
      </button>

      {showRollback && !isSuperseded && (
        <button
          className={classes.rollbackCta}
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
  const classes = useStyles();
  const initials = displayName
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className={classes.avatar}
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
  const classes = useStyles();
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
      className={classes.entryTimestamp}
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
  const classes = useStyles();

  return (
    <div
      className={classes.modal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rollback-modal-title"
    >
      <div className={classes.modalBackdrop} onClick={onCancel} aria-hidden="true" />
      <div className={classes.modalPanel}>
        <h2 id="rollback-modal-title" className={classes.modalTitle}>
          Restore to Version {target.version}?
        </h2>
        <p className={classes.modalBody}>
          This will create a new version of this record whose content is a copy of{' '}
          <strong>v{target.version}</strong> ({VERSION_TAG_LABELS[target.tag]}).
          Versions between v{target.version} and the current version will be marked as superseded
          and hidden from the default view. This action cannot be undone.
        </p>
        {target.changeSummary && (
          <blockquote className={classes.modalSummary}>
            &ldquo;{target.changeSummary}&rdquo;
          </blockquote>
        )}
        {error && (
          <p className={classes.modalError} role="alert">
            Restore failed: {error.message}
          </p>
        )}
        <div className={classes.modalActions}>
          <button
            className={classes.modalCancel}
            onClick={onCancel}
            disabled={isRollingBack}
          >
            Cancel
          </button>
          <button
            className={classes.modalConfirm}
            onClick={onConfirm}
            disabled={isRollingBack}
            aria-busy={isRollingBack}
            data-testid="rollback-confirm-btn"
          >
            {isRollingBack ? 'Restoring…' : `Restore to v${target.version}`}
          </button>
        </div>
      </div>
    </div>
  );
}
