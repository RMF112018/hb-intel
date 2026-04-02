# Prompt-03 — Shared Safety Contracts and Model Placement

## Objective

Create the shared TypeScript contract model that the Phase 11 safety framework will rely on, and place each contract in the correct package boundary.

## Important execution rules

- Inspect package placement carefully before changing files.
- Do not create a new package unless you verify there is no correct existing placement.
- Prefer `@hbc/models` for shared data contracts consumed by frontend and backend.
- Keep reusable visual components out of models.
- Keep backend enforcement logic out of models.

## Inputs

Use:
- the Phase 11 doctrine docs from Prompt-02
- `packages/models/package.json`
- nearby `packages/models/src/**` structure
- any existing admin/provisioning model patterns you find relevant

## Exact scope of work

Add or update shared contracts needed for at least:

- `AdminActionRiskTier`
- `AdminActionClass`
- `AdminSafetyRequirements`
- `AdminActionManifest` or equivalent action metadata shape
- preview result model
- dry-run result model
- impact summary model
- execution scope model
- confirmation / acknowledgment payload model
- post-run validation result model
- recovery guidance model
- safety evidence summary model
- safety warning model

If current model organization suggests a better naming pattern, follow the repo’s established naming conventions and document the decision.

## Deliverables

1. Shared contract code in `packages/models/**`
2. Supporting exports
3. A new doc:
   - `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-preview-dry-run-and-confirmation-model.md`

## Required implementation notes

- Use strong typing and narrow enums/unions where possible.
- Include comments only where they materially aid understanding.
- Ensure models are neutral enough for future SharePoint and Entra actions, not just provisioning.
- If a model depends on data that does not yet exist from earlier phases, define the smallest forward-compatible shape necessary.

## Documentation requirements

The doc must explain:
- which contracts were added,
- why they belong in `@hbc/models`,
- what each contract governs,
- how the model supports preview, confirmation, validation, and recovery.

## Validation

Run the smallest justified validation set, likely:
- `pnpm --filter @hbc/models lint`
- `pnpm --filter @hbc/models check-types`

Report exactly what was run.

## Completion condition

Stop after shared contracts, exports, docs, and validation are complete.
