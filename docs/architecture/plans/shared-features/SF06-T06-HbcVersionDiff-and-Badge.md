# SF06-T06 — `HbcVersionDiff` and `HbcVersionBadge` Components

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01 (scaffold), T02 (contracts), T03 (diff engine), T04 (hooks)
**Blocks:** T08 (Storybook stories)
**SPFx Note:** `HbcVersionDiff` is PWA-only (too complex for SPFx webpart context per spec). `HbcVersionBadge` is SPFx-compatible via `@hbc/ui-kit/app-shell`.

---

## Objective

Implement two supporting UI components:
- `HbcVersionDiff` — side-by-side and unified field diff viewer with character-level highlighting, numeric delta display, and collapsible unchanged fields
- `HbcVersionBadge` — compact version chip for record headers that opens the version history panel on click

---

## File: `src/components/HbcVersionDiff.tsx`

```tsx
import React, { useState } from 'react';
import { useVersionDiff } from '../hooks/useVersionDiff';
import { computeCharDiff } from '../engine/diffEngine';
import { VERSION_TAG_LABELS, VERSION_TAG_COLORS } from '../utils/versionUtils';
import type {
  IVersionedRecordConfig,
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
```

---

## File: `src/components/HbcVersionBadge.tsx`

```tsx
import React from 'react';
import { VERSION_TAG_LABELS, VERSION_TAG_COLORS } from '../utils/versionUtils';
import type { HbcVersionBadgeProps, VersionTag } from '../types';

/**
 * Compact version chip for record headers.
 * Renders as "v3 · Approved" with a colored tag.
 * Clicking opens the version history panel (caller's responsibility via `onClick`).
 * SPFx-compatible.
 */
export function HbcVersionBadge({
  currentVersion,
  currentTag,
  onClick,
}: HbcVersionBadgeProps): React.ReactElement {
  const tagLabel = currentTag ? VERSION_TAG_LABELS[currentTag] : undefined;
  const tagColor: string = currentTag ? VERSION_TAG_COLORS[currentTag] : 'grey';

  const content = (
    <>
      <span className="hbc-version-badge__version">v{currentVersion}</span>
      {tagLabel && (
        <>
          <span className="hbc-version-badge__separator" aria-hidden="true">·</span>
          <span
            className={`hbc-version-badge__tag hbc-version-badge__tag--${tagColor}`}
          >
            {tagLabel}
          </span>
        </>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        className="hbc-version-badge hbc-version-badge--interactive"
        onClick={onClick}
        aria-label={`Version ${currentVersion}${tagLabel ? `, ${tagLabel}` : ''}. Click to view history.`}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className="hbc-version-badge"
      aria-label={`Version ${currentVersion}${tagLabel ? `, ${tagLabel}` : ''}`}
    >
      {content}
    </span>
  );
}
```

---

## CSS Class Definitions

