# HB Intel My Dashboard — My Projects Dual-Launch Module Comprehensive Development Plan

**Prepared:** May 13, 2026  
**Artifact status:** Closed-decision development blueprint; no open implementation decisions remain  
**Target surface:** HB Intel **My Dashboard** → **My Work** home surface  
**Target module:** **My Projects** — personalized project launch surface  
**Primary objective:** Display only projects assigned to the authenticated user across the approved project-team role taxonomy, with **two distinct actionable links per project**:
1. **SharePoint** — project site or legacy fallback folder, depending on source resolution  
2. **Procore** — assembled from `procoreProject` using  
   `https://app.procore.com/{procoreProject}/project/home`

---

# 1. Executive Verdict

## 1.1 Final recommendation

Proceed with a full implementation of a **flagship-grade My Projects dual-launch module** inside the **My Dashboard / My Work home surface**.

The module must:

- treat **both** HB Central source lists as assignment-capable sources after schema provisioning:
  - `Projects`
  - `Legacy Project Fallback Registry`
- introduce a **canonical multi-value UPN role model** across both lists for fourteen project-team roles;
- standardize `procoreProject` as the **raw Procore project identifier** needed to construct a direct Procore launch URL;
- render a **premium, highly polished launch surface** that materially exceeds the existing Project Sites application in hierarchy, composition, interaction quality, state handling, and responsiveness;
- align to the **HB Intel Homepage quality standard** as a benchmark-grade UI/UX bar, without cloning homepage-specific composition or importing homepage-only implementation patterns into My Dashboard;
- consume a protected backend read model:
  ```http
  GET /api/my-work/me/project-links
  ```
- return normalized, actor-scoped data through a new typed My Work read-model contract;
- provide **two explicit actions per rendered project**:
  - **Open SharePoint Site** or **Open SharePoint Folder**
  - **Open Procore**

## 1.2 Final product identity

### User-facing module title
> **My Projects**

### Surface descriptor
> Your assigned projects, ready to open in SharePoint and Procore.

### Internal module ID
```ts
'my-project-links'
```

### Backend route
```http
GET /api/my-work/me/project-links
```

### Frontend client method
```ts
getMyProjectLinks()
```

## 1.3 Final architecture decision

The implementation must use a **backend-mediated, me-scoped, read-model-first architecture**:

```text
My Dashboard SPFx UI
  -> My Work read-model client
  -> protected HB Intel backend route
  -> authenticated actor UPN from validated token claims
  -> Projects list role-assignment scan
  -> Legacy Project Fallback Registry role-assignment scan
  -> source reconciliation and dedupe
  -> SharePoint and Procore launch assembly
  -> MyProjectLinksReadModel
  -> premium My Projects launch surface
```

### Binding prohibitions

The implementation must **not**:

- call HB Central lists directly from the React surface;
- allow user/UPN/email override parameters in path or query;
- embed or clone the Project Sites UI;
- make the entire row a single link when two independent launch actions exist;
- rely on guessed list-stage semantics to suppress records;
- treat a Procore link as proof that the user has downstream Procore authorization;
- leave raw matching ambiguity or source precedence to UI components.

---

# 2. Governing Decisions — Fully Closed

The following decisions are binding.

| Decision Area | Final Decision |
|---|---|
| Product name | **My Projects** |
| Product placement | My Work home-surface flagship supporting module |
| Product form | Premium launch surface, not a project directory clone |
| Backend route | `GET /api/my-work/me/project-links` |
| Client method | `getMyProjectLinks()` |
| Auth actor | `auth.claims.upn`, normalized |
| UPN meaning | Entra ID sign-in name in email-like format, e.g. `bfetting@hedrickbrothers.com` |
| Assignment sources | **Both** Projects and Legacy Fallback Registry |
| Multi-role support | Fourteen approved project-team role fields in both lists |
| Role storage | JSON-serialized `string[]` stored in SharePoint `MultiLineText` / Note columns |
| Procore field | `procoreProject` stores the raw Procore project identifier/path token |
| SharePoint action | Site URL for Projects rows; folder URL for legacy-only rows; primary site wins for merged rows |
| Procore action | Constructed as `https://app.procore.com/{procoreProject}/project/home` |
| Legacy-only eligibility | Allowed when Registry row is active, approved/matched, and actor UPN appears in role arrays |
| Merged-row precedence | Projects row wins for display identity, assignments, and `procoreProject`; Registry contributes fallback folder/provenance |
| Dedupe | One rendered project record per reconciled project |
| Initial visible count | Six rendered projects before expansion |
| Expand behavior | Inline “View all My Projects” disclosure, not separate route/module in MVP |
| Row click behavior | No row-level omnibus click; exactly two explicit launch action controls |
| UI quality bar | Must exceed Project Sites and target flagship / benchmark-grade doctrine acceptance |
| Scorecard target | `48+/56` with no hard-stop failures |
| Additional assignment index | No new persistent assignment-index list in this implementation |
| Query strategy | Backend paged source reads + in-memory normalized role matching; no fragile UI-side filtering |
| Source read ceiling | 25,000 rows per source; ceiling hit => `partial` envelope with warning |
| Legacy discovery mismatch bug | The existing forced registry write override for match fields must be corrected because My Projects eligibility depends on truthful registry states |
| Open decisions | None |

---

# 3. Current Repo Truth and Required Directional Corrections

## 3.1 My Dashboard is already a real My Work shell

The live repo already establishes My Dashboard as a standalone SPFx app with:
- `MyDashboardApp`
- `MyWorkShell`
- home/focused-module state architecture
- bento/grid layout ownership
- read-model planning conventions.

This new module must **extend** the My Work home surface rather than invent an unrelated side architecture.

## 3.2 My Work read-model precedent is already locked

The repo already contains:
- `packages/models/src/myWork/`
- My Work envelope semantics
- route-map planning posture
- backend/fixture client direction
- protected me-scoped endpoint conventions.

The My Projects module must be added as another route-specific My Work BFF/read-model contract, not as bespoke ad hoc list handling.

## 3.3 Project Sites is a semantics precedent, not the UI target

The current Project Sites implementation proves useful patterns:
- source classification,
- Projects/Legacy Registry reconciliation,
- launch target precedence,
- fallback candidate selection,
- parsing of multi-user text fields,
- deterministic dedupe.

