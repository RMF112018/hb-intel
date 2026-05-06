# 02 — Tab Rail Target Architecture

## Objective

Transform the PCC tab rail from a static, icon-heavy, low-contrast strip into a polished, text-only navigation band with clear active state, subtle motion, and strong accessibility semantics.

## Locked Taxonomy

Use the following labels in this exact order:

1. `Project Home`
2. `Team`
3. `Documents`
4. `Project Readiness`
5. `Approvals`
6. `External Platforms`
7. `Settings`
8. `Site Health`

Surface title for the external platform surface:

```text
External Platforms Launch Pad
```

## Remove Icons

Remove icons from the tab rail for now.

Rationale:

- Current icons create semantic ambiguity.
- Some icons imply actions or meanings that do not match the destination.
- Text-only navigation is preferable to misleading iconography.
- Icons can be reintroduced later only with a locked iconography contract.

## Active State Requirements

The active tab must have at least three non-icon signals:

1. Stronger foreground/text treatment.
2. Distinct selected background or container treatment.
3. Animated active indicator such as underline, bar, or inset rail.

Do not rely on orange text alone.

Recommended active state:

- active text uses a strong branded foreground or high-contrast neutral with branded accent;
- active background uses a subtle branded wash or elevated neutral surface;
- active indicator uses branded accent and animates between tabs;
- selected state remains obvious in grayscale / color-impaired conditions.

## Inactive State Requirements

Inactive tabs must be readable but subordinate:

- sufficient contrast against rail background;
- no excessive muted gray that feels disabled;
- hover state should signal clickability;
- spacing should be even and scan-friendly.

## Hover / Focus / Pressed States

Each tab must define:

- default
- hover
- active
- pressed
- focus-visible
- reduced-motion behavior

Focus-visible must be clearly visible and not hidden behind the active indicator.

## Motion Requirements

Required:

- active indicator transition: 160–220ms;
- background/text color transition: 120–180ms;
- hover transition: 120–160ms;
- reduced-motion support that disables transform/slide motion and uses immediate/fade state changes.

Do not implement flashy movement. Motion should feel premium, restrained, and operational.

## Layout Requirements

Desktop / laptop:

- tabs are horizontally aligned;
- no icons;
- clear spacing between labels;
- active indicator aligns with selected tab label/container;
- rail has its own background and bottom border/seam.

Tablet:

- tabs remain text-visible where possible;
- horizontal scrolling is acceptable if all tabs cannot fit;
- active tab must be scrolled into view if selected programmatically, if feasible without fragile implementation.

Phone:

- horizontal scroll is acceptable;
- labels remain visible;
- active state remains obvious;
- do not collapse to hamburger in this remediation unless explicitly approved.

## Accessibility Requirements

Preserve and complete:

- `role="tablist"`
- `role="tab"`
- `aria-selected`
- roving tab index
- ArrowLeft / ArrowRight
- Home / End
- Enter / Space activation

Add/complete:

- stable `aria-controls` on each tab;
- active panel with `role="tabpanel"`;
- panel `aria-labelledby` pointing to active tab;
- no icon-only accessible names because icons are removed;
- focus-visible evidence.

## Tests Required

Add/update tests asserting:

- all 8 labels render in canonical order;
- tab label `External Platforms` is used;
- old label `Apps` is not used in the tab rail;
- no icon wrapper renders inside the tab buttons;
- selected tab has structural active indicator;
- tablist density markers still work across modes;
- keyboard behavior remains green;
- `aria-controls` is supplied by shell;
- active panel has `role="tabpanel"` and correct accessible relationship;
- reduced-motion class/behavior is present if motion implementation requires it.

## Acceptance Criteria

- The tab rail reads as primary PCC section navigation.
- Selected tab is obvious and visually appealing.
- The rail no longer relies on ambiguous icons.
- Motion is present but restrained.
- Text contrast is materially improved.
- The rail is visually separated from hero and canvas.
