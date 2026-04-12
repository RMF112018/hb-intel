# HB Homepage Governance Package

## Purpose

This package establishes a formal governance system for all homepage webparts so the **HB Kudos public-facing webpart** becomes the benchmark for:

- implementation quality
- architectural discipline
- backend interaction quality
- state management rigor
- UX completeness and sophistication
- accessibility and host-runtime behavior
- validation depth and closure discipline

This package does **not** require other homepage webparts to copy the Kudos UI.
It requires them to match the **same level of quality and sophistication relative to their own purpose**.

## Primary decision

**HB Kudos Public is the canonical reference implementation for homepage-grade webparts.**

That means future homepage webpart work must be evaluated against the Kudos benchmark in these dimensions:

1. Surface sophistication
2. Shared primitive discipline
3. Data contract rigor
4. Backend read/write seam quality
5. State orchestration quality
6. Error/loading/empty-state completeness
7. Identity/media handling quality
8. Accessibility and keyboard behavior
9. SharePoint host-runtime resilience
10. Validation, testing, and closure evidence

## Package contents

- `00-Plan-Summary.md`
- `01-Homepage-Webpart-Conformance-Standard.md`
- `02-Kudos-Public-Benchmark-Reference.md`
- `03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `04-Conformance-Scoring-Matrix.md`
- `05-Code-Agent-Governance-Prompt-Template.md`
- `06-Closure-Checklist.md`

## How to use this package

1. Lock this package as the governing standard for homepage work.
2. Before any update to a homepage webpart, require a repo-truth benchmark audit against the Kudos public webpart.
3. Require the implementation plan and prompts to explicitly close benchmark gaps.
4. Require proof artifacts and closure gates before the work is accepted.

## Non-negotiable rule

No homepage webpart may be considered complete merely because it renders, looks improved, or satisfies a narrow bug request.
It must demonstrate homepage-grade quality across architecture, UX, runtime behavior, and validation.

## Intended audience

- you
- local code agent workflows
- future audit sessions
- PR review and acceptance processes
