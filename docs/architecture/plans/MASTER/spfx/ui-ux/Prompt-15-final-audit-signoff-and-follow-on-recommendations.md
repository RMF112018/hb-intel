# Prompt 15 — Final Audit Signoff And Follow On Recommendations

## Objective

Run a final audit across code, docs, and package evidence to determine whether the SPFx shared UI/UX conformance program is ready for signoff and what follow-on work, if any, remains.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `00-Implementation-Summary.md`
- `01-Findings-Summary.md`
- `docs/reference/ui-kit/`
- `docs/architecture/reviews/`
- `docs/architecture/plans/MASTER/spfx/accounting/`
- `dist/sppkg/`

## Instructions

1. Re-audit the implemented result against the original objective and the workstreams in this package.
2. Confirm whether the effort achieved:
   - shared SPFx shell
   - shared SPFx layout family
   - shared interactive component family
   - conformance cleanup across the target app suite
   - source-package updates feeding the target `.sppkg` artifacts
   - future-facing doctrine in `docs/reference/ui-kit/`
3. Identify any partial closures, technical debt left intentionally in place, or deferred items that should become the next prompt package.
4. Produce a final signoff report with a plainspoken executive summary plus technical detail.

## Deliverables

- final signoff report
- closure status by workstream
- residual risk / deferred work list
- recommended next-step prompt package topics, if any

## Acceptance criteria

- the report is honest about what is fully closed versus partially closed
- every original workstream is addressed explicitly
- the result is suitable for executive review and technical follow-up
- deferred work is well scoped rather than hand-wavy

## Guardrails

- Treat `docs/architecture/blueprint/current-state-map.md` as the governing reference for present-state disagreements.
- Do not create a parallel design system outside `@hbc/ui-kit`.
- Do not flatten valid domain-specific workflow behavior just to make screenshots look more similar.
- Be explicit when something is a confirmed repo fact versus an inference.
- Prefer updating authoritative docs and existing package surfaces over introducing duplicate layers.
- Treat SPFx host limitations honestly rather than forcing false parity with non-SPFx surfaces.

## Completion note

When you finish, summarize:
- what you verified from repo truth
- what you changed
- what you intentionally left unchanged
- any residual risk or follow-up prompt dependencies
