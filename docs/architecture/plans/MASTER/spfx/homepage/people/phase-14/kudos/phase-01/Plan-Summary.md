# Plan Summary — HB Kudos + HR Approval Companion Implementation v3

## Objective

Implement the required structural and runtime changes to complete the split from the merged People & Culture architecture and deliver a production-ready **HB Kudos** recognition product plus its **HR approval companion webpart**, using the existing SharePoint list pair as the governing storage model:

- `People Culture Kudos`
- `Kudos Audit Events`

This v3 package also locks the correct **homepage shared-surface architecture** so the resulting UI is premium and disciplined instead of a mixture of bespoke local styling and weak generic cards.

## Target Product Surfaces

### 1. People & Culture webpart
Focus:
- announcements
- celebrations
- people-facing culture communications

This remains distinct from HB Kudos.

### 2. HB Kudos webpart
Focus:
- featured kudos spotlight
- pinned and standard feed behavior
- archive / browse experience
- submission flow
- celebrate interaction
- detail panel behavior
- role-aware associated-item access

### 3. HR approval companion webpart
Focus:
- moderation queues
- approval / rejection / revision behavior
- admin review handling
- scheduling
- prominence governance
- queue ownership / claim / reassignment
- audit timeline
- bulk-safe governance actions
- operational filters / presets / overdue handling

## UI Architecture and Shared Surface Strategy

### Lane mapping
- HB Kudos employee experience = **presentation-lane recognition**
- HR approval companion = **homepage-hosted governance / operational**
- Shared detail panel = **hybrid recognition + governance**

### Existing shared homepage primitives/surfaces to use directly where applicable
At minimum, evaluate and use where fit:
- `HbcPeopleCultureSurface` or a direct successor/extension
- `HbcKudosComposer*`
- `HbcAvatarStack`
- `HbcPremiumSurface`
- `HbcPremiumSection`
- `HbcPremiumBadge`
- `HbcPremiumCta`
- `HbcHomepageMetadataRow`
- `HbcHomepageActionRow`
- governed motion/icon utilities re-exported through `@hbc/ui-kit/homepage`

### New shared homepage-safe primitives expected if the current kit is insufficient
If absent or too weak, create shared homepage-safe components for:
- recognition archive card/list patterns
- recipient summary / mixed-recipient bucket presentation
- governance queue item shells
- governance toolbar / filter / preset controls
- workflow state / aging / ownership chips
- governance detail sections
- audit timeline presentation blocks
- inline governance action bars

### Local-only responsibilities
Keep these local to webparts/data/helpers:
- SharePoint list reads/writes
- role and authorization logic
- workflow state machine
- scheduling/prominence rules
- notifications
- thin view-model adapters
- runtime mount / manifest / packaging logic

## SharePoint Storage Posture

### Main content/workflow store
Use `People Culture Kudos` directly for:
- content fields
- workflow state
- recipients
- homepage visibility
- removal/restore lifecycle
- revision/withdrawal metadata
- admin-review metadata
- scheduling
- prominence
- claim/reassignment/work ownership
- current visibility mode

### Audit / events store
Use `Kudos Audit Events` directly for:
- durable event timeline
- workflow transition records
- actor/timestamp history
- public/internal notes
- before/after snapshots where appropriate

### Implementation stance
- Do not redesign storage around missing fields if the fields already exist.
- Do not introduce extra required lists unless repo truth proves the current list pair cannot support a needed behavior.
- App logic may derive presentation-only values, but workflow/governance state must align to the existing list fields.

## Phase Map

### Prompt 00 — Authority and scope lock
Freeze architecture, resolve repo/document conflicts, classify UI work into:
- use existing shared primitive
- extend shared primitive
- keep local

### Prompt 01 — Data model and contracts
Normalize the explicit state model and define typed contracts aligned to the live list schema, including typed recipient contracts.

### Prompt 02 — HB Kudos employee experience
Implement the employee-facing recognition experience using shared homepage recognition primitives and new shared recognition primitives where needed.

### Prompt 03 — HR approval companion webpart
Implement the moderation/governance workspace using shared homepage-safe governance primitives and operational surface logic.

### Prompt 04 — Scheduling, prominence, and detail panel
Implement scheduled publishing, prominence rules, and the shared detail panel / audit timeline / governance sections.

### Prompt 05 — Permissions, notifications, and work management
Implement role enforcement, notification rules, overdue/reminder behavior, queue ownership, reassignment, and safe bulk actions.

### Prompt 06 — Validation, packaging, and closure
Validate code paths, import discipline, runtime behavior, build/package output, and produce a final closure report.

## Non-Negotiable Outcome Rules

1. The final homepage webparts must use `@hbc/ui-kit/homepage` as the primary UI entry point.
2. The final HB Kudos submission flow must not use a plain text recipient model.
3. The final product must not rely on one-off local premium shells for reusable patterns.
4. The final product must read as a premium signature recognition/governance experience, not a generic enterprise card grid with light restyling.
5. The People & Culture and HB Kudos experiences must remain distinct products.
6. All workflow/governance state must align to real list fields.
7. All durable historical events should write to `Kudos Audit Events` where the operating model requires reconstruction or traceability.