However, the new My Projects module must **not** inherit Project Sites’ UI ceiling. The module’s UI must materially exceed Project Sites in:
- visual authority,
- interaction polish,
- clarity of purpose,
- responsiveness,
- dual-action usability,
- premium state handling,
- hosted SharePoint credibility.

## 3.4 Projects schema is currently narrower than the target role model

The current Projects schema includes:
- scalar role fields such as `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`
- one multi-value role-like field `supportingEstimatorUpns`
- `procoreProject` as a text column.

This must be evolved to the canonical fourteen-role multi-value model described in this plan.

## 3.5 Legacy Fallback Registry is not yet role-complete

The current Legacy Project Fallback Registry does **not** include:
- the fourteen role-assignment UPN arrays,
- `procoreProject`.

Those columns must be provisioned, documented, and incorporated into the writer/backfill/read-model logic.

## 3.6 Current Procore semantics contain a contract conflict

The repo currently contains two conflicting ideas:
- the SharePoint schema has a text column named `procoreProject`;
- the provisioning-domain model treats `procoreProject` as `'Yes' | 'No'`.

This plan resolves that conflict decisively:

> **Target architecture standard:**  
> `procoreProject` means the raw Procore project identifier/path token required to construct the launch URL. It is **not** a Yes/No flag.

Any workflow that needs a Yes/No concept must derive that truth from presence/absence of `procoreProject` or use a separate dedicated field in a future workflow-specific refactor. The My Projects implementation must update repo contracts/docs/tests so `procoreProject` is no longer treated as a boolean-like enumerated text field.

## 3.7 Legacy discovery currently hard-writes match fields in a way that becomes unsafe

The current legacy fallback discovery writer force-writes:
- `MatchStatus: 'matched'`
- `MatchConfidence: 'high'`
- `MatchMethod: 'no-match'`

regardless of the underlying matching result. That posture is incompatible with a module that relies on registry match semantics for eligibility, merged-vs-legacy-only classification, and launch confidence.

### Binding correction
This implementation must correct the writer so that:
- actual matching-engine output is persisted,
- `matched`, `unmatched`, `review-required`, `ignored`, and `disabled` states retain their intended meaning,
- My Projects only consumes registry rows that pass the eligibility rules below.

---

# 4. Target Product Definition

# 4.1 Objective

**My Projects** is a personalized launch surface that gives the signed-in user immediate access to the projects where they are assigned in HB Central, with direct project entry into:

1. **SharePoint**
   - modern project site, or
   - legacy fallback folder, where applicable;

2. **Procore**
   - direct project home URL constructed from the stored `procoreProject` identifier.

# 4.2 Product scope

The module is:
- personal,
- read-only,
- action-oriented,
- role-aware,
- launch-focused.

It is **not**:
- a project directory,
- a reporting dashboard,
- a full Project Sites replacement,
- a SharePoint project administration screen,
- a Procore access-permission verifier.

# 4.3 Module success statement

Done means:

> A user opens My Dashboard and immediately sees a premium My Projects surface that accurately reflects their assigned projects across the approved role taxonomy, shows exactly where each project can be opened, and gives two clear independent launch actions — SharePoint and Procore — with no source ambiguity, no false eligibility, and no generic enterprise-card UI outcome.

---

# 5. Canonical Project-Team Role Taxonomy

# 5.1 Binding role set

Both lists must support **multi-value UPN arrays** for the following roles:

| Role | Canonical Internal Name | Display Name |
|---|---|---|
| Lead Estimator | `leadEstimatorUpns` | Lead Estimator UPNs |
| Estimator | `estimatorUpns` | Estimator UPNs |
| IDS Manager | `idsManagerUpns` | IDS Manager UPNs |
| Project Accountant | `projectAccountantUpns` | Project Accountant UPNs |
| Project Administrator | `projectAdministratorUpns` | Project Administrator UPNs |
| Project Coordinator | `projectCoordinatorUpns` | Project Coordinator UPNs |
| Superintendent | `superintendentUpns` | Superintendent UPNs |
| Lead Superintendent | `leadSuperintendentUpns` | Lead Superintendent UPNs |
| Project Manager | `projectManagerUpns` | Project Manager UPNs |
| Lead Project Manager | `leadProjectManagerUpns` | Lead Project Manager UPNs |
| Project Executive | `projectExecutiveUpns` | Project Executive UPNs |
| Safety Coordinator | `safetyCoordinatorUpns` | Safety Coordinator UPNs |
| QC Manager | `qcManagerUpns` | QC Manager UPNs |
| Warranty Manager | `warrantyManagerUpns` | Warranty Manager UPNs |

# 5.2 Role identifiers returned to the UI

The backend read model must use stable role IDs:

```ts
type MyProjectAssignmentRoleId =
  | 'lead-estimator'
  | 'estimator'
  | 'ids-manager'
  | 'project-accountant'
  | 'project-administrator'
  | 'project-coordinator'
  | 'superintendent'
  | 'lead-superintendent'
  | 'project-manager'
  | 'lead-project-manager'
  | 'project-executive'
  | 'safety-coordinator'
  | 'qc-manager'
  | 'warranty-manager';
```

# 5.3 Matching rule

A project is assigned to the authenticated actor when the normalized actor UPN appears in **any** approved role field on the authoritative source record.

If the actor appears in multiple fields:
- the project appears **once**;
- all matched roles are preserved in `assignmentRoles[]`;
- UI displays up to two role pills inline and collapses additional roles into `+N`.

---

# 6. Canonical UPN Storage Contract

# 6.1 Final storage decision

All fourteen role fields in both lists must be stored as:

- **SharePoint type:** `MultiLineText` / Note
- **Serialization:** JSON-serialized `string[]`
- **Required:** No
- **Indexed:** No
- **Default write form:** `'[]'`

### Example stored value
```json
["bfetting@hedrickbrothers.com","jsmith@hedrickbrothers.com"]
```

# 6.2 Why this is the final decision

This plan intentionally uses JSON-array UPN strings rather than SharePoint multi-person fields because:

- the current repo already uses JSON-array UPN/text storage patterns for fields such as:
  - `viewerUPNs`
  - `groupMembers`
  - `groupLeaders`
  - `supportingEstimatorUpns`
  - `sageAccessUpns`
- the module needs deterministic string UPN normalization and matching;
- both source lists need an identical contract;
- backend logic, backfill, and source-preservation behavior are simpler and more auditable with one shared JSON-array contract;
- multi-value columns would not solve the core correctness requirement and would introduce different read/write semantics from the established repo pattern.

