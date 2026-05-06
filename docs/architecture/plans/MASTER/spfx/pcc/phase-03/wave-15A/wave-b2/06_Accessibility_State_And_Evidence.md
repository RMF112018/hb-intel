# 06 — Accessibility, State Model, and Evidence

## Objective

Define the accessibility, state-model, and evidence requirements required for doctrine-aligned closure of the remediated PCC shell.

## Tablist / Tabpanel Requirements

The shell must complete the tab relationship:

- `PccHorizontalTabs` receives a stable `panelId`.
- Each tab has `aria-controls={panelId}`.
- The active content panel has `role="tabpanel"`.
- The active content panel has `id={panelId}`.
- The active content panel has `aria-labelledby={activeTabId}`.
- The active panel marker remains unique.

Do not break existing bento direct-child invariants. If adding a tabpanel wrapper would break bento direct-child layout, the active panel semantics must be applied to an existing safe shell/canvas element rather than wrapping card children in a new grid-breaking element.

## Focus Order

Recommended focus order:

1. SharePoint host controls.
2. PCC disabled command affordance if focusable; otherwise skip.
3. PCC tab rail.
4. Active surface panel content.
5. Surface actions/cards.

Keyboard expectations:

- Tab enters the active tab.
- ArrowLeft/ArrowRight changes active tab within tablist.
- Home/End jump to first/last tab.
- Enter/Space activate target tab.
- Focus-visible state is obvious.

## Disabled Command Affordance Semantics

Two acceptable patterns:

### Pattern A — Non-focusable disabled button

Use when helper text is visible.

```tsx
<button type="button" disabled>Command Search — Preview</button>
<p>Project search and command actions are planned for a later phase.</p>
```

### Pattern B — Focusable aria-disabled button

Use when tooltip/helper appears on focus.

```tsx
<button type="button" aria-disabled="true">Command Search — Preview</button>
```

In Pattern B:

- click/keydown handlers must block execution;
- no input field is rendered;
- tooltip/help must be accessible by keyboard.

## State Requirements

Shell-level states to account for:

- default preview profile available;
- missing profile data;
- compact layout;
- disabled command affordance;
- tab active state;
- tab hover/focus/pressed state;
- reduced-motion preference.

Do not overbuild live data states in this shell remediation. The shell should remain preview-safe and read-only.

## Evidence Requirements

Create or update a Wave 15A evidence index containing:

- before/after screenshots;
- hosted SharePoint edit-mode capture;
- hosted SharePoint view-mode capture, if available;
- breakpoint captures;
- focus-visible capture;
- notes on disabled command affordance state;
- notes on tab rail label/icon removal;
- hard-stop checklist;
- score reassessment.

## Hard-Stop Checklist

The closeout must explicitly answer:

- Does the shell duplicate SharePoint chrome? Expected: no.
- Does the hero use inconsistent placeholder project identity? Expected: no.
- Does the hero show excluded facts? Expected: no.
- Does command search look operational? Expected: no.
- Are tab icons still present? Expected: no.
- Is `Apps` still visible in the tab rail? Expected: no.
- Is `External Platforms` visible in the tab rail? Expected: yes.
- Is the selected tab obvious without icons? Expected: yes.
- Is keyboard navigation preserved? Expected: yes.
- Is focus-visible treatment present? Expected: yes.
- Is tab-to-panel linkage present? Expected: yes or documented exception if a wrapper would break grid invariants.
- Is hosted evidence captured? Expected: yes, or explicitly operator-pending.
- Is a final 56/56 claim made? Expected: no unless independently scored and proven.

## Scoring Target

This remediation should target a meaningful score uplift, but it should not automatically claim 56/56.

Expected post-remediation target range:

```text
40–46 / 56 if implemented and evidence is credible.
48+ / 56 only if hosted proof, responsive proof, accessibility proof, and visual polish are all strong.
56 / 56 only after full surface-wide doctrine validation, not shell-only remediation.
```
