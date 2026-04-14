# Publisher Remediation Prompt Package

This package contains a sequenced remediation set for the `Article Publisher` application.

## Package objective
Resolve each audit issue identified in the backend wiring / workflow audit by driving the local code agent through one tightly bounded topic at a time.

## Package contents
- `Plan-Summary.md`
- `Prompt-01-Close-direct-published-state-bypass.md`
- `Prompt-02-Close-publish-and-republish-lifecycle-state-history.md`
- `Prompt-03-Realign-team-member-seam-to-tenant-schema.md`
- `Prompt-04-Realign-media-seam-to-tenant-schema.md`
- `Prompt-05-Harden-archive-and-withdraw-destination-page-lifecycle.md`
- `Prompt-06-Realign-descriptor-mvp-fields-to-tenant-schema.md`
- `Prompt-07-Reconcile-drift-policy-preview-and-ui-messaging.md`
- `Prompt-08-Replace-destructive-child-rewrite-behavior.md`
- `Prompt-09-Refine-lifecycle-error-classification-and-logging.md`

## Execution rules
- Execute the prompts in order unless a prompt explicitly says otherwise.
- Do not start the next prompt until the current prompt is fully closed.
- Each prompt is intentionally narrow and should result in code changes, targeted tests, and a closure report.
- Treat the repo `main` branch code as implementation authority and the tenant list schema report as schema authority.
- Use the existing audit package as the defect baseline.

## Governing references
Primary repo:
- `https://github.com/RMF112018/hb-intel.git`

Primary schema authority:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Primary audit package to close:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/01-List-by-List-Wiring-Assessment.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/02-Workflow-Logic-Assessment.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/04-Recommended-Remediation-Sequence.md`

## Closure artifact requirement
For each prompt, create a closure report in:

- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/`

Use one report file per prompt, matching the prompt number and topic.

## Expected posture
This is a repo-truth remediation effort, not a broad redesign effort.
Do not make unrelated refactors.
Do not weaken tenant alignment to preserve legacy assumptions.
