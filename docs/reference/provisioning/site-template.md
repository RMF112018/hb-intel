# Site Template Specification

**Traceability:** W0-G1-T01
**Classification:** Living Reference (Diátaxis) — Reference quadrant
**Audience:** Provisioning developers, platform engineers, product owners
**Template Version:** v1.0

---

## 1. Core Document Libraries

Every HB Intel project site is provisioned with three core document libraries. All three have SharePoint versioning enabled.

| Library | Versioning | Provisioning Step | Notes |
|---------|-----------|-------------------|-------|
| Project Documents | Enabled | Step 2 | Primary document store; receives all template files |
| Drawings | Enabled | Step 2 | Construction drawing library |
| Specifications | Enabled | Step 2 | Specification documents library |

**Config source:** `backend/functions/src/config/core-libraries.ts` — `CORE_LIBRARIES` array.

**Provisioning rule:** All three libraries are created by Step 2 of the provisioning saga with idempotency checks (`documentLibraryExists` per library). If a library already exists, it is skipped. If all libraries already exist, Step 2 completes with `idempotentSkip: true`.

**Native vs. custom:** These libraries are created via the SharePoint REST API (`sp.web.lists.add` with template 101 for document libraries). They are standard SharePoint document libraries — no custom list templates or content types are applied at provisioning time.

---

## 2. Core Lists

Eight core SharePoint lists are provisioned on every project site during Step 4. All 8 were confirmed as core by the product owner on 2026-03-14.

| # | List | Description |
|---|------|-------------|
| 1 | RFI Log | Request for Information tracking |
| 2 | Submittal Log | Submittal package tracking |
| 3 | Meeting Minutes | Weekly and coordination meeting notes |
| 4 | Daily Reports | Daily field report entries |
| 5 | Issues Log | Open issues and blocker tracking |
| 6 | Punch List | Punch list item closeout tracking |
| 7 | Safety Log | Safety observations and incidents |
| 8 | Change Order Log | Potential and approved change order tracking |

**Config source:** `backend/functions/src/config/list-definitions.ts` — `HB_INTEL_LIST_DEFINITIONS` array.

**Provisioning rule:** Step 4 iterates all 8 definitions. Each list is created with idempotency check (`listExists`). Field schemas are applied immediately after list creation.

---

## 3. Template File Manifest

Four template files are uploaded to the **Project Documents** library during Step 3.

| # | File Name | Target Library | Format |
|---|-----------|---------------|--------|
| 1 | Project Setup Checklist.xlsx | Project Documents | Excel |
| 2 | Submittal Register Template.xlsx | Project Documents | Excel |
| 3 | Meeting Agenda Template.docx | Project Documents | Word |
| 4 | RFI Log Template.xlsx | Project Documents | Excel |

**Config source:** `backend/functions/src/config/template-file-manifest.ts` — `TEMPLATE_FILE_MANIFEST` array.

**Asset location:** `backend/functions/src/assets/templates/` — actual Excel/Word files are G2 scope. Step 3 delegates to the `uploadTemplateFiles` service method.

---

## 4. Add-On Packs

Add-ons are template-file-only bundles that extend the core provisioning when explicitly requested. They do not add SharePoint lists.

### 4.1 safety-pack

| File | Target Library |
|------|---------------|
| Safety Plan Template.docx | Project Documents |

- **Lists:** None
- **Asset path:** `backend/functions/src/assets/templates/add-ons/safety-pack/`

### 4.2 closeout-pack

| File | Target Library |
|------|---------------|
| Close-Out Checklist.xlsx | Project Documents |

- **Lists:** None
- **Asset path:** `backend/functions/src/assets/templates/add-ons/closeout-pack/`

**Config source:** `backend/functions/src/config/add-on-definitions.ts` — `ADD_ON_DEFINITIONS` registry.

**Add-on governance:**
- Add-ons are template-file-only; they do not create lists or modify site structure.
- New add-ons are registered in `ADD_ON_DEFINITIONS` with a unique slug key.
- Add-on activation is driven by the `addOns` array on the provisioning status model (G2/T02 scope for model changes).
- Step 3 reads `status.addOns` and uploads the corresponding template files. When the field is absent, add-on upload is a graceful no-op.

---

## 5. Department Pruning Model

The department pruning model adds or removes department-specific libraries based on the project's department classification.

### 5.1 Confirmed Department Types

| Department Key | Display Name |
|---------------|-------------|
| `commercial` | Commercial |
| `luxury-residential` | Luxury Residential |

### 5.2 Department Libraries

| Department | Additional Library | Versioning |
|-----------|-------------------|-----------|
| `commercial` | Bid Documents | Enabled |
| `luxury-residential` | Design Selections | Enabled |

**Config source:** `backend/functions/src/config/core-libraries.ts` — `DEPARTMENT_LIBRARIES` record.

### 5.3 Department Field Contract

The department field on the provisioning status model (`status.department`) determines which department-specific libraries are created. When the field is absent or unrecognized, only the three core libraries are created.

**Implementation status:** Scaffolded in Step 3. Actual pruning logic depends on `status.department`, which is G2/T02 scope (model changes to `IProvisioningStatus`).

---

## 6. Template Versioning Scheme

**Current version:** v1.0

The template version identifies the generation of site template being applied. It is used for:
- Tracking which template version a project site was provisioned with.
- Determining whether a site needs template updates when the template version increments.
- Audit trail and troubleshooting.

**Versioning rules:**
- Template version follows semver: `MAJOR.MINOR`.
- MAJOR increments when core libraries, core lists, or template file manifest changes in a breaking way (e.g., library added/removed, list schema changed).
- MINOR increments when template files are updated or add-ons are added without structural changes.
- The template version is recorded on the provisioning status model (G2/T02 scope for model field).

---

## 7. Navigation Specification

The provisioned site's navigation is determined by the core libraries and lists:

### Left Navigation (Quick Launch)

| Position | Link | Target |
|----------|------|--------|
| 1 | Project Documents | Project Documents library |
| 2 | Drawings | Drawings library |
| 3 | Specifications | Specifications library |
| 4 | RFI Log | RFI Log list |
| 5 | Submittal Log | Submittal Log list |
| 6 | Daily Reports | Daily Reports list |
| 7 | Issues Log | Issues Log list |

**Implementation status:** Navigation link creation is not yet implemented in the provisioning saga. SharePoint creates default links for libraries. Custom navigation ordering will be addressed in a future task.

---

## 8. Template Update Process

When a new template version is released:

1. Update the template files in `backend/functions/src/assets/templates/`.
2. Update `TEMPLATE_FILE_MANIFEST` if file names or target libraries change.
3. Update `CORE_LIBRARIES` or `HB_INTEL_LIST_DEFINITIONS` if structural changes are needed.
4. Increment the template version number.
5. Existing project sites are **not** automatically updated. A separate migration process (future scope) handles retroactive template updates.

---

## Related Documents

- [Saga Steps Reference](./saga-steps.md) — Step-by-step provisioning saga contract
- [Request Lifecycle](./request-lifecycle.md) — End-to-end provisioning request flow
- [State Machine](./state-machine.md) — Provisioning status state transitions
- [Roles & Permissions](./roles-permissions.md) — Provisioning role-based access model