# 6.3 Canonical normalization before persistence

When writing any role-array field:

1. trim whitespace;
2. lowercase;
3. discard empty values;
4. discard tokens without a plausible `local@domain` shape;
5. deduplicate;
6. sort ascending for deterministic storage;
7. serialize as a JSON array.

### Example normalization

Input:
```ts
[
  " BFetting@HedrickBrothers.com ",
  "bfetting@hedrickbrothers.com",
  "",
  "not-an-email"
]
```

Persisted:
```json
["bfetting@hedrickbrothers.com"]
```

# 6.4 Canonical parsing on read

Read helpers must support:
- proper JSON array string,
- malformed but salvageable JSON array string,
- existing comma-delimited strings where migration data may exist,
- existing semicolon-delimited strings where migration data may exist,
- already materialized arrays from adapter layers,
- null/undefined as empty arrays.

The canonical writer always stores JSON arrays. Permissive parsing exists only to protect migration and older rows.

---

# 7. Schema Provisioning Plan

# 7.1 Projects list — required target changes

## 7.1.1 New canonical role fields

Provision the fourteen fields listed in §5.1 as `MultiLineText` / Note columns with JSON-array semantics.

## 7.1.2 Existing legacy role fields retained during transition

Do not remove these existing Projects columns in this implementation:
- `projectExecutiveUpn`
- `projectManagerUpn`
- `leadEstimatorUpn`
- `supportingEstimatorUpns`

They become **compatibility fields** during the transition and are not the long-term role taxonomy.

## 7.1.3 Migration/backfill mapping

Existing Projects rows must be backfilled as follows:

| Existing Field | New Canonical Field |
|---|---|
| `leadEstimatorUpn` | `leadEstimatorUpns` |
| `supportingEstimatorUpns` | `estimatorUpns` |
| `projectManagerUpn` | `projectManagerUpns` |
| `projectExecutiveUpn` | `projectExecutiveUpns` |

All backfilled values must pass the normalization rules in §6.3.

## 7.1.4 Runtime compatibility rule

During the implementation window:

- read-model assignment matching must use canonical role fields first;
- if a corresponding canonical role field is empty, it may fall back to the legacy field shown above;
- final output must merge both sources without duplicate role pills.

This guarantees existing Projects data remains visible before or during backfill.

## 7.1.5 Target updates required in repo contracts

Update:
- Projects list schema docs,
- `projects-list-contract.ts`,
- SharePoint field mapping tests,
- projects mapper tests,
- any project setup persistence types that enumerate list fields,
- docs that state only the old limited role set.

# 7.2 Legacy Project Fallback Registry — required target changes

## 7.2.1 New role fields

Provision the same fourteen role fields from §5.1 with identical storage semantics.

## 7.2.2 New Procore field

Provision:

| Internal Name | Display Name | Type | Required | Indexed | Semantics |
|---|---|---|---|---|---|
| `procoreProject` | Procore Project | Text | No | No | Raw Procore project identifier/path token |

## 7.2.3 Registry writer and descriptor updates

Update:
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- provisioning docs / admin guides
- schema extraction/reference docs
- registry models under `@hbc/models/provisioning`

## 7.2.4 Registry matched-row mirroring

For registry rows that are matched to a Projects list row:
- role arrays mirror the canonical Projects role arrays;
- `procoreProject` mirrors the Projects `procoreProject`;
- Projects is authoritative;
- registry values are refreshed during matched-row backfill and matching-aware sync.

## 7.2.5 Registry legacy-only rows

For legacy-only rows that have no resolved Projects authority:
- role arrays are operator-maintained directly in the registry;
- `procoreProject` is operator-maintained directly in the registry;
- discovery sync must preserve those operator-managed fields and must **never** overwrite them with blank values.

## 7.2.6 Registry field preservation during discovery upsert

The discovery writer must:
- update discovery/matching/location metadata;
- preserve operator-maintained role arrays and `procoreProject` when no Projects-authoritative mirror exists;
- overwrite role arrays and `procoreProject` from Projects only when a matched Projects row is present and authoritative.

# 7.3 `procoreProject` target semantics across both lists

## 7.3.1 Binding meaning

`procoreProject` means:

> the raw Procore project identifier/path token used to construct the project home URL.

## 7.3.2 Prohibited meanings

`procoreProject` must **not** mean:
- `'Yes'`
- `'No'`
- a full URL
- a label
- a launch-state enum.

## 7.3.3 Existing repo conflict remediation

Any current contract treating:
```ts
procoreProject?: 'Yes' | 'No'
```
must be revised.

### Target replacement
```ts
procoreProject?: string;
```

### Derived boolean, if needed
Any UI/workflow needing “Has a Procore project?” should derive:
```ts
Boolean(procoreProject?.trim())
```
or introduce a separate workflow-specific field in a later initiative. This implementation does **not** keep the old Yes/No semantics on `procoreProject`.

## 7.3.4 Procore token validation

A `procoreProject` value is valid for launch construction only when:
- it is non-empty after trimming;
- it does not contain whitespace;
- it matches:
  ```regex
  ^[A-Za-z0-9_-]+$
  ```

If invalid:
- do not construct the Procore URL;
- mark the Procore action unavailable;
- include a structured warning in the read model.

## 7.3.5 Procore URL construction

Construct exactly:

```ts
const procoreLaunchUrl =
  `https://app.procore.com/${encodeURIComponent(procoreProject)}/project/home`;
```

The UI may display:
> Open Procore

The read model owns URL construction. The UI does not rebuild the URL.

---

# 8. Source Authority, Eligibility, Reconciliation, and Dedupe

# 8.1 Record source classes

The My Projects read model must support:

```ts
type MyProjectRecordSource =
  | 'projects-only'
  | 'merged'
  | 'legacy-only';
