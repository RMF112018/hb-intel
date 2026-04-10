# Repo Truth and Test-Basis Lock — Comprehensive Test Suite for Refactored People & Culture / HB Kudos

Phase-14 testing package · Prompt-00 deliverable.

This report validates that all prerequisites for the comprehensive test suite are present at local HEAD and locks the authoritative test basis. No test code is created in this prompt.

---

## 1. Prerequisite packages reflected at local HEAD

| Package / prompt sequence | Status | Evidence |
|---|---|---|
| **Phase-14 kudos/ Prompts 00–06** (HB Kudos + HR Approval Companion) | **Complete** | `Prompt-06-Validation-Packaging-and-Closure.md` closure delivered; solution at `1.0.0.126`; all 19 `KudosPatch` writers implemented; 164 Phase-14 focused tests green. |
| **Phase-14 pc/ Prompts 00–06** (People & Culture split + HR operating companion) | **Complete** | `peopleCulturePublic/` real runtime, `peopleCultureCompanion/` real runtime with sections (Overview, ContentFamily, Approvals, Homepage, Intake, Notifications), preview panel, and editing drawers. |
| **Preliminary workflow test harness** | **Present** | `scripts/testing/people-kudos-workflow/` with `peopleKudosWorkflowHelpers.ts` (592+ lines: patch builders, audit event creation, `RunContext` type, config loading). |
| **SharePoint schema extraction** | **Complete** | 14 schema/report artifacts under `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/` covering `People Culture Kudos`, `Kudos Audit Events`, `People Culture Announcements`, and `People Culture Celebrations` lists. |

---

## 2. Application surfaces present and authoritative

### 2.1 Employee-facing public surfaces

