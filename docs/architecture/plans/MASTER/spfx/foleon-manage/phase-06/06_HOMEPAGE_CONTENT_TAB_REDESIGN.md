# 06 — Homepage Foleon Content Tab Redesign

## Goal

Make the content tab the primary marketing workflow. A marketing user should immediately identify the status of the three homepage lanes and understand what action to take.

## Default Layout

```text
Homepage Foleon Content
├─ Lane Summary
│  ├─ Project Spotlight
│  ├─ Company Pulse
│  └─ Leadership Message
├─ Selected Lane Workspace
├─ Content Library
└─ Editor / Placement Drawer
```

## Lane Summary

### Lane Card Fields

- Lane name.
- Current state chip:
  - Live
  - Preview
  - Blocked
  - Empty
  - Needs setup
- Active/staged content title.
- Display window.
- Placement status.
- Publish readiness summary.
- Primary next action.
- Disabled-action reason where applicable.

### Lane State Derivation

Use current data conservatively:

| State | Conditions |
|---|---|
| Live | Public-ready content exists and active placement aligns to the lane. |
| Preview | Draft/staged/sample lane content exists but is not live. |
| Blocked | Validation, placement, origin, URL, display window, API, route, read/write, or sync blocker exists. |
| Empty | No lane content exists. |
| Needs setup | Required list/backend/registry state is missing or inaccessible. |

Do not invent lane data. Use existing content, placement, and readiness facts only.

## Selected Lane Workspace

### Required Sections

1. **Current content**
   - title;
   - content type;
   - lane;
   - display window;
   - preview/live URL availability.

2. **Placement status**
   - assigned lane;
   - active placement;
   - sort/display rank where relevant;
   - conflicts or missing placement.

3. **Publish readiness**
   - visible/public ready;
   - homepage eligible;
   - production URL;
   - origin policy;
   - display window;
   - placement alignment;
   - API approval / write access;
   - route authorization.

4. **Quick actions**
   - Review lane;
   - Edit content;
   - Validate;
   - Publish;
   - Open preview;
   - Update placement.

### Workspace Selection Logic

Default selected lane should be:

1. first blocked lane;
2. first needs-setup lane;
3. first preview/staged lane;
4. first empty lane;
5. Project Spotlight.

## Content Library

### Position

Below lane summary and selected lane workspace.

### Behavior

- Filter homepage-relevant content first.
- Search by title, Foleon doc ID, project, content type, lane.
- Sort by display date, modified date, status, lane.
- Keep current registry/editor workflows reachable.
- Do not make the raw content table the first/primary view.

## Editor / Placement Drawer

The editor and placement tools should open from user action rather than occupy dominant first-load space.

Allowed patterns:

- side drawer;
- details panel;
- inline expansion below selected lane;
- modal only for short confirmation actions.

## Empty Content State

When no content exists:

- show three lane cards as `Empty` or `Needs setup`;
- explain the intended workflow;
- offer `Add content` or `Open Foleon`;
- do not show a dead diagnostics screen.

## Preview-Only State

When preview/sample content is present:

- clearly label it `Preview`;
- never imply it is live;
- disable publish unless readiness supports it;
- guide user to configure production URL and publish status.

## Blocked State

Show blocker in plain language:

- `Publishing is blocked until API approval is granted.`
- `This lane is missing an active placement.`
- `This content has no production Foleon URL.`
- `This content is outside its display window.`
- `The Foleon URL origin is not approved.`

## Acceptance Criteria

- Three lane cards render.
- Homepage Foleon Content is selected by default.
- A marketing user can identify live/preview/blocked/empty lane status without reading Config.
- Content actions remain available or disabled with reasons.
- Existing editor, placement, validate, publish, suppress, and sync workflows remain reachable.
- No raw registry/list/API labels appear in the marketing workflow by default.
