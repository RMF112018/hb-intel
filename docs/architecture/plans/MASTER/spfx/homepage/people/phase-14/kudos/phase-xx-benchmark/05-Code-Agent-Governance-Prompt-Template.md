# 05 — Code Agent Governance Prompt Template

Use the following template whenever you initiate major updates to a homepage webpart.

---

## Prompt Template

Conduct a **comprehensive, exhaustive, repo-truth audit** of the target homepage webpart in the live repo and compare it directly against the **HB Kudos public-facing webpart** as the benchmark reference for homepage-grade quality.

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

### Required benchmark rule

Treat the HB Kudos public-facing webpart as the **canonical homepage reference implementation**.
Evaluate the target webpart against that benchmark relative to its own intended purpose.

### Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

### Mandatory audit scope

At minimum:

1. identify the target webpart’s actual runtime architecture
2. identify all relevant shared UI-kit and homepage seams
3. identify all read/write seams and host/runtime dependencies
4. compare the target webpart against the Kudos benchmark in each conformance category
5. produce a categorized gap register
6. produce an implementation plan that closes the gaps
7. produce validation requirements and closure criteria

### Mandatory conformance categories

Score and analyze the target webpart against these categories:

1. purpose-fit sophistication
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

1. Audit Summary
2. Gap Register
3. Decision Lock
4. Implementation Prompt Package
5. Validation Prompt
6. Closure Checklist
7. Conformance Scorecard

### Prohibited behavior

- do not stop at visual recommendations
- do not produce soft or vague prompts
- do not ignore backend/data/runtime weaknesses
- do not assume the target webpart can close because it looks improved
- do not leave dead interactions, incomplete states, or weak seams unaddressed

### Closure rule

The target homepage webpart may not be considered complete until it reaches homepage-grade quality relative to its own purpose and demonstrates explicit closure evidence.

---

## Recommended usage note

This template should be adapted with:
- the target webpart path(s)
- relevant shared paths
- hosted runtime notes
- any special backend or SharePoint constraints
