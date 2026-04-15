# Validation Strategy

This file defines the minimum proof-of-closure posture expected across the Wave 02 prompts.

## 1. Baseline validation categories

Every prompt should prove closure across the categories that apply:

- typecheck / build validity
- targeted unit or component tests where behavior changed
- keyboard interaction checks
- visible-focus checks
- empty / loading / error state checks
- breakpoint / host-fit checks where layout or sticky behavior is involved
- regression checks for previously working author flows
- closure-report documentation

## 2. Keyboard checks

Where a prompt touches interactive controls, validate:

- Tab / Shift+Tab entry and exit behavior
- Arrow-key behavior when the pattern expects it
- Enter / Space behavior where applicable
- Escape behavior where overlays, prompts, or popups are involved
- focus restoration after close / cancel / clear flows
- no focus loss into hidden or inert UI

## 3. Accessibility checks

Where a prompt touches ARIA-backed widgets, validate:

- role/state/property correctness
- active-option or checked-state announcement
- visible focus indicator
- coherent disabled state semantics
- no duplicate or misleading accessible names
- no raw implementation tokens in author-facing help/copy where user-facing labels should appear

## 4. Breakpoint / host-fit checks

Where a prompt touches shell/layout/sticky behavior, validate at minimum:

- desktop full workspace layout
- compressed desktop / laptop widths
- the breakpoint where readiness rail collapses to the lower sticky panel
- the narrow stacked mobile-ish layout used by the current shell
- no clipping, unreachable controls, double-scroll traps, or sticky overlap that obscures primary actions

## 5. Closure-report discipline

Each prompt names a closure artifact. That artifact must record:

- what changed
- what was deliberately preserved
- what tests were added or updated
- what manual validation was performed
- any narrow boundary calls made during implementation

## 6. No-deferral rule

A prompt is not closed if the closure report still contains:

- “future pass” language for in-scope work
- untested behavioral changes in the affected seam
- known remaining keyboard or accessibility defects in the touched controls
- known UX friction that was discovered during the prompt and left unresolved even though it belonged to the prompt’s closure scope
