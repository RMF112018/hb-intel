# Project Sites Authoritative Year-Context Closure

## Objective

Restore a single trustworthy year-context contract for Project Sites so shell authoring, shell runtime injection, mount consumption, and React scope behavior all agree.

## Final Runtime Contract

Project Sites now consumes a typed shell runtime config contract at mount:

- `webPartId`
- `webPartProperties.yearOverride`
- `hostPageYear`
- pass-through shell fields already injected for other surfaces (`functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, `apiAudience`, `assetBaseUrl`)

Normalization is centralized in `normalizeProjectSitesRuntimeConfig()` and validates year values through `parseProjectSitesRuntimeYear()`.

## Final Authority Order

Initial Project Sites scope now resolves through one explicit order in `resolveInitialProjectSitesScope()`:

1. valid author override (`yearOverride`)
2. valid host page year context (`hostPageYear`)
3. default year fallback (`resolveDefaultYear`, current year if present else newest)
4. explicit `All Projects` fallback only when no year can be resolved

The resolved scope source is persisted in a typed object and rendered in the UI as "Scope source" messaging.

## Shell and Mount Proof

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
  - adds Project Sites property-pane authoring for `yearOverride`
  - derives `hostPageYear` defensively from SharePoint page context
  - passes `hostPageYear` and `webPartProperties` to app mount runtime config
- `apps/project-sites/src/mount.tsx`
  - mount signature is now `mount(el, spfxContext?, config?)`
  - consumes and normalizes typed runtime config
  - passes runtime context into `ProjectSitesRoot`

## UI Source-of-Truth Proof

`ProjectSitesRoot` now:

- resolves initial scope from authoritative runtime context instead of unconditional self-default behavior
- preserves segmented control behavior for user scope changes
- switches "Scope source" to `user-selected` when the user explicitly changes scope
- visibly shows users why the current scope is active
