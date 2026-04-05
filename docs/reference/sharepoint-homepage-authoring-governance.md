# Homepage Authoring Governance

Authoritative reference for who may author, edit, and approve homepage content, and what kinds of changes require escalation.

## Homepage authoring model

The homepage is a **curated, governed surface** — not a self-service content board. All changes pass through one of three governance tiers:

| Tier | Description | Examples |
|------|-------------|---------|
| **Self-service** | Owner can make the change directly within their zone | Refresh editorial copy, update a link, rotate a featured item |
| **Governed** | Owner makes the change but requires explicit approval before publishing | Add a new content category, change zone emphasis, modify a CTA destination |
| **Architecture-required** | Change cannot proceed without architecture review | Add/remove a webpart, use Lane A webparts on non-homepage pages, change the 5-zone structure |

## Who may update what

### Editorial copy (weekly/biweekly content)

| Webpart | May Update | Approval Needed? |
|---------|-----------|:----------------:|
| HB Hero Banner — headline, message, metadata | Corporate Communications | No (self-service) |
| HB Hero Banner — CTA destination | Corporate Communications | Yes (Comms Lead) |
| Company Pulse — items | Corporate Communications | No (self-service) |
| Leadership Message — entries | Executive Communications | No (self-service) |
| People & Culture — entries | HR / Corporate Communications | No (self-service) |
| Welcome Header — support line, context line | Corporate Communications | No (self-service) |
| Welcome Header — alert severity/message | Corporate Communications | Yes (Comms Lead for warning/critical) |

### Utility destinations (monthly content)

| Webpart | May Update | Approval Needed? |
|---------|-----------|:----------------:|
| Priority Actions Rail — actions within existing groups | Operations Support | No (self-service) |
| Priority Actions Rail — add/remove groups | Operations Support | Yes (IT Director) |
| Tool Launcher — items within existing groups | IT / Operations Support | No (self-service) |
| Tool Launcher — add/remove groups | IT / Operations Support | Yes (IT Director) |
| Smart Search — resources, quick paths | IT / Operations Support | No (self-service) |
| Smart Search — categories | IT / Operations Support | Yes (IT Director) |

### Operational signals (event-driven content)

| Webpart | May Update | Approval Needed? |
|---------|-----------|:----------------:|
| Project Spotlight — item updates | Operations Program Managers | No (self-service) |
| Project Spotlight — add strategic emphasis | Operations Program Managers | Yes (VP Operations) |
| Safety Excellence — items | Safety Department | No (self-service) |
| Safety Excellence — critical safety alerts | Safety Department | Yes (Safety Director) |

## Changes that require approval before publishing

| Change Type | Approval Required From |
|-------------|----------------------|
| New CTA destination not previously approved | Zone Approval Role |
| Change to alert severity (warning or critical) | Comms Lead |
| New content category in any webpart | Zone Approval Role |
| Change to zone visual emphasis or ordering | Architecture Reviewer |
| Adding strategic emphasis flag to project content | VP Operations |
| Content that references external parties or legal matters | VP Communications + Legal |

## Changes prohibited without architecture involvement

| Change | Why Architecture Review Required |
|--------|--------------------------------|
| Adding Lane A webparts to non-homepage pages | Violates homepage singularity |
| Removing a webpart from the homepage composition | Changes the governed 5-zone structure |
| Adding a new custom webpart | Requires Lane A product work |
| Changing the zone order or structure | Affects composition architecture |
| Creating automation for homepage content | Requires engineering assessment |
| Modifying homepage mount/dispatch behavior | Core product-lane seam |

## What belongs on the homepage vs a normal page

| Content | Homepage? | Normal Page? | Rationale |
|---------|:---------:|:------------:|-----------|
| Weekly company update | Yes (Company Pulse) | Also post as Communications page | Homepage is the curated summary; page is the full article |
| New hire announcement | Yes (People & Culture) | Also post as Communications page | Homepage is the recognition highlight; page is the full welcome |
| Project milestone update | Yes (Project Spotlight) | Also post as Operational page | Homepage is the status signal; page is the detailed report |
| Policy document | No | Yes (Simple Content page) | Policies are reference content, not homepage editorial |
| Meeting notes | No | Yes (Simple Content page) | Too granular for homepage |
| Department-specific tool link | Maybe (if cross-org) | Yes (department landing page) | Homepage utility zone is for company-wide tools only |
| Emergency safety alert | Yes (Welcome Header alert) | Also post as Safety page | Homepage is the immediate signal; page is the detailed guidance |

## Homepage-safe admin configuration boundary

| Action | Classification |
|--------|---------------|
| Editing text within an existing webpart config | **Content editing** — self-service |
| Adding/removing items within approved config shape | **Governed configuration** — may need approval |
| Changing which webparts appear on the homepage | **Architecture change** — requires review |
| Changing how webparts render or behave | **Architecture change** — requires engineering |
| Creating a new page template inspired by the homepage | **Design/template decision** — requires P05 template governance |

---

## Related Documents

- [Homepage Ownership & Freshness](./sharepoint-homepage-ownership-and-freshness.md) — zone/webpart ownership matrix, freshness cadences, review model
- [Homepage & Shell Boundaries](./sharepoint-homepage-shell-boundaries.md) — three-lane architecture
- [Branding and Page Templates](./sharepoint-branding-and-page-templates.md) — non-homepage page governance
- [Navigation Governance](./sharepoint-navigation-governance.md) — Lane C nav rules
