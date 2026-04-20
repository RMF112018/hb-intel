# Financial Shared Spine Integration — Prompt 01
## Objective
Complete the first shared-spine integration workstream for the Financial module by locking the canonical shared-spine publish/consume contract for Financial across Project Hub and all required shared packages.

## Context
You are working inside the HB Intel repo. Your task is limited to shared-spine integration doctrine and implementation-readiness for the Financial module. In this prompt, focus on identifying, reconciling, and locking the canonical contract for how Financial publishes to and consumes from the shared spines.

This is not a broad repo audit.
This is not a UI polish pass.
This is not a route implementation pass.
This is a shared-spine integration definition pass.

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target-architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. local file comments / inferred intent
- Do not overclaim implementation maturity.
- Do not blur modeled integration with operationally proven integration.
- Do not invent new shared spines if the repo already defines canonical ones.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make runtime code changes in this prompt unless a tiny documentation-adjacent housekeeping change is strictly necessary.

## Files to Inspect First
Inspect the repo directly and ground your work in actual file content, especially:

### Core repo-truth and planning files
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/Target-Architecture-Blueprint.md`
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

### Financial doctrine and readiness files
- all relevant files under:
  - `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- any Financial module doctrine control index
- Financial acceptance/readiness files
- Financial source-of-truth / action-boundary files
- Financial runtime model files

### Shared spine / package doctrine and implementation surfaces
Inspect the most relevant repo-truth and implementation surfaces for shared packages, including but not limited to:
- `packages/features-project-hub`
- `packages/project-canvas`
- `packages/related-items`
- `packages/activity-timeline`
- `packages/workflow-handoff`
- `packages/notification-intelligence`
- `packages/versioned-record`
- `packages/acknowledgment` or `packages/acknowledgement`
- `packages/bic-next-move`
- `packages/complexity`
- `packages/ui-kit`
- any shell / tile registration / mandatory module registration surfaces
- any acceptance or readiness docs that govern shared-spine behavior

## Required Actions
1. Identify every shared spine the Financial module is required to publish to or consume from.
   - At minimum assess:
     - Activity / timeline
     - Work Queue / next move
     - Related Items / work graph
     - Health / risk / operational posture surfaces
     - Notifications
     - Acknowledgment / receipt workflows
     - Versioned-record lineage where applicable
     - Workflow handoff and ownership transitions
     - Project canvas / tile registration / mandatory operating-layer surfaces

2. For each spine, determine:
   - canonical package / owning surface
   - whether Financial is required to publish, consume, or both
   - the minimum record contract or integration shape implied by repo truth
   - whether the integration is governed, partially governed, weakly governed, or missing
   - whether implementation seams already exist in code
   - whether current doctrine is sufficient for safe downstream implementation

3. Identify doctrine fragmentation and contradictions.
   - Find where Financial doctrine references shared-spine behavior without enough specificity.
   - Find where shared package doctrine implies obligations that Financial doctrine does not yet encode.
   - Find where package implementation appears ahead of doctrine or doctrine appears ahead of implementation.

4. Create or update a canonical Financial shared-spine integration control document.
   - Prefer an existing canonical file if one already exists.
   - If a new file is needed, prefer a name like:
     - `docs/architecture/plans/MASTER/phase-3-deliverables/financial/Financial-Shared-Spine-Integration-Contract.md`
   - This document must become the primary implementation-control surface for Financial shared-spine integration.

5. The control document must include, at minimum:
   - purpose and scope
   - repo-truth precedence notes
   - spine-by-spine integration obligations
   - canonical publish/consume direction per spine
   - required entity linkage expectations
   - required ownership / acknowledgment / notification implications
   - explicit note of any unresolved contradictions
   - implementation-safety notes for downstream integration work

6. Update the Financial doctrine index and any relevant README surfaces so the shared-spine contract is discoverable.

## Deliverables
1. A new or revised Financial shared-spine integration control document.
2. Any necessary README / doctrine-index cross-reference updates.
3. A spine-by-spine integration inventory summary.
4. A changed-files summary.
5. A short remaining-risk section.

## Definition of Done
This prompt is complete only when:
- there is one clear canonical control surface for Financial shared-spine integration,
- each required shared spine has an explicit publish/consume posture,
- doctrine gaps and contradictions are identified rather than hidden,
- and a downstream implementer can understand the required Financial shared-spine obligations without guessing.

## Output Format
Return:
1. objective completed
2. files changed
3. shared-spine inventory findings
4. summary of what was normalized
5. remaining risks / follow-ups
