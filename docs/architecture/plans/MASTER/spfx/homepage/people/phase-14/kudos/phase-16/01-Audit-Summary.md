# 01 — Audit Summary

## Repo-truth architecture summary

The current live repo uses a **split Kudos architecture**, not a single merged surface.

### Runtime seams actually in play

- `HbKudos` is the employee-facing recognition webpart.
- `HbKudosCompanion` is the governance / approval companion webpart.
- `mount.tsx` still preserves a legacy `PeopleCultureMerged` path for backward compatibility, but current dedicated Kudos webpart IDs are separately mounted.
- `HbKudos` receives `getGraphToken` through the mount layer.
- explicit `kudosListHostUrl` can be stored from webpart properties so a companion webpart can operate against the canonical list host even when hosted elsewhere.

## Key public-surface seams

### Employee/public surface

`apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`

Current public/runtime behavior includes:

- `HbcPeopleCultureSurface` rendering
- Give Kudos flyout via `HbcKudosComposerFlyout`
- typed composer path via `HbcKudosComposerForm`
- live preview via `HbcKudosComposerPreview`
- success and error states
- dirty-draft close handling with discard dialog
- `View All` opening a feed flyout, not a dead link
- searchable feed body with full excerpt rendering
- archive rendering and search
- detail panel path
- celebrate / reaction path from both main surface and detail panel
- submitter withdraw and resubmit flows
- Graph-based individual recipient photo hydration cache
- SharePoint people search adapter for typed people-picker search

## Key governance-surface seams

### Companion/admin surface

`apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

Current governance/runtime behavior includes:

- role resolution through canonical security-group-driven role helper
- queue tabs for:
  - pending
  - revision requested
  - flagged for admin
  - approved
  - rejected
  - removed / unpublished
- filter model for:
  - search
  - ownership
  - admin-review-only
  - scheduled-only
  - aging buckets
- detail panel with audit timeline
- immediate and dialog-driven governance actions
- bulk approve path
- queue refresh after mutation

## Authoritative data and state seams

### Hook / data layer

- `usePeopleCultureData` fetches list-backed People & Culture data and exposes cache invalidation + refresh.
- `invalidatePeopleCultureCache()` is an important stale-after-action seam and must be explicitly tested.
- `submitKudosDraft()` creates new SharePoint list items in pending/internal-only posture.
- typed individual recipients are resolved through `ensureUser`; taxonomy-like buckets are currently carried through notes until taxonomy resolution lands.
- `submitKudosGovernanceAction()` is the central mutation seam for both public and governance actions.

### Governance writer behavior

The governance writer is the single most important stress-test seam.

It currently enforces:

- list binding by GUID, not title
- real item lookup + etag-based MERGE
- one audit-event write per governance action
- writer-level authorization by resolved role capability
- prominence rule validation
- cache invalidation after success
- notification intent building / dispatch hook points

## Workflow-state coverage map

### Core workflow union

Current core workflow union is 7-state:

- `pending`
- `revisionRequested`
- `approved`
- `approvedScheduled`
- `rejected`
- `withdrawn`
- `removedUnpublished`

### Important non-core overlays and action states

These are **not** separate workflow enum members, but they are real user-visible states and must be tested as first-class matrix dimensions:

- flagged for admin review
- cleared admin review
- claim owner set
- assigned owner set / reassigned
- scheduled publish timestamp present
- pinned / unpinned
- featured / unfeatured
- featured expiration / demotion behavior if surfaced
- public visibility
- archive eligibility
- associated visibility
- aged-off homepage behavior
- celebrate count states
- dirty draft
- submit success / submit error
- withdraw flow
- resubmit flow
- reopen flow
- update content flow

## Current strengths relevant to stress testing

- real shared data writer seam already exists
- real audit timeline read path already exists
- Playwright webparts config already exists
- public/detail privacy boundary is intentionally modeled
- typed people search seam is real and testable
- recipient photo hydration seam is real and testable
- queue filtering model is explicit enough for deterministic matrix coverage

## Current notable gaps / risks the stress package must account for

### 1. Status vocabulary drift risk

A broad stress package could easily over-model fake workflow states. The agent must not do that. Several requested “states” are actually:

- audit events
- overlay booleans
- ownership metadata
- prominence metadata
- visibility predicates
- action results

### 2. Transitional legacy-path risk

Legacy merged People & Culture mount support still exists. The stress suite must stay focused on the current dedicated Kudos seams unless a test explicitly proves backward-compat mount behavior.

### 3. Taxonomy-recipient incompleteness risk

Typed recipient coverage is real for individuals. Non-individual buckets currently flow through label/note behavior rather than full term-store write resolution. The suite must test repo truth, not imagined future taxonomy completion.

### 4. Hosted-runtime risk

Flyouts, slide-out panels, SharePoint chrome overlap, zoom behavior, focus handling, and persistent host controls remain meaningful failure zones. Closure must include hosted validation artifacts, not just dev-harness screenshots.

### 5. Public/admin boundary risk

The public detail panel intentionally avoids audit timeline and governance internals. The admin detail panel intentionally includes them. The suite must prove both sides.

## Required interpretation lock for the code agent

Use the matrix model below when designing the suite:

- **workflow** = 7-state union
- **overlay state** = admin review, ownership, prominence, visibility, archive, age-off, reaction, photo, dirty-draft, etc.
- **transition** = action or mutation path
- **surface** = public, feed, archive, detail, companion queue, companion detail
- **host condition** = SharePoint-style chrome, panel scroll, focus, keyboard, zoom, density, no-dead-CTA
