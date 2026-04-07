# Phase 09 Package — Packaging, Runtime Proof, and Production Hardening

## Objective

Implement the **packaging, runtime proof, and production hardening** package for Tool Launcher / Work Hub so the launcher survives the real `hb-webparts` build, `.sppkg` packaging, SharePoint-hosted runtime loading, and tenant validation without regressing the homepage lane.

This phase should build on:

- **Phase 01** normalized launcher seam
- **Phase 02** desktop launcher skeleton
- **Phase 03** flagship platform stage
- **Phase 04** utility rail and support actions
- **Phase 05** workflow shelves
- **Phase 06** all-platforms overlay / index layer
- **Phase 07** responsive and authoring hardening
- **Phase 08** search, personalization, and refinement

## Why this phase exists

By the end of Phase 08, the launcher should already be structurally and visually complete. What should still need proof is the **production reality**:

1. the launcher must survive the cumulative `hb-webparts` package build
2. the launcher must survive manifest emission and shell-entry generation
3. the launcher must load correctly through the homepage mount / dispatch seam
4. the launcher must render in SharePoint-hosted conditions, not just local preview assumptions
5. the launcher must retain authoring-safe, host-aware behavior after packaging

This phase exists to ensure the launcher is not just well designed, but **deployment-safe** and **tenant-proof**.

The result should be a launcher that is production-ready inside Lane A homepage packaging, not just visually complete in source form.

## Scope

This package should result in:

1. a locked packaging and runtime validation plan for Tool Launcher / Work Hub
2. explicit proof that launcher manifests, shell-entry output, and cumulative package wiring remain intact
3. SharePoint-hosted runtime validation for loader contract, rendering, and interaction behavior
4. production hardening for failures, missing assets, and deployment-time edge cases
5. documentation updates and completion notes suitable for handoff and production readiness review

## Explicit exclusions

This phase must **not**:

- redesign the launcher
- reopen earlier hierarchy or architecture decisions without a proven runtime regression
- introduce unrelated homepage features
- broaden into shell-extension work or non-Lane-A architecture
- treat local preview as sufficient proof of production readiness
- rely on undocumented manual fixes that are not captured in repo docs

## Package contents

- `phase-09-package-summary.md`
- `prompt-01-packaging-and-build-proof-plan.md`
- `prompt-02-runtime-loader-contract-and-sharepoint-hosted-proof.md`
- `prompt-03-production-hardening-and-failure-state-sweep.md`
- `prompt-04-release-readiness-docs-and-handoff.md`
- `phase-09-validation-checklist.md`
- `phase-09-completion-notes-template.md`

## Prompt execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04

## Required working posture for all prompts

- repo truth first
- do not re-read files still in current context unless needed
- preserve the completed launcher hierarchy and prior phase outcomes
- keep work within `apps/hb-webparts`, related build tooling, and directly relevant docs unless broader change is clearly required
- preserve the cumulative `hb-webparts` package model and mount / dispatch seam
- validate SharePoint-hosted runtime behavior, not just local composition reference behavior
- document every proof step and every material risk clearly
