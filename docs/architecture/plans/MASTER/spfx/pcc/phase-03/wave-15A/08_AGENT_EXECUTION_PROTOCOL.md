# 08 — Agent Execution Protocol

## 1. Purpose

This file defines how local code agents should execute Wave 15A without creating scope drift, token waste, or unsupported 56/56 claims.

## 2. Universal Agent Instructions

Every agent must:

1. Start with repo-truth inspection.
2. Do not rely on chat memory.
3. Do not re-read files still in current context unless exact wording, line references, or changed repo state must be verified.
4. Keep scope limited to Wave 15A.
5. Preserve existing architecture unless it conflicts with doctrine acceptance.
6. Prefer shared primitives over one-off surface fixes.
7. Update or produce closeout documentation for each prompt.
8. Run appropriate tests.
9. Capture evidence.
10. Never claim 56/56 without evidence.

## 3. Required Pre-Implementation Repo Truth Pass

Before code changes, inspect:

- PCC source under `apps/project-control-center/`
- PCC shell/router files
- PCC surface files
- PCC UI/shared components
- CSS/SCSS/module styles
- fixtures/adapters/read-model clients
- tests
- SPFx manifests/package files
- UI doctrine files
- SPFx audit checklist/scorecard/evidence docs
- PCC Phase 3 architecture and Wave 15 docs
- Wave 15A guide files

## 4. Implementation Rules

### Shared First

Do not begin with a surface unless the prompt specifically says the shared system is already corrected.

### No Local Styling Drift

Do not introduce one-off CSS that bypasses shared primitives unless documented as temporary and followed by consolidation.

### No Feature Creep

Do not add backend execution, Graph integration, Procore execution, approval execution, or new data stores unless explicitly in scope.

### No False Actions

Do not show actions that appear executable unless they work or clearly explain preview/read-only limitations.

### No Diagnostic Dominance

Do not make build/wave/fixture metadata the primary business-facing message.

## 5. Prompt Closeout Requirements

Each prompt response/closeout must include:

```markdown
## Objective Completed
[summary]

## Files Changed
- [path]

## Doctrine Criteria Addressed
- [category]

## Tests Run
- [command] — [result]

## Screenshots / Evidence
- [path or note]

## Scorecard Impact
- [category]: [old] → [new]

## Residual Issues
- [item or none]

## Next Recommended Prompt
[short next step]
```

## 6. Validation Commands

Agents must determine current repo-appropriate commands through repo truth. Common expected commands may include:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <touched-files>
```

Do not assume command names without checking package scripts.

## 7. Branch / Commit Guidance

Recommended branch naming:

```text
pcc/phase-3-wave-15a-ui-doctrine-remediation
```

Recommended commit structure:

```text
docs(pcc): add wave 15A UI doctrine remediation guide
feat(pcc): remediate wave 15A shell and host fit
feat(pcc): remediate wave 15A grid card and state model
feat(pcc): remediate wave 15A project home and access surfaces
feat(pcc): remediate wave 15A documents and readiness surfaces
feat(pcc): remediate wave 15A governance and integration surfaces
docs(pcc): finalize wave 15A 56 scorecard closeout
```

## 8. Agent Stop Conditions

Stop and report if:

- A required doctrine file is missing.
- Existing source state materially differs from this guide.
- Required changes exceed Wave 15A scope.
- A compile error requires touching unrelated systems.
- Tenant validation cannot be performed.
- Scorecard criteria are ambiguous.
- A hard-stop issue cannot be resolved without product decision.

## 9. Required Agent Mindset

Treat Wave 15A as a readiness gate, not a design preference pass.

Use direct findings:

- “This surface lacks project context.”
- “This card hierarchy does not communicate priority.”
- “This disabled action is misleading.”
- “This layout fails inside SharePoint chrome.”

Avoid vague findings:

- “Make cleaner.”
- “Improve polish.”
- “Modernize UI.”
- “Looks better.”
