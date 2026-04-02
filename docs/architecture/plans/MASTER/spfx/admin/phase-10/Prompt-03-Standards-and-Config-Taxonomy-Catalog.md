# Prompt-03 — Standards and Configuration Taxonomy / Catalog

## Objective

Define the canonical taxonomy and catalog model for all Phase 10 governed standards/config items.

This prompt should produce the durable structure that later services, APIs, and UI surfaces all rely on.

## Important execution rules

- Build on the baseline from Prompt-02.
- Keep the catalog implementation-oriented.
- Do not add vague “miscellaneous” categories.
- Do not mark a category live-editable unless the baseline allows it.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-hybrid-config-baseline.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-repo-truth-and-gap-audit.md`
- current wave-0 configuration docs and registry files

## Required work

Create:

1. `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-standards-config-taxonomy.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-config-catalog-model.md`

## Taxonomy requirements

At minimum define domains/subdomains for:
- rollout / provisioning settings
- SharePoint standards and posture rules
- Entra-related standards where appropriate
- notification / operational business-controlled settings
- environment-readiness / validation policy references
- admin UI-only presentation config if any is allowed
- future expansion categories, clearly marked as not yet in active scope

## Catalog model requirements

For each config item type, define fields such as:
- key / stable identifier
- domain
- subdomain
- description
- value type
- validation rule
- default value source
- live-editable: yes/no
- secret: yes/no
- infrastructure-controlled: yes/no
- allowed editor role / permission
- risk tier
- environment scoping rules
- versioning behavior
- publish semantics
- audit payload requirements
- downstream run snapshot requirement

## Optional code artifact recommendation

If repo structure supports it cleanly, define the target location for a canonical code catalog such as:
- `backend/functions/src/config/catalog/**`
or another repo-truth-consistent location.

You may create a small scaffold or TODO doc path recommendation, but do not implement the full backend catalog code in this prompt.

## Completion condition

Stop when the taxonomy and catalog docs are complete and give later prompts enough precision to implement code without re-inventing config semantics.
