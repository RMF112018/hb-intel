# 02 — Root-Cause Investigation

## Category A — Source-level intent vs source-level reality

### What source intends

`defaultPreset.ts` clearly intends a three-row paired homepage composition with the six approved applications, in the exact row order stated in the prompt.

### What source actually allows

The lower seams do not match that intent:

- `tablet-landscape` is still single-column by authored breakpoint policy
- `feature-pair` and `asymmetric-two-up` still exclude `tablet-landscape`
- paired-width math blocks Row 1/2 for most standard-laptop widths and blocks Row 3 for all standard-laptop widths
- CSS still refuses to render paired grids below `1180px`

### Assessment

The preset is not the blocker. The blockers are the downstream runtime-policy, fit-contract, and CSS-activation seams.

---

## Category B — Breakpoint and device-class logic

### What the code does

`breakpointPolicy.ts` defines:

- `standard-laptop`: `1180–1599`, paired first lane allowed
- `tablet-landscape`: `980–1179`, first lane pairing denied

### Why that contradicts the target

The prompt's locked target explicitly requires row pairing on `tablet-landscape`. The current breakpoint seam still encodes the opposite.

### Assessment

This is a direct source-level contradiction, not a measurement mistake.

---

## Category C — Band recipe and row eligibility logic

### What the code does

`bandRecipes.ts` defines:

- `feature-pair` eligible only in `ultrawide-desktop` and `standard-laptop`
- `asymmetric-two-up` eligible only in `ultrawide-desktop` and `standard-laptop`

### Impact on the three rows

- Row 1 uses `feature-pair` → not eligible in `tablet-landscape`
- Row 2 uses `feature-pair` → not eligible in `tablet-landscape`
- Row 3 uses `asymmetric-two-up` → not eligible in `tablet-landscape`

### Assessment

Even if `breakpointPolicy.ts` were relaxed, the rows would still stack in `tablet-landscape` because recipe eligibility still denies them.

---

## Category D — Width measurement and shell-fit logic

### What the code does

`useShellContainer.ts` measures usable shell width as:

`authoritative outer envelope width - shell inline inset total`

`slotComfortResolver.ts` then computes paired slot widths using a stable `2/3` major column and `1/3` minor column.

### Resulting fit thresholds

Because the minor slot gets only one-third of usable shell width, the shell-fit contracts in `occupantRegistry.ts` imply:

- Row 1 minor occupant (`hb-kudos`) needs `520px` paired width → row needs about `1560px`
- Row 2 minor occupant (`safety-field-excellence`) needs `520px` paired width → row needs about `1560px`
- Row 3 minor occupant (`people-culture-public`) needs `720px` paired width → row needs about `2160px`

### Assessment

This is the seam that makes the current target impractical even when the entry state is `standard-laptop`.

---

## Category E — CSS activation and layout rendering

### What the code does

`HbHomepageShell.module.css` keeps paired bands visually collapsed to one column until the container reaches `1180px`.

### Why that matters

`tablet-landscape` tops out at `1179px`. So even if runtime policy were changed to permit pairing, CSS would still render one column unless the activation threshold were lowered.

### Assessment

This is a separate visual blocker from the breakpoint and recipe blockers.

---

## Category F — Deployment / hosted-runtime proof

### What repo truth shows

The current repo includes:

- aligned homepage package versioning
- a homepage package verification runbook
- explicit DOM markers to prove wrapper/shell presence and full-width hosting

### What is not proven from repo truth alone

Repo source cannot prove whether the currently hosted SharePoint page:

- is using the latest `.sppkg`
- is authored in full-width mode
- is exposing a usable shell width high enough to enter the paired branch

### Assessment

Deployment mismatch remains a plausible **secondary** cause only for the special case where an ultrawide hosted page still stacks all rows. It is not required to explain the general defect, because the source tree already blocks the target behavior.
