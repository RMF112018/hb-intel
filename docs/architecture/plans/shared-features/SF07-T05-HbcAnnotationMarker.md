# SF07-T05 — `HbcAnnotationMarker` Component

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-05 (complexity mode rendering), D-06 (SPFx constraints), D-09 (form integration pattern)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01 (scaffold), T02 (contracts), T03 (AnnotationApi), T04 (Hooks)

> **Doc Classification:** Canonical Normative Plan — SF07-T05 HbcAnnotationMarker component task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Implement `HbcAnnotationMarker` — the indicator dot component that is rendered adjacent to each annotatable form field. The marker is the primary entry point into the annotation system from the form layer. It reads annotation state for its specific field, renders the appropriate visual indicator, and manages the click-to-open thread interaction.

---

## 3-Line Plan

1. Implement `HbcAnnotationMarker` with all intent color states, complexity gating, and tooltip behavior.
2. Implement the click handler that opens `HbcAnnotationThread` as an anchored popover.
3. Apply SPFx constraints — use `@hbc/ui-kit/app-shell` popover anchor only; no Fluent Dialog dependency.

---

## Props Interface

```typescript
interface HbcAnnotationMarkerProps {
  /** Record type namespace (e.g., 'bd-scorecard') */
  recordType: string;
  /** Unique identifier of the parent record */
  recordId: string;
  /** Stable field key this marker is associated with */
  fieldKey: string;
  /** Human-readable field label — passed through to HbcAnnotationThread */
  fieldLabel: string;
  /** Per-record-type configuration */
  config: IFieldAnnotationConfig;
  /**
   * Whether the current user can create new annotations on this field.
   * When false, the marker is read-only (thread visible, add form hidden).
   * Defaults to false.
   */
  canAnnotate?: boolean;
  /**
   * Whether the current user can resolve annotations on this field.
   * Typically true for the assignee or record owner.
   * Defaults to false.
   */
  canResolve?: boolean;
  /**
   * Force a specific complexity variant regardless of the user's global setting (D-05).
   * Required for SPFx narrow column contexts and My Work Feed annotation rows.
   */
  forceVariant?: 'essential' | 'standard' | 'expert';
}
```

---

## `src/components/HbcAnnotationMarker.tsx`

