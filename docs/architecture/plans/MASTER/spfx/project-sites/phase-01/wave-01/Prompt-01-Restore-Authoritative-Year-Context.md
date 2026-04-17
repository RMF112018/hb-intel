# Prompt-01-Restore-Authoritative-Year-Context.md

## Objective
Restore an authoritative end-to-end year-context contract for Project Sites so the live runtime actually honors the product promise implied by the manifest and current scope statement.

## Governing authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` (benchmark maturity only where relevant)
- `docs/architecture/reviews/spfx/project-sites/project-sites-ui-kit-compliance-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-search-filter-sort-enhancement.md`

## Inspect these exact repo seams
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/project-sites/src/mount.tsx`
- `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/types.ts`
- any Project Sites docs that describe host-page year behavior

## Current future-state gap to close
Repo truth currently says two conflicting things:
1. the manifest describes the webpart as driven by the hosting page’s `Year` property and a `yearOverride`
2. the live React surface chooses its own default scope from available years and never consumes shell-passed runtime config

The shell already passes `webPartProperties`, but the Project Sites mount boundary ignores the third `config` argument entirely.

## Required implementation outcome
Implement one explicit authoritative resolution model and wire it all the way through. At minimum:

1. Extend the Project Sites app-host mount signature so it deliberately accepts and validates the shell runtime config.
2. Define a typed Project Sites runtime-config contract rather than reading generic blobs ad hoc.
3. Decide and implement the final resolution order for scope authority. Example pattern:
   - valid author override
   - valid host page year context
   - explicit all-projects mode when allowed
   - fallback default year only when no authoritative context exists
4. Surface the resolved context in the UI so users can tell why the current scope is being shown.
5. Remove or repair any dead authoring semantics. Do not leave `yearOverride` declared but nonfunctional.
6. Ensure the shell/property model and the rendered experience say the same thing.

## Closure proof required
- show the final typed runtime-config contract
- show the final resolution order in code comments and docs
- prove the shell passes the needed config and the app consumes it
- prove the UI reflects the resolved source of truth
- update or remove stale docs / manifest wording so repo truth is coherent

## Guardrails
- do not redesign unrelated homepage or shell surfaces
- do not broaden the mission into a generic project hub
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
