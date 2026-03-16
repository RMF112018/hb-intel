import React, { useState } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,
  HBC_RADIUS_SM,
  HBC_RADIUS_MD,
  HBC_RADIUS_FULL,
  HBC_PRIMARY_BLUE,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_GRAY,
  HBC_SURFACE_LIGHT,
} from '@hbc/ui-kit/theme';
import { useVersionDiff } from '../hooks/useVersionDiff';
import { computeCharDiff } from '../engine/diffEngine';
import { VERSION_TAG_LABELS, VERSION_TAG_COLORS } from '../utils/versionUtils';
import type {
  IVersionDiff,
  IVersionMetadata,
  DiffMode,
  HbcVersionDiffProps,
} from '../types';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderRadius: HBC_RADIUS_MD,
    overflow: 'hidden',
  },
  rootLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: `${HBC_SPACE_XL}px`,
  },
  rootError: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: `${HBC_SPACE_XL}px`,
  },
  spinner: {
    width: '24px',
    height: '24px',
  },
  loadingText: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  errorText: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_STATUS_RAMP_RED[30],
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_LG}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_MD}px`,
  },
  versions: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
  },
  arrow: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontSize: '1.25rem',
  },
  versionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  versionNumber: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  versionAuthor: {
    fontSize: '12px',
    lineHeight: '16px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  versionTag: {
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '16px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_FULL,
  },
  tagGreen: { backgroundColor: HBC_STATUS_RAMP_GREEN[90], color: HBC_STATUS_RAMP_GREEN[30] },
  tagRed: { backgroundColor: HBC_STATUS_RAMP_RED[90], color: HBC_STATUS_RAMP_RED[30] },
  tagBlue: { backgroundColor: HBC_STATUS_RAMP_INFO[90], color: HBC_STATUS_RAMP_INFO[30] },
  tagPurple: { backgroundColor: HBC_STATUS_RAMP_INFO[90], color: HBC_STATUS_RAMP_INFO[10] },
  tagGrey: { backgroundColor: HBC_STATUS_RAMP_GRAY[90], color: HBC_STATUS_RAMP_GRAY[30] },

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_LG}px`,
  },
  changeCount: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  modeToggle: {
    display: 'flex',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_SM,
    overflow: 'hidden',
  },
  modeBtn: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: '18px',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  modeBtnActive: {
    backgroundColor: HBC_STATUS_RAMP_INFO[90],
    color: HBC_STATUS_RAMP_INFO[10],
  },

  // Body
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  noChanges: {
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    textAlign: 'center',
    padding: `${HBC_SPACE_XL}px`,
  },
  unchangedToggle: {
    alignSelf: 'flex-start',
    fontSize: '13px',
    lineHeight: '18px',
    color: HBC_PRIMARY_BLUE,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    textDecoration: 'underline',
  },

  // Side-by-side table
  diffTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    lineHeight: '18px',
  },
  diffTableTh: {
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '16px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    textAlign: 'left',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  colLabel: { width: '25%' },
  colBefore: { width: '37.5%' },
  colAfter: { width: '37.5%' },

  diffRowTd: {
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    verticalAlign: 'top',
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['surface-2']}`,
  },
  rowAddedAfter: { backgroundColor: HBC_STATUS_RAMP_GREEN[90] },
  rowRemovedBefore: { backgroundColor: HBC_STATUS_RAMP_RED[90] },
  rowModifiedBefore: { backgroundColor: HBC_STATUS_RAMP_AMBER[90] },
  rowModifiedAfter: { backgroundColor: HBC_STATUS_RAMP_GREEN[90] },
  rowLabel: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: '18px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  rowEmpty: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  valueRemoved: { color: HBC_STATUS_RAMP_RED[30] },
  valueAdded: { color: HBC_STATUS_RAMP_GREEN[30] },
  valueDelta: {
    marginLeft: `${HBC_SPACE_SM}px`,
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '16px',
    backgroundColor: HBC_STATUS_RAMP_GRAY[90],
    borderRadius: HBC_RADIUS_SM,
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: `${HBC_SPACE_XS}px`,
    paddingRight: `${HBC_SPACE_XS}px`,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },

  // Unified diff
  unified: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
  },
  unifiedRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['surface-2']}`,
  },
  unifiedLabel: {
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '16px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  unifiedBefore: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
    backgroundColor: HBC_STATUS_RAMP_RED[90],
  },
  unifiedAfter: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
    backgroundColor: HBC_STATUS_RAMP_GREEN[90],
  },
  unifiedPrefix: {
    flexShrink: 0,
    color: HBC_SURFACE_LIGHT['text-muted'],
    width: '12px',
    textAlign: 'center',
  },

  // Character-level diff
  charDiff: { fontFamily: 'inherit' },
  charEqual: { color: 'inherit' },
  charRemoved: {
    backgroundColor: HBC_STATUS_RAMP_RED[70],
    color: HBC_STATUS_RAMP_RED[10],
    borderRadius: '2px',
  },
  charAdded: {
    backgroundColor: HBC_STATUS_RAMP_GREEN[70],
    color: HBC_STATUS_RAMP_GREEN[10],
    borderRadius: '2px',
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

export function HbcVersionDiff<T>({
  recordType,
  recordId,
  versionA,
  versionB,
  config,
  diffMode: controlledDiffMode,
  onDiffModeChange,
}: HbcVersionDiffProps<T>): React.ReactElement {
  const classes = useStyles();
  const [internalDiffMode, setInternalDiffMode] = useState<DiffMode>('side-by-side');
  const [showUnchanged, setShowUnchanged] = useState(false);

  const diffMode = controlledDiffMode ?? internalDiffMode;
  const setDiffMode = (mode: DiffMode) => {
    setInternalDiffMode(mode);
    onDiffModeChange?.(mode);
  };

  const { diffs, isComputing, error, metadataA, metadataB } = useVersionDiff(
    recordType,
    recordId,
    versionA,
    versionB,
    config
  );

  if (isComputing) {
    return (
      <div className={mergeClasses(classes.root, classes.rootLoading)} role="status">
        <div className={classes.spinner} aria-label="Computing diff\u2026" />
        <span className={classes.loadingText}>Comparing versions\u2026</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={mergeClasses(classes.root, classes.rootError)} role="alert">
        <p className={classes.errorText}>Failed to load diff: {error.message}</p>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <DiffHeader
        metadataA={metadataA}
        metadataB={metadataB}
        versionA={versionA}
        versionB={versionB}
        diffMode={diffMode}
        onDiffModeChange={setDiffMode}
        changedCount={diffs.length}
      />

      {diffs.length === 0 ? (
        <p className={classes.noChanges}>No differences found between these versions.</p>
      ) : (
        <div className={classes.body}>
          {diffMode === 'side-by-side' ? (
            <SideBySideDiff diffs={diffs} showUnchanged={showUnchanged} />
          ) : (
            <UnifiedDiff diffs={diffs} showUnchanged={showUnchanged} />
          )}
          <button
            className={classes.unchangedToggle}
            onClick={() => setShowUnchanged((v) => !v)}
          >
            {showUnchanged ? 'Hide unchanged fields' : 'Show unchanged fields'}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DiffHeader sub-component
// ---------------------------------------------------------------------------

interface DiffHeaderProps {
  metadataA: IVersionMetadata | null;
  metadataB: IVersionMetadata | null;
  versionA: number;
  versionB: number;
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  changedCount: number;
}

function DiffHeader({
  metadataA,
  metadataB,
  versionA,
  versionB,
  diffMode,
  onDiffModeChange,
  changedCount,
}: DiffHeaderProps): React.ReactElement {
  const classes = useStyles();

  return (
    <div className={classes.header}>
      <div className={classes.versions}>
        <VersionLabel version={versionA} metadata={metadataA} />
        <span className={classes.arrow} aria-hidden="true">{'\u2192'}</span>
        <VersionLabel version={versionB} metadata={metadataB} />
      </div>

      <div className={classes.controls}>
        <span className={classes.changeCount}>
          {changedCount} field{changedCount !== 1 ? 's' : ''} changed
        </span>
        <div
          className={classes.modeToggle}
          role="group"
          aria-label="Diff display mode"
        >
          <button
            className={mergeClasses(classes.modeBtn, diffMode === 'side-by-side' && classes.modeBtnActive)}
            onClick={() => onDiffModeChange('side-by-side')}
            aria-pressed={diffMode === 'side-by-side'}
          >
            Side by side
          </button>
          <button
            className={mergeClasses(classes.modeBtn, diffMode === 'unified' && classes.modeBtnActive)}
            onClick={() => onDiffModeChange('unified')}
            aria-pressed={diffMode === 'unified'}
          >
            Unified
          </button>
        </div>
      </div>
    </div>
  );
}

interface VersionLabelProps {
  version: number;
  metadata: IVersionMetadata | null;
}

function VersionLabel({ version, metadata }: VersionLabelProps): React.ReactElement {
  const classes = useStyles();
  const tagColor = metadata ? VERSION_TAG_COLORS[metadata.tag] : 'grey';
  const tagLabel = metadata ? VERSION_TAG_LABELS[metadata.tag] : '';

  return (
    <div className={classes.versionLabel}>
      <span className={classes.versionNumber}>v{version}</span>
      {tagLabel && (
        <span className={mergeClasses(classes.versionTag, classes[TAG_COLOR_MAP[tagColor] ?? 'tagGrey'])}>
          {tagLabel}
        </span>
      )}
      {metadata && (
        <span className={classes.versionAuthor}>
          {metadata.createdBy.displayName}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SideBySideDiff sub-component
// ---------------------------------------------------------------------------

interface SideBySideDiffProps {
  diffs: IVersionDiff[];
  showUnchanged: boolean;
}

function SideBySideDiff({ diffs }: SideBySideDiffProps): React.ReactElement {
  const classes = useStyles();

  return (
    <table className={classes.diffTable} aria-label="Side by side diff">
      <thead>
        <tr>
          <th className={mergeClasses(classes.diffTableTh, classes.colLabel)}>Field</th>
          <th className={mergeClasses(classes.diffTableTh, classes.colBefore)}>Before</th>
          <th className={mergeClasses(classes.diffTableTh, classes.colAfter)}>After</th>
        </tr>
      </thead>
      <tbody>
        {diffs.map((diff) => (
          <SideBySideRow key={diff.fieldName} diff={diff} />
        ))}
      </tbody>
    </table>
  );
}

interface SideBySideRowProps {
  diff: IVersionDiff;
}

function SideBySideRow({ diff }: SideBySideRowProps): React.ReactElement {
  const classes = useStyles();
  const isNumeric = diff.numericDelta !== undefined;
  const isText = !isNumeric && diff.changeType === 'modified' &&
    diff.previousValue.length > 0 && diff.currentValue.length > 0;

  const beforeCellClass = mergeClasses(
    classes.diffRowTd,
    diff.changeType === 'removed' && classes.rowRemovedBefore,
    diff.changeType === 'modified' && classes.rowModifiedBefore,
  );
  const afterCellClass = mergeClasses(
    classes.diffRowTd,
    diff.changeType === 'added' && classes.rowAddedAfter,
    diff.changeType === 'modified' && classes.rowModifiedAfter,
  );

  return (
    <tr>
      <td className={mergeClasses(classes.diffRowTd, classes.rowLabel)}>{diff.label}</td>
      <td className={beforeCellClass}>
        {diff.changeType === 'added' ? (
          <span className={classes.rowEmpty}>{'\u2014'}</span>
        ) : isNumeric ? (
          <span className={classes.valueRemoved}>{diff.previousValue}</span>
        ) : isText ? (
          <CharDiffDisplay text={diff.previousValue} otherText={diff.currentValue} side="before" />
        ) : (
          <span className={classes.valueRemoved}>{diff.previousValue}</span>
        )}
      </td>
      <td className={afterCellClass}>
        {diff.changeType === 'removed' ? (
          <span className={classes.rowEmpty}>{'\u2014'}</span>
        ) : isNumeric ? (
          <span className={classes.valueAdded}>
            {diff.currentValue}
            <span className={classes.valueDelta}>{diff.numericDelta}</span>
          </span>
        ) : isText ? (
          <CharDiffDisplay text={diff.currentValue} otherText={diff.previousValue} side="after" />
        ) : (
          <span className={classes.valueAdded}>{diff.currentValue}</span>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// UnifiedDiff sub-component
// ---------------------------------------------------------------------------

interface UnifiedDiffProps {
  diffs: IVersionDiff[];
  showUnchanged: boolean;
}

function UnifiedDiff({ diffs }: UnifiedDiffProps): React.ReactElement {
  const classes = useStyles();

  return (
    <div className={classes.unified} aria-label="Unified diff">
      {diffs.map((diff) => (
        <UnifiedRow key={diff.fieldName} diff={diff} />
      ))}
    </div>
  );
}

interface UnifiedRowProps {
  diff: IVersionDiff;
}

function UnifiedRow({ diff }: UnifiedRowProps): React.ReactElement {
  const classes = useStyles();

  return (
    <div className={classes.unifiedRow}>
      <span className={classes.unifiedLabel}>{diff.label}</span>
      <div>
        {diff.changeType !== 'added' && (
          <div className={classes.unifiedBefore}>
            <span className={classes.unifiedPrefix} aria-hidden="true">{'\u2212'}</span>
            <span className={classes.valueRemoved}>{diff.previousValue}</span>
          </div>
        )}
        {diff.changeType !== 'removed' && (
          <div className={classes.unifiedAfter}>
            <span className={classes.unifiedPrefix} aria-hidden="true">+</span>
            <span className={classes.valueAdded}>
              {diff.currentValue}
              {diff.numericDelta && (
                <span className={classes.valueDelta}>{diff.numericDelta}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CharDiffDisplay sub-component — character-level inline highlighting
// ---------------------------------------------------------------------------

interface CharDiffDisplayProps {
  text: string;
  otherText: string;
  side: 'before' | 'after';
}

function CharDiffDisplay({ text, otherText, side }: CharDiffDisplayProps): React.ReactElement {
  const classes = useStyles();
  const tokens = side === 'before'
    ? computeCharDiff(text, otherText)
    : computeCharDiff(otherText, text);

  return (
    <span className={classes.charDiff}>
      {tokens.map((token, i) => {
        if (token.type === 'equal') {
          return <span key={i} className={classes.charEqual}>{token.text}</span>;
        }
        if (side === 'before' && token.type === 'removed') {
          return <mark key={i} className={classes.charRemoved}>{token.text}</mark>;
        }
        if (side === 'after' && token.type === 'added') {
          return <mark key={i} className={classes.charAdded}>{token.text}</mark>;
        }
        return null;
      })}
    </span>
  );
}
