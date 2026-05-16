# Required Test Matrix

## 1. Schema descriptor / provisioner

| Test | Required Result |
|---|---|
| Descriptor Projects target | includes 2 new link fields |
| Descriptor Registry target | includes 2 new link fields + projectStage |
| Provisioner dry-run, fields absent | planned creates include all new fields |
| Provisioner dry-run, fields live | liveVerified includes all new fields |
| Provisioner wrong-type | blockers returned, no apply |
| Provisioner apply path | createField called only for missing fields |

## 2. Readiness helper / verifier

| Test | Required Result |
|---|---|
| Projects readiness with both new Text fields | ready when role arrays + link fields present |
| Registry readiness with new Text fields | ready when role arrays + procore + link + stage present |
| Missing BuildingConnected field | ready false, missing state |
| Missing Document Crunch field | ready false, missing state |
| Wrong-type Registry projectStage | ready false, wrong-type state |
| JSON report | deterministic shape preserved |

## 3. Contracts / fixtures

| Test | Required Result |
|---|---|
| Warning-code set | new warning codes present |
| Fixture fully-ready item | both new actions available |
| Fixture unavailable item | disabled/action unavailable path modeled |
| Summary builder | new counts correct |
| Legacy-only fixture | Registry-sourced platform links/stage represented |

## 4. Backend provider

| Test | Required Result |
|---|---|
| Projects valid BuildingConnected URL | available action |
| Projects invalid BuildingConnected URL | invalid + unavailable warnings |
| Projects valid Document Crunch URL | available action |
| Projects invalid Document Crunch URL | invalid + unavailable warnings |
| Merged row external link precedence | Projects values used, Registry not fallback |
| Merged row stage precedence | Projects stage first, Registry stage fallback only if missing |
| Legacy-only row stage | Registry stage surfaced |
| Legacy-only links | Registry link fields surface |
| Summary multiPlatformReadyCount | exact count |
| Summary individual ready/missing counts | exact counts |

## 5. Frontend launch menu

| Test | Required Result |
|---|---|
| Menu order | SharePoint → Procore → BuildingConnected → Document Crunch |
| Available BuildingConnected | anchor with target/rel |
| Available Document Crunch | anchor with target/rel |
| Unavailable BuildingConnected | disabled button + aria-disabled |
| Unavailable Document Crunch | disabled button + aria-disabled |
| Invalid URL aria label | meaningful invalid posture surfaced |
| Single menu open | preserved |
| Escape dismissal | preserved |

## 6. My Projects card

| Test | Required Result |
|---|---|
| Masthead copy | multi-platform wording |
| Consolidated unavailable hint | renders deduped destination list |
| Browser reuse | overflow browser still renders tiles |
| Existing empty/banner states | unchanged |

## 7. Docs

| Test / Review | Required Result |
|---|---|
| Search for outdated “dual launch” live-state wording | removed or reframed where implementation supersedes |
| Admin runbook | new provisioning fields included |
| Schema docs | new fields documented |
