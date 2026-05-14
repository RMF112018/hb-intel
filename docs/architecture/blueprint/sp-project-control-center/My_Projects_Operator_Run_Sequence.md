# My Projects Operator Run Sequence

## Objective

Define the operator-safe end-to-end sequence from schema verification through source-list provisioning and post-provision backfill for My Projects.

## Sequence

1. Select identity lane and confirm permissions posture.
2. Run read-only schema verification.
3. Run source-list provisioner dry-run.
4. Run source-list provisioner apply (only if no blockers).
5. Re-run read-only schema verification.
6. Run Projects backfill dry-run/apply.
7. Run Registry backfill dry-run/apply.
8. Capture final readiness + functional smoke evidence.

## Safety Constraints

- Dry-run first for provisioning and backfill scripts.
- No backfill apply before schema closure is confirmed.
- Runtime identity lane and operator/deployment app-registration lane are distinct and must both be evidenced.
- No secrets in logs/evidence artifacts.

## Operational References

- `docs/how-to/administrator/provision-my-projects-source-list-schema.md`
- `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
- `docs/how-to/administrator/templates/my-projects-source-list-evidence-checklist.md`
