# Evidence and Repo-Truth Findings

## Evidence Inputs

Relevant evidence run:

```text
docs/architecture/evidence/pcc-live/20260507-134047/
```

### Surface Screenshot Evidence

Path:

```text
docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/pcc-live-screenshot-evidence.md
```

Confirmed:

```text
Surface count: 8
Surfaces with screenshots: 8
Screenshot count: 24
DOM card summary count: 117
Warning count: 0
```

### Breakpoint Evidence

Path:

```text
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-evidence.md
```

Confirmed:

```text
Surface/viewport pairs: 64
Screenshot count: 64
Card measurement count: 936
Touch target measurement count: 0
Warning count: 144
Mode mismatch count: 0
Horizontal overflow count: 0
Clipped card count: 89
Direct-child issue count: 32
Touch target issue count: 0
```

### Why Direct-Child Is the Highest ROI Defect

The direct-child count is deterministic and maps directly to Team & Access:

```text
Team & Access cards: 4
Viewports: 8
4 × 8 = 32 direct-child failures
```

This is stronger and cleaner than chasing the entire clipped-card count because the breakpoint capture currently flags intentional card `overflow: hidden` as overflow risk.

## Relevant Repo-Truth

### Correct Pattern

`PccTeamAccessLaneShell.tsx` returns a `Fragment` of `PccDashboardCard` children. This is the correct pattern because `PccShell` renders active route content inside `PccBentoGrid`.

### Existing Test Coverage

`PccTeamAccessSurface.layout.test.tsx` already validates the default fixture path:

```tsx
<PccBentoGrid forceMode="desktop">
  <PccTeamAccessSurface previewPersona="project-manager" previewHasProjectSiteAccess={true} />
</PccBentoGrid>
```

The default path direct-child invariant is therefore already protected.

### Defective Path

`PccTeamAccessReadModelContent.tsx` wraps read-model preview content:

```tsx
<div data-pcc-team-access-read-model-content="preview">
  <PccTeamAccessLaneShell ... />
</div>
```

That wrapper makes every Team & Access card a grandchild of `PccBentoGrid`.

The loading and error paths also return wrapper divs containing `PccPreviewState`, which are not valid bento card children.

## Expected Code-Level Fix

Refactor `PccTeamAccessReadModelContent.tsx` so:

- preview returns `PccTeamAccessLaneShell` directly
- loading returns a direct `PccDashboardCard`
- error returns a direct `PccDashboardCard`
- exactly one Team & Access active panel marker exists in every state
- no read-model state inserts a non-card wrapper as a direct child of `PccBentoGrid`

## Risk Notes

### Clipped Card Count

The current breakpoint capture logic marks cards as overflow risk if:

```ts
style.overflowX === 'hidden'
style.overflowY === 'hidden'
```

`PccDashboardCard.module.css` intentionally sets:

```css
.card {
  overflow: hidden;
}
```

Therefore, some of the 89 clipped/overflow findings are likely evidence-rule inflation. Do not modify that evidence logic in this prompt.

### Project Readiness Density

Project Readiness has 62 DOM card summaries. That is a larger design-level remediation target, but it is not the highest ROI first step because it requires product/design decisions. Team & Access direct-child remediation is smaller, deterministic, and directly tied to a full class of evidence failures.
