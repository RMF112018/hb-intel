# Prompt-07-Reduce-First-Screen-Overhead-and-Host-Fit-Risk

## Objective

Reduce pre-result vertical overhead on constrained states and harden the Project Sites surface against obvious SharePoint host-fit crowding risks.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `apps/project-sites/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

## Exact repo files / seams / symbols to inspect

- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `header`
  - `scopeContextPill`
  - `contextSummary`
  - `contextSummaryWarning`
  - `renderHeader`
  - `renderControlBar`
  - `activeChipsRow`
  - root spacing / padding styles
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
  - if card density or top-of-card rhythm needs support from this prompt
- `apps/project-sites/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

## Current gap to close

The title, scope-source pill, context summary, controls, chips, and host page furniture still consume too much of the first screen before results appear. Hosted evidence also shows lower-right host-level affordances that make breathing room and edge discipline worth hardening.

## Required implementation outcome

Rebalance first-screen priorities so users reach project results sooner on compact and transitional states. Compress or progressively disclose secondary context as needed, tighten vertical rhythm deliberately, and ensure the surface has enough host-fit resilience near page edges.

Keep the content truthful. The goal is not to remove useful context; it is to deliver it in a better-timed way.

## Proof of closure required

- compact and narrow-tablet first screens reach project cards sooner
- secondary context is still available but less dominant
- lower-edge and lower-right crowding risks are reduced in hosted use
- the result remains visually coherent with the rest of the redesign

## Constraints

- do not add fake shell chrome or compete with SharePoint host chrome
- do not solve the problem by indiscriminately adding blank padding
- do not make context meaning inaccessible or misleading

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Reduce pre-result vertical overhead on constrained states and harden the Project Sites surface against obvious SharePoint host-fit crowding risks.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `apps/project-sites/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

Exact Repo Files / Seams / Symbols to Inspect:
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `header`
  - `scopeContextPill`
  - `contextSummary`
  - `contextSummaryWarning`
  - `renderHeader`
  - `renderControlBar`
  - `activeChipsRow`
  - root spacing / padding styles
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
  - if card density or top-of-card rhythm needs support from this prompt
- `apps/project-sites/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

Current Gap:
The title, scope-source pill, context summary, controls, chips, and host page furniture still consume too much of the first screen before results appear. Hosted evidence also shows lower-right host-level affordances that make breathing room and edge discipline worth hardening.

Required Outcome:
Rebalance first-screen priorities so users reach project results sooner on compact and transitional states. Compress or progressively disclose secondary context as needed, tighten vertical rhythm deliberately, and ensure the surface has enough host-fit resilience near page edges.

Keep the content truthful. The goal is not to remove useful context; it is to deliver it in a better-timed way.

Proof of Closure:
- compact and narrow-tablet first screens reach project cards sooner
- secondary context is still available but less dominant
- lower-edge and lower-right crowding risks are reduced in hosted use
- the result remains visually coherent with the rest of the redesign

Constraints:
- do not add fake shell chrome or compete with SharePoint host chrome
- do not solve the problem by indiscriminately adding blank padding
- do not make context meaning inaccessible or misleading

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- Prioritize first-screen value density.
- Be explicit in your final summary about what was compressed, deferred, or combined.
- Preserve truthful attention/provisioning messaging.
```
