# W0-G1-T01 — Site Template Specification

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 1 task plan for site template decisions. Governs what structure the provisioning saga creates in every project site. Must be locked before G2 step 3/4 implementation proceeds.

**Phase Reference:** Wave 0 Group 1 — Contracts and Configuration Plan
**Locked Decision Applied:** Decision 1 — Core template plus selectable add-ons
**Estimated Decision Effort:** 1–2 working sessions with product owner
**Depends On:** None within Group 1 (may begin immediately)
**Unlocks:** G2.1–G2.7 (backend hardening, specifically step3/step4 implementation), T06 of MVP Project Setup plan set
**ADR Output:** Contributes to ADR-0114 (site template section)

---

## Objective

Lock the Wave 0 site template specification: the exact structure that the provisioning saga creates inside every project's SharePoint site. This includes the core template (applied unconditionally to all projects) and the add-on model (additional structure applied conditionally).

The output of this task is a reference document (`docs/reference/provisioning/site-template.md`) that G2 implementors use directly when building out step 3 (`step3-template-files.ts`) and step 4 (`step4-data-lists.ts`) in the provisioning saga. Implementors must not invent template contents during G2; they must implement what T01 specifies.

---

## Why This Task Exists

The provisioning saga currently has a partial template implementation:

- **Step 2** (`step2-document-library.ts`) creates a single library named `'Project Documents'`
- **Step 3** (`step3-template-files.ts`) calls `uploadTemplateFiles(siteUrl, 'Project Documents')` — the actual template files uploaded are not explicitly defined in code; they depend on what is loaded by the SharePoint service
- **Step 4** (`step4-data-lists.ts`) uses `HB_INTEL_LIST_DEFINITIONS` from `backend/functions/src/config/list-definitions.ts` — this file already defines 8 lists (RFI Log, Submittal Log, Meeting Minutes, Daily Reports, Issues Log, Punch List, Safety Log, Change Order Log)

This partial state means the template is partially implemented but not formally governed. There is no canonical reference document stating what the Wave 0 template should contain, what is in scope vs. out of scope, or what the add-on model looks like. Without this specification:

- G2 implementors cannot know whether the current `HB_INTEL_LIST_DEFINITIONS` is the correct Wave 0 template or an overly expansive placeholder
- The setup request form (G4) cannot offer add-on selection without knowing what add-ons exist
- Wave 1 app teams cannot know what site structure to build against
- The site template cannot be versioned or updated predictably

---

## Scope

T01 covers:

1. Definition of the **Wave 0 core template**: the document libraries, lists, navigation, and template files that every project site receives unconditionally
2. Definition of the **Wave 0 add-on model**: what categories of optional structure exist, what is in scope for Wave 0 as add-ons, and how add-on selection is governed
3. The **department field requirement**: specifying what `department` means, what values are valid, and what structural behavior it drives in the template
4. Rules for **native vs. custom provisioning**: when to use SharePoint site scripts vs. saga step code
5. The **reference document** structure that G2 and downstream consumers will use

T01 does not cover:

- Implementing the template changes in saga steps (that is G2)
- The add-on selection UI in the setup form (that is G4)
- Wave 1+ template expansions or site redesigns
- SharePoint page layouts, SPFx webpart placement, or visual design of the site home page
- External integrations that post data into site lists (those are Wave 1 scope)

---

## Governing Constraints

