---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 09 — Responsive Host Fit and Evidence Matrix

## Purpose

Define what must be proven before the host shell can be considered flagship/premium ready.

## PCC 8-Mode Evidence Matrix

| Mode | Width Target | Required Evidence |
|---|---:|---|
| phone | 390–430px | hero compact, tabs usable, command preview not dominant |
| tabletPortrait | 768px | facts wrap/collapse intentionally |
| tabletLandscape | 1024px | tabs remain legible without icons |
| smallLaptop | 1180px | shell remains compact and useful |
| standardLaptop | 1440px | primary hosted laptop evidence |
| largeLaptop | 1599px | comfortable layout without over-stretch |
| desktop | 1600–1919px | shell/canvas rhythm remains controlled |
| ultrawide | 1920px+ | no uncontrolled line length or excessive whitespace |

## Host Conditions

Capture evidence for:

- SharePoint edit/draft mode;
- SharePoint published/view mode;
- browser zoom 125%;
- short-height browser;
- right-side SharePoint edit panel open, if applicable;
- all eight active surfaces at standard laptop;
- focus-visible state on tabs.

## Evidence File Structure

Recommended path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/host-shell-add-on/evidence/
```

Recommended files:

```text
INDEX.md
scorecard.md
hard-stop-checklist.md
screenshots/
  view-mode/
  edit-mode/
  focus/
  breakpoints/
```

## Minimum Screenshot Set

| Capture | Required |
|---|---|
| Project Home standard laptop | yes |
| Team standard laptop | yes |
| External Platforms standard laptop | yes |
| Missing/unavailable surface state | yes |
| Tabs focus-visible | yes |
| Phone shell | yes |
| Tablet portrait shell | yes |
| 125% zoom | yes |
| Short-height | yes |
| Edit mode | yes |
| View mode | yes |

## Acceptance Criteria

- Evidence index exists.
- Every screenshot has mode, date, branch/ref, and notes.
- Hard-stop checklist is complete.
- No final 56/56 claim without full evidence.
