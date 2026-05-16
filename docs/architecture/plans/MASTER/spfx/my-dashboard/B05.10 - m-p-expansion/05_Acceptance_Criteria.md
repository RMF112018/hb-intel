# Acceptance Criteria

## 1. Schema and provisioning

- `MY_PROJECTS_SOURCE_LIST_SCHEMA_DESCRIPTOR` includes:
  - Projects:
    - `buildingConnectedUrl`
    - `documentCrunchUrl`
  - Registry:
    - `buildingConnectedUrl`
    - `documentCrunchUrl`
    - `projectStage`
- Provisioner dry-run sees those fields when missing.
- Provisioner apply can create those fields.
- No new Projects `projectStage` column is introduced.
- Wrong-type fields still block apply.

## 2. Readiness verification

- Readiness helper/verifier covers the newly required operational My Projects fields.
- Expected types:
  - external URL fields => Text
  - Registry stage => Text
- JSON readiness report remains deterministic.
- Existing role-array and Registry `procoreProject` validation is preserved.

## 3. Backend model/provider

- `MyProjectLinkItem` includes BuildingConnected and Document Crunch actions.
- Warning codes exist for missing/invalid external platform links.
- Projects-only rows build platform actions from Projects values.
- Merged rows build platform actions from Projects values only.
- Legacy-only rows build platform actions from Registry values.
- Merged stage precedence:
  - Projects stage first,
  - Registry fallback only if Projects stage absent.
- Legacy-only stage uses Registry stage.
- Summary fields include:
  - `buildingConnectedReadyCount`
  - `documentCrunchReadyCount`
  - `noBuildingConnectedLaunchCount`
  - `noDocumentCrunchLaunchCount`
  - `multiPlatformReadyCount`
- Existing summary fields remain intact.

## 4. Frontend UX

- Launch menu renders four options in fixed order:
  1. SharePoint
  2. Procore
  3. BuildingConnected
  4. Document Crunch
- Available external-platform options are anchors with new-tab safe rel attributes.
- Unavailable options are disabled buttons with meaningful aria labels.
- Masthead support copy is updated to multi-platform wording.
- A consolidated missing-destination hint replaces hard-coded SharePoint/Procore-only hint fragments.
- Current menu concurrency, escape dismissal, browser overflow, and tile-role behavior remain intact.

## 5. Fixtures/tests/docs

- Fixtures support new action fields.
- Provider tests cover valid/invalid/missing link behavior.
- Frontend tests cover menu option order and updated copy.
- Docs no longer treat My Projects as a two-destination dual-launch module where the new implementation supersedes that description.
- Admin docs identify the added SharePoint columns and operator flow.

## 6. Non-regression

- Existing SharePoint and Procore launch behavior remains unchanged.
- Existing project assignment filtering remains unchanged.
- Existing My Projects zero-match diagnostics remain intact.
- Existing provisioning REST path remains intact.
- No unrelated backend, Adobe Sign, PCC, or deployment workflows are modified.

## 7. Operator readiness

- The package produces a clear final report with:
  - files changed,
  - tests executed,
  - provisioning commands to run,
  - any tenant/apply steps deferred to operator approval.
