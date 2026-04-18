# Prompt 06 — Integrate `project-sites` Fallback Launch Resolution

## Objective
Integrate the fallback registry into `project-sites` so the app can resolve launch behavior in the correct order: primary migrated site first, legacy fallback folder second, none last.

## Current gap to close
The backend fallback records may exist, but the user-facing application still cannot use them until the project entry normalization and launch-action UI understand secondary fallback targets.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- output of Prompts 01 through 05
- the live `project-sites` entry normalization, repository, card, and launch-state seams

## Required repo inspection areas

Inspect the actual live implementation footprint for:

- project-sites repository/data access seams
- normalized entry model
- launch-state / card rendering logic
- empty / provisioning / attention-needed messaging
- any existing fallback or site-url handling

## Required implementation outcome

Add secondary legacy fallback launch behavior to `project-sites` without degrading the current primary-site behavior.

Required outcomes:

1. query the HBCentral fallback registry through a governed read seam
2. merge fallback data into the normalized project entry model
3. implement launch precedence:
   - primary site URL
   - legacy fallback folder URL
   - none
4. expose a clear fallback action label such as `Open Legacy Project Files`
5. add factual helper messaging for fallback records
6. preserve existing primary `Open Site` behavior intact

## Required implementation details

- Add normalized fields such as:
  - `legacyFallbackFolderUrl`
  - `legacyFallbackSourceYear`
  - `legacyFallbackMatchStatus`
  - `launchTargetKind`
- Keep the heavy discovery and matching logic out of the SPFx runtime.
- Read only the already-built HBCentral fallback registry.
- Keep card semantics truthful; do not present fallback records as if they are migrated sites.
- Preserve accessibility and clear link labeling.

## Proof of closure

Provide:

- exact files added or modified
- the final normalized model additions
- the launch precedence logic as implemented
- examples of:
  - a primary-site record
  - a fallback-only record
  - a no-launch record
- screenshots or description of the resulting action states if available

## Constraints

- Do not start generating share links from the UI.
- Do not poll annual sites directly from the web part.
- Do not rework unrelated `project-sites` UI patterns beyond what is required to add truthful fallback behavior.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