```typescript
import React, { useCallback, useRef, useState } from 'react';
import { useComplexity } from '@hbc/complexity';
import { useFieldAnnotation } from '../hooks/useFieldAnnotation';
import type { IFieldAnnotationConfig, AnnotationIntent } from '../types/IFieldAnnotation';
import { intentColorClass, resolveAnnotationConfig } from '../constants/annotationDefaults';
import { HbcAnnotationThread } from './HbcAnnotationThread';

// ─────────────────────────────────────────────────────────────────────────────
// Derive the marker's visual state from open annotations (D-05)
// ─────────────────────────────────────────────────────────────────────────────

type MarkerVisualState =
  | 'hidden'          // No annotations on this field
  | 'open-clarification'
  | 'open-flag'
  | 'open-comment'
  | 'resolved-only';  // All annotations resolved

function resolveMarkerState(
  annotations: ReturnType<typeof useFieldAnnotation>['annotations']
): MarkerVisualState {
  if (annotations.length === 0) return 'hidden';

  const open = annotations.filter((a) => a.status === 'open');
  if (open.length === 0) return 'resolved-only';

  // Priority: clarification-request > flag-for-revision > comment
  if (open.some((a) => a.intent === 'clarification-request')) return 'open-clarification';
  if (open.some((a) => a.intent === 'flag-for-revision')) return 'open-flag';
  return 'open-comment';
}

function markerStateToIntent(state: MarkerVisualState): AnnotationIntent | 'resolved' | null {
  switch (state) {
    case 'open-clarification': return 'clarification-request';
    case 'open-flag': return 'flag-for-revision';
    case 'open-comment': return 'comment';
    case 'resolved-only': return 'resolved';
    default: return null;
  }
}

function buildTooltipText(openCount: number, state: MarkerVisualState): string {
  if (state === 'resolved-only') return 'All annotations resolved';
  if (openCount === 1) return '1 open annotation';
  return `${openCount} open annotations`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HbcAnnotationMarker
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcAnnotationMarkerProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: IFieldAnnotationConfig;
  canAnnotate?: boolean;
  canResolve?: boolean;
  forceVariant?: 'essential' | 'standard' | 'expert';
}

export function HbcAnnotationMarker({
  recordType,
  recordId,
  fieldKey,
  fieldLabel,
  config,
  canAnnotate = false,
  canResolve = false,
  forceVariant,
}: HbcAnnotationMarkerProps) {
  const { variant: contextVariant } = useComplexity();
  const variant = forceVariant ?? contextVariant;

  const resolvedConfig = resolveAnnotationConfig(config);

  // In Essential mode, render nothing (D-05)
  if (variant === 'essential') return null;

  // For read-only viewers where visibleToViewers is false, render nothing
  const isViewer = !canAnnotate && !canResolve;
  if (isViewer && !resolvedConfig.visibleToViewers) return null;

  return (
    <HbcAnnotationMarkerInner
      recordType={recordType}
      recordId={recordId}
      fieldKey={fieldKey}
      fieldLabel={fieldLabel}
      config={resolvedConfig}
      canAnnotate={canAnnotate}
      canResolve={canResolve}
      variant={variant}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner — always mounted when complexity check passes
// ─────────────────────────────────────────────────────────────────────────────

interface InnerProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: Required<IFieldAnnotationConfig>;
  canAnnotate: boolean;
  canResolve: boolean;
  variant: 'standard' | 'expert';
}

function HbcAnnotationMarkerInner({
  recordType,
  recordId,
  fieldKey,
  fieldLabel,
  config,
  canAnnotate,
  canResolve,
  variant,
}: InnerProps) {
  const { annotations, openCount } = useFieldAnnotation(recordType, recordId, fieldKey);
  const [threadOpen, setThreadOpen] = useState(false);
  const markerRef = useRef<HTMLButtonElement>(null);

  const markerState = resolveMarkerState(annotations);
  const intent = markerStateToIntent(markerState);
  const tooltipText = buildTooltipText(openCount, markerState);

  // Zero DOM footprint when no annotations exist and user cannot annotate (D-09)
  if (markerState === 'hidden' && !canAnnotate) return null;

  const colorClass = intent ? intentColorClass[intent] ?? 'grey' : 'transparent';
  const dotClass = markerState === 'hidden'
    ? 'hbc-annotation-marker--add-only'
    : `hbc-annotation-marker--${colorClass}`;

  const handleClick = useCallback(() => {
    setThreadOpen((prev) => !prev);
  }, []);

  const handleThreadClose = useCallback(() => {
    setThreadOpen(false);
  }, []);

  return (
    <>
      <button
        ref={markerRef}
        type="button"
        className={`hbc-annotation-marker ${dotClass}`}
        aria-label={markerState === 'hidden' ? 'Add annotation' : tooltipText}
        aria-expanded={threadOpen}
        aria-haspopup="dialog"
        title={markerState === 'hidden' ? 'Add annotation' : tooltipText}
        onClick={handleClick}
        data-testid="hbc-annotation-marker"
      >
        {/* Expert mode: open count badge (D-05) */}
        {variant === 'expert' && openCount > 0 && (
          <span className="hbc-annotation-marker__count" aria-hidden="true">
            {openCount}
          </span>
        )}

        {/* Resolved-only: checkmark indicator */}
        {markerState === 'resolved-only' && (
          <span className="hbc-annotation-marker__resolved-icon" aria-hidden="true">✓</span>
        )}
      </button>

      {/* Thread popover — anchored to the marker button (D-06) */}
      {threadOpen && (
        <HbcAnnotationThread
          recordType={recordType}
          recordId={recordId}
          fieldKey={fieldKey}
          fieldLabel={fieldLabel}
          config={config}
          canAnnotate={canAnnotate}
          canResolve={canResolve}
          anchorRef={markerRef}
          onClose={handleThreadClose}
        />
      )}
    </>
  );
}
```

---

## Visual State Reference

