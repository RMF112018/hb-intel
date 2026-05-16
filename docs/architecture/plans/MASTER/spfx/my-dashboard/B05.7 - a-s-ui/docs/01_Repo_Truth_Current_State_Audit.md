# 01 — Repo-Truth Current-State Audit

## Verified Baseline

- Repo: `RMF112018/hb-intel`
- Branch baseline inspected: `main`
- Baseline implementation commit:
  - `7ae348ed5ee912e72a7ec1d703ad53bdc18bd090`
  - `adobe-sign: add completed view header toggle to action queue card`
- Commit compare at audit time showed this commit was identical to `main`.

## Files Inspected During Audit

### Core Adobe Sign module

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx
```

### Shared card/shell composition

```text
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/layout/myWorkFootprints.ts
apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
apps/my-dashboard/src/shell/MyWorkShell.tsx
```

### View-model and runtime seams

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
```

### Package posture

```text
apps/my-dashboard/package.json
packages/ui-kit/package.json
```

## Key Repo-Truth Findings

### 1. Current card view switching is real and functional

`AdobeSignActionQueueCard.tsx` maintains:

- `activeView: 'action-queue' | 'completed'`;
- view-switch buttons;
- completed-panel conditional rendering;
- lazy completed-panel hook activation.

This is sound and must be preserved conceptually.

### 2. Completed loading is lazy and cache-aware

`useAdobeSignRecentCompletionsReadModel.ts`:

- remains idle while the Completed view is not selected;
- fetches once on first enable;
- does not re-fetch after toggling away and back;
- exposes deterministic `idle/loading/ready/error` states.

This is a strong seam and must remain.

### 3. State coverage is already broad

The completed panel handles:

- idle
- loading
- available-empty
- available-items
- partial
- source-unavailable
- backend-unavailable
- authorization-required
- configuration-required
- principal-unresolved

The implementation work is primarily **presentation quality**, not state inventory creation.

### 4. `MyWorkCard.titleContent` exists only to support the Adobe view switch

Repo search found `titleContent` in:

- `MyWorkCard.tsx`
- `AdobeSignActionQueueCard.tsx`
- `MyWorkCard.test.tsx`

No other runtime card consumes it. This implementation package therefore **removes** `titleContent` and rebuilds the Adobe view switch outside the heading.

### 5. Adobe-specific view-toggle CSS is currently in the generic MyWork card CSS module

Current Adobe-specific classes live in:

```text
apps/my-dashboard/src/layout/MyWorkCard.module.css
```

This is a boundary violation for a module-specific flagship redesign. The styles must move into a dedicated:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
```

### 6. Status badge labels are computed but not rendered visibly

The card computes `badgeLabel` and emits it as data:

```text
data-adobe-sign-action-queue-badge
```

but does not render an actual status chip in the UI.

This remediation makes status visible.

### 7. Shared `.row` styles are structurally wrong for Adobe agreement rows

Generic My Work CSS defines:

- flex key/value row;
- uppercase muted row labels;
- nowrap ellipsis row values.

The Adobe card uses those classes for:

- agreement titles;
- completed agreement titles;
- sender/date metadata;
- links.

That produces the raw compressed list posture seen in the current screenshot.

This package replaces that approach with dedicated Adobe activity row primitives.

### 8. Current completed fallback copy makes the UI look broken

When no date exists, the current card displays:

```text
Updated date unavailable
```

repeated across rows.

This remediation removes that presentation rule and replaces it with graceful metadata behavior:

- render date when known;
- render sender only when date absent and sender present;
- render subdued `Completion metadata not reported.` only when both date and sender are absent.

### 9. Preview-limit semantics are not visible

The data/view-model layer already knows:

- total count;
- preview item count;
- hasMore.

The current UI does not tell the user why the metric count may exceed the visible list length.

This package adds preview-context copy.

### 10. Card stretch is a visible host-composition issue

The screenshots show the Adobe card stretching to the height of the My Projects card. Repo truth points to the grid/card layout posture as the likely cause:

- CSS grid auto rows;
- sibling row-sharing;
- no explicit top-align posture;
- card body `min-height: 100%`.

The implementation must make the Adobe card **top-aligned and content-authored**, not height-equalized by accident.

### 11. Shell-level responsiveness exists; card-level responsiveness is insufficient

The shell has:

- explicit responsive modes;
- explicit column counts;
- deliberate card span overrides.

But the Adobe card interior does not sufficiently recompose across:

- desktop;
- laptop;
- tablet;
- phone;
- short-height states.

Prompt 06 closes this gap.

### 12. Premium-stack dependencies are present in `@hbc/ui-kit`, not direct My Dashboard package dependencies

`apps/my-dashboard/package.json` does not directly declare the premium stack.  
`packages/ui-kit/package.json` does include:

- motion
- lucide-react
- Floating UI
- Radix separator/tooltip/slot/scroll-area
- class-variance-authority
- clsx

This implementation package does **not** add new direct third-party dependencies or lockfile drift. The code agent may use only:

- existing My Dashboard dependencies;
- existing `@hbc/ui-kit` exports where repo truth confirms appropriate exports;
- native semantic HTML/CSS where no governed export is already available.

## Audit Implication

The implementation is not a rewrite of the read-model system. It is a focused flagship UI/UX remediation with light hook enhancement for card-owned retry only.