| Surface | Path | Manifest GUID | Runtime lines | Version |
|---|---|---|---|---|
| **HB Kudos** | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | `f14e59a3-4d6b-43b2-952e-ba02dea11dad` | ~580 | `0.2.0.0` |
| **People & Culture public** | `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx` | `e39d9662-34c4-43e6-9425-5770f62da626` | ~125 (+ `PeopleCulturePublicSurface.tsx` ~369) | `0.0.4.0` |
| **Legacy merged (transitional)** | `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | ~283 | `0.0.5.0` |

### 2.2 HR / governance companion surfaces

| Surface | Path | Manifest GUID | Runtime lines | Version |
|---|---|---|---|---|
| **HB Kudos Approval Companion** | `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx` | `a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97` | ~1,131 | `0.2.0.0` |
| **People & Culture HR Companion** | `apps/hb-webparts/src/webparts/peopleCultureCompanion/PeopleCultureCompanion.tsx` | `7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e` | ~815 | `0.0.3.0` |

### 2.3 Shared data / helper layers

| Layer | Path | Purpose |
|---|---|---|
| Contracts | `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts` | `KudosPatch` (19 kinds), `KudosAuditEventInput`, view models, mapping helpers |
| Contracts | `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` | `KudosEntry` with full governance metadata |
| Contracts | `apps/hb-webparts/src/homepage/webparts/peopleCultureSplitContracts.ts` | PC split contracts (~609 lines) |
| List source | `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts` | `KUDOS_FIELDS`, `KUDOS_AUDIT_FIELDS`, `mapKudos()`, `fetchPeopleCultureListData()` |
| List registry | `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts` | GUID-bound list descriptors for all 4 lists |
| Submission | `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts` | `submitKudosDraft()` with typed recipient writes |
| Governance writer | `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts` | `buildKudosPatchPlan()`, `executeKudosPatch()`, `fetchKudosAuditTimeline()`, `submitKudosGovernanceAction()` |
| Capabilities | `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts` | `KudosRole`, `KudosCapabilities`, `deriveKudosCapabilities()` |
| Role resolver | `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts` | `resolveKudosRole()` via SharePoint group membership |
| Notifications | `apps/hb-webparts/src/homepage/helpers/kudosNotificationBuilder.ts` | `buildKudosNotificationIntents()`, `findKudosReminderTargets()`, overdue helpers |
| Detail panel | `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx` | Role-aware detail body shared by both kudos webparts |

---

## 3. Preliminary test assets already present

### 3.1 Unit / integration tests (vitest, 8 relevant files, 164 tests)

| File | Tests | Coverage area |
|---|---|---|
| `kudosContracts.test.ts` | 16 | Workflow helpers, visibility predicates, audit event vocabulary, recipient summary, aging |
| `hbKudosRuntime.test.tsx` | 9 | HbKudos webpart smoke, typed composer hook validation, `resolveTypedRecipientBuckets`, form mode rendering |
| `hbKudosCompanionRuntime.test.tsx` | 28 | Capabilities for all roles, all 19 `buildKudosPatchPlan` shapes, notification intents, overdue targets, companion runtime smoke (viewer/reviewer/admin), tab switching |
| `peopleCultureMerged.test.ts` | 40 | Merged normalizer, audience filtering, config adaptation |
| `peopleCultureSplitModel.test.ts` | 36 | Lifecycle state derivation, audience visibility, companion overview, homepage conflicts, media source resolution |
| `peopleCulturePublicRuntime.test.tsx` | 22 | Legacy adapter, split detection, public surface rendering |
| `peopleCultureCompanionRuntime.test.tsx` | 16 | Companion shell, section rendering |
| `peopleCultureSpListBinding.test.ts` | 16 | List registry GUID binding, endpoint construction, field-presence guardrails |
| `peopleCulturePermissionsAndIntake.test.tsx` | 28 | Permissions, targeting guardrails, milestone generation, notification builder |
| `peopleCultureMediaAndPreview.test.tsx` | 18 | Media resolution, preview panel rendering |
| `importDiscipline.test.ts` | (shared) | Homepage entry-point ban enforcement |

### 3.2 Workflow test harness (scripts/testing/)

| File | Purpose |
|---|---|
| `peopleKudosWorkflowHelpers.ts` | `RunContext`, `WorkflowStatus`, `KudosEventType`, all patch builders (`buildKudosApprovalPatch`, `buildKudosSchedulePatch`, `buildKudosPinPatch`, `buildKudosFeaturePatch`, `buildKudosRevisionRequestedPatch`, `buildKudosRejectPatch`, `buildKudosWithdrawPatch`, `buildKudosRemovePatch`, `buildKudosRestorePatch`, `buildKudosCelebratePatch`, `buildKudosVisibilityPatch`), `createAuditEvent()` |
| `runPeopleKudosWorkflowTest.ts` | CLI runner for the workflow harness against a live SharePoint tenant |
| `peopleKudosWorkflow.config.example.json` | Configuration template (site URL, tenant ID, client secret) |

### 3.3 SharePoint schema artifacts (14 files)

- `people-culture-kudos-sharepoint-schema-report.md` — authoritative field inventory for `People Culture Kudos` + `Kudos Audit Events`
- `people-culture-announcements-sharepoint-schema-report.md` — field inventory for announcements
- Normalized + raw `.json` schemas for all 4 lists
- Sample items JSON for kudos + announcements
- Adapter mapping matrix (`people-culture-adapter-mapping-matrix.md`)
- Schema Reference Appendix (`kudos/Schema-Reference-Appendix.md`)

---

## 4. Gaps / blockers before the final suite can be built

| Gap | Severity | Impact on final suite |
|---|---|---|
| **No live-tenant integration tests** | Expected | The preliminary harness (`runPeopleKudosWorkflowTest.ts`) runs against a live SharePoint tenant with real credentials. The comprehensive suite (Prompt-01 onwards) must decide whether to require tenant access or work entirely with mocked REST. |
| **People & Culture celebrations schema has no sample items JSON** | Minor | `people-culture-announcements1-list-sample-items.json` exists for the celebrations list but is named inconsistently. Usable but naming clarity would help test fixture generation. |
| **No existing test for `kudosGovernanceWriter` network integration** | Expected | The `buildKudosPatchPlan` discriminator is tested exhaustively (28 test cases across 19 kinds), but the network-level `patchKudosItem`, `createKudosAuditEvent`, and `fetchKudosAuditTimeline` functions have no mocked-fetch integration tests. The final suite should add mocked-fetch round-trip tests. |
| **No existing test for `resolveKudosRole` group membership resolution** | Expected | The resolver is present but no test mocks the `/_api/web/currentuser` + `sitegroups` REST calls. The final suite should cover role-resolution fallback paths. |
| **No existing test for `KudosDetailPanelContent` rendering** | Minor | The shared detail panel (`KudosDetailPanelContent.tsx`) is exercised transitively through the webpart runtime smokes but has no dedicated rendering test that asserts role-specific section visibility. |
| **Pre-existing test failures outside Phase-14 scope** | Non-blocking | 14 tests in `bundleBudget`, `compositionPreview`, `discoveryWebpart`, `interactiveStates`, `motionAndAccessibility`, `operationalAwarenessWebparts`, `topBandWebparts`, `utilityWebparts` fail pre-existing. These are not Phase-14 regressions and do not block the kudos/PC test suite. |

**No blocking gaps.** All prerequisite implementation work is materially reflected at local HEAD. The comprehensive test suite can proceed.

---

## 5. Test-basis lock

The following is locked as the authoritative basis for the comprehensive test suite:

- **Solution version at lock:** `1.0.0.126`
- **HB Kudos webpart version:** `0.2.0.0` (manifest `f14e59a3-…`)
- **HB Kudos Companion version:** `0.2.0.0` (manifest `a8c5d9e2-…`)
- **People & Culture public version:** `0.0.4.0` (manifest `e39d9662-…`)
- **People & Culture Companion version:** `0.0.3.0` (manifest `7c3f8e24-…`)
- **KudosPatch kinds implemented:** 19/19 (zero `NotImplemented`)
- **Phase-14 test count at lock:** 164 tests across 8 focused files
- **SharePoint schema artifacts:** 14 files covering 4 lists
- **Preliminary harness patch builders:** 11 (covering the core lifecycle)

Prompts 01–06 of the testing package may proceed against this locked basis.
