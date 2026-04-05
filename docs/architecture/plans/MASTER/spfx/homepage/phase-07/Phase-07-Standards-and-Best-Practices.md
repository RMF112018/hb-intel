# Phase 07 — Standards and Best Practices

## Core standards for this phase

1. **Repo truth governs.** Freeze what the code and build actually do, not what older docs implied.
2. **Narrow entrypoints stay narrow.** Lane A and Lane B import discipline must remain enforced and measurable.
3. **Production and non-production seams must be unmistakable.**
4. **Release artifacts must be operator-usable.** Checklists and guides should be concise, repeatable, and specific.
5. **Small durable guardrails beat one-time audits.**
6. **Phase boundaries remain real.** Accessibility/QA depth belongs to Phase 08.

## Packaging standards

- Record emitted JS and CSS explicitly
- Record global mount API names explicitly
- Treat solution/package metadata as release-critical
- Document proof-case and preview seams separately from production seams

## Bundle standards

- Establish baseline sizes before setting thresholds
- Separate JS and CSS thinking where useful
- Prefer lane-specific budgets over one generic “small enough” rule
- Investigate unexplained growth, not just absolute size

## Runtime integrity standards

- Homepage lane must keep webpart dispatch integrity
- Shell-extension lane must keep top/bottom independent safe rendering
- Null/no-op safety must be preserved
- CSS extraction, if present, must be treated as a real runtime dependency and documented

## Documentation standards

- New docs must be linked from the appropriate navigation/index surfaces
- Current-state classification should be updated when canonical docs are added
- Completion notes must include evidence, not conclusions only
