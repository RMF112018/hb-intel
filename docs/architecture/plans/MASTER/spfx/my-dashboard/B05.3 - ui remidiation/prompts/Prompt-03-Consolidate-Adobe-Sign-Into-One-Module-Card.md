# Prompt 03 — Consolidate Adobe Sign into One Module Card

````markdown
# Objective

Consolidate Adobe Sign into a single production-grade `Adobe Sign Action Queue` module card that owns all visible states and eliminates the current fragmented home-card / queue-state-card / connection-guidance-card / focused-surface posture.

# Repo-truth context

Start from Prompts 01–02.

Primary seams to inspect and likely change:

- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueSummaryCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignAgreementActionListCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/**/*.test.tsx`
- `apps/my-dashboard/src/state/myWorkCardViewModel.ts`
- `apps/my-dashboard/src/shell/MyWorkActiveEnvelopeContext.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`

Relevant target authorities:

- `docs/02-Decision-Lock-And-Closed-Target-Posture.md`
- `docs/05-Target-Module-State-Matrices.md`
- `docs/06-Target-Copy-Library.md`

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. One card per module is mandatory.
   - This doctrine permits an in-header view selector within that one card.
2. Adobe Sign state must be rendered inside one card, not distributed across standalone UI cards.
3. Preserve existing truthful read-model fields and source-status semantics.
4. Preserve the existing OAuth start path and use `Connect Adobe Sign` only where status truth allows it.
5. Do not invent Adobe APIs, new backend fields, or new handoff URLs.
6. Agreement actions remain in Adobe Sign; do not imply completion inside My Dashboard.

# Implementation instructions

Implement the consolidated Adobe card in a way that meets or exceeds the target matrix.

## Required card identity

- Eyebrow: `Adobe Sign`
- Title region may host an in-card header selector while preserving single-card ownership.

## Required source-status handling

Render all of these states within the same card:

- loading;
- authorization required;
- configuration required;
- principal/account unresolved;
- source unavailable;
- backend unavailable;
- partial;
- available + zero items;
- available + pending items.

## Required state posture

Follow `docs/05-Target-Module-State-Matrices.md` and `docs/06-Target-Copy-Library.md` exactly.

## Required metrics

When status is `available` or `partial`, render compact metrics for:

- Pending agreements
- Signature actions
- Review actions

## Required item list

When actionable items exist:

- show up to 5 items;
- preserve:
  - agreement name;
  - required action label;
  - sender label where available;
  - expiration label where available.

## Required handoff actions

Render source handoff copy only where truthful:

- `Open in Adobe Sign`
- `View all in Adobe Sign` if current repo truth provides a suitable destination and pagination indicates additional items.

## Required consolidation outcome

The current Adobe implementation must no longer require separate rendered:

- queue state card;
- connection guidance card;
- focused route surface;
- home summary card that delegates to a separate focused route just to disclose the meaningful queue state.

You may:

- replace these files with one new module card component plus supporting internal subcomponents;
- or refactor an existing file into the single owning card.

The visible target result matters more than preserving old file names.

# Why the current implementation is insufficient

The user experiences Adobe Sign as several disconnected surfaces. That reflects implementation history, not a coherent product module. The target UI must instead let users understand and act from one card.

# Required implementation outcome

After this prompt:

- one Adobe card owns all state;
- connect CTA appears in authorization-required state;
- populated queue can show compact metrics and top items;
- empty queue is positive and concise;
- partial/unavailable states remain truthful but compact;
- no separate Adobe-ready/readiness card is required for the primary page.

# What done really looks like

A user looking at the Adobe card can answer, without leaving the dashboard:

- Am I connected?
- Is Adobe available?
- Do I have pending work?
- What are the first items?
- Where do I continue?

# Verification

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```
````

Add/update tests to cover:

- authorization-required state + CTA;
- unavailable state;
- empty ready state;
- populated ready state;
- partial state;
- one-card consolidation in the home surface.

# Documentation updates

Do not perform the full README rewrite yet.  
Reconcile comments/tests inside Adobe module files that still describe the rejected multi-card/focused-route posture.

# Deliverables / exit criteria

Return:

1. **Implementation Decision:** PASS / PARTIAL / BLOCKED
2. **Files inspected**
3. **Files changed**
4. **New single-card Adobe architecture**
5. **State matrix coverage summary**
6. **CTA / OAuth preservation notes**
7. **Validation commands/results**

```

```
