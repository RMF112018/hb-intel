# Admin SPFx White-Glove Device Deployment — Repo-Truth Gap Map

## Objective

Map the current reusable repo foundations against the white-glove device deployment target state.

## Gap map

## 1. Existing foundations to reuse

### Admin shell and page structure
**Exists now**

- admin shell routing
- system settings page
- dashboards
- provisioning oversight
- permission-gated admin actions
- alert / probe polling hooks

**Reuse direction**

- extend the admin shell information architecture
- add a dedicated white-glove control lane
- follow existing admin action / detail / oversight patterns where they are already strong

### Admin intelligence package
**Exists now**

- alert monitors
- infrastructure probes
- approval authority components
- reusable admin hooks and dashboard components

**Reuse direction**

- extend for connector health, package-run signals, and readiness snapshots
- keep it as an admin-intelligence layer, not the privileged executor

### Provisioning control-plane substrate
**Exists now**

- headless provisioning package
- authenticated API client pattern
- durable provisioning status model
- SignalR progress model
- retry / archive / escalation / force-state patterns
- backend services with adapter-style service factory

**Reuse direction**

- generalize run, audit, checkpoint, and evidence patterns
- preserve compatibility with provisioning
- avoid rewriting the existing substrate from scratch

### Graph service baseline
**Exists now**

- security group create / lookup / membership add
- SharePoint site access grant support
- managed identity usage

**Reuse direction**

- expand into a broader identity / device-management adapter family
- do not overload the existing file with unrelated responsibilities; split by domain if needed

## 2. Major gaps to close

### Gap A — White-glove domain model
**Missing**

- device package templates
- device platform taxonomy
- parent package run / child device run model
- package-specific readiness rules
- technician checkpoint taxonomy
- evidence classes for enrollment / standardization / validation

**Owner**
- shared contracts + backend

**Priority**
- critical / first-wave

### Gap B — Connector registry and configuration governance
**Missing**

- durable connector records
- secure secret / credential handling abstraction
- connection test actions
- readiness threshold configuration
- connector health persistence
- versioned governed connector configuration

**Owner**
- backend + admin surfaces

**Priority**
- critical / first-wave

### Gap C — Microsoft execution lane
**Missing**

- Intune-specific adapter contracts
- Autopilot-specific orchestration
- device registration / assignment normalization
- package-specific Windows readiness logic
- identity / device / group binding rules for this feature

**Owner**
- backend adapter layer

**Priority**
- critical / first-wave

### Gap D — Apple execution lane
**Missing**

- ABM / ADE connector model
- Apple token and MDM readiness state model
- serial-assignment workflow support
- iPhone / iPad / macOS differentiation
- supervised enrollment evidence model

**Owner**
- backend adapter layer

**Priority**
- critical / first-wave

### Gap E — NinjaOne execution lane
**Missing**

- OAuth / API connection handling
- package-standard bundle mapping
- script / policy / software-bundle orchestration
- post-enrollment validation contracts
- endpoint metadata synchronization model

**Owner**
- backend adapter layer

**Priority**
- critical / first-wave

### Gap F — SPFx white-glove operator UX
**Missing**

- employee lookup and package launch
- target-device intake forms
- connector setup and validation UI
- package readiness and preflight UI
- checkpoint / status visualization for this domain
- package evidence / audit browsing
- repair guidance and recovery UX

**Owner**
- apps/admin + packages/features/admin

**Priority**
- critical / first-wave

### Gap G — Package standards governance
**Missing**

- template editor / version model
- code-baseline vs governed-override model
- per-role package mappings
- per-platform software bundle standards
- audit history for package changes

**Owner**
- backend + admin surfaces + docs

**Priority**
- high

### Gap H — Durable audit and evidence expansion
**Missing**

- package-run evidence manifests
- child-device evidence linkage
- normalized external system event capture
- operator action attribution for white-glove commands
- connector snapshot linkage per run

**Owner**
- backend

**Priority**
- high

### Gap I — IT enablement documentation
**Missing**

- Microsoft setup guide for Intune / Autopilot / Entra dependencies
- Apple setup guide for ABM / ADE / APNs / Intune
- NinjaOne setup guide for API, policies, bundles, and custom fields
- first-use readiness workflow
- troubleshooting model

**Owner**
- docs

**Priority**
- critical / first-wave

## 3. Scope ownership matrix

### SPFx must own
- operator input
- package selection
- connection setup UX
- readiness and health visibility
- run launch
- checkpoint display
- logs / evidence / audit consumption
- standards and governance UX

### Backend must own
- orchestration
- privileged execution
- connector calls
- retries / compensation / repair
- evidence capture
- audit persistence
- connector validation execution
- connection resolution
- package / device run normalization

### Platform-native systems must own
- Windows enrollment authority
- Apple ADE authority
- Apple supervision state
- primary MDM enrollment ownership
- device identity and registration semantics

### NinjaOne should own
- post-enrollment policy application
- software deployment
- endpoint scripts
- standardization tasks
- endpoint validation tasks

## 4. Recommended file-placement baseline

### Proposed frontend lanes
- `apps/admin/src/pages/WhiteGloveOverviewPage.tsx`
- `apps/admin/src/pages/WhiteGloveConnectionsPage.tsx`
- `apps/admin/src/pages/WhiteGloveLaunchPage.tsx`
- `apps/admin/src/pages/WhiteGloveRunHistoryPage.tsx`
- `apps/admin/src/pages/WhiteGlovePackageStandardsPage.tsx`

### Proposed feature package lanes
- `packages/features/admin/src/white-glove/`
  - `components/`
  - `hooks/`
  - `types/`
  - `api/`
  - `testing/`

### Proposed backend lanes
- `backend/functions/src/functions/white-glove/`
- `backend/functions/src/services/device-management/`
  - `microsoft/`
  - `apple/`
  - `ninjaone/`
- `backend/functions/src/services/white-glove-run-store.ts`
- `backend/functions/src/services/white-glove-audit-store.ts`
- `backend/functions/src/services/connector-registry-service.ts`

### Proposed docs lanes
- `docs/architecture/plans/MASTER/spfx/admin/white-glove/`
- `docs/reference/white-glove/`
- `docs/how-to/developer/white-glove-*.md`
- `docs/maintenance/white-glove-tenant-prerequisites.md`

## 5. Immediate implementation order

1. baseline and boundary freeze
2. domain model and standards model
3. connector registry and governed configuration
4. durable run / audit / evidence model
5. Microsoft adapter lane
6. Apple adapter lane
7. NinjaOne adapter lane
8. SPFx connection / readiness UX
9. SPFx launch / checkpoint UX
10. SPFx history / recovery UX
11. standards governance UX
12. testing / observability / closeout

## 6. No-go conditions

Do not proceed as if the feature is complete if any of the following remain absent:

- secure UI-driven connection setup
- durable run persistence
- parent / child run orchestration
- Apple and Microsoft workflow separation
- package-specific standards model
- recovery / retry / repair operator flow
- IT setup documentation
