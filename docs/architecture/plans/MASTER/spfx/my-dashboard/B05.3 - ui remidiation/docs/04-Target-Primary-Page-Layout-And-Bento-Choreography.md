# 04 — Target Primary-Page Layout and Bento Choreography

## Purpose

This file defines the exact target page composition, card order, span overrides, and responsive behavior. It closes all layout discretion for the implementation phase.

---

# 1. Existing Grid System to Preserve

The current grid primitives are sufficient and should be retained where practical:

- `MyWorkBentoGrid`
- `MyWorkCard`
- `myWorkFootprints.ts`
- responsive mode definitions already used by the app.

The implementation should **recompose**, not replace, this grid system.

---

# 2. Card Order

The render order is locked:

1. `My Projects`
2. `Adobe Sign Action Queue`

No runtime urgency-based reordering.

---

# 3. Exact Span Targets

## 3.1 My Projects card

| Responsive mode | Target span |
|---|---:|
| phone | full mode width |
| tabletPortrait | full mode width |
| tabletLandscape | full mode width |
| smallLaptop | full mode width |
| standardLaptop | 6 |
| largeLaptop | 7 |
| desktop | 7 |
| ultrawide | 7 |

## 3.2 Adobe Sign card

| Responsive mode | Target span |
|---|---:|
| phone | full mode width |
| tabletPortrait | full mode width |
| tabletLandscape | full mode width |
| smallLaptop | full mode width |
| standardLaptop | 4 |
| largeLaptop | 5 |
| desktop | 5 |
| ultrawide | 5 |

---

# 4. Implementation Interpretation of "Full Mode Width"

Use the actual responsive column count already governed by the existing grid:

| Mode | Grid columns |
|---|---:|
| phone | 1 |
| tabletPortrait | 2 |
| tabletLandscape | 6 |
| smallLaptop | 8 |

The card should span all available columns in those modes.

---

# 5. Required Layout Behavior by State

The spans above do **not** change when a card is:

- loading;
- empty;
- unavailable;
- authorization required;
- populated.

The card's **internal body** compresses or expands by state. The overall page choreography remains stable.

---

# 6. No Full-Width Desktop Exception

Do not expand My Projects to 12 columns on desktop for any state in this phase.

If many projects are present:
- use the card's disclosure behavior;
- do not break the locked page composition by turning My Projects into a full-row card.

---

# 7. Card Height Rhythm

The two first-row cards should feel visually related, but exact equal-height forcing is not required. The implementation target is:

- coherent top alignment;
- healthy spacing;
- no awkward underutilized blank bands;
- no giant card body caused by empty-state scaffolding.

---

# 8. Header-to-Grid Spacing

The compact production header should transition into the grid with restrained spacing. Avoid the large command-surface band feeling of the current implementation.

Recommended posture:
- the header's bottom edge should sit materially closer to the first card row than the current hero band;
- the page should allow the module cards to appear prominently in the first viewport under normal SharePoint chrome.

---

# 9. No Placeholder Third Row

Do not create empty or faux-card scaffolding below the first module row merely to make the page look populated.

Future modules are an extensibility concern, not a current-page filler requirement.
