# P3-E9-T05 — Reports: Template Governance, Project Extension, and Promotion Workflow

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 §4 — Report definition registry; §14 — Central project-governance policy record
**Locked decisions driving this file:** LD-REP-03, LD-REP-04, LD-REP-05, LD-REP-06, LD-REP-07, LD-REP-11

---

## 1. Corporate Template Library

### 1.1 Purpose

The corporate template library is the MOE/Admin-governed set of approved report family definitions. Every project report family traces back to a corporate template. No project may create a report family that does not reference an approved corporate template (for native families) or follow an approved extension template (for project extensions).

The corporate template library is a governed data store maintained by MOE/Admin in the HB Intel administration layer. It is not a code constant.

### 1.2 Template Types in the Library

| Template Key | Type | Modifiable By | Phase 3 |
|--------------|------|---------------|---------|
| `px-review` | Native — Corporate Locked | MOE/Admin only | Yes |
| `owner-report` | Native — Corporate Configurable | MOE/Admin (structure); PE (project config within zones) | Yes |
| `sub-scorecard` | Integration-Driven Artifact | MOE/Admin (structure); P3-E10 (source data) | Yes |
| `lessons-learned` | Integration-Driven Artifact | MOE/Admin (structure); P3-E10 (source data) | Yes |
| Project Extension Base | Extension Template | MOE/Admin defines the extension template; PE activates project instance | Future (not required Phase 3) |

### 1.3 Locked Template Constraint

A template marked `isLocked: true` in its `IReportFamilyDefinition` (e.g., `px-review`) cannot be structurally modified by any project-level action. Specifically:

- Projects may not add, remove, or reorder sections on a locked template.
- Projects may not change the content type of sections.
- Projects may not change the approval gate, release class set, or audience class set.
- The only PM-level customization on a locked template is authoring narrative in designated narrative sections.
- Structural modifications require a new MOE-approved template version.

### 1.4 Template Versioning

When MOE makes a structural change to a corporate template:
1. A new template version is created (e.g., version N+1).
2. The `effectiveFrom` field records when the new version takes effect.
3. Existing project registrations that reference version N continue to use version N until PE activates a new project configuration version referencing version N+1.
4. The family registry tracks which template version each project's active configuration was built against.

---

## 2. Project-Level Configuration (within Template Bounds)

### 2.1 What Projects May Configure

For configurable templates (`native-configurable` and `integration-artifact` types where the template permits customization), projects may configure within MOE-defined customization zones:

| Customization | Allowed For | Constraint |
|---------------|-------------|------------|
| Narrative section content | All non-locked families | PM-authored; text only (LD-REP-08) |
| Section include/exclude | Where template marks section as optional | Requires PE re-approval if post-activation |
| Section ordering | Where template allows reordering | Non-structural; no PE re-approval required |
| Release class selection | From template's `allowedReleaseClasses` | PM selects; within allowed set only |
| Audience class selection | From template's `allowedAudienceClasses` | PE approval required to broaden |

### 2.2 What Projects May NOT Configure

- Adding sections not defined in the corporate template.
- Creating custom data bindings or formula overrides in any section.
- Changing the content type (`contentType`) of any section.
- Removing the approval gate on PX Review.
- Overriding the `perReleaseAuthority` setting unilaterally (policy record governs this).
- Modifying the source module reference for `module-snapshot` or `calculated-rollup` sections.

### 2.3 Configuration Activation Workflow

```
PM creates/edits project family configuration draft
  → PM submits for PE activation (or PE activates directly for simple non-structural changes)
  → PE reviews draft configuration
  → PE activates: config version state = 'active'; project family is live
  → PE rejects: PM must revise
```

For non-structural changes (narrative defaults, section ordering, release class within allowed set), PE may activate immediately without a formal review step — the system flags whether PE re-approval is needed based on `structuralChanges` flag.

---

## 3. Post-Activation Structural Change Workflow

### 3.1 When It Applies

