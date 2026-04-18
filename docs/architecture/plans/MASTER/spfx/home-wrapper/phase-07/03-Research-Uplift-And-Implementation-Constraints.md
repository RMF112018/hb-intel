# 03 — Research Uplift and Implementation Constraints

This file turns external research into concrete implementation constraints.

## 1. SharePoint modern page layout constraints

### Constraint A — Full-width behavior is explicit, not automatic
SharePoint supports a full-width column only on communication-site modern pages, and SPFx webparts must explicitly support that host/layout.  
Implication: once the rail is embedded inside `HbHomepage`, its visible width and spacing should be validated inside the homepage wrapper rather than assumed to match the old page-canvas section placement.

### Constraint B — Sections and columns remain page-canvas reality
Modern SharePoint pages are still organized through sections/columns, and authors can add/move/remove web parts on the page canvas.  
Implication: code-level wrapper embedding does **not** automatically guarantee the actual homepage page-canvas cutover is complete.

### Constraint C — Narrow-window behavior can reorder page-side constructs
SharePoint’s section system can move certain section types when width becomes constrained.  
Implication: the final proof bar cannot be only static desktop inspection.

## 2. Container-aware responsive behavior is the right technical posture

### Constraint D — Container-based responsiveness is the correct fit for embedded components
Container queries are expressly meant for components that must adapt to the size of their containing parent, not merely the viewport.  
Implication: embedding the rail inside the homepage wrapper is technically sound, but the wrapper must provide a stable containing region and proof of comfort across widths.

### Constraint E — Element-size observation is a valid implementation seam
ResizeObserver exists specifically so a component can react to changes in the size of the element containing it.  
Implication: the existing rail’s container-aware logic is a strength to preserve, not bypass.

## 3. Architecture implication for this repo

The external research aligns with the repo’s existing direction:

- SharePoint page canvas remains real, so cutover must be real.
- The embedded rail should respond to its wrapper container, not just the viewport.
- The shell should not be burdened with a command-band concern just because the command band now lives inside the homepage runtime.
- The final implementation must prove both:
  - runtime composition correctness, and
  - page-canvas correctness.

## 4. Concrete rules for the local code agent

### Rule 1 — Do not equate “embedded in JSX” with “homepage cutover complete”
The flagship page must be proved.

### Rule 2 — Keep the rail’s product seam intact
Do not duplicate or re-home rail list/admin logic into shell code.

### Rule 3 — Give the wrapper its own responsive seam
Do not simply drop `<PriorityActionsRail />` above the shell without a real wrapper region, CSS, and diagnostic attributes.

### Rule 4 — Validate width comfort
Because the homepage shell already enforces `max-width` and container-aware spacing, the embedded rail region should be intentionally aligned with that envelope and visually proven at:
- standard-laptop widths
- tablet portrait / tablet landscape
- phone-portrait
- short-height / phone-landscape style states where feasible

### Rule 5 — Reconcile doctrine after implementation
Any repo statement still saying “production mounts hero, actions, and shell as separate webparts on the flagship homepage” must be updated or narrowed so it is not misleading after the change.

## 5. External references the agent should keep in mind

- Microsoft Learn — full-width column support for SPFx web parts
- Microsoft Support — SharePoint modern page sections/columns and modern web parts
- MDN — container queries
- W3C — ResizeObserver
- web.dev — container-query responsive components
