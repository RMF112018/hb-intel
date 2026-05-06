# 05 — Breakpoint and Responsive Behavior

## Objective

Define how the remediated PCC hero and tab rail behave across the existing 8-mode PCC breakpoint policy.

## Existing Breakpoint Modes

Preserve the current PCC modes:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

Do not alter the threshold policy unless implementation evidence proves the current thresholds are defective.

## Content Priority

| Priority | Content | Behavior |
|---:|---|---|
| 1 | Project Control Center title | Always visible |
| 2 | Active surface name | Always visible |
| 3 | Surface description | Visible desktop/tablet; clamp/truncate compact |
| 4 | Location | Visible desktop/tablet; collapse if needed on phone |
| 5 | Estimated Value | Visible desktop/tablet; collapse if needed on phone |
| 6 | Scheduled Completion | Visible desktop/tablet; collapse if needed on phone |
| 7 | Project Stage | Visible as chip; compact chip on phone |
| 8 | Disabled command affordance | Visible desktop/laptop; compact or disclose on tablet/phone |

## Desktop / Ultrawide

Expected layout:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ PROJECT CONTROL CENTER                                                     │
│ Project Control Center   |   Project Home                                  │
│ Priority actions, project facts, and daily project signals.                │
│                                                                            │
│ [Location] [Estimated Value] [Scheduled Completion] [Project Stage] [Cmd]   │
└────────────────────────────────────────────────────────────────────────────┘
┌ Project Home │ Team │ Documents │ Project Readiness │ ... ┐
```

Rules:

- Hero can use two-column composition only if it remains balanced.
- Fact strip should sit below identity or to the right only if spacing is strong.
- Disabled command affordance may sit at right edge or end of fact row.
- Tab rail must remain visually separate.

## Standard / Large Laptop

Rules:

- Hero identity remains on first row.
- Facts may wrap to second row.
- Command affordance may align right or become compact chip.
- Surface description may clamp to one line.

## Small Laptop

Rules:

- Do not force all facts into one row.
- Use two-row hero if needed.
- Disable command affordance can move below facts or become compact chip.
- Tab rail may horizontally scroll only if needed.

## Tablet Landscape

Rules:

- Hero stacks into identity row + facts row + utility row if needed.
- Surface description clamps to one line or hides after label.
- Facts render in 2x2 grid or compact wrap.
- Tab rail may scroll horizontally; all labels remain text-visible.

## Tablet Portrait

Rules:

- Hero stacks vertically.
- Surface description may be hidden after active surface label.
- Facts render as compact 2x2 grid.
- Command affordance becomes compact disabled chip.
- Tabs scroll horizontally.

## Phone

Rules:

- Hero must not consume excessive vertical space.
- Always visible:
  - `Project Control Center`
  - active surface name
  - project stage chip
- Facts may collapse behind `Project Details` disclosure.
- Location may remain visible if space permits.
- Estimated value and scheduled completion may hide behind disclosure.
- Command affordance may hide or render as compact `Search Preview` chip only if it does not crowd identity.
- Tabs scroll horizontally and preserve text labels.

## Short-Height / Constrained Browser Conditions

Rules:

- Hero should compress vertical padding before hiding mandatory identity.
- Hero should not create double-scroll with SharePoint page chrome.
- Tab rail must remain reachable.
- Primary content should not be pushed completely below the fold by the shell.

## Tests Required

- Existing 8-mode shell tests remain green.
- Add assertions for hero density markers by mode.
- Add assertions for facts visible/collapsed by mode if the implementation uses mode-specific markup.
- Add tests that tab labels remain rendered at phone mode.
- Add tests that no horizontal overflow-critical wrapper is introduced around the bento grid.

## Evidence Required

Capture hosted screenshots for at least:

- desktop / standard laptop view mode;
- desktop / standard laptop edit mode;
- tablet landscape or equivalent constrained width;
- tablet portrait or equivalent constrained width;
- phone or narrow browser width;
- 125% zoom or constrained browser condition;
- short-height condition if practical.
