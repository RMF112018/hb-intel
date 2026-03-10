import React, { useState } from 'react';
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
      <div className="hbc-version-diff hbc-version-diff--loading" role="status">
        <div className="hbc-version-diff__spinner" aria-label="Computing diff…" />
        <span className="hbc-version-diff__loading-text">Comparing versions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hbc-version-diff hbc-version-diff--error" role="alert">
        <p className="hbc-version-diff__error">Failed to load diff: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="hbc-version-diff">
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
        <p className="hbc-version-diff__no-changes">No differences found between these versions.</p>
      ) : (
        <div className="hbc-version-diff__body">
          {diffMode === 'side-by-side' ? (
            <SideBySideDiff diffs={diffs} showUnchanged={showUnchanged} />
          ) : (
            <UnifiedDiff diffs={diffs} showUnchanged={showUnchanged} />
          )}
          <button
            className="hbc-version-diff__unchanged-toggle"
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
  return (
    <div className="hbc-version-diff__header">
      <div className="hbc-version-diff__versions">
        <VersionLabel version={versionA} metadata={metadataA} side="left" />
        <span className="hbc-version-diff__arrow" aria-hidden="true">→</span>
        <VersionLabel version={versionB} metadata={metadataB} side="right" />
      </div>

      <div className="hbc-version-diff__controls">
        <span className="hbc-version-diff__change-count">
          {changedCount} field{changedCount !== 1 ? 's' : ''} changed
        </span>
        <div
          className="hbc-version-diff__mode-toggle"
          role="group"
          aria-label="Diff display mode"
        >
          <button
            className={`hbc-version-diff__mode-btn${diffMode === 'side-by-side' ? ' hbc-version-diff__mode-btn--active' : ''}`}
            onClick={() => onDiffModeChange('side-by-side')}
            aria-pressed={diffMode === 'side-by-side'}
          >
            Side by side
          </button>
          <button
            className={`hbc-version-diff__mode-btn${diffMode === 'unified' ? ' hbc-version-diff__mode-btn--active' : ''}`}
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
  side: 'left' | 'right';
}

function VersionLabel({ version, metadata, side }: VersionLabelProps): React.ReactElement {
  const tagColor = metadata ? VERSION_TAG_COLORS[metadata.tag] : 'grey';
  const tagLabel = metadata ? VERSION_TAG_LABELS[metadata.tag] : '';

  return (
    <div className={`hbc-version-diff__version-label hbc-version-diff__version-label--${side}`}>
      <span className="hbc-version-diff__version-number">v{version}</span>
      {tagLabel && (
        <span className={`hbc-version-diff__version-tag hbc-version-diff__version-tag--${tagColor}`}>
          {tagLabel}
        </span>
      )}
      {metadata && (
        <span className="hbc-version-diff__version-author">
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
  return (
    <table className="hbc-diff-table hbc-diff-table--side-by-side" aria-label="Side by side diff">
      <thead>
        <tr>
          <th className="hbc-diff-table__col-label">Field</th>
          <th className="hbc-diff-table__col-before">Before</th>
          <th className="hbc-diff-table__col-after">After</th>
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
  const isNumeric = diff.numericDelta !== undefined;
  const isText = !isNumeric && diff.changeType === 'modified' &&
    diff.previousValue.length > 0 && diff.currentValue.length > 0;

  return (
    <tr className={`hbc-diff-row hbc-diff-row--${diff.changeType}`}>
      <td className="hbc-diff-row__label">{diff.label}</td>
      <td className="hbc-diff-row__before">
        {diff.changeType === 'added' ? (
          <span className="hbc-diff-row__empty">—</span>
        ) : isNumeric ? (
          <span className="hbc-diff-value hbc-diff-value--removed">{diff.previousValue}</span>
        ) : isText ? (
          <CharDiffDisplay text={diff.previousValue} otherText={diff.currentValue} side="before" />
        ) : (
          <span className="hbc-diff-value hbc-diff-value--removed">{diff.previousValue}</span>
        )}
      </td>
      <td className="hbc-diff-row__after">
        {diff.changeType === 'removed' ? (
          <span className="hbc-diff-row__empty">—</span>
        ) : isNumeric ? (
          <span className="hbc-diff-value hbc-diff-value--added">
            {diff.currentValue}
            <span className="hbc-diff-value__delta">{diff.numericDelta}</span>
          </span>
        ) : isText ? (
          <CharDiffDisplay text={diff.currentValue} otherText={diff.previousValue} side="after" />
        ) : (
          <span className="hbc-diff-value hbc-diff-value--added">{diff.currentValue}</span>
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
  return (
    <div className="hbc-diff-unified" aria-label="Unified diff">
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
  return (
    <div className={`hbc-diff-unified-row hbc-diff-unified-row--${diff.changeType}`}>
      <span className="hbc-diff-unified-row__label">{diff.label}</span>
      <div className="hbc-diff-unified-row__values">
        {diff.changeType !== 'added' && (
          <div className="hbc-diff-unified-row__before">
            <span className="hbc-diff-unified-row__prefix" aria-hidden="true">−</span>
            <span className="hbc-diff-value hbc-diff-value--removed">{diff.previousValue}</span>
          </div>
        )}
        {diff.changeType !== 'removed' && (
          <div className="hbc-diff-unified-row__after">
            <span className="hbc-diff-unified-row__prefix" aria-hidden="true">+</span>
            <span className="hbc-diff-value hbc-diff-value--added">
              {diff.currentValue}
              {diff.numericDelta && (
                <span className="hbc-diff-value__delta">{diff.numericDelta}</span>
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
  const tokens = side === 'before'
    ? computeCharDiff(text, otherText)
    : computeCharDiff(otherText, text);

  return (
    <span className="hbc-char-diff">
      {tokens.map((token, i) => {
        if (token.type === 'equal') {
          return <span key={i} className="hbc-char-diff__equal">{token.text}</span>;
        }
        if (side === 'before' && token.type === 'removed') {
          return <mark key={i} className="hbc-char-diff__removed">{token.text}</mark>;
        }
        if (side === 'after' && token.type === 'added') {
          return <mark key={i} className="hbc-char-diff__added">{token.text}</mark>;
        }
        return null;
      })}
    </span>
  );
}
