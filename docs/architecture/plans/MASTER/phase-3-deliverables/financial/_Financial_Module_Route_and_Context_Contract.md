# Financial Module — Route and Context Contract

## Purpose
This document defines the canonical route family and context rules for the Financial module. The goal is durable project-scoped navigation, deep-link safety, predictable re-entry, and honest failure modes.

## 1. Canonical route family
The Financial module should use a project-scoped route family under the Project Hub / Project Context lane.

### Recommended family
`/projects/:projectId/financial`

### Tool sub-routes
- `/projects/:projectId/financial/budget-import`
- `/projects/:projectId/financial/forecast-summary`
- `/projects/:projectId/financial/forecast-checklist`
- `/projects/:projectId/financial/gc-gr`
- `/projects/:projectId/financial/cash-flow`
- `/projects/:projectId/financial/buyout`
- `/projects/:projectId/financial/review`
- `/projects/:projectId/financial/publication`
- `/projects/:projectId/financial/history`

### Contextual deep sub-routes
Examples:
- `/projects/:projectId/financial/forecast-summary/:versionId`
- `/projects/:projectId/financial/review/:reviewId`
- `/projects/:projectId/financial/publication/:publicationId`
- `/projects/:projectId/financial/history/cases/:caseId`

Implementation may refine naming, but the contract must preserve the pattern: **project first, tool second, artifact third**.

## 2. Required route context
At minimum, the module must preserve the following context across navigation where applicable:
- `projectId`
- `reportingPeriod`
- `artifactId`
- `versionId`
- `reviewId`
- `publicationId`
- `caseId`
- selected tab / panel
- return route

### URL vs local state
- durable business identity should live in the route or query parameters where safe
- ephemeral view state may live in local UI state if it can be reconstructed
- return-route contracts should not depend only on transient in-memory state

## 3. Reporting-period contract
Financial routes are not safe without explicit reporting-period posture.

### Rule
The current reporting period must be:
- selected intentionally, or
- resolved from a durable default that is visible to the user

The UI must always show which reporting period the user is working in. Hidden implicit period switching is not acceptable.

### Route-safe period behavior
If the user enters a deep link without a period and the destination requires one:
- the system should resolve the safest valid default
- visibly disclose the selected period
- allow explicit change without losing the originating route

## 4. Version / artifact context
If a tool supports versioned or run-specific artifacts, the route must preserve enough context to reopen the same working object.

### Rules
- version-aware tools should include a durable identifier when opening a specific version
- historical snapshots should not silently drift to the latest version
- "latest" shortcuts are acceptable only when clearly labeled and not used for immutable audit or review destinations

## 5. Deep-link durability
A copied route should reopen the same operational context whenever permissions and artifact existence allow.

### Minimum durability
- same project
- same tool
- same period
- same artifact / case / review / publication where present
- same route-safe mode (history vs active workflow where relevant)

### Honest failure
If the destination cannot be reopened:
- show why (permission, deleted artifact, superseded artifact, invalid period, unavailable lineage)
- offer safe fallback navigation
- avoid silent redirect to a misleading latest-state page

## 6. Switching behavior
### Project switching
When the project changes:
- tool context should remain only if the target project supports equivalent safe context
- otherwise route to the target project's financial home with an explanation where necessary

### Period switching
When the reporting period changes:
- warn if unsaved work or pending action context may be lost
- preserve the same tool where safe
- clear or remap artifact selection only when required
- make stale artifact invalidation visible

### Tool switching
Switching tools should preserve:
- current project
- current reporting period
- known return path
- launch reason when arriving through remediation or review handoff

## 7. Return behavior
Every cross-tool launch should carry a return contract.

### Examples
- audit case -> forecast summary remediation -> return to same case and same finding
- review queue -> source tool correction -> return to same review record
- publication block -> failed validation detail -> return to publication step

The user should not need to manually reconstruct where they came from.

## 8. Re-entry rules
The module should support predictable re-entry after:
- refresh
- authentication renewal
- SharePoint launch
- browser restart where local persistence is supported
- notification deep link

### Re-entry priorities
1. restore project
2. restore tool
3. restore period
4. restore artifact
5. restore last meaningful panel or selection

## 9. SharePoint / SPFx launch contract
SharePoint-native entry points should carry enough context to open the correct PWA route.

### Minimum launch payload
- project identity
- target tool
- artifact reference if present
- reporting period if known
- return hint or origin marker if needed

The launch should not dump the user at a generic module landing page if a more specific destination is known and safe.

## 10. Permission mismatch handling
If the route points to a valid artifact but the current user lacks authority:
- show a truthful permission state
- allow read-only mode if policy permits
- otherwise offer safe fallback to the nearest authorized financial route

Do not silently rewrite an edit-intent route into a read/write surface the user should not access.

## 11. Route recovery
The module must recover gracefully from:
- stale query params
- missing artifacts
- superseded versions
- invalid case / review / publication ids
- closed periods if period policy restricts active work

Recovery should favor:
- truthful explanation
- nearest safe context
- preserved project identity
- preserved reason-for-launch where possible

## 12. Non-negotiable route principles
1. Project-scoped routing is canonical.
2. Period context must be explicit.
3. Deep links must be durable.
4. Historical destinations must remain historically truthful.
5. Return paths are first-class runtime objects, not an afterthought.
