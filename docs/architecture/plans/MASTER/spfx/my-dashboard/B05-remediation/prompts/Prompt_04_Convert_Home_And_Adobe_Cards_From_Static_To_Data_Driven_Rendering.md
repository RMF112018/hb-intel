# Prompt 04 — Convert Home and Adobe Cards from Static to Data-Driven Rendering

## Objective

Replace the current static placeholder/pending-source card implementations with presentation components that consume real My Work read-model props/view models.

## Why this exists now

The audit found that even “ready” variants of the My Dashboard surfaces still render hardcoded card values:

- counts are `—`,
- refresh state is `Pending source connection`,
- focused queue list displays static explanatory text,
- summary values are not driven from backend envelopes.

Even after Prompt 03 wires readiness, the UI will remain functionally incomplete unless card content itself becomes data-driven.

## Required future state

Cards remain presentational components, but they render actual values from stable props/view models derived from read-model envelopes.

## Cards in scope

At minimum:

```text
apps/my-dashboard/src/surfaces/home/WorkSummaryCard.tsx
apps/my-dashboard/src/surfaces/home/SourceReadinessCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueSummaryCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignAgreementActionListCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx
```

## Required rendering behavior

### Work Summary
Render from home summary envelope data:
- total action item count,
- connected/available source posture where available,
- generated/refresh timestamp in a user-appropriate form.

### Source Readiness
Render source readiness from `MyWorkSourceReadinessItem[]` rather than hardcoded “Adobe Sign — Connection pending.”

### Adobe Queue Home Card
Render:
- pending agreement count,
- awaiting-your-action count if available in summary contract,
- last refresh/generated time,
- CTA state tied to module availability rather than a static placeholder posture.

### Adobe Queue Summary Card
Render counts from queue summary data.

### Adobe Agreement Action List Card
Render actual preview/list items from the read model where available. Preserve empty-state handling for legitimately empty queues.

### Adobe Queue State / Connection Guidance
Render typed non-ready guidance based on source status/warnings, distinguishing:
- configuration required,
- authorization required,
- principal unresolved,
- source unavailable,
- backend unavailable.

Do not use one generic “pending connection” message for every failure class.

## Data contract rule

Do not make cards fetch data. They receive props/view models from the composition/surface layer.

If helper selectors are needed to transform raw envelopes into card props, create narrow selector/view-model functions with tests.

## Exact source model references to inspect

```text
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/AdobeSignActionQueue.ts
```

Also inspect current fixture/live envelope producers to understand exact available fields before shaping card props.

## Required tests

Update card/surface tests to prove:

1. Real counts/timestamps render when provided.
2. Source-readiness reasons render distinct copy and/or markers.
3. Empty queue is different from unavailable queue.
4. Authorization-required guidance is different from configuration-required guidance.
5. No card regresses to hardcoded `—` / `Pending source connection` when live data is supplied, unless that wording is deliberately retained for a truthful non-ready state.
6. Existing data attributes and layout/choreography contracts stay intact unless intentionally updated and tests revised accordingly.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

## Non-scope

- Do not redesign the entire My Dashboard UI.
- Do not rework OAuth callback security.
- Do not invent data fields not present in the model contracts without first updating contracts/providers intentionally and proving necessity.

## Completion standard

Prompt 04 is complete only when the home and focused Adobe module can visually reflect live envelope data, truthful non-ready states, and real empty states without relying on static placeholders.

## Agent Efficiency Directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