- **Locked Decision 1 (core + add-ons):** The template model must implement core plus selectable add-ons. The core is mandatory and identical for all projects. Add-ons are explicitly defined packages, not ad-hoc customizations.
- **Template must support Wave 1 consumers:** The Wave 0 template is the structural foundation on which Wave 1 app surfaces (Project Hub SPFx webpart, Estimating integration, BD pipeline) will build. The template must provide the right structure without over-provisioning.
- **CLAUDE.md §1.2 Zero-Deviation Rule:** Once the template specification is locked in the reference document, it becomes the governing contract. Changes require a superseding ADR.
- **R-01 from MVP Project Setup plan:** Prefer platform-native site template / site script actions for repeatable site-scoped configuration; use custom saga steps only for behaviors the native layer cannot cover.
- **Idempotency requirement:** All template provisioning must be idempotent — if a step is re-run, it must no-op on already-existing artifacts (the current `listExists` and `documentLibraryExists` checks in the SharePoint service support this).
- **Department field dependency:** The `IProjectSetupRequest` interface in `@hbc/models/src/provisioning/IProvisioning.ts` does not currently include a `department` field. T01 must specify the field contract so that Project Setup T02 can add it to the model. T01 does not add the field — it documents what the field must be.

---

## Current State Baseline

The following is what the provisioning saga already creates, confirmed from live code:

### Already provisioned (code-verified)

**Document Library (Step 2):**
- `Project Documents` — generic project document library (always created)

**Data Lists (Step 4) — from `HB_INTEL_LIST_DEFINITIONS`:**
| List Title | Purpose |
|-----------|---------|
| RFI Log | Request for Information tracking |
| Submittal Log | Submittal package tracking |
| Meeting Minutes | Weekly and coordination meeting notes |
| Daily Reports | Daily field report entries |
| Issues Log | Open issues and blocker tracking |
| Punch List | Punch list item closeout tracking |
| Safety Log | Safety observations and incidents |
| Change Order Log | Potential and approved change order tracking |

**Template Files (Step 3):**
- Files are uploaded to `Project Documents` — the specific file set is determined by what the SharePoint service loads; no formal file manifest exists in code

