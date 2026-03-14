# Project Setup Notification Registrations

> **Document Classification:** Canonical Normative Plan
> **Traceability:** W0-G3-T04 (extends G1-T03 baseline)
> **Depends on:** G1-T03 notification baseline, T02 canonical action strings (`PROJECT_SETUP_ACTION_MAP`)

---

## Overview

This document is the authoritative specification for all 15 provisioning notification event registrations in `@hbc/provisioning`. The original 8 events were established by G1-T03; G3-T04 added 7 new project setup lifecycle events and reclassified `request-submitted`.

---

## Full Registration Table

| # | eventType | defaultTier | tierOverridable | channels | G3-D8 Class | Description |
|---|-----------|-------------|-----------------|----------|-------------|-------------|
| 1 | `provisioning.request-submitted` | immediate | false | push, email, in-app | action-required | Controller must review to advance workflow (reclassified by T04) |
| 2 | `provisioning.clarification-requested` | immediate | false | in-app, email, push | action-required | Controller requires additional information |
| 3 | `provisioning.ready-to-provision` | immediate | false | in-app, email, push | action-required | Request reviewed, ready for external setup and provisioning trigger |
| 4 | `provisioning.started` | watch | true | in-app | awareness | SharePoint site provisioning has started |
| 5 | `provisioning.first-failure` | immediate | false | in-app, email, push | action-required | Provisioning failed on first attempt |
| 6 | `provisioning.second-failure-escalated` | immediate | false | in-app, email, push | action-required | Provisioning failed a second time, requires admin escalation |
| 7 | `provisioning.completed` | watch | true | in-app, email | awareness | Project SharePoint site is ready (T04: email added, push removed) |
| 8 | `provisioning.recovery-resolved` | watch | true | in-app | awareness | Previously failed provisioning recovered |
| 9 | `provisioning.clarification-responded` | immediate | false | push, email, in-app | action-required | Requester responded to clarification — Controller must review |
| 10 | `provisioning.request-approved` | watch | true | in-app, email | awareness | Request approved, moving to provisioning |
| 11 | `provisioning.step-completed` | watch | true | in-app | awareness | A provisioning step completed |
| 12 | `provisioning.handoff-received` | immediate | false | push, email, in-app | action-required | Workflow handoff assigned — action required |
| 13 | `provisioning.handoff-acknowledged` | watch | true | in-app, email | awareness | Handoff acknowledged by recipient |
| 14 | `provisioning.handoff-rejected` | immediate | false | push, email, in-app | action-required | Handoff rejected — reassign or resolve |
| 15 | `provisioning.site-access-ready` | watch | true | in-app, email | awareness | Site access permissions configured, site ready for team |

---

## Naming Reconciliation

The T04 spec uses different names for two existing events. The repository retains the original names because they are wired throughout templates, registrations, backend saga, and tests:

| T04 Spec Name | Repository Name (canonical) | Rationale |
|---|---|---|
| `provisioning.failed` | `provisioning.first-failure` | Already wired in templates, registrations, backend saga, tests |
| `provisioning.failed-escalated` | `provisioning.second-failure-escalated` | Same — wired throughout the stack |

---

## G3-D8 Classification Rule

All registrations follow the D8 classification invariant:

- **action-required:** `tierOverridable: false` and `defaultTier: 'immediate'` — the recipient must act to advance the workflow
- **awareness:** `tierOverridable: true` and `defaultTier` is NOT `'immediate'` — informational, user may adjust delivery preference

This invariant is enforced by tests in `notification-registrations.test.ts`.

---

## Payload Template Reference

All 15 events have corresponding template factories in `PROVISIONING_NOTIFICATION_TEMPLATES` (`notification-templates.ts`). Each factory returns `{ subject, body, actionUrl, actionLabel }`.

Template body text reuses T02 canonical action strings from `PROJECT_SETUP_ACTION_MAP` where the notification maps to a lifecycle state transition.

---

## Who-Fires-Each Table

| eventType | Fired By |
|-----------|----------|
| `request-submitted` | Backend handler: request creation |
| `clarification-requested` | Backend handler: controller requests clarification |
| `clarification-responded` | Backend handler: requester submits clarification response |
| `request-approved` | Backend handler: controller approves request |
| `ready-to-provision` | Backend handler: external setup complete, provisioning queued |
| `started` | Backend handler: provisioning saga begins |
| `step-completed` | Backend handler: provisioning saga step completion |
| `first-failure` | Backend handler: provisioning saga first failure |
| `second-failure-escalated` | Backend handler: provisioning saga second failure |
| `completed` | Backend handler: provisioning saga success |
| `recovery-resolved` | Backend handler: admin recovery success |
| `handoff-received` | Workflow handoff: sender initiates handoff |
| `handoff-acknowledged` | Workflow handoff: recipient acknowledges |
| `handoff-rejected` | Workflow handoff: recipient rejects |
| `site-access-ready` | Backend handler: site permissions configured |

---

## Recipient Resolution

Recipients are resolved from `STATE_NOTIFICATION_TARGETS` in `state-machine.ts` and per-event specification:

| eventType | Recipients |
|-----------|-----------|
| `request-submitted` | controller |
| `clarification-requested` | submitter |
| `clarification-responded` | controller |
| `request-approved` | submitter |
| `ready-to-provision` | controller |
| `started` | group |
| `step-completed` | group |
| `first-failure` | controller, submitter |
| `second-failure-escalated` | controller, submitter, admin |
| `completed` | group |
| `recovery-resolved` | group |
| `handoff-received` | handoff recipient |
| `handoff-acknowledged` | handoff sender |
| `handoff-rejected` | handoff sender |
| `site-access-ready` | group |

---

## Canonical Action String Reuse Rule

Notification body text must use the canonical action strings from `PROJECT_SETUP_ACTION_MAP` (defined in `bic-config.ts`) when the notification corresponds to a lifecycle state. Bespoke text is only permitted for events that do not map directly to a single state transition (e.g., `handoff-received`).
