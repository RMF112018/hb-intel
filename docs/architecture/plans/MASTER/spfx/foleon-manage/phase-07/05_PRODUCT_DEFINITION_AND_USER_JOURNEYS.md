# 05 — Product Definition and User Journeys

## Product Definition

### Foleon

The authoring and source content platform. Marketing creates and manages primary content in Foleon.

### HB Intel Foleon Manager

The HB Central placement and readiness control plane. It governs which Foleon content appears in which HB Central reader lane, when it appears, and whether it is safe to render.

### HB Central Foleon Readers

Employee-facing presentation surfaces embedded in HB Central.

## Primary User Questions

The Manager must answer:

- What content is available from Foleon?
- What content is new since last sync?
- What is ready for HB Central?
- What lanes need attention?
- What is live now?
- What is staged next?
- What is blocked and why?
- What action should I take next?
- Can I safely place this content?
- Can I preview what employees will see?

## Primary User Journey

1. User opens Foleon Manager.
2. Command header summarizes sync/readiness and last sync.
3. Content Inbox highlights new and unassigned content.
4. User selects a content item.
5. Detail panel shows Foleon source metadata, readiness, recommended lane, and preview eligibility.
6. User selects “Place in lane.”
7. Placement workflow suggests destination lane and display window.
8. User confirms placement.
9. Manager validates placement.
10. User previews employee-facing reader.
11. User activates/publishes placement.

## Secondary Journeys

### Review Blocked Content

1. Filter inbox to Blocked.
2. Select content.
3. Read reason grouped by Foleon source issue / HB Central placement issue / backend admin issue.
4. Take recommended action or assign to admin.

### Manage Existing Lane

1. Open Lane Control Board.
2. Select Project Spotlight, Company Pulse, or Leadership Message.
3. Review live and staged items.
4. Update display window or replace staged item.
5. Preview lane.
6. Activate when ready.

### Run Sync

1. Click Sync from Foleon.
2. System shows progress and expected result.
3. New/changed records appear in Inbox.
4. Sync errors appear as recoverable issues, not raw diagnostics.

## Admin-Only Journey

1. Open Admin / Config.
2. Review system readiness groups.
3. Copy redacted proof.
4. Validate Graph/list bindings.
5. Review OAuth/token/API audience state.
6. Confirm package/runtime identity.
7. Troubleshoot with correlation IDs and backend diagnostics.

## Role Language

Use:

- Content Manager
- Marketing Operations
- Homepage lane
- Live now
- Staged next
- Ready to place
- Needs review
- Blocked
- Preview employee view

Avoid in primary path:

- Registry item
- Raw GUID
- Reader key
- Placement key
- Sync health
- Graph route
- Backend safe-config
- API audience
