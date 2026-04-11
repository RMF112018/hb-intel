# HB Kudos + HR Approval Companion Prompt Package — v3

## Purpose

This package is the full replacement v3 implementation prompt set for the local code agent to complete the split from the merged People & Culture surface and deliver:

- a dedicated **HB Kudos** recognition experience
- a dedicated **HR approval companion webpart**
- correct integration to the live SharePoint list pair:
  - `People Culture Kudos`
  - `Kudos Audit Events`

This package is for **implementation against repo truth**, not for broad re-discovery.

The key v3 change is that the package now locks **disciplined premium `@hbc/ui-kit` usage** for homepage work. The agent must not merely “look at the kit.” The agent must implement against the repo’s actual homepage doctrine, actual entry-point rules, and actual shared premium surface model.

## Package Contents

- `README.md`
- `Plan-Summary.md`
- `Decision-Lock-Appendix.md`
- `Schema-Reference-Appendix.md`
- `Prompt-00-Authority-and-Scope-Lock.md`
- `Prompt-01-Data-Model-and-Contracts.md`
- `Prompt-02-HB-Kudos-Employee-Experience.md`
- `Prompt-03-HR-Approval-Companion-Webpart.md`
- `Prompt-04-Scheduling-Prominence-and-Detail-Panel.md`
- `Prompt-05-Permissions-Notifications-and-Work-Management.md`
- `Prompt-06-Validation-Packaging-and-Closure.md`

## Governing Repo Inputs

Use the live repo as authoritative.

Primary repo:
- `https://github.com/RMF112018/hb-intel`

Primary code/doc inputs include, at minimum:
- `apps/hb-webparts/src/webparts/peopleCulture/`
- adjacent seams under `apps/hb-webparts/src/homepage/`
- `packages/ui-kit/`
- `packages/ui-kit/src/homepage.ts`
- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/entry-points.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Relevant current implementation examples include, at minimum:
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/`
- `packages/ui-kit/src/HbcKudosComposer/`
- `packages/ui-kit/src/HbcAvatarStack/`

Do not assume legacy file names still exist just because older prompts referenced them. Verify actual repo truth first.

## Governing SharePoint Lists

The implementation must assume these lists already exist and are the intended v1 stores unless live repo truth proves an unavoidable conflict:

### 1. `People Culture Kudos`
Primary system of record for:
- content
- workflow status
- recipient targeting
- homepage visibility
- scheduling
- prominence
- removal / restore lifecycle
- admin review
- claim / reassignment / ownership
- visibility mode
- engagement counts

### 2. `Kudos Audit Events`
Durable event journal for:
- workflow transitions
- claim / reassignment changes
- scheduling and prominence actions
- moderation notes
- reminders / notification events where the code path writes them
- audit reconstruction

The agent must not invent replacement storage for these responsibilities if the required fields already exist.

## Mandatory UI System Contract

### Homepage entry-point discipline
For any work under `apps/hb-webparts/src/webparts/`, the **primary UI entry point is `@hbc/ui-kit/homepage`**.

Do not import homepage webpart UI from:
- `@hbc/ui-kit`
- `@hbc/ui-kit/primitives`
- `@hbc/ui-kit/app-shell`
- `@hbc/ui-kit/fluent`

Supplementary imports from `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`, and `@hbc/ui-kit/branding` are allowed only where the homepage entry point does not expose the needed item.

### Lane mapping
- Employee-facing HB Kudos is a **presentation-lane recognition surface**
- The HR approval companion is a **homepage-hosted governance / operational surface**
- Shared detail panel work is a **recognition + governance hybrid surface** but still homepage-safe

### Shared-first rule
Use existing shared homepage primitives / surfaces where they are the right fit.

If a required recognition or governance pattern is missing from `@hbc/ui-kit/homepage`, create or extend a **shared homepage-safe primitive first**, then consume it locally.

Do not create local one-off premium patterns for:
- archive cards
- recipient-summary patterns
- queue rows
- toolbar / filter bars
- state / aging / ownership chips
- governance detail sections
- inline action bars
- audit timeline blocks

if the pattern is expected to repeat across HB Kudos surfaces.

### Current composer limitation
The current shared `HbcKudosComposer*` pattern may be used only as a starting point. It is **not acceptable** for the final product to preserve a plain comma-delimited text recipient model.

The final implementation must align to the live recipient fields:
- `IndividualRecipients`
- `TeamRecipients`
- `DepartmentRecipients`
- `ProjectGroupRecipients`

### Thin-consumer rule
Local webpart code should retain:
- SharePoint data access
- normalization
- authorization
- workflow logic
- notification routing
- view-model adaptation
- packaging/runtime wiring

The durable visual grammar should live in shared homepage-safe components.

## Global Execution Rules

1. Respect the locked decisions in `Decision-Lock-Appendix.md`.
2. Respect the field contracts in `Schema-Reference-Appendix.md`.
3. Treat current code plus the latest implementation/migration notes as higher authority than stale review text if repo docs conflict.
4. Do not keep weak local premium styling simply because it already compiles.
5. Do not preserve the merged People & Culture experience as the end-state HB Kudos product.
6. Do not invent new required lists or fields where the existing ones already support the behavior.
7. Keep all changes production-safe, strongly typed, and packaging-aware.
8. Do not re-read files that are still within your active context window or memory unless you need to verify a genuinely uncertain detail.
9. Rebuild and verify the relevant package artifacts when runtime registration or webpart behavior changes.
10. Every execution report must name:
   - files changed
   - decisions implemented
   - unresolved gaps
   - validation performed
   - packaging result
   - SharePoint fields read and written by the changed flow

## Expected Outcome

After full execution, the repo should support:

- a dedicated HB Kudos homepage experience
- a dedicated HR approval companion webpart
- a typed recipient model aligned to the real list schema
- shared premium recognition surfaces through `@hbc/ui-kit/homepage`
- shared premium governance primitives where reuse is real
- correct workflow/governance storage in `People Culture Kudos`
- durable audit/event logging in `Kudos Audit Events`
- scheduling and prominence handling
- queue ownership and overdue/reminder handling
- role-aware visibility and moderation
- validated build/package output for the final SharePoint artifact