**Permissions (Step 6):**
- Currently assigns `groupMembers + OPEX_UPN` to a single SharePoint group — this does not yet use the 3-group Entra ID model (that is T02's concern)

### Not yet provisioned

- No department-specific document library variants (T06 in Project Setup plan set specifies these as department-pruning behavior)
- No Entra ID security groups (T02)
- No navigation structure customization
- No site home page customization
- No hub association configuration (Step 7 handles hub association, but what hub it joins is not yet specified as a config value)

---

## Template Architecture Decision

### Core vs. Add-On Model

The **core template** contains the structure that is always provisioned, regardless of project type, department, or any other variable. It is applied deterministically on every provisioning run.

**Criteria for being in the Wave 0 core:**
- Used by all projects in all departments
- Required for Wave 1 apps to function (if a Wave 1 app depends on a list existing, that list is in the core)
- Stable — unlikely to change between projects
- Not controversial — no add-on selection needed

**Criteria for being an add-on:**
- Used by a subset of projects (e.g., only commercial, only certain project types)
- Selectable at setup time by the requestor or controller
- May be provisioned after the initial core, as a second provisioning pass
- Has a defined governance mechanism (who approves which add-ons)

**Criteria for Wave 0 deferral:**
- Not needed by any Wave 0 or Wave 1 app surface
- Complex to provision reliably
- Requires external system integration
- Can be added manually post-provisioning without breaking anything

---

## Wave 0 Core Template Definition

The following constitutes the **required Wave 0 core template**. This is the specification that G2 implementors must treat as authoritative.

### Document Libraries

| Library Name | Purpose | Department Scope |
|-------------|---------|-----------------|
| `Project Documents` | Primary project document store | All |
| `Drawings` | Construction drawings and revisions | All |
| `Specifications` | Project specification documents | All |

**Library governance rules:**
- `Project Documents` already exists (Step 2 creates it); steps 3–4 run relative to it
- `Drawings` and `Specifications` are new additions to the Wave 0 core; Step 2 must be extended to create all three libraries, or a companion step must handle the additional libraries
- All three libraries must be created with versioning enabled
- No additional libraries are in the Wave 0 core

**Department-specific library behavior (governed by T06 pruning model):**
The MVP Project Setup T06 plan and `docs/explanation/feature-decisions/MVP/MVP-Project-Setup.md` specify a **pruning model**: the source template site contains *both* department-specific document libraries (`Commercial Documents` and `Luxury Residential Documents`), and provisioning Step 3 removes the library that does not match the project's `department` value. This is not an add-on selection — it is pruning behavior.

Accordingly, `Commercial Documents` and `Luxury Residential Documents` are **not Wave 0 add-ons**. They are department-mandatory libraries whose presence in the final provisioned site is determined by the department field via Step 3 pruning (see `step3-template-files.ts`). The add-on model governs truly optional extras only — see §Add-On Model Definition below.

The core-always libraries (`Project Documents`, `Drawings`, `Specifications`) are always present after provisioning, regardless of department.

### Department Library Model

Each provisioned project site contains exactly **one department-appropriate document library** — either `Commercial Documents` or `Luxury Residential Documents` — determined by `IProvisionSiteRequest.department`.

**Implementation model (governed by T06 pruning approach):**
The provisioning source template site contains both department libraries. Step 3 (`step3-template-files.ts`) reads `status.department` and removes the non-applicable library. This is the pruning model specified in `MVP-Project-Setup-T06` and confirmed by `docs/explanation/feature-decisions/MVP/MVP-Project-Setup.md`.

| department value | Library retained | Library removed |
|-----------------|-----------------|----------------|
| `commercial` | `Commercial Documents` | `Luxury Residential Documents` |
| `luxury-residential` | `Luxury Residential Documents` | `Commercial Documents` |

**What this means for G2:**
- G2 must NOT implement department libraries as add-on keys in `ADD_ON_DEFINITIONS`
- G2 must implement department library selection as a pruning action in Step 3
- The pruning step must be idempotent: if the non-applicable library is already absent, no-op

---

### Standard Lists (Core)

> **Status: Confirmed — product owner locked 2026-03-14.** All 8 lists in `HB_INTEL_LIST_DEFINITIONS` are the confirmed Wave 0 core. Every provisioned project site receives all 8 lists unconditionally. G2 must implement Step 4 against the full `HB_INTEL_LIST_DEFINITIONS` without trimming. Punch List and Safety Log were previously proposed as candidate add-ons; that proposal is superseded by this product owner decision.

The following 8 lists constitute the confirmed Wave 0 core. Field schemas exist for all 8 in `HB_INTEL_LIST_DEFINITIONS` (`backend/functions/src/config/list-definitions.ts`).

| List Title | Core Rationale | Wave 1 Dependency |
|-----------|---------------|------------------|
| RFI Log | Universal construction workflow | Project Hub RFI surface |
| Submittal Log | Universal construction workflow | Project Hub submittal surface |
| Change Order Log | Universal construction workflow | Project Hub change order surface |
| Issues Log | Universal construction tracking | Project Hub issues surface |
| Daily Reports | Universal field reporting | Field crew experience (Wave 2) |
| Meeting Minutes | Universal project management | Project Hub meeting surface |
| Punch List | Universal closeout tracking — confirmed core by product owner 2026-03-14 | Project Hub punch list surface |
| Safety Log | Universal safety compliance — confirmed core by product owner 2026-03-14 | Safety reporting surface |

### Navigation

The Wave 0 core navigation should be minimal:
- Left navigation must include quick links to: `Project Documents`, `Drawings`, `Specifications`, and each core list
- A "Welcome" page or announcement web part on the site home page is desirable but not required for Wave 0 pilot
- SPFx webpart placement on the site home page is Step 5 (web parts installation) — not a template concern

**Navigation is provisioned via site scripts** where possible, per R-01. If the site script approach requires additional tenant configuration, document the requirement explicitly.

### Template Files

Step 3 uploads template files into `Project Documents`. The Wave 0 template file set must be defined explicitly.

**Required template file manifest for Wave 0 core:**

| File Name | Type | Purpose |
|-----------|------|---------|
| `Project Setup Checklist.xlsx` | Excel | Initial project setup tracking |
| `Submittal Register Template.xlsx` | Excel | Blank submittal register |
| `Meeting Agenda Template.docx` | Word | Standard meeting agenda format |
| `RFI Log Template.xlsx` | Excel | Offline RFI tracking backup |

**Implementation note:** These files must exist as assets in the backend function's deployment package (e.g., `backend/functions/src/assets/templates/`). The `uploadTemplateFiles` method in `SharePointService` must reference this file manifest. G2 must create the assets directory and populate it as part of the backend hardening work.

---

## Add-On Model Definition

### Wave 0 Add-On Governance

An add-on is an explicitly defined provisioning package that:
1. Has a declared name and description
2. Has a defined set of resources it provisions (libraries, lists, files)
3. Is selectable at setup request time by the submitter (if self-serve) or by the controller (if gated)
4. Is implemented as an idempotent provisioning action that can run independently of or after the core

**Add-on selection field:** The setup request form (`IProjectSetupRequest`) will need an `addOns: string[]` field listing selected add-on keys. This field addition is a new requirement introduced by T01. It is not covered by MVP Project Setup T02 (which specifies different model extensions: `department`, `clarifications`, retry policy, etc.). G2 must add `addOns: string[]` to `IProvisionSiteRequest` (and propagate it through `IProvisioningStatus`) as part of the template hardening work in steps 3 and 4.

### Wave 0 Add-Ons (In Scope)

> **Scope note:** Department-specific document libraries (`Commercial Documents`, `Luxury Residential Documents`) are **not add-ons**. They are provisioned via Step 3's department-pruning behavior (T06 model). The add-on registry covers truly optional extras only.

| Add-On Key | Name | Contents | Who Selects |
|-----------|------|----------|-------------|
| `safety-pack` | Safety Management Pack | `Safety Plan Template.docx` template file only | Controller |
| `closeout-pack` | Project Close-Out Pack | `Close-Out Checklist.xlsx` template file only | Controller |

> **List components removed 2026-03-14:** Safety Log and Punch List were originally planned as list components of these add-ons. They are now confirmed core lists (product owner decision 2026-03-14) and are always provisioned in Step 4. The `safety-pack` and `closeout-pack` add-ons are retained as **template-file-only** packs — they provision the corresponding optional working documents that some projects need, without duplicating the list provisioning already in the core. See updated `ADD_ON_DEFINITIONS` below.

**Notes:**
- The controller may select `safety-pack` and `closeout-pack` during the request review step — not at initial submission
- No add-on requires product owner approval at Wave 0; controller discretion is sufficient
- Add-ons not in this registry are deferred to post-Wave-0
- Future add-ons (e.g., luxury-residential-specific documents, commercial-specific site content) may be added as the template model matures, but must not duplicate the department-pruning behavior already governed by T06

### Add-On Implementation Pattern

Add-ons must be implemented as named provisioning actions registered in a config module. The saga orchestrator does not need to know about add-ons directly; Step 3 and Step 4 read the add-on selection from the provisioning request and execute the corresponding provisioning actions.

Conceptual structure (G2 implements, T01 specifies):
```
// backend/functions/src/config/add-on-definitions.ts
// Updated 2026-03-14: Safety Log and Punch List are confirmed core lists.
// safety-pack and closeout-pack are now template-file-only add-ons.
export const ADD_ON_DEFINITIONS: Record<string, IAddOnDefinition> = {
  'safety-pack': {
    lists: [],                              // Safety Log is core — always provisioned in Step 4
    templateFiles: ['Safety Plan Template.docx'],
  },
  'closeout-pack': {
    lists: [],                              // Punch List is core — always provisioned in Step 4
    templateFiles: ['Close-Out Checklist.xlsx'],
  },
};
```

Step 3 and Step 4 receive the `addOns: string[]` array from the provisioning request (`IProvisionSiteRequest`) and apply the matching definitions. For Wave 0, both registered add-ons provision template files only — list provisioning is handled unconditionally by Step 4 from the confirmed 8-list core. Note that Step 3 also separately applies department-library pruning behavior (removing the non-applicable department library) — this is independent of the add-on selection path and is governed by T06.

---

## Department Field Requirement

The `IProjectSetupRequest` type in `@hbc/models/src/provisioning/IProvisioning.ts` does not currently include a `department` field. T01 specifies the contract; Project Setup T02 implements the field addition.

### Specification

```typescript
// Required addition to IProjectSetupRequest
department: ProjectDepartment;

// Required new type in @hbc/models
// Wave 0 locked values — aligned with MVP-Project-Setup-T02 contract spec and
// docs/explanation/feature-decisions/MVP/MVP-Project-Setup.md §Interface Contract.
// Expand only through a superseding ADR or future-wave model update.
export type ProjectDepartment =
  | 'commercial'
  | 'luxury-residential';
```

**Governing rules:**
- `department` is required — it must not be optional in the request model; the form must enforce selection
- `department` drives the department library selection behavior in Step 3 (see §Department Library Model below)
- `department` also drives department background access group selection in Step 6 (see T02)
- The same `department` field must be propagated to `IProvisionSiteRequest` and `IProvisioningStatus` so downstream steps have access to it

### Wave 0 Department Meanings

| Value | Meaning |
|-------|---------|
| `commercial` | Commercial construction projects (office, retail, industrial) |
| `luxury-residential` | Luxury residential projects (high-end multi-family, custom homes) |

> **Locked values:** `commercial` and `luxury-residential` are the only locked Wave 0 department values, per the governing MVP Project Setup T02 contract spec ("lean for MVP; expand in future phases"). `mixed-use` and `other` are commonly discussed as candidates for future phases but are **not locked for Wave 0** and must not be added to the `ProjectDepartment` union without a model update or superseding ADR. See Risk T01-R2 for future expansion guidance.

---

## Native vs. Custom Provisioning Rule

Per R-01 from the MVP Project Setup plan:

**Use native SharePoint site scripts for:**
- Navigation link configuration
- Site theme application
- Site column and content type registration (if needed in future)

**Use custom saga steps for:**
- Document library creation (already in Step 2)
- Template file upload (already in Step 3)
- Data list creation (already in Step 4)
- Permission assignment (Step 6)

**Rationale:** The custom saga step approach provides retry semantics, idempotency checks, AppInsights telemetry, and compensation logic that native site scripts cannot provide. For Wave 0, consistency and reliability outweigh the convenience of native-only provisioning.

**Exception:** If navigation can be reliably set via a site script applied before Step 2, it should be. Site script application is not currently a saga step — if this is added, it should be Step 0 (pre-core) or embedded in Step 1 after site creation.

---

## Template Versioning

Every provisioned site must record which template version was applied. This enables future template updates to identify which sites need migration.

**Required approach:**
- Add a `templateVersion` property to `IProvisioningStatus` (e.g., `templateVersion: string`)
- The Wave 0 template is version `'1.0'`
- The saga sets `status.templateVersion = '1.0'` before executing template steps
- If a future template version is released, `templateVersion` on the status record distinguishes which sites received which template

This field is specified here and implemented in Project Setup T02 (model hardening).

---

## Reference Document Requirements

T01 must produce `docs/reference/provisioning/site-template.md` as its primary artifact. That document must include at minimum:

1. Wave 0 core template: libraries (names, versioning enabled), lists (titles only — full schemas in code), template files (manifest)
2. Wave 0 add-on registry: each add-on's key, name, description, contents, and selection governance
3. Department field values and behaviors
4. Template versioning scheme
5. Rules for when the template may be updated and what process that requires

The reference document is a **human-readable specification**, not code. It should be written for an admin, a Wave 1 developer, or a new team member who needs to understand what a provisioned project site contains.

---

## Acceptance Criteria

- [ ] Wave 0 core document libraries are enumerated (names, count, versioning requirement)
- [ ] Wave 0 core lists are enumerated — all 8 confirmed (titles; field schemas remain in `HB_INTEL_LIST_DEFINITIONS`); product owner confirmation recorded 2026-03-14
- [ ] Wave 0 template file manifest is complete (file names, types, target library)
- [ ] Add-on model is defined: 2 optional template-file-only add-ons registered (`safety-pack` → Safety Plan Template.docx; `closeout-pack` → Close-Out Checklist.xlsx); list components removed since Safety Log and Punch List are confirmed core; department library behavior described as T06 pruning (not add-ons)
- [ ] Add-on governance rules documented (who selects, when, whether controller-only)
- [ ] `department` field contract is documented: type union locked to `commercial | luxury-residential` for Wave 0, valid values, behaviors, future expansion path noted
- [ ] Native vs. custom provisioning rule is documented
- [ ] Template versioning scheme is documented
- [ ] Reference document (`docs/reference/provisioning/site-template.md`) exists and is complete
- [ ] Reference document is added to `current-state-map.md §2` as "Reference"
- [ ] G2 implementors can implement step 3 and step 4 from this specification without inventing assumptions

---

## Known Risks and Pitfalls

**Risk T01-R1: Template scope creep.** The product owner may want to add lists or libraries that are "nice to have" for Wave 0. Resist this. Every addition to the core increases provisioning time, increases the failure surface area, and makes the template harder to maintain. Use the add-on model for optional items.

**Risk T01-R2: Department taxonomy expansion pressure.** The locked Wave 0 `ProjectDepartment` type contains exactly two values (`commercial`, `luxury-residential`), per the governing MVP Project Setup T02 contract spec. Teams may propose additional values such as `mixed-use` or `other`. These are not locked for Wave 0 and must not be added to the type union without a model update. Expanding the department taxonomy changes the template pruning behavior (Step 3) and the department background access model (T02/T04) — it is not a trivial addition. The correct path is a future-wave model update with product owner confirmation of the additional department values and their provisioning behaviors before the type is expanded.

**Risk T01-R3: Template file assets not created.** The `uploadTemplateFiles` implementation in `SharePointService` will fail at G2 if the actual template file assets do not exist in the backend deployment package. G2 must create these files — T01 specifies what they should be called and where they go.

**Risk T01-R4: ~~`HB_INTEL_LIST_DEFINITIONS` treated as canonical without review.~~** *Resolved 2026-03-14.* Product owner confirmed all 8 lists in `HB_INTEL_LIST_DEFINITIONS` are the confirmed Wave 0 core. G2 must implement Step 4 against the full 8-list set. No trimming is permitted. This risk is closed.

---

## Follow-On Consumers

The locked T01 decision feeds directly into:

- **G2.3 (Harden Steps 3–4):** G2 must implement T01's core template and add-on model in step 3 and step 4. The `HB_INTEL_LIST_DEFINITIONS` file may need revision based on T01 decisions.
- **T06 (MVP Project Setup plan set):** SharePoint template and permissions bootstrap uses T01's template spec as its governing input for what to provision.
- **G4.1 (Project Setup Request Form):** The add-on selection UI must present the Wave 0 add-ons defined in T01. No add-on may appear in the UI that is not in the T01 registry.
- **Wave 1 planning:** Wave 1 apps (Project Hub, Estimating integration) must build against the structure T01 defines. If T01's template is incomplete, Wave 1 work cannot proceed reliably.

---

*End of W0-G1-T01 — Site Template Specification v1.2 (Corrected 2026-03-14 v1.1: department type locked to `commercial | luxury-residential`; department library model reconciled with T06 pruning approach; `commercial-documents`/`luxury-residential-documents` removed from add-on registry; add-on count corrected to 2; list section labeled as proposed default; `addOns` field attribution corrected. Updated 2026-03-14 v1.2: all 8 lists confirmed core by product owner — Punch List and Safety Log promoted from proposed add-ons to confirmed core; `safety-pack` and `closeout-pack` repurposed as template-file-only add-ons with empty `lists` arrays; Risk T01-R4 closed.)*