```

# 8.2 Source authority matrix

| Record Class | Display Identity | Assignment Authority | Procore Authority | SharePoint/Fallback Link Authority |
|---|---|---|---|---|
| `projects-only` | Projects | Projects | Projects | Projects `SiteUrl` |
| `merged` | Projects | Projects | Projects | Projects `SiteUrl` first; Registry fallback folder second |
| `legacy-only` | Registry | Registry | Registry | Registry folder URL |

# 8.3 Projects-only eligibility

A Projects row appears when:
- actor UPN matches at least one canonical Projects role array, or compatible legacy fallback during migration;
- row can be normalized into a valid project identity.

A Projects row does **not** require:
- a SharePoint site URL,
- a Procore project ID,
- a specific `ProjectStage`.

Missing links become honest unavailable action states, not hidden records.

# 8.4 Registry merged eligibility

A Registry row enriches a Projects row when:
- `IsActive === true`;
- `MatchStatus === 'matched'`;
- it resolves to the Projects row through:
  1. strong linkage: `MatchedProjectListItemId`,
  2. deterministic fallback linkage: `ProjectNumber + LegacyYear`;
- it has a valid fallback `FolderWebUrl` when needed.

Merged-row display still depends on the **Projects assignment** rule, not registry role arrays.

# 8.5 Registry legacy-only eligibility

A Registry row may appear as `legacy-only` when:
- `IsActive === true`;
- `MatchStatus === 'matched'`;
- it does not resolve to an authoritative Projects row;
- actor UPN matches at least one canonical Registry role array;
- it has enough identity fields to produce a stable record key.

A legacy-only row may display even when:
- `procoreProject` is blank,
- fallback folder URL is unavailable or invalid.

The row remains visible as an assigned project, but actions truthfully degrade.

# 8.6 Merged-row precedence

For a matched Projects + Registry project:
- Project name → Projects
- Project number → Projects
- project stage → Projects
- role arrays → Projects
- `procoreProject` → Projects
- site URL → Projects first
- fallback folder URL → Registry second
- source badge → `Merged`
- launch label → derived from actual resolved launch target.

If Projects has no valid `SiteUrl` and Registry has a valid fallback folder, the SharePoint action becomes:
> Open SharePoint Folder

If both are present:
- the SharePoint action uses the Projects site URL;
- the fallback folder remains provenance data only unless a future expanded detail view exposes it.

# 8.7 Dedupe rules

A user sees **one row per reconciled project**.

Dedupe precedence:
1. Projects row + strongly linked Registry row = one `merged` row.
2. Projects row + heuristically linked Registry row = one `merged` row.
3. Standalone Projects row = one `projects-only` row.
4. Standalone Registry row = one `legacy-only` row.

Record key strategy:
```ts
project:{projectsListItemId}
legacy:{projectNumber}:{legacyYear}:{registryItemId}
```

When a legacy-only row becomes merged later:
- it should collapse into the Projects-backed `project:{id}` identity in the read model;
- the UI should not briefly show duplicates after refresh.

---

# 9. Backend Read-Model Architecture

# 9.1 Route contract

```http
GET /api/my-work/me/project-links
```

## No query parameters in MVP
The route does not accept:
- user,
- email,
- UPN,
- principal,
- role filters,
- project ID,
- list source override.

# 9.2 Actor resolution

The route derives the authenticated actor from validated backend auth context:

```ts
const actorUpn = normalizeUpn(auth.claims.upn);
```

If no usable UPN is present:
- return HTTP 200 with My Work envelope status:
  ```ts
  'principal-unresolved'
  ```

Do not invent a fallback actor from request query or frontend config.

# 9.3 Read provider pipeline

The backend service must execute the following pipeline:

1. Resolve actor UPN.
2. Read Projects list candidate fields, paged, selected-field only.
3. Read Registry candidate fields, paged, selected-field only.
4. Normalize canonical role arrays and transitional legacy role fields.
5. Determine Projects assignments.
6. Determine Registry legacy-only assignments.
7. Resolve matched Registry candidates against Projects rows.
8. Build merged/projects-only/legacy-only records.
9. Resolve SharePoint action.
10. Resolve Procore action.
11. Sort final records.
12. Build summary counts.
13. Return `MyProjectLinksReadModel`.

# 9.4 Paged source read ceilings

No new persistent assignment-index list is introduced in this initiative.

Instead:
- backend source reads are paged;
- each source has a hard drain ceiling of **25,000 rows**;
- if a source reaches the ceiling before exhaustion:
  - return a `partial` envelope,
  - emit warning code:
    ```ts
    'assignment-source-bounded'
    ```
  - include the already resolved assigned projects rather than failing closed into an empty panel.

# 9.5 Source failure policy

| Scenario | Envelope Status | Result |
|---|---|---|
| Projects succeeds; Registry succeeds | `available` | Full result |
| Projects succeeds; Registry fails | `partial` | Projects-only and any already available data; warning |
| Projects fails; Registry succeeds | `partial` | Legacy-only assigned rows; warning |
| Both fail | `source-unavailable` | No misleading empty result |
| Actor unresolved | `principal-unresolved` | Guidance state |
| Frontend cannot consume backend route | `backend-unavailable` fixture fallback | Existing My Work client pattern |

# 9.6 No direct SharePoint filtering by JSON role fields as correctness source

The backend may use source-side narrowing when safe, but correctness must come from backend normalized matching because:
- the role fields are JSON-array text values;
- the Projects list currently has no indexed non-hidden business fields in the extracted schema snapshot;
- Graph filtering works best on indexed fields and cannot substitute for deterministic matching across fourteen JSON-backed arrays.

---

# 10. Read-Model Contract

# 10.1 Route key

```ts
export const MY_WORK_READ_MODEL_ROUTE_PATHS = {
  ...existingRoutes,
  'project-links': 'my-work/me/project-links',
} as const;
```

# 10.2 Client interface

```ts
interface IMyWorkReadModelClient {
  getMyWorkHome(): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>>;
  getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>>;
  getMyProjectLinks(): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>>;
}
```

# 10.3 Project-links read model

```ts
interface MyProjectLinksReadModel {
  readonly moduleId: 'my-project-links';
  readonly actor: {
    readonly principalName: string;
    readonly displayName?: string;
  };
  readonly summary: {
    readonly assignedProjectCount: number;
    readonly dualLaunchReadyCount: number;
    readonly sharePointReadyCount: number;
    readonly procoreReadyCount: number;
    readonly noSharePointLaunchCount: number;
    readonly noProcoreLaunchCount: number;
    readonly projectsOnlyCount: number;
    readonly mergedCount: number;
    readonly legacyOnlyCount: number;
  };
  readonly items: readonly MyProjectLinkItem[];
  readonly sourceReadiness: {
    readonly projects: MyWorkReadModelSourceStatus;
    readonly legacyFallbackRegistry: MyWorkReadModelSourceStatus;
  };
}
```

# 10.4 Project item DTO

```ts
interface MyProjectLinkItem {
  readonly recordKey: string;
  readonly source: 'projects-only' | 'merged' | 'legacy-only';
  readonly projectName: string;
  readonly projectNumber: string;
  readonly projectStage?: string;
  readonly assignmentRoles: readonly MyProjectAssignmentRoleId[];
  readonly sharePointAction: {
    readonly state: 'available' | 'unavailable';
    readonly kind: 'project-site' | 'legacy-folder' | 'none';
    readonly label:
      | 'Open SharePoint Site'
      | 'Open SharePoint Folder'
      | 'SharePoint unavailable';
    readonly href?: string;
  };
  readonly procoreAction: {
    readonly state: 'available' | 'unavailable';
    readonly label: 'Open Procore' | 'Procore unavailable';
    readonly procoreProject?: string;
    readonly href?: string;
  };
  readonly provenance: {
    readonly projectsListItemId?: number;
    readonly legacyRegistryItemId?: number;
    readonly legacyMatchedProjectListItemId?: number;
    readonly fallbackMatchMethod?: string;
    readonly fallbackMatchConfidence?: string;
  };
  readonly warnings: readonly MyProjectLinkWarning[];
}
```

# 10.5 Warning DTO

```ts
type MyProjectLinkWarningCode =
  | 'sharepoint-launch-unavailable'
  | 'procore-launch-unavailable'
  | 'procore-project-invalid'
  | 'assignment-source-bounded'
  | 'projects-source-partial'
  | 'legacy-registry-source-partial'
  | 'legacy-match-state-excluded'
  | 'legacy-role-data-preserved'
  | 'schema-transition-legacy-role-fallback-used';