```css
/* src/components/HbcVersionDiff.css */

.hbc-version-diff {
  display: flex;
  flex-direction: column;
  gap: var(--hbc-space-4);
  background: var(--hbc-color-surface-raised);
  border-radius: var(--hbc-radius-md);
  overflow: hidden;
}

.hbc-version-diff--loading,
.hbc-version-diff--error {
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--hbc-space-8);
}

.hbc-version-diff__loading-text {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-muted);
}

.hbc-version-diff__error {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-danger-700);
}

/* Header */
.hbc-version-diff__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--hbc-space-4);
  border-bottom: 1px solid var(--hbc-color-border-default);
  flex-wrap: wrap;
  gap: var(--hbc-space-3);
}

.hbc-version-diff__versions {
  display: flex;
  align-items: center;
  gap: var(--hbc-space-3);
}

.hbc-version-diff__arrow {
  color: var(--hbc-color-text-muted);
  font-size: 1.25rem;
}

.hbc-version-diff__version-label {
  display: flex;
  align-items: center;
  gap: var(--hbc-space-2);
}

.hbc-version-diff__version-number {
  font: var(--hbc-font-label-md);
  color: var(--hbc-color-text-primary);
}

.hbc-version-diff__version-author {
  font: var(--hbc-font-body-xs);
  color: var(--hbc-color-text-muted);
}

/* Reuse tag color classes from HbcVersionHistory */
.hbc-version-diff__version-tag {
  font: var(--hbc-font-label-xs);
  padding: 2px var(--hbc-space-2);
  border-radius: var(--hbc-radius-full);
}

.hbc-version-diff__controls {
  display: flex;
  align-items: center;
  gap: var(--hbc-space-4);
}

.hbc-version-diff__change-count {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-muted);
}

.hbc-version-diff__mode-toggle {
  display: flex;
  border: 1px solid var(--hbc-color-border-default);
  border-radius: var(--hbc-radius-sm);
  overflow: hidden;
}

.hbc-version-diff__mode-btn {
  font: var(--hbc-font-label-sm);
  padding: var(--hbc-space-1) var(--hbc-space-3);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--hbc-color-text-secondary);
}

.hbc-version-diff__mode-btn--active {
  background: var(--hbc-color-primary-50);
  color: var(--hbc-color-primary-700);
}

/* Body */
.hbc-version-diff__body {
  display: flex;
  flex-direction: column;
  gap: var(--hbc-space-2);
}

.hbc-version-diff__no-changes {
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-muted);
  text-align: center;
  padding: var(--hbc-space-8);
}

.hbc-version-diff__unchanged-toggle {
  align-self: flex-start;
  font: var(--hbc-font-body-sm);
  color: var(--hbc-color-text-link);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--hbc-space-2) var(--hbc-space-4);
  text-decoration: underline;
}

/* Side-by-side table */
.hbc-diff-table {
  width: 100%;
  border-collapse: collapse;
  font: var(--hbc-font-body-sm);
}

.hbc-diff-table th {
  font: var(--hbc-font-label-xs);
  color: var(--hbc-color-text-muted);
  text-align: left;
  padding: var(--hbc-space-2) var(--hbc-space-4);
  border-bottom: 1px solid var(--hbc-color-border-default);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hbc-diff-table__col-label { width: 25%; }
.hbc-diff-table__col-before { width: 37.5%; }
.hbc-diff-table__col-after { width: 37.5%; }

.hbc-diff-row td {
  padding: var(--hbc-space-2) var(--hbc-space-4);
  vertical-align: top;
  border-bottom: 1px solid var(--hbc-color-border-subtle);
}

.hbc-diff-row--added td.hbc-diff-row__after    { background: var(--hbc-color-success-50); }
.hbc-diff-row--removed td.hbc-diff-row__before { background: var(--hbc-color-danger-50);  }
.hbc-diff-row--modified td.hbc-diff-row__before { background: var(--hbc-color-warning-50); }
.hbc-diff-row--modified td.hbc-diff-row__after  { background: var(--hbc-color-success-50); }

.hbc-diff-row__label {
  font: var(--hbc-font-label-sm);
  color: var(--hbc-color-text-secondary);
}

.hbc-diff-row__empty {
  color: var(--hbc-color-text-muted);
}

.hbc-diff-value--removed { color: var(--hbc-color-danger-700); }
.hbc-diff-value--added   { color: var(--hbc-color-success-700); }

.hbc-diff-value__delta {
  margin-left: var(--hbc-space-2);
  font: var(--hbc-font-label-xs);
  background: var(--hbc-color-neutral-100);
  border-radius: var(--hbc-radius-sm);
  padding: 1px var(--hbc-space-1);
  color: var(--hbc-color-text-secondary);
}

/* Unified diff */
.hbc-diff-unified {
  display: flex;
  flex-direction: column;
  font-family: var(--hbc-font-mono);
  font-size: 0.8125rem;
}

.hbc-diff-unified-row {
  display: flex;
  flex-direction: column;
  gap: var(--hbc-space-1);
  padding: var(--hbc-space-2) var(--hbc-space-4);
  border-bottom: 1px solid var(--hbc-color-border-subtle);
}

.hbc-diff-unified-row__label {
  font: var(--hbc-font-label-xs);
  color: var(--hbc-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hbc-diff-unified-row__before,
.hbc-diff-unified-row__after {
  display: flex;
  align-items: flex-start;
  gap: var(--hbc-space-2);
}

.hbc-diff-unified-row__before { background: var(--hbc-color-danger-50); }
.hbc-diff-unified-row__after  { background: var(--hbc-color-success-50); }

.hbc-diff-unified-row__prefix {
  flex-shrink: 0;
  color: var(--hbc-color-text-muted);
  width: 12px;
  text-align: center;
}

/* Character-level diff */
.hbc-char-diff { font-family: inherit; }
.hbc-char-diff__equal   { color: inherit; }
.hbc-char-diff__removed { background: var(--hbc-color-danger-200);  color: var(--hbc-color-danger-900);  border-radius: 2px; }
.hbc-char-diff__added   { background: var(--hbc-color-success-200); color: var(--hbc-color-success-900); border-radius: 2px; }

/* ------------------------------------------------------------------ */
/* HbcVersionBadge                                                      */
/* ------------------------------------------------------------------ */

.hbc-version-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--hbc-space-1);
  font: var(--hbc-font-label-xs);
  padding: 2px var(--hbc-space-2);
  border-radius: var(--hbc-radius-full);
  background: var(--hbc-color-neutral-100);
  color: var(--hbc-color-text-secondary);
  white-space: nowrap;
  user-select: none;
}

.hbc-version-badge--interactive {
  border: none;
  cursor: pointer;
  transition: background 0.1s ease;
}

.hbc-version-badge--interactive:hover {
  background: var(--hbc-color-neutral-200);
}

.hbc-version-badge__version {
  font-weight: 600;
}

.hbc-version-badge__separator {
  color: var(--hbc-color-text-muted);
}

/* Reuse version-entry tag color tokens */
.hbc-version-badge__tag--green  { color: var(--hbc-color-success-700); }
.hbc-version-badge__tag--red    { color: var(--hbc-color-danger-700);  }
.hbc-version-badge__tag--blue   { color: var(--hbc-color-info-700);    }
.hbc-version-badge__tag--purple { color: var(--hbc-color-purple-700);  }
.hbc-version-badge__tag--grey   { color: var(--hbc-color-neutral-600); }
```

