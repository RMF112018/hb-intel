# Prompt 05 — Test Updates and Bento / Active-Panel Guardrails

## Objective

Complete the test contract shift from card-owned compatibility active panels to shell-owned active panel semantics, while preserving bento direct-child invariants.

## Instructions

# Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, and tab/tabpanel accessibility.

Do not implement Phase 05 module launcher, Phase 06 Project Home bento composition realignment, URL routing, command routing, active module state, live integrations, writeback, or broad visual redesign during Phase 04.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

## Required Test Search

Search test files for:

```text
data-pcc-active-surface-panel
dataActiveSurfacePanel
getActiveCompatibilityCard
getSoleActivePanel
compatibilityCards
tier1
region="command"
Project Intelligence
PccDocumentsHeaderCard
PccTeamAccessHeaderCard
PccSurfaceCommandCardContract
PccCardTierContract
PccApp.bentoIntegration
PccShell.navigation
PccShell.surfaceSmoke
```

## Required Updates

- Replace card-level active-panel assertions with shell `main[role="tabpanel"]` assertions.
- Keep direct-child card assertions, but no longer require a direct-child card to carry the active-panel marker.
- Convert "first command card" tests into "first operational card" tests where appropriate.
- Retain tests that ensure all cards have explicit tier/region/footprint metadata.
- Add regression assertions that removed duplicate header cards are absent.
- Add preservation assertions for operational metrics/facts.

## Hard Stops

Do not approve test updates that:

- weaken bento direct-child protection;
- hide failures by deleting coverage without replacement;
- permit multiple shell active panels;
- permit active-panel ownership to disappear;
- permit operational content loss.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Then run prettier/diff checks on changed files.