interface MyProjectLinkWarning {
  readonly code: MyProjectLinkWarningCode;
  readonly message: string;
}
```

# 10.6 Sorting

Sort final rendered items in the following order:

1. projects with both SharePoint and Procore launch actions available;
2. projects with SharePoint only;
3. projects with Procore only;
4. projects with neither action available;
5. within each bucket:
   - project name ascending,
   - project number ascending,
   - record key ascending as final deterministic tiebreak.

---

# 11. Premium UI/UX Target — Must Exceed Project Sites

# 11.1 Quality bar

The My Projects module must be built to a **flagship-grade SPFx standard**:
- benchmarked against the **HB Intel Homepage** level of composition and polish;
- scored against the repo’s SPFx doctrine acceptance framework;
- target **48+/56** with no hard-stop failures;
- materially better than the current Project Sites app in product identity, action clarity, state handling, and hosted visual outcome.

## Alignment principle

The module must align with HB Intel Homepage as a **quality benchmark**, not as a literal visual clone.  
It remains a My Dashboard / My Work operational surface.

# 11.2 Why Project Sites cannot be the UI ceiling

Project Sites is a useful directory/productivity surface, but My Projects requires:
- clearer urgency of purpose,
- dual-action CTA hierarchy,
- more premium surface materiality,
- stronger personal/work-context framing,
- a more authored flagship composition,
- more sophisticated unavailable/degraded link semantics.

The implementation must not simply render:
- a Project Sites-style filter bar,
- a grid of utility cards,
- two links wedged into existing Project Site cards.

# 11.3 Final surface composition

The My Projects module renders as a **full-width flagship launch surface** within the My Work home bento canvas.

## Composition zones

### Zone A — Signature module header
Contains:
- eyebrow: `My Work`
- title: `My Projects`
- concise purpose statement
- summary metric cluster:
  - Assigned Projects
  - Dual Launch Ready
  - SharePoint Ready
  - Procore Ready

### Zone B — Source confidence and degraded-state banner
Displays only when useful:
- partial source warning,
- principal unresolved,
- registry enrichment degraded,
- bounded-source warning.

Must be compact, premium, and truthful — not developer copy.

### Zone C — Launch list
A polished list of up to **six** launch rows by default.

Each row includes:
- source badge:
  - `Projects`
  - `Projects + Legacy`
  - `Legacy`
- project number
- project name
- matched role chips
- two separate CTA groups:
  - SharePoint action
  - Procore action
- micro-state treatment for unavailable links.

### Zone D — Inline expansion
If more than six items exist:
- render:
  > View all My Projects
- expands inline within the same surface;
- animation must respect reduced-motion preferences;
- no separate modal or secondary page in MVP.

# 11.4 Launch row design

## Desktop / large layout
Each project row should function like a premium operational launch strip:
- left accent/provenance rail,
- identity stack,
- role chips,
- right-aligned dual action group.

The layout must feel like a deliberate enterprise launch console, not a generic card.

## Compact layout
On tablet portrait and phone:
- identity stack first,
- role chips second,
- SharePoint and Procore actions stack or form a two-button full-width row only when tap targets remain credible.

# 11.5 Action controls

## SharePoint action labels
- `Open SharePoint Site`
- `Open SharePoint Folder`
- disabled label: `SharePoint unavailable`

## Procore action labels
- `Open Procore`
- disabled label: `Procore unavailable`

## Link behavior
When available:
- open in a new tab;
- use safe external-link attributes:
  - `target="_blank"`
  - `rel="noopener noreferrer"`

## Disabled affordances
Unavailable states must remain visible but non-deceptive:
- no fake `href`,
- tooltip or micro-help may explain why unavailable,
- iconography distinguishes inactive from active states.

# 11.6 Source badge treatment

Use understated but intentional source indicators:
- Projects row: `Project Site`
- merged fallback-aware row: `Site + Legacy`
- legacy-only row: `Legacy Folder`

Do not overload the UI with migration jargon.

# 11.7 Role chip treatment

- show up to two matched roles inline;
- render `+N` overflow when more roles match;
- tooltip/popup may reveal remaining roles;
- role chips must remain readable at compact widths;
- do not show raw internal field names.

# 11.8 Premium interaction expectations

The module should use approved premium interaction tools where materially beneficial:
- refined reveal/transition choreography,
- premium hover/press treatment for active actions,
- polished accessible tooltips for unavailable or overflow role states,
- deliberate separation surfaces/rhythm.

The implementation must remain restrained, not theatrical.

# 11.9 Required state set

The My Projects surface must have professional states for:

1. Loading
2. Available with 1–6 projects
3. Available with >6 projects
4. No assigned projects
5. Mixed action availability
6. SharePoint unavailable for one or more rows
7. Procore unavailable for one or more rows
8. Source partial
9. Source unavailable
10. Principal unresolved
11. Backend unavailable fixture fallback
12. Bounded-source partial result

# 11.10 Copy posture

Use end-user language, not developer diagnostics.

### Empty state
> No assigned projects were found for your current project-role assignments.

### Partial state
> Your assigned projects are available. Some launch destinations could not be fully verified.

### Principal unresolved
> We could not confirm your project assignment identity for this view.

### Bounded-source partial
> Your project list is available, but the source inventory exceeded the current review limit. Some assignments may not yet be shown.

# 11.11 No generic card-grid outcome

The dominant posture must **not** be:
- a repeated white-card wall,
- a filter panel copied from Project Sites,
- a low-density “directory page” inside My Dashboard.

The accepted posture is:
- flagship surface,
- strong launch hierarchy,
- dual-action clarity,
- premium operational composition.

---

# 12. Breakpoint and Container-Fit Contract

# 12.1 Layout modes

The module should align with My Dashboard’s established responsive mode vocabulary:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

# 12.2 Surface footprint in My Work home

Use a full-row footprint for the My Projects surface.

| Mode family | Footprint |
|---|---|
| 12-column layouts | `12` |
| 10-column layouts | `10` |
| 8-column layouts | `8` |
| 6-column layouts | `6` |
| 2-column/tablet portrait | full available width |
| phone | full available width |

# 12.3 Row composition rules

| Mode | Layout |
|---|---|
| Ultrawide / Desktop | identity + roles + dual actions in one authoritative horizontal row |
| Large / Standard Laptop | horizontal row; actions may compress slightly but not collapse |
| Small Laptop / Tablet Landscape | identity and role chips remain left; dual actions can wrap within controlled area |
| Tablet Portrait | launch row becomes stacked identity block + action row |
| Phone | single-column launch card/strip with actions stacked or evenly split if targets remain credible |

# 12.4 Interaction safety

- no critical action hidden on hover;
- keyboard order remains:
  1. project identity context,
  2. SharePoint action,
  3. Procore action,
  4. disclosure controls;
- touch targets remain credible at handheld widths;
- no horizontal scrolling required for primary content or actions.

# 12.5 Expansion behavior by breakpoint

When `View all My Projects` is activated:
- expansion remains inside the module;
- in compact modes, rows continue stacking;
- no height-jank that shifts focus unpredictably;
- collapse returns focus to the disclosure control.

---

# 13. UI Doctrine and Scorecard Requirements

# 13.1 Acceptance tier

This module is treated as a **flagship / benchmark-grade SPFx surface**.

### Required score target
- **48+/56**
- no hard-stop failures
- evidence-backed closure.

# 13.2 Required doctrinal alignment

The implementation must comply with:
- SPFx host-aware polish,
- token discipline,
- anti-generic-card posture,
- container-aware breakpoint design,
- complete state model,
- evidence-backed closure,
- accessibility and keyboard requirements,
- authoring/runtime resilience.

# 13.3 Homepage alignment interpretation

The module must align with the **HB Intel Homepage** bar by delivering:
- visibly authored composition,
- strong visual hierarchy,
- material hosted runtime polish,
- purposeful use of available width,
- refined motion/iconography,
- robust empty/loading/error states,
- benchmark-level responsiveness.

It must **not**:
- clone the homepage hero,
- import homepage-only layout semantics,
- replace the My Work shell with homepage entry-stack patterns.

# 13.4 Hard-stop failures

The module may not close if any of the following remain:
- generic enterprise card-grid outcome;
- weak or ambiguous launch affordances;
- row-level single-click ambiguity with two destinations;
- broken or deceptive disabled actions;
- missing degraded-state handling;
- no hosted SharePoint validation;
- weak mobile/touch layout;
- inaccessible keyboard order;
- actor override query/path;
- unresolved Procore semantic conflict;
- schema provisioned without backfill/write-path strategy.

---

# 14. Implementation Workstreams and Sequence

# Workstream 0 — Repo-truth recheck and scope lock

## Objective
Reconfirm current repo state before code changes and lock the plan as the execution source.

## Required outputs
- repo-truth audit note,
- field/schema gap register,
- current vs target file map,
- explicit lock that this plan supersedes the prior narrower project-links plan.

---

# Workstream 1 — Canonical role schema expansion

## Scope
- Projects list schema contract expansion
- Legacy Registry schema contract expansion
- shared role taxonomy constants/models

## Required changes
- define fourteen canonical role fields;
- update schema docs;
- update Projects mapping contracts;
- update registry descriptors;
- create tests verifying all fields exist in descriptors/contracts.

---

# Workstream 2 — Procore contract reconciliation

## Scope
- convert canonical `procoreProject` semantics to raw project identifier string;
- update conflicting models/docs/tests.

## Required changes
- `IProjectSetupRequest.procoreProject?: string`;
- Projects list contract comments and types updated;
- any Yes/No UI or docs refactored;
- mapper/tests updated;
- registry `procoreProject` provisioning added.

---

# Workstream 3 — Data migration and backfill

## Scope
- Projects list existing field migration
- Registry matched-row mirroring
- manual/ops preservation for legacy-only registry rows

## Required changes
- backfill Projects canonical fields from legacy role fields:
  - lead estimator,
  - estimator,
  - project manager,
  - project executive;
- add matched registry backfill from Projects;
- preserve operator-entered legacy-only role arrays and Procore ID;
- add idempotent repeat-run behavior;
- produce migration summary counts.

---

# Workstream 4 — Legacy discovery writer correction and enrichment

## Scope
- fix truthful match-state persistence;
- enrich matched registry rows with Projects-authoritative role arrays and Procore ID;
- preserve legacy-only operator-managed fields.

## Required changes
- remove forced `matched/high/no-match` override;
- persist actual matching decision;
- add matched-row mirror hydration;
- preserve manual fields when no authoritative Projects row exists;
- update writer tests.

---

# Workstream 5 — My Work models, fixtures, and route map

## Scope
- new `MyProjectLinksReadModel`
- new route key
- fixture matrix

## Required changes
- new My Work model file or additive model family under `packages/models/src/myWork/`;
- route map update:
  - `'project-links': 'my-work/me/project-links'`;
- fixture states covering all UI scenarios;
- model purity tests.

---

# Workstream 6 — Backend project-links provider and route

## Scope
- protected endpoint
- source reads
- assignment matching
- source reconciliation
- dual-link assembly

## Required changes
- provider/service under backend functions host path consistent with My Work read-model conventions;
- route registration;
- auth actor resolution;
- 25,000-row per-source drain ceiling;
- sorting and summary generation;
- route tests.

---

# Workstream 7 — Frontend read-model client

## Scope
- client interface
- fixture client
- backend client
- fallback semantics

## Required changes
- `getMyProjectLinks()`;
- backend route URL construction;
- `backend-unavailable` fallback handling;
- fixture consumption tests.

---

# Workstream 8 — Flagship My Projects UI surface

## Scope
- home-surface integration
- premium surface layout
- dual-action rows
- state rendering

## Required changes
- full-width My Projects module in My Work home;
- summary header and metric strip;
- launch row system;
- role chips and overflow treatment;
- SharePoint/Procore actions;
- all state variants;
- disclosure expansion;
- container-aware responsive choreography.

---

# Workstream 9 — Validation, hosted evidence, and closure

## Required proof
- schema contract validation,
- migration/backfill proof,
- unit and route tests,
- UI tests,
- hosted My Dashboard screenshots,
- scorecard using flagship target,
- closure checklist.

---

# 15. Target File Map

The exact implementation may adjust for current repo structure, but the following seams must be addressed.

## 15.1 Models / contracts
- `packages/models/src/myWork/...`
- `packages/models/src/provisioning/IProvisioning.ts`
- any barrel exports for new read-model contracts

## 15.2 Projects persistence / mapping
- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- related tests under `backend/functions/src/services/__tests__/`

## 15.3 Legacy fallback registry
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- applicable models/tests
- admin docs and schema docs

## 15.4 My Dashboard app
- `apps/my-dashboard/src/api/...`
- `apps/my-dashboard/src/surfaces/home/...` or equivalent live My Work home seam
- `apps/my-dashboard/src/modules/...` only if the live structure requires localized module folders
- styles/test files for the My Projects surface

## 15.5 Documentation
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- My Dashboard planning / route docs
- administrator how-to docs for schema provisioning and legacy fallback readiness

---

# 16. Validation Matrix

# 16.1 Role schema validation

| Test | Required Proof |
|---|---|
| Projects descriptor/contract contains all 14 role fields | pass |
| Registry descriptor contains all 14 role fields | pass |
| Role fields are JSON-array MultiLineText contract | pass |
| Field names match canonical internal names | pass |
| Schema docs updated | pass |

# 16.2 UPN normalization tests

| Scenario | Expected |
|---|---|
| uppercase/lowercase mismatch | matches |
| leading/trailing spaces | matches |
| duplicate UPNs | deduped |
| malformed UPN | discarded |
| empty array | no match |
| JSON array parse | matches |
| comma/semicolon migration text | parsed defensively |

# 16.3 Legacy migration tests

| Scenario | Expected |
|---|---|
| `leadEstimatorUpn` → `leadEstimatorUpns` | populated |
| `supportingEstimatorUpns` → `estimatorUpns` | populated |
| `projectManagerUpn` → `projectManagerUpns` | populated |
| `projectExecutiveUpn` → `projectExecutiveUpns` | populated |
| rerun backfill | idempotent |
| canonical field already populated | do not duplicate |

# 16.4 Registry mirroring/preservation tests

| Scenario | Expected |
|---|---|
| matched registry row + Projects row | mirror roles + Procore from Projects |
| legacy-only registry row | preserve operator-managed values |
| discovery refresh without Projects match | does not blank manual fields |
| writer persists truthful match states | pass |
| formerly forced matched/high/no-match override absent | pass |

# 16.5 Eligibility tests

| Scenario | Expected |
|---|---|
| Projects role match | displayed |
| Registry legacy-only role match | displayed |
| merged row role match only in Projects | displayed |
| merged row role match only in Registry | not displayed |
| Registry row unmatched/review-required/disabled | not displayed |
| inactive registry row | not displayed |
| no role match | not displayed |

# 16.6 Dual-link tests

| Scenario | SharePoint Action | Procore Action |
|---|---|---|
| Projects site + Procore ID | available site | available Procore |
| No site, valid fallback folder + Procore ID | available folder | available Procore |
| Site only | available | unavailable |
| Procore only | unavailable | available |
| neither | unavailable | unavailable |
| invalid Procore token | unchanged SharePoint | unavailable + warning |

# 16.7 Dedupe/reconciliation tests

| Scenario | Expected |
|---|---|
| Projects + strong registry match | one merged item |
| Projects + heuristic registry match | one merged item |
| Registry-only | one legacy-only item |
| Duplicate registry candidates | deterministic best candidate |
| Legacy-only becomes merged | one merged identity after refresh |

# 16.8 Sorting tests

Sort output must prove:
1. dual-ready before partial-ready;
2. SharePoint-only before Procore-only;
3. neither last;
4. project name stable ordering;
5. project number stable fallback;
6. record key final tiebreak.

# 16.9 Read-model route tests

| Scenario | Expected |
|---|---|
| authenticated request | 200 envelope |
| missing bearer token | repo-standard auth error |
| invalid token | repo-standard auth error |
| actor UPN unresolved | `principal-unresolved` |
| Projects failure + Registry success | `partial` |
| Projects success + Registry failure | `partial` |
| both fail | `source-unavailable` |
| source read ceiling hit | `partial` + bounded warning |
| forbidden actor override query | no override surface exists |

# 16.10 Frontend UI tests

Required UI proof:
- title/header renders;
- metrics render;
- six-row preview renders;
- disclosure expands/collapses;
- two distinct actions render per item;
- unavailable states are non-deceptive;
- role overflow works;
- source badges accurate;
- loading/empty/partial/unavailable states render;
- keyboard/focus order remains coherent.

# 16.11 Hosted My Dashboard validation

Capture hosted evidence across:
- ultrawide desktop,
- desktop,
- standard laptop,
- tablet landscape,
- tablet portrait,
- phone portrait,
- short-height constrained state.

Hosted evidence must prove:
- the My Projects surface is visually premium and not a Project Sites clone;
- no horizontal overflow;
- actions remain accessible;
- expansion remains stable;
- primary My Work shell is not broken by the new surface;
- the packaged experience matches source intent.

---

# 17. UI/UX Scorecard Closure Requirement

The implementation must close with a scored acceptance artifact mapped to the repo scorecard.

## Required target
- **48+/56**
- no category below **2**
- no hard-stop failures.

## Categories requiring explicit written proof
- Doctrine and host compliance
- UI-kit / premium-stack compliance
- Token and styling discipline
- Purpose-fit sophistication
- Surface composition and hierarchy
- Homepage-benchmark alignment without cloning
- Breakpoint/container-fit quality
- Interaction completeness
- State-model completeness
- Contract/data/backend seam rigor
- Accessibility and keyboard behavior
- Host-runtime resilience
- Validation and closure evidence

---

# 18. Documentation and Operational Updates

The implementation must update:

## 18.1 Schema references
- Projects list schema reference
- Legacy Fallback Registry schema reference

## 18.2 Admin/how-to documentation
- how to provision the new registry fields;
- how the matched-row mirror works;
- how legacy-only role arrays and Procore ID are maintained;
- how backfill is executed and validated.

## 18.3 My Dashboard docs
- route contract,
- read-model contract,
- UI module purpose,
- source precedence summary.

## 18.4 Project setup / provisioning docs
- `procoreProject` semantic migration;
- updated role taxonomy;
- any deprecated legacy field notes.

---

# 19. Definition of Done

The initiative is complete only when all of the following are true:

1. Both source lists have the fourteen canonical multi-value UPN role fields.
2. Legacy Fallback Registry has `procoreProject`.
3. `procoreProject` semantics are standardized to raw project identifier string.
4. Current Yes/No semantic drift is remediated in contracts/docs/tests.
5. Projects legacy role data is backfilled into canonical arrays.
6. Matched Registry rows mirror Projects role arrays and `procoreProject`.
7. Legacy-only Registry rows preserve operator-managed role arrays and Procore ID.
8. Discovery writer persists truthful match state, not hard-coded override values.
9. Protected read model route exists:
   ```http
   GET /api/my-work/me/project-links
   ```
10. Actor scope derives only from validated `auth.claims.upn`.
11. No actor override query/path exists.
12. The backend returns normalized, deduped project launch records.
13. Every rendered project has two distinct action slots:
    - SharePoint,
    - Procore.
14. Procore URLs are constructed only from valid `procoreProject` tokens.
15. Merged vs legacy-only authority rules are deterministic and tested.
16. The UI surface is flagship-grade and materially above Project Sites.
17. Empty/loading/partial/unavailable/principal-unresolved states are complete.
18. Hosted My Dashboard evidence is captured.
19. Scorecard closure achieves **48+/56** with no hard-stop failures.
20. Documentation and schema references are updated.

---

# 20. Final Closed Decision Register

| # | Decision |
|---:|---|
| 1 | The module is named **My Projects**. |
| 2 | It renders on the My Work home surface. |
| 3 | It uses backend route `GET /api/my-work/me/project-links`. |
| 4 | It uses frontend method `getMyProjectLinks()`. |
| 5 | It is personal, read-only, and actor-scoped. |
| 6 | Actor identity comes from `auth.claims.upn`. |
| 7 | UPN means normalized email-form Entra sign-in name. |
| 8 | Both Projects and Legacy Fallback Registry are assignment-capable sources. |
| 9 | Both lists receive the same fourteen role fields. |
| 10 | Every role field is a JSON-array MultiLineText/Note column. |
| 11 | Canonical internal names are the plural `...Upns` names listed in §5.1. |
| 12 | Existing scalar Projects role fields remain during transition but are superseded. |
| 13 | Existing scalar Projects fields are backfilled into canonical arrays. |
| 14 | `supportingEstimatorUpns` migrates into `estimatorUpns`. |
| 15 | Legacy Registry receives `procoreProject`. |
| 16 | `procoreProject` is a raw project identifier/token, not Yes/No. |
| 17 | Old Yes/No `procoreProject` semantics must be remediated. |
| 18 | Matched Registry rows mirror Projects roles and Procore ID. |
| 19 | Legacy-only Registry rows are eligible when operator-managed role arrays match. |
| 20 | Projects wins on merged rows for display identity, assignment authority, and Procore ID. |
| 21 | Registry supplies fallback folder/provenance for merged rows. |
| 22 | Every displayed project gets two explicit launch actions. |
| 23 | SharePoint action uses site or folder based on resolved source. |
| 24 | Procore action uses exact URL pattern provided by the user. |
| 25 | Missing links remain visible as unavailable actions, not hidden records. |
| 26 | No entire project row acts as a single link. |
| 27 | Default preview count is six projects. |
| 28 | “View all My Projects” expands inline. |
| 29 | Sorting prioritizes dual-ready rows, then partial-ready rows, then unavailable rows. |
| 30 | Backend source reads use paged scans with 25,000-row per-source ceilings. |
| 31 | No separate persistent assignment-index list is introduced in this implementation. |
| 32 | Writer hard-coded legacy match override must be corrected. |
| 33 | UI must materially exceed Project Sites. |
| 34 | UI quality aligns with HB Intel Homepage as benchmark, not visual clone. |
| 35 | Closure requires 48+/56 flagship scorecard and no hard stops. |
| 36 | No open implementation decisions remain. |

---

# 21. Source Register

## Repository sources inspected
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/B03/02_B03_Target_Architecture_And_File_Map.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/B04/02_B04_Target_Contracts_And_Route_Map.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md`
- `packages/models/src/myWork/MyWorkReadModels.ts`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `backend/functions/src/services/projects-list-contract.ts`
- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/features/estimating/src/project-setup/config/projectTeamFields.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesResolver.ts`
- `packages/spfx/src/webparts/projectSites/repository/legacyFallbackRegistryAdapter.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`

## External primary references considered
- Microsoft SharePoint Framework Entra-secured API permission guidance
- Microsoft Graph list item filtering guidance
- Microsoft SharePoint large-list/indexing guidance

---

# 22. Final Conclusion

This initiative should proceed as a **schema-aware, backend-mediated, flagship-grade personalized launch surface**.

The finished My Projects module should become the user’s immediate project-entry console inside My Dashboard:
- precise assignment scoping,
- authoritative source reconciliation,
- dual SharePoint/Procore actions,
- legacy fallback support without ambiguity,
- visually premium presentation that clears the quality bar set by HB Intel Homepage and exceeds the existing Project Sites application.

No material architecture or product decisions remain open.
