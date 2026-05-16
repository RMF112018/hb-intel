# Prompt 03 — My Projects Multi-Platform Launch Expansion | Read-Model Contracts and Backend Provider Expansion

## Objective

Implement the shared My Projects read-model contract and backend provider expansion for:

- Autodesk BuildingConnected launch actions,
- Document Crunch launch actions,
- Registry-side stage continuity,
- new summary counts and warning codes.

Do not change frontend UI in this prompt.

---

## Mandatory working rules

1. Do not re-read files that remain available in your current context or working memory unless exact lines are needed or source changed.
2. Work from the Prompt 02 repo state.
3. Preserve backward compatibility of existing public read-model fields.
4. Preserve `dualLaunchReadyCount` semantics as SharePoint + Procore.
5. Add `multiPlatformReadyCount` for all four destinations.
6. Preserve source-of-record boundaries:
   - Projects-backed merged items use Projects external-platform links only.
   - Legacy-only items use Registry external-platform links.
7. Do not broaden into data backfill or live tenant mutation.
8. Keep diagnostics sanitized and do not leak raw PII.

---

## Required contract changes

File:
- `packages/models/src/myWork/MyProjectLinksReadModel.ts`

### Add warning codes
- `building-connected-launch-unavailable`
- `building-connected-url-invalid`
- `document-crunch-launch-unavailable`
- `document-crunch-url-invalid`

### Add item actions

```ts
buildingConnectedAction: {
  state: 'available' | 'unavailable';
  label: 'Open BuildingConnected' | 'BuildingConnected unavailable';
  href?: string;
};

documentCrunchAction: {
  state: 'available' | 'unavailable';
  label: 'Open Document Crunch' | 'Document Crunch unavailable';
  href?: string;
};
```

### Add summary fields
- `buildingConnectedReadyCount`
- `documentCrunchReadyCount`
- `noBuildingConnectedLaunchCount`
- `noDocumentCrunchLaunchCount`
- `multiPlatformReadyCount`

Do not remove existing summary fields.

---

## Required provider changes

File:
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`

### Extend row shapes

Projects:
- `buildingConnectedUrl?: string`
- `documentCrunchUrl?: string`

Registry:
- `projectStage?: string`
- `buildingConnectedUrl?: string`
- `documentCrunchUrl?: string`

### Extend source select fields

Projects select:
- `resolveSpField('buildingConnectedUrl')`
- `resolveSpField('documentCrunchUrl')`

Registry select:
- `projectStage`
- `buildingConnectedUrl`
- `documentCrunchUrl`

### Add launch-action builders

Implement two builder helpers that:
- trim raw values,
- identify empty values,
- identify invalid non-http(s) URL values,
- return action + warnings.

Use the locked warning codes.

### Reconciliation rules

Implement exactly:

#### Projects-only
- stage: Projects
- links: Projects

#### Merged
- stage: Projects stage when present, else Registry stage
- BuildingConnected: Projects only
- Document Crunch: Projects only

#### Legacy-only
- stage: Registry
- links: Registry

### Summary
Update provider summary builder for all new counts.

---

## Projects mapping support

File:
- `backend/functions/src/services/projects-list-contract.ts`

Ensure these fields exist in the Projects field map so the provider can use centralized resolution:

- `buildingConnectedUrl`
- `documentCrunchUrl`

Add them to optional extension field sets as appropriate.

If `projects-list-mapper.ts` requires no behavioral change beyond field-map resolution, do not create unnecessary DTO expansion.

---

## Fixtures

File:
- `packages/models/src/myWork/fixtures/myProjectLinksReadModels.ts`

Update all necessary fixture items and summary builder logic to satisfy the expanded type contract.

Include at least:
- one fully ready all-platform fixture item,
- one unavailable BuildingConnected item,
- one unavailable Document Crunch item,
- one legacy-only row with Registry stage and links.

---

## Required tests

Update:
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.test.ts`

Add/assert:
- valid BuildingConnected URL,
- invalid BuildingConnected URL,
- missing BuildingConnected URL,
- valid Document Crunch URL,
- invalid Document Crunch URL,
- missing Document Crunch URL,
- summary counts,
- multi-platform readiness,
- merged stage precedence,
- legacy-only stage.

Update any model fixture/type tests as needed.

---

## Required validation

Run:
- targeted provider tests,
- directly affected model/fixture tests,
- `pnpm --filter @hbc/functions check-types`,
- relevant model package type checks if present,
- Prettier.

---

## Required closeout

Return exactly:

# Prompt 03 Closeout — Read-Model Contracts and Backend Provider Expansion

## 1. Executive Verdict
State whether contracts/provider now support the four-platform posture.

## 2. Files Changed
Path + summary + reason.

## 3. Contract Additions
List:
- warning codes,
- item fields,
- summary fields.

## 4. Provider Behavior Implemented
State source precedence and stage precedence.

## 5. Fixtures Updated
Summarize added scenarios.

## 6. Test Results
Exact commands and outcomes.

## 7. Remaining Work for Prompt 04
State the exact frontend tasks left.
