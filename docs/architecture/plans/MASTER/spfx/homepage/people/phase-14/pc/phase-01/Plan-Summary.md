# Plan Summary — People & Culture + HR Operating Companion Implementation

## Objective

Implement the structural and runtime changes required to complete the **People & Culture** side of the split and deliver a production-ready **People & Culture** public webpart plus its **HR operating companion webpart**.

## Target Product Surfaces

### 1. People & Culture public webpart
Focus:
- announcements
- celebrations / milestones
- broader culture programming
- warm people-facing communication
- homepage feature/supporting hierarchy
- profile-photo-first and campaign-media-aware presentation

### 2. HB Kudos public webpart
Focus:
- recognition only
- maintained as a separate product boundary
- not in scope here except where the split boundary must be preserved

### 3. People & Culture HR operating companion webpart
Focus:
- overview / queue health
- content-family workspaces
- lifecycle operations
- approvals inbox
- homepage governance
- quick-edit drawer + full editor
- scheduling / expiry / suppression
- audience targeting
- milestone intake review
- preview and media control
- limited external intake management

## Phase Map

### Prompt 00 — Authority and scope lock
Freeze architecture, file ownership, repo-truth assumptions, companion scope, and implementation target state.

### Prompt 01 — Data model and contracts
Introduce or normalize the explicit state model, content-family model, audience model, approval triggers, homepage-governance metadata, milestone-candidate fields, media-source fields, preview model, and role model.

### Prompt 02 — People & Culture public surface and homepage integration
Implement or reconcile the dedicated public People & Culture runtime so it consumes the locked companion-driven governance model without collapsing back into the merged Kudos structure.

### Prompt 03 — HR operating companion webpart
Implement the companion workspace:
- Overview
- Announcements
- Celebrations / Milestones
- Culture Programs / Events
- Approvals
- Homepage
- shared quick-edit drawer
- richer full editor
- optional calendar mode

### Prompt 04 — Media, preview, homepage, and milestone operations
Implement:
- profile-photo-first media sourcing with HR override
- multi-context preview
- homepage-feature/supporting governance
- milestone auto-generation into review
- conflict handling and expiring logic

### Prompt 05 — Permissions, intake, notifications, and work management
Implement:
- Editor vs Approver/Admin role behavior
- claim/reassign for approvals only
- limited intake from designated non-HR users
- operator + content-owner notifications
- targeted audience guardrails
- dashboard health signals

### Prompt 06 — Validation, packaging, and closure
Validate the full People & Culture state model, permissions, preview behavior, homepage governance, work-management logic, and rebuild/package the final SharePoint artifact.

## Non-Negotiable Product Outcomes

- no merged overbearing People & Culture / Kudos surface as the final architecture
- no unclear ownership between People & Culture and HB Kudos
- no hidden workflow states inferred only from scattered metadata
- no flat public feed that ignores homepage feature/supporting hierarchy
- no person-based announcement/celebration surface that lacks a trustworthy photo/media model
- no milestone process that depends on fully manual entry for everything
- no approval model that leaves pinned/high-visibility items without the added checkpoint
- no open public intake model for all employees in v1

## Required Locked Decisions

See `Decision-Lock-Appendix.md` for the governing decision set.
