---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# PCC Host Shell Add-On Remediation Package

## Purpose

This package accompanies the separate **Hero + Tab Rail Flagship Remediation Package**. It resolves the remaining host-shell open items needed to bring the PCC shared shell toward flagship / premium UI-kit grade without expanding into full surface redesign.

This add-on package focuses on the shell operating frame beyond the visual hero and tab rail:

- shell ownership and surface boundaries;
- SharePoint host fit;
- PCC canvas rhythm;
- active surface state integrity;
- disabled command preview behavior;
- shell-level state model;
- surface context duplication cleanup;
- accessibility wiring beyond tab buttons;
- External Platforms launch posture;
- hosted evidence and closeout scoring.

## Locked Inputs from User

The Hero + Tab Rail package owns these locked decisions and this add-on must not contradict them:

| Area                         | Locked Decision                                                |
| ---------------------------- | -------------------------------------------------------------- |
| Hero primary title           | `Project Control Center`                                       |
| Hero secondary title         | active surface name                                            |
| Project number               | do **not** include in hero; SharePoint chrome exposes it       |
| Mandatory hero facts         | location, estimated value, scheduled completion, project stage |
| Excluded hero facts          | client, project status, source confidence, last updated        |
| External platform tab label  | `External Platforms`                                           |
| External platform page title | `External Platforms Launch Pad`                                |
| Tab icons                    | remove icons for now                                           |
| Command search               | disabled preview affordance, not functional search             |
| Colors/tokens                | use branded colors available in existing UI-kit                |

## Repo-Truth Basis

Current repo-truth reviewed for this package includes:

- `PccShell.tsx` currently composes `PccProjectHeroBand`, `PccHorizontalTabs`, `main[data-pcc-canvas]`, and `PccBentoGrid`.
- `PccShell.module.css` currently defines a minimal shell and canvas with limited separation.
- `PccProjectHeroBand.tsx` currently carries client, source confidence, and search directly in the hero, which conflicts with the new locked hero contract.
- `PccHorizontalTabs.tsx` currently includes icons and labels `external-systems` as `Apps`, which conflicts with the new locked tab contract.
- `PccApp.tsx` currently passes `PCC_PROJECT_PLACEHOLDER` to the shell, while the preview project profile model provides a better canonical preview identity path.
- `PccCommandSearch.tsx` currently renders a read-only search input or disabled icon button; this should become a non-interactive preview affordance.
- `PccSurfaceContextHeader.tsx` currently repeats project/surface/source metadata that should be compressed or removed from happy-path first views.
- `PccMvpSurfaces.ts` currently defines `external-systems` display name and long surface descriptions that need shell-safe copy treatment.
- `footprints.ts` already defines the 8-mode PCC responsive contract.

## Authority and Relationship to Hero + Tab Rail Package

This add-on package is subordinate to the locked Hero + Tab Rail decisions. If a conflict exists, the locked Hero + Tab Rail contract wins for visual/title/navigation specifics.

This package expands implementation coverage to the host shell operating system around those components.

## Recommended Execution

Run prompts in order:

1. `prompts-2/Prompt_01_AddOn_Scope_Lock_And_Shell_Ownership.md`
2. `prompts-2/Prompt_02_Project_Identity_Context_And_Canvas_Boundary.md`
3. `prompts-2/Prompt_03_Surface_Context_DeDup_And_State_Model.md`
4. `prompts-2/Prompt_03A_External_Platforms_Surface_Copy_Alignment.md`
5. `prompts-2/Prompt_04_Command_Preview_And_Active_Panel_A11y.md`
6. `prompts-2/Prompt_05_External_Platforms_And_Routing_Integrity.md`
7. `prompts-2/Prompt_06_Host_Fit_Responsive_Evidence_And_Closeout.md`

Prompt 03A is a narrow user-facing copy alignment between the locked tab label / page title (`External Platforms` / `External Platforms Launch Pad`) and residual `External Systems` strings still rendered across the External Platforms surface, the Project Home dashboard card, cross-surface reference labels (Approvals references, Constraints, Buyout, Project Readiness, Document Control), and adapter/fixture display labels. It runs **after** Prompt 03 (so context de-duplication has stabilized which copy belongs where) and **before** Prompt 04 (so command-preview a11y validates against the final user-facing label set). 03A must not change routes, the `PccSurfaceRouter` shape, internal IDs (`'external-systems'`), component/file/folder names, manifest/package versions, or `pnpm-lock.yaml`. It must not absorb Prompt 05 routing-integrity scope.

## Context-Efficiency Rules for Local Agent

Every prompt includes this binding rule:

> Do not re-read files that are still within your current context or memory unless they changed, you need exact adjacent lines, or a validation failure requires verification.

Use active context first. Do not perform broad repo audits after Prompt 01 unless a validation failure requires it.

## Non-Goals

Do not use this package to:

- redesign all downstream surface cards;
- introduce backend/API mutation;
- add live Graph/PnP/Procore integration;
- introduce URL routing without explicit later approval;
- claim final 56/56 scoring without hosted evidence;
- alter SharePoint chrome;
- make hero or tabs sticky in this phase.