When PM needs to make a structural change (add/remove section, change content type, change source module ref) after a project family has already been activated, the following workflow applies (LD-REP-07):

1. PM makes structural changes to the existing configuration.
2. System sets `structuralChanges = true` on the draft configuration version and creates a new version number.
3. The existing active version (N) remains active and continues to drive generation runs.
4. PM submits new draft version (N+1) for PE re-approval.
5. PE reviews and activates the new version, or rejects with reason.
6. On activation of version N+1: prior version N transitions to `'superseded'`; version N+1 becomes `'active'`.

### 3.2 Running During Pending Re-Approval

While a structural change draft is pending PE re-approval:
- New generation runs still use the current active version (N).
- The pending draft (N+1) is clearly shown in the UI as pending approval.
- PE may approve and activate version N+1 at any time.

---

## 4. Project Extension Families (Future — Not Required Phase 3)

### 4.1 Overview

In future phases, projects may register project-specific report families not covered by the standard corporate template library, subject to MOE-approved extension template guardrails. The Phase 3 implementation does not require this capability, but the data model in T02 supports it (via `IProjectFamilyRegistration.promotionStatus`).

### 4.2 Extension Model Principles (for future reference)

- PM drafts a project extension proposal using an MOE-approved extension template as the base.
- PE activates the project extension.
- The extension is visible and usable within the project only.
- Proven extensions may be submitted for promotion to the corporate template library.

---

## 5. Template Promotion Workflow

### 5.1 Purpose

A project-level extension family that has proven useful may be promoted to the corporate template library. This makes it available to all projects as a corporate template.

Promotion is a MOE/Admin governance process. It is tracked on `IProjectFamilyRegistration.promotionStatus`.

### 5.2 Promotion Steps

```
Project PE submits extension for promotion (promotionStatus = 'submitted-for-review')
  → MOE reviews template quality, scope, and business value (status = 'under-review')
  → MOE approves:
      status = 'approved-promoted'
      Extension is published to corporate template library as a new family definition
      Existing project registration updated to reference the new corporate family key
  → MOE rejects:
      status = 'rejected'
      Rejection reason recorded
      Extension remains as a project-only family
```

### 5.3 Promotion Constraints

- Only PE may submit an extension for promotion; PM may not.
- MOE may request revisions before final approval.
- Promoted templates become subject to all corporate template governance rules, including `isLocked` classification if MOE designates them as locked.
- The originating project's existing runs are not affected by promotion; they remain associated with the project's configuration versions.

---

## 6. Central Project-Governance Policy Record

### 6.1 Ownership and Enforcement Split

The central project-governance policy record governs approval/release/distribution rules per project and report family. Reports enforces it but does not own it (LD-REP-04, P3-F1 §14.6).

| Actor | Authority |
|-------|-----------|
| MOE/Admin | Owns the global policy floor; sets minimum requirements that apply to all projects |
| Project Executive (PE) | Sets project-level overlay; may tighten policy floor but NOT loosen it |
| Reports module | Reads and enforces the effective merged policy; never modifies it |

### 6.2 Policy Hierarchy

```
Global floor (MOE)
  + Project overlay (PE, additive/restrictive only)
  = Effective policy (what Reports enforces)
```

Example: If the global floor sets `maxStalenessThresholdDays = 14`, no project overlay can set a project's staleness threshold above 14 days (though the family definition default may be 7 days).

### 6.3 Policy Enforcement Points

Reports enforces the effective policy at these critical points:
- Draft generation readiness check (staleness threshold, narrative completeness)
- Approval action gate (requires internal review chain completion if policy requires it)
- Release action gate (PER release authority check per `perReleaseAuthority`)
- Audience class change gate (PE approval required for broader audience)
- External distribution gate (template + policy permission check)

### 6.4 Policy Change Propagation

When the effective policy changes (PE updates the project overlay, or MOE updates the global floor):
- The next generation run readiness check uses the updated effective policy.
- Runs already in progress (status = `generating`) are not affected.
- Runs in `generated` status awaiting approval use the current policy at the time the approval action is taken.