| Marker State | CSS Class | Visual | Tooltip |
|---|---|---|---|
| No annotations, `canAnnotate=true` | `hbc-annotation-marker--add-only` | Subtle `+` icon (ghost/outline) | "Add annotation" |
| No annotations, `canAnnotate=false` | Not rendered | Nothing | — |
| Open clarification-request | `hbc-annotation-marker--red` | Filled red dot | "N open annotations" |
| Open flag-for-revision | `hbc-annotation-marker--amber` | Filled amber dot | "N open annotations" |
| Open comment only | `hbc-annotation-marker--blue` | Filled blue dot | "N open annotations" |
| All resolved | `hbc-annotation-marker--grey` | Grey checkmark dot | "All annotations resolved" |

### Complexity Tier Rendering (D-05)

| Tier | Marker Rendered | Count Badge | Behavior |
|---|---|---|---|
| Essential | No (returns `null`) | — | Zero DOM footprint |
| Standard | Yes | No | Dot + tooltip only |
| Expert | Yes | Yes (open count) | Dot + count badge + tooltip |

---

## CSS Architecture

Add to the HB Intel Design System CSS (or `packages/ui-kit/src/styles/components/`):

```css
/* Base marker — positioned inline-flex adjacent to form field */
.hbc-annotation-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  flex-shrink: 0;
  transition: opacity 0.15s ease;
}

.hbc-annotation-marker--red    { background-color: var(--hbc-color-red-500); }
.hbc-annotation-marker--amber  { background-color: var(--hbc-color-amber-500); }
.hbc-annotation-marker--blue   { background-color: var(--hbc-color-blue-500); }
.hbc-annotation-marker--grey   { background-color: var(--hbc-color-grey-400); }
.hbc-annotation-marker--add-only {
  background-color: transparent;
  border: 1.5px dashed var(--hbc-color-grey-300);
  opacity: 0; /* hidden until the field row is hovered */
}
.hbc-annotation-marker--add-only:focus,
.field-with-annotation:hover .hbc-annotation-marker--add-only {
  opacity: 1;
}

/* Expert mode count badge */
.hbc-annotation-marker__count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 14px;
  height: 14px;
  background: var(--hbc-color-grey-700);
  color: white;
  font-size: 9px;
  border-radius: 7px;
  padding: 0 3px;
  line-height: 14px;
  text-align: center;
}

/* Resolved checkmark */
.hbc-annotation-marker__resolved-icon {
  font-size: 8px;
  color: white;
  line-height: 1;
}
```

---

## Form Integration Pattern (D-09)

The host form wraps each annotatable field in a `field-with-annotation` container and renders `HbcAnnotationMarker` as a sibling — no HOC required:

```tsx
// In any host form that supports annotations
import { HbcAnnotationMarker } from '@hbc/field-annotations';

// Config is defined once per record type, outside the component
const scorecardAnnotationConfig: IFieldAnnotationConfig = {
  recordType: 'bd-scorecard',
  blocksBicOnOpenAnnotations: true,
  allowAssignment: true,
  requireResolutionNote: true,
};

// In the form render:
<div className="field-with-annotation">
  <TextInput
    id="totalBuildableArea"
    name="totalBuildableArea"
    label="Total Buildable Area (SF)"
    {...fieldProps}
  />
  <HbcAnnotationMarker
    recordType="bd-scorecard"
    recordId={scorecard.id}
    fieldKey="totalBuildableArea"
    fieldLabel="Total Buildable Area (SF)"
    config={scorecardAnnotationConfig}
    canAnnotate={currentUser.canAnnotateScorecards}
    canResolve={currentUser.isDirectorOfPreconstruction}
  />
</div>
```

---

## Verification Commands

```bash
# Type-check with zero errors
pnpm --filter @hbc/field-annotations check-types

# Build
pnpm --filter @hbc/field-annotations build

# Run marker tests (written in T08)
pnpm --filter @hbc/field-annotations test -- --grep "HbcAnnotationMarker"

# Run Storybook to visually verify all states (requires dev-harness)
pnpm --filter @hbc/dev-harness storybook
# Navigate to: Annotations / HbcAnnotationMarker
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T05 not yet started.
Next: SF07-T06 (HbcAnnotationThread and HbcAnnotationSummary)
-->
