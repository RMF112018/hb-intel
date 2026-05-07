# Automation Boundaries and Human Audit Model

## Fully or Mostly Automatable

- Screenshot capture.
- Console/page error capture.
- SharePoint host boundary screenshots.
- Navigation to all surfaces.
- Breakpoint screenshots.
- Horizontal overflow/clipping checks.
- Bento/card data marker checks.
- Keyboard tab sequences.
- Focus-visible screenshot capture.
- ARIA relationship checks.
- Disabled-control reason linkage.
- No-live-http anchors inside PCC grid.
- Source/demo/read-only/deferred/state label existence.

## Partially Automatable

- Contrast and color independence.
- Touch target quality.
- Reduced-motion risk.
- Hover-only risk.
- Drawer/modal focus, if safe trigger exists.
- Package/version proof, unless PCC exposes a DOM marker.
- Edit mode, unless safe edit URL/permission exists.
- Unauthorized state, unless alternate test user/storageState exists.

## Expert Review Required

- Mold Breaker differentiation.
- Cognitive-load reduction.
- Construction-specific operational clarity.
- Whether Project Home feels like an operating layer rather than an index.
- Whether cross-surface continuity feels like one product.
- Visual polish and hierarchy scoring.
- Final subcategory point assignment.

## Required Report Behavior

The generated report must separate:

- automated pass/fail evidence;
- generated artifacts;
- expert-review-required findings;
- blocked or operator-pending evidence.
