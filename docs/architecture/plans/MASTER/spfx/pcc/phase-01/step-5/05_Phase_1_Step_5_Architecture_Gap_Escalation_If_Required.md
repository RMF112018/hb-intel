# Prompt 05 — Phase 1 Step 5 Architecture Gap Escalation If Required

Use this prompt only if the validation harness reveals a true architecture issue that cannot be fixed mechanically.

## Objective

Document architecture gaps discovered during schema validation or contract integrity checks.

Do not resolve architecture gaps by weakening schemas, disabling tests, removing guardrails, changing enum meanings, or adding unsupported fields.

---

## Use This Prompt If

Use this prompt if any validation failure requires:

- changing a Contract decision;
- changing ProjectType / ProjectStage / ProjectStatus meaning;
- changing Decision Closure status meaning;
- changing Procore boundary rules;
- changing OC-17 or OC-18 placeholder-only treatment;
- changing Sage Intacct / Procore system-of-record boundaries;
- adding a runtime behavior requirement;
- introducing provisioning, backend, or SPFx behavior;
- changing required/optional field semantics in a way not supported by field maps;
- weakening no-secret checks;
- changing how full extraction is determined.

---

## Allowed File Changes

Create or update only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Architecture_Gap_Escalation_Register.md
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
```

Do not modify schemas while the gap remains unresolved.

Do not set `fullExtractionComplete: true`.

---

## Required Escalation Register

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Architecture_Gap_Escalation_Register.md
```

Required sections:

```markdown
# Phase 1 Step 5 — Architecture Gap Escalation Register

## Purpose
## Summary
## Gap Register
## Validation Failures Caused by Architecture Gaps
## Work Paused
## Work That Can Continue
## Impact on Phase 1 Completion
## Impact on Phase 2 Readiness
## Recommended Decision Path
## Validation
```

Required table:

```markdown
| Gap ID | Severity | Validation Failure | Source Section(s) | Affected Schema / Fixture | Gap / Conflict | Why Mechanical Fix Is Not Allowed | Required Decision Owner | Recommended Resolution Path | Blocks Phase 1 Completion? | Notes |
```

Severity values:

```text
Critical
High
Medium
Low
Informational
```

Blocks Phase 1 Completion values:

```text
Yes
Partial
No
```

---

## Required Completion Summary

Output:

```markdown
## Completion Summary

### Escalation Register Created
### Blocking Gaps
### Validation Failures
### Work Paused
### Work That Can Continue
### fullExtractionComplete Status
### Phase 1 Completion Decision
### Recommended Decision Path
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): record phase 1 validation architecture gaps
```
