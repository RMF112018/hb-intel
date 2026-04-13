# 05 — Code Agent Governance Prompt Template

Use the following template whenever you initiate major updates to a homepage webpart.

---

## Prompt Template

Conduct a **comprehensive, exhaustive, repo-truth audit** of the target homepage webpart in the live repo and compare it directly against the **HB Kudos public-facing webpart** as the benchmark reference for homepage-grade quality.

### Governing authority

Treat the following files as the governing authority for all homepage webpart work in `apps/hb-webparts`:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Read and apply those doctrine files first.
They govern import discipline, page-canvas ownership, host-aware behavior, surface posture, premium stack expectations, manifest intent, and homepage-specific constraints.

### Primary objective

Your objective is to identify and close all material gaps between the target homepage webpart and the benchmark standard established by the HB Kudos public-facing webpart.

This does **not** mean copying the Kudos UI.
It means matching the same level of:

- implementation detail
- code quality
- shared primitive discipline
- data/contract rigor
- backend interaction quality
- state orchestration maturity
- UX completeness
- accessibility credibility
- SharePoint host-runtime resilience
- validation and closure discipline

while also preserving the target webpart’s own **persona** and content-fit identity.

### Required benchmark rule

Treat the HB Kudos public-facing webpart as the **canonical homepage reference implementation**.
Evaluate the target webpart against that benchmark relative to its own intended purpose.

### Mandatory anti-homogenization rule

**Do not turn the target homepage webpart into a renamed or lightly restyled version of HB Kudos.**

You must explicitly determine:
- what persona the target webpart should express
- how that persona should differ from Kudos and other homepage webparts
- how to preserve branding and design symmetry without producing visual sameness

Examples:
- Kudos = engaging, warm, fun, celebratory
- Project Spotlight = professional, informative, confidence-building
- Company Pulse = editorial, timely, scan-friendly
- Tool Launcher / Work Hub = utility-first, operational, efficient

Use those only as directional examples.
Infer the target persona from the target webpart’s mission and content.

### Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

### Mandatory audit scope

At minimum:

1. identify the target webpart’s actual runtime architecture
2. identify all relevant shared UI-kit and homepage seams
3. identify all read/write seams and host/runtime dependencies
4. review and summarize the two doctrine files as they apply to the target
5. define the target webpart’s intended persona and content posture
6. compare the target webpart against the Kudos benchmark in each conformance category
7. produce a categorized gap register
8. produce an implementation plan that closes the gaps
9. produce validation requirements and closure criteria

### Mandatory conformance categories

Score and analyze the target webpart against these categories:

1. purpose-fit sophistication and persona expression
2. interaction completeness
3. shared primitive discipline
4. contract / data rigor
5. backend seam quality
6. state orchestration
7. UX completeness
8. identity / media / attribution quality where applicable
9. accessibility / host behavior
10. validation / closure proof

### Required output

Produce the following:

1. Doctrine Summary
2. Audit Summary
3. Gap Register
4. Decision Lock
5. Implementation Prompt Package
6. Validation Prompt
7. Closure Checklist
8. Conformance Scorecard

### Mandatory decision-lock content

Your decision lock must explicitly state:

- the governing doctrine files
- the target webpart’s intended persona
- the aspects of the Kudos benchmark that should be translated
- the aspects that should **not** be copied directly
- the shared primitives and seams that should remain common
- the visible/personality differences that should remain unique

### Prohibited behavior

- do not stop at visual recommendations
- do not produce soft or vague prompts
- do not ignore backend/data/runtime weaknesses
- do not assume the target webpart can close because it looks improved
- do not leave dead interactions, incomplete states, or weak seams unaddressed
- do not interpret “benchmark” as permission to clone the Kudos public layout, tone, or interaction model where they are not purpose-fit
- do not produce identical homepage webparts with different names

### Closure rule

The target homepage webpart may not be considered complete until it:

- complies with the two doctrine files
- reaches homepage-grade quality relative to its own purpose
- demonstrates explicit closure evidence
- preserves its own persona while maintaining HB brand/design symmetry

---

## Recommended usage note

This template should be adapted with:
- the target webpart path(s)
- relevant shared paths
- hosted runtime notes
- any special backend or SharePoint constraints
- the target content persona if already known
