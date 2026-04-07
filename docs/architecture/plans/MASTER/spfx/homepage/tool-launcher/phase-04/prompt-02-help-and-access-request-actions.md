# Prompt 02 — Help and Access-Request Actions

## Objective

Implement the **help** and **access-request** action layer for Tool Launcher / Work Hub so the utility rail provides practical support pathways driven by the normalized launcher model.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- use the Phase 01 normalized launcher seam rather than raw SharePoint assumptions
- use the Phase 02 shell and Phase 04 utility-rail contract rather than inventing a parallel support path
- preserve the Phase 03 flagship hierarchy and homepage-safe composition

## Existing implementation context

Review at minimum:

- the Phase 01 normalized launcher adapter/model files
- the Phase 02 launcher shell / utility-rail region implementation
- the Phase 04 utility-rail files created in Prompt 01
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`

## What you must implement

Wire support actions so the utility rail can:

- resolve help destinations from normalized launcher records
- resolve access-request destinations from normalized launcher records
- display support-owner metadata or references when it materially improves usability
- suppress individual support action rows when data is absent or not useful
- preserve a quiet secondary posture rather than creating a button pile

## Data handling requirements

Do not bind directly to raw SharePoint field names.

Use the normalized launcher seam to derive, at minimum:

- help-link targets
- access-request targets
- support-owner / support-owner-reference data if normalized
- display labels and fallback copy when only partial support metadata exists

If the normalized seam is missing a selector or derived helper needed for this phase, add it there rather than bypassing the seam.

## Required output

Produce a markdown file named:

- `phase-04-support-action-binding-notes.md`

The file must include:

### 1. Binding approach
How help and access-request actions are selected and rendered.

### 2. Suppression rules
When support actions render vs collapse.

### 3. Data assumptions
What the utility rail assumes the normalized launcher seam provides.

### 4. Residual debt
What is deferred to later phases.

## Coding expectation

Implement the support-action binding in the repo and ensure the utility rail now provides real help / access-request functionality from normalized live data rather than placeholder support content.
