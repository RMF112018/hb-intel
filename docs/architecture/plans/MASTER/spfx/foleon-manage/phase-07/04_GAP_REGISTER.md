# 04 — Gap Register

| Gap ID | Severity | Gap | Evidence | Remediation |
|---|---|---|---|---|
| FM-001 | Critical | No true content inbox as primary work object. | Content library is secondary and below the main workspace. | Build `ContentInbox` with new, unassigned, staged, blocked, live, and search/filter/sort views. |
| FM-002 | Critical | Lane board is visually subordinate. | Lanes appear as small left-rail cards. | Build `LaneControlBoard` as a destination control room with live, staged, readiness, display window, and next action. |
| FM-003 | Critical | Placement is a form, not a workflow. | Right rail asks users to manipulate placement fields and content dropdowns. | Build guided placement workflow panel: select content → choose lane → confirm placement → validate → preview → activate. |
| FM-004 | High | Developer/admin language dominates. | Registry, sync health, placement key, reader key, homepage slot appear in primary path. | Translate to content manager language; move technical labels to Admin diagnostics. |
| FM-005 | High | OAuth missing state is punitive. | The surface shows blocked sync and empty content as the main visual narrative. | Add useful limited mode with workflow preview, sample lane model, and admin action handoff. |
| FM-006 | High | Preview is not first-class. | Open Foleon exists; employee-facing reader preview is not central. | Add side-panel/split-preview with HB Central reader frame and fallback messaging. |
| FM-007 | High | Breakpoint model is viewport-based. | `useManageBreakpoint` uses `window.innerWidth`, not container width. | Use ResizeObserver/container queries and explicit application modes. |
| FM-008 | Medium | Excessive nested cards and borders. | Panels within panels dominate screenshot. | Reduce borders; use stronger sections, density bands, and content rows. |
| FM-009 | Medium | Media and identity underused. | Foleon content appears text-only when unavailable. | Add thumbnail/hero treatment, source metadata, and preview imagery where available. |
| FM-010 | Medium | Validation actions lack editorial clarity. | Publish checks exist, but next action is not tied to the full workflow. | Build readiness taxonomy with owner/action/source classification. |
| FM-011 | Medium | Admin diagnostics are too close to primary journey. | Diagnostics button and config tab are prominent. | Keep available but make Admin secondary and role-aware. |
| FM-012 | Medium | Hosted proof incomplete. | Package version exists, screenshot exists, but no full proof matrix. | Require screenshots, network proof, JS/CSS asset proof, runtime proof object, and package proof. |
