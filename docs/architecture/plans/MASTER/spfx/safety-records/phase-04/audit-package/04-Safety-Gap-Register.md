# Safety Gap Register

## G-01 — Dominant visual posture is still generic enterprise workflow
- **Type:** Structural blocker
- **Where it shows:** Upload, Periods, Review, Inspections
- **Symptoms:** masthead + card/table + filter bar composition repeats across the product
- **Why it matters:** doctrine prohibits generic enterprise-card outcomes as the dominant posture
- **Required outcome:** authored Safety surface family with stronger hierarchy, command posture, and domain-specific product identity

## G-02 — Breakpoint behavior is under-authored
- **Type:** Structural blocker
- **Where it shows:** global layout contract, compact states, nested hosted behavior
- **Symptoms:** viewport-breakpoint CSS exists, but compact behavior is mostly reflow rather than real mode change
- **Why it matters:** doctrine requires explicit shell/app breakpoint behavior and narrowest stable nested mode
- **Required outcome:** formal Safety breakpoint contract with wide / medium / compact / minimal behaviors

## G-03 — Upload page is functional but not flagship
- **Type:** Structural blocker
- **Where it shows:** `UploadPage`
- **Symptoms:** hidden raw file input, flat intake card, weak readiness model, weak post-submit action model
- **Why it matters:** the first operational experience defines credibility
- **Required outcome:** productized intake surface with clearer readiness, progress, outcome, and next-action patterns

## G-04 — Dashboard is too table-administrative
- **Type:** Major UX gap
- **Where it shows:** `ReportingPeriodDashboardPage`
- **Symptoms:** KPI cards + period filter + table, limited authored risk framing
- **Why it matters:** the reporting-period surface should feel like a safety command summary, not a reporting list
- **Required outcome:** stronger summary rail, risk emphasis, cleaner drill-in logic, better empty/blocked storytelling

## G-05 — Review queue lacks enough operational depth
- **Type:** Major UX gap
- **Where it shows:** `ReviewQueuePage`
- **Symptoms:** clean table and actions, but little triage framing or progressive disclosure
- **Why it matters:** this is a high-consequence governance surface
- **Required outcome:** clearer risk grouping, cause visibility, and replay/supersede confidence

## G-06 — Inspection and project-week detail pages are strongest, but still too thin
- **Type:** Significant refinement gap
- **Where it shows:** `InspectionDetailPage`, `ProjectWeekDetailPage`
- **Symptoms:** good stat/finding/provenance base, but panels are still simple card blocks
- **Why it matters:** flagship detail surfaces should build trust and speed decisions
- **Required outcome:** richer evidence, provenance, source, and section-disclosure treatment

## G-07 — State honesty is stronger than state craftsmanship
- **Type:** Significant refinement gap
- **Where it shows:** blocked upload, partial failure banners, empty states
- **Symptoms:** states are handled, but not sufficiently authored
- **Why it matters:** premium UX depends on credible blocked / loading / degraded / success states
- **Required outcome:** stronger state presentation language and next-action guidance

## G-08 — Identity / authority / provenance treatment is too weak
- **Type:** Medium gap
- **Where it shows:** inspection provenance, uploader/inspector context, source workbook references
- **Symptoms:** trust context exists mostly as small text lines or links
- **Why it matters:** safety records need visible authority and evidence
- **Required outcome:** stronger provenance and authority framing

## G-09 — Accessibility closure is incomplete
- **Type:** Medium gap
- **Where it shows:** upload input strategy, banner action affordances, compact touch behavior
- **Symptoms:** mostly decent, but still a few tactical exceptions and insufficient proof
- **Why it matters:** hard-stop category if left ambiguous
- **Required outcome:** fully governed affordances and explicit keyboard/touch validation

## G-10 — Hosted and packaged proof is incomplete
- **Type:** Hard-stop closure gap
- **Where it shows:** acceptance workflow
- **Symptoms:** source and screenshot are available; package config is available; actual binary package and broad hosted matrix proof were not inspectable here
- **Why it matters:** doctrine requires packaged/hosted truth
- **Required outcome:** evidence-backed hosted/package validation across the required matrix
