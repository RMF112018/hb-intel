# Prompt 02 — P0 degraded / misconfigured / partial-state closure

## Objective

Close the P0 gap around **degraded**, **misconfigured**, and **partial-state** runtime behavior in the **HB Kudos Companion** so the webpart behaves professionally when SharePoint context, configuration, or data dependencies are incomplete.

## Governing authority

Primary governing files:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Secondary supporting references:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`

## Problem to correct

The Companion has some bounded behavior today, but it still assumes a relatively happy-path runtime.

The doctrine requires strong behavior when the webpart is:

- minimally configured
- partially configured
- moved between page sections
- viewed in edit mode
- loaded with missing, stale, or empty data
- running with incomplete SharePoint/site/list context

The runtime must render bounded, understandable outcomes rather than vague emptiness or brittle behavior.

## Required implementation direction

### 1. Enumerate degraded states explicitly
Audit the Companion runtime for realistic degraded states such as:

- missing or invalid `kudosListHostUrl`
- unavailable SharePoint site context
- unresolved role state failure
- available shell but unavailable data source
- partial config in dev-harness or non-SharePoint execution contexts

You do not need to over-engineer a universal state machine, but the runtime must explicitly handle the real degraded states it can encounter.

### 2. Add professional bounded outcomes
For each supported degraded state, render a professional bounded result that clearly communicates the condition without pretending the surface is healthy.

The outcome should:

- be host-safe
- be page-canvas appropriate
- remain visually premium and non-generic
- avoid fake shell chrome
- avoid ambiguous “nothing here” messaging where the condition is actually degraded or incomplete

### 3. Preserve correct dev-harness behavior
The dev harness must remain usable for Companion development.

Do not break the simulated-role/local execution path while hardening production/runtime behavior.

### 4. Keep property/manifest assumptions honest
If the manifest default and mount behavior are relied upon for production assumptions, make those assumptions explicit and safely handled in code.

Do not leave critical runtime behavior implicit or fragile.

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`

You may add a narrow helper or guard seam if it materially improves clarity and reliability.

## Constraints

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not introduce fake app-shell scaffolding inside the page canvas.
- Do not remove existing role/capability protections.
- Do not turn this into a broad Wave 1 redesign.
- Do not hide degraded states behind silent fallback content.

## Validation requirements

Explicitly validate realistic degraded scenarios, including where feasible:

1. local/dev-harness execution
2. missing or unavailable site/list host context
3. failed role resolution path
4. partially configured runtime assumptions
5. expected production-like path with normal context available

## Deliverable

Implement degraded-state hardening and report:

- which degraded/misconfigured states are now explicitly handled
- what render behavior exists for each state
- how dev-harness behavior was preserved
- what validation was performed
