# Plan Summary — HB Kudos + HR Approval Companion Implementation

## Objective

Implement the required structural and runtime changes to complete the split from the merged People & Culture architecture and deliver a production-ready **HB Kudos** recognition experience plus its **HR approval companion webpart**.

## Target Product Surfaces

### 1. People & Culture webpart
Focus:
- announcements
- celebrations
- people-facing communication

### 2. HB Kudos webpart
Focus:
- featured kudos spotlight
- pinned and standard kudos feed behavior
- archive / browse surface
- submission experience
- celebrate interaction
- detail panel behavior
- role-aware associated-item access

### 3. HR approval companion webpart
Focus:
- moderation queues
- revision / rejection / approval behavior
- admin review handling
- scheduling
- prominence governance
- queue ownership / claim / reassignment
- audit timeline
- safe bulk actions
- operational filters / presets / overdue handling

## Phase Map

### Prompt 00 — Authority and scope lock
Freeze architecture, file ownership, repo-truth assumptions, and implementation target state.

### Prompt 01 — Data model and contracts
Introduce or normalize the explicit status/state model, recipient model, role model, scheduling/prominence fields, audit metadata, and queue/work-management contracts.

### Prompt 02 — HB Kudos employee experience
Implement the dedicated HB Kudos employee-facing runtime:
- submission
- archive/feed
- celebrate toggle
- detail panel
- associated-item visibility behavior

### Prompt 03 — HR approval companion webpart
Implement the moderation workspace, queue system, queue ordering, queue counts, filtering, claim/reassignment, and lightweight inline governance actions.

### Prompt 04 — Scheduling, prominence, and detail panel
Implement:
- admin-only scheduling
- featured/pinned rules
- role-aware detail panel sections
- reduced associated-history view for no-longer-public items

### Prompt 05 — Permissions, notifications, and work management
Implement:
- shared role model
- webpart-configured SharePoint principal/group permissions
- queue-specific overdue reminders
- admin review flag lifecycle
- shared operational presets
- safe bulk actions

### Prompt 06 — Validation, packaging, and closure
Validate the full state machine, UI behavior, permissions, runtime flows, and package contents. Rebuild and prove the final `hb-webparts.sppkg`.

## Non-Negotiable Product Outcomes

- no plain text pseudo-people picker for recipients
- no merged overbearing surface as the final Kudos architecture
- no hidden workflow states inferred from scattered metadata alone
- no destructive deletion as the normal removal model
- no unrestricted visibility drift between public, associated-party, HR, and admin audiences
- no automatic retry magic for missed prominence conflicts
- no public comments/replies in v1

## Required Locked Decisions

See `Decision-Lock-Appendix.md` for the governing decision set.
