# Wave 2 / Prompt-02 — List Provisioning and Domain Contracts

**Closed:** 2026-04-13
**Scope:** SharePoint list provisioning + typed TypeScript domain contracts for the Project Spotlight publisher, aligned to the locked architecture package (`docs/architecture/plans/MASTER/spfx/publisher/architecture/` docs 02–06).

---

## 1. List-host decision

**Host:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` (HBCentral).

Rationale:
- HBCentral is the repo's canonical control-plane list host (commit `a9c1ae21` locked Team Viewer onto the same site via `TEAM_VIEWER_CANONICAL_LIST_HOST_URL`; changing that host now requires an ADR).
- Architecture doc 02 §Notes describes the control-plane lists as the editorial source of truth, distinct from the rendered destination pages on `/sites/ProjectSpotlight`.
- Keeping publisher lists on HBCentral preserves the separation enforced in Rule 4 of the operating charter (the destination page is a rendered shell, not editorial truth).

No divergence from the Wave 1 impact map — Wave 1 identified HBCentral as the owning site; Wave 2 confirms it.

## 2. Provisioning script

**Created:** `packages/sharepoint-docs/infrastructure/provision-project-spotlight-publisher-lists.ps1`

Architecture-aligned PnP.PowerShell script that idempotently provisions the seven lists mandated by architecture doc 02 §List inventory:

| # | Display name | Key field | Architecture §source |
|---|--------------|-----------|----------------------|
| 1 | `Project Spotlight Posts` | `PostId` | doc 03 §A |
| 2 | `Project Spotlight Post Team Members` | `PostId` + `TeamMemberId` | doc 03 §B |
| 3 | `Project Spotlight Post Media` | `PostId` + `MediaId` | doc 03 §C |
| 4 | `Project Spotlight Template Registry` | `TemplateKey` | doc 03 §D |
| 5 | `Project Spotlight Page Bindings` | `BindingId` (+ `PostId`) | doc 03 §E |
| 6 | `Project Spotlight Workflow History` | `HistoryId` | doc 03 §F |
| 7 | `Project Spotlight Publishing Errors` | `ErrorId` | doc 03 §G |

Rollup Rules (list 8) is deferred per arch doc 02 §185: "MVP can inline most rollup state on the post record."

Script structure mirrors the legacy `provision-publisher-lists.ps1` helper scaffold (`Connect-PublisherPnP`, `New-FieldDef`, `Convert-TypeLabelToFieldSpec`, `Ensure-List`, `Ensure-Field`, `Validate-Field`, `Get-Schemas`) so future edits stay predictable. Only the choice-defaults table and the per-list schema contents differ — both replaced with the architecture-doc-03 canonical inventory.

Scope discipline: only **MVP=Yes** fields from arch doc 03 are provisioned at first pass. Every post-MVP field in arch 03 (e.g., `RenderVersion`, `RegenerationPolicy`, `ShellChecksum`, `GenerationNotes`, `ProjectStatusLabel`, `MilestoneLabel`, `MilestoneDateUtc`, `SuppressFromRollups`, `ManualSortOverride`, campaign-window fields, approval/review owner fields, revision/change-reason fields) is intentionally deferred.

## 3. Typed domain contracts

**Created directory:** `apps/hb-webparts/src/homepage/data/publisherAdapter/`

Mirrors the kudosAdapter directory shape. Prompt-02 fills only the schema + enum layer; reads/writes/governance/validation/submission modules will be added by later prompts next to these files.

| File | Purpose |
|------|---------|
| `publisherEnums.ts` | `as const` tuples + derived literal-union types for every choice field in arch doc 03 (PostFamily, SpotlightType, ProjectStage, ArticleSubject, WorkflowState, BannerThemeVariant, HeroRendererKind/BannerRendererKind, BodyRendererKind, TeamRendererKind, GalleryRendererKind, TeamViewerLayout, TeamViewerDensity, GalleryLayoutProfile, PageSyncStatus, TemplateStatus, MediaRole, BindingStatus, LastOperation, WorkflowHistoryAction, PublishingErrorCategory, PublishingErrorOperation, RetryStatus, TargetSiteKey) |
| `publisherContracts.ts` | Raw-row interfaces (`PublisherPostRow`, `PublisherTeamMemberRow`, `PublisherMediaRow`, `PublisherTemplateRegistryRow`, `PublisherPageBindingRow`, `PublisherWorkflowHistoryRow`, `PublisherPublishingErrorRow`) mirroring SP field shapes. MVP=Yes fields only; optional where arch 03 marks `Required=No`. Normalized domain types deferred to Prompt-03. |
| `publisherListDescriptors.ts` | Frozen `PUBLISHER_LISTS` constant with `{ key, displayName, hostSiteUrl, mvpFields }` per list. Runtime-safe metadata handle for Prompt-03 service layer. |
| `index.ts` | Barrel re-export. |

**Why local-to-webparts and not a new `packages/*-contracts` package:** follows the established precedent (TeamViewer, Kudos, communications all co-locate contracts next to their reader/adapter). No existing extracted-contracts package in this repo; extracting one now would be speculative ahead of the Prompt-06 publisher webpart. Extraction remains available as a small refactor if Prompt-03/-06 demonstrate cross-webpart sharing need.

## 4. Legacy-vs-new provisioning coexistence

The legacy `packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1` is **untouched** by this prompt. It still provisions the "HB Articles / ArticleId" schema that Phase-01 Team Viewer (commits `3bb8dd10`…`35b0f38c`) reads today via `TEAM_VIEWER_CANONICAL_LIST_HOST_URL`. Renaming those lists or fields in place would break already-landed runtime code.

The two scripts will coexist until a dedicated future migration prompt migrates Team Viewer onto the architecture-aligned `Project Spotlight Post Team Members` list. That migration is out of scope here and is tracked as a follow-up item.

No Team Viewer code paths were modified in Prompt-02.

## 5. Schema alignment audit

Every **MVP=Yes** column in arch doc 03 §A-E is present in both the provisioning script and `publisherContracts.ts`, using identical internal names. MVP=No columns are omitted in both places (no silent promotion). Choice value sets in `Get-ChoiceDefaults` (PowerShell) mirror the literal-union values in `publisherEnums.ts` case-sensitively.

Spot checks:
- `PostId` is the primary cross-list identity across all seven lists (arch doc 04 cross-reference).
- `TargetSiteKey` defaults to `'projectSpotlight'` on both Posts and Page Bindings, preserving Rule 1 of the operating charter (single destination).
- `HeroRendererKind` defaults to `'oobPageTitle'` on Posts; Rule 9 prevents any silent `hbSignatureHero` injection.
- `BindingStatus` uses arch doc 03's `previewOnly | published | archived | withdrawn | error` — not the legacy `draft | published | error | scheduled` set.
- `WorkflowState` uses arch doc 03's `inReview` casing, not the legacy `review` value.

## 6. Verification performed

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ `tsc --noEmit` passes clean |
| `git diff packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1` | ✅ no changes (legacy untouched) |
| `git status apps/hb-webparts/src/webparts/teamViewer/` | ✅ no changes (Team Viewer untouched) |
| No `.sppkg` / SPFx bundle changes | ✅ no files under `tools/spfx-shell/**` or `apps/hb-webparts/config/` touched |
| MVP=Yes field set parity (arch 03 ↔ ps1 ↔ contracts) | ✅ field-by-field confirmed |

Hosted tenant validation of the new provisioning script is deferred to Wave 9 (hosted verification runbook), per the Phase-01 DoD §A.

## 7. Out of scope (by design)

- No service/repository layer (Prompt-03 / Wave 3).
- No reads or writes (no runtime list I/O code).
- No authoring UI, no webpart (Prompt-06 / Wave 6).
- No Team Viewer migration; Team Viewer stays on legacy binding.
- No `@hbc/sharepoint-platform` public-API changes.
- No changes to architecture docs (authority — untouched).

## 8. Handoff to Prompt-03

Prompt-03 / Wave 3 (Service layer and template resolution) consumes:
- `PUBLISHER_LISTS` from `publisherListDescriptors.ts` for list handles.
- Typed row interfaces from `publisherContracts.ts` for read/write payloads.
- Literal-union enums from `publisherEnums.ts` for validation and template-resolution predicates.

Blocking unknowns carried forward (unchanged from Wave 1):
1. SharePoint Pages REST API path + auth model for `/sites/ProjectSpotlight`.
2. Webpart property injection strategy at page-generation time.
3. Photo hydration timing (generation-time embed vs. runtime fetch).
4. Publish permissions / service principal on ProjectSpotlight.
5. Rollback / version-history policy.
6. Scheduled publishing inclusion + trigger mechanism.
7. OOB Image Gallery layout variant.