---

## Representative Unit Tests

```tsx
// src/components/__tests__/HbcVersionDiff.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HbcVersionDiff } from '../HbcVersionDiff';
import { VersionApi } from '../../api/VersionApi';

vi.mock('../../api/VersionApi');

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

const snapA = { snapshotId: 'a', version: 1, tag: 'submitted' as const, snapshot: { totalScore: 42, projectName: 'Alpha' }, createdAt: '2026-01-01T00:00:00Z', createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' }, changeSummary: '' };
const snapB = { snapshotId: 'b', version: 2, tag: 'approved' as const, snapshot: { totalScore: 67, projectName: 'Alpha' }, createdAt: '2026-01-15T00:00:00Z', createdBy: { userId: 'u1', displayName: 'Alice', role: 'Director' }, changeSummary: '' };

describe('HbcVersionDiff', () => {
  beforeEach(() => {
    vi.mocked(VersionApi.getSnapshot).mockImplementation(async (_rt, _id, ver) =>
      ver === 1 ? (snapA as never) : (snapB as never)
    );
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      { snapshotId: 'a', version: 1, tag: 'submitted', createdAt: snapA.createdAt, createdBy: snapA.createdBy, changeSummary: '' },
      { snapshotId: 'b', version: 2, tag: 'approved', createdAt: snapB.createdAt, createdBy: snapB.createdBy, changeSummary: '' },
    ]);
  });

  it('renders side-by-side diff with changed fields', async () => {
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('1 field changed')).toBeInTheDocument();
    });
  });

  it('toggles to unified diff mode', async () => {
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
      />
    );
    await waitFor(() => screen.getByText('Unified'));
    fireEvent.click(screen.getByText('Unified'));
    expect(screen.getByLabelText('Unified diff')).toBeInTheDocument();
  });

  it('displays numeric delta for changed numeric fields', async () => {
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('+25')).toBeInTheDocument();
    });
  });

  it('shows "No differences found" when versions are identical', async () => {
    vi.mocked(VersionApi.getSnapshot).mockResolvedValue(snapA as never);
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={1}
        config={mockConfig}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/No differences found/)).toBeInTheDocument();
    });
  });
});

// src/components/__tests__/HbcVersionBadge.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcVersionBadge } from '../HbcVersionBadge';

describe('HbcVersionBadge', () => {
  it('renders version number', () => {
    render(<HbcVersionBadge currentVersion={3} />);
    expect(screen.getByText('v3')).toBeInTheDocument();
  });

  it('renders tag label when provided', () => {
    render(<HbcVersionBadge currentVersion={3} currentTag="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders as a button when onClick is provided', () => {
    render(<HbcVersionBadge currentVersion={3} onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as a span when onClick is not provided', () => {
    render(<HbcVersionBadge currentVersion={3} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handler = vi.fn();
    render(<HbcVersionBadge currentVersion={3} onClick={handler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders all tag states without error', () => {
    const tags = ['draft', 'submitted', 'approved', 'rejected', 'archived', 'handoff', 'superseded'] as const;
    for (const tag of tags) {
      const { unmount } = render(<HbcVersionBadge currentVersion={1} currentTag={tag} />);
      unmount();
    }
  });
});
```

---

## Verification Commands

```bash
cd packages/versioned-record

pnpm test -- --reporter=verbose src/components/__tests__/HbcVersionDiff.test.tsx
pnpm test -- --reporter=verbose src/components/__tests__/HbcVersionBadge.test.tsx
pnpm typecheck
```
