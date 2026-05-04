# Wireframes and Interaction Model

## Purpose

This document indexes the screen-level wireframes in `docs/wireframes/` and defines the shared UX model for implementation.

## Wireframe Inventory

| Wireframe                 | File                                              |
| ------------------------- | ------------------------------------------------- |
| Approvals Home            | `docs/wireframes/01_Approvals_Home.md`            |
| My Approvals              | `docs/wireframes/02_My_Approvals.md`              |
| Approval Detail           | `docs/wireframes/03_Approval_Detail.md`           |
| Checkpoint Registry       | `docs/wireframes/04_Checkpoint_Registry.md`       |
| Decision History          | `docs/wireframes/05_Decision_History.md`          |
| Escalation Queue          | `docs/wireframes/06_Escalation_Queue.md`          |
| Admin Verification Queue  | `docs/wireframes/07_Admin_Verification_Queue.md`  |
| Module Integration Panels | `docs/wireframes/08_Module_Integration_Panels.md` |

## Shared Layout Principles

- Keep the PCC shell/navigation consistent with existing PCC surfaces.
- Use compact card spacing aligned with PCC dashboard doctrine.
- Prioritize decision clarity over visual density.
- Group by actionable state rather than source module alone.
- Do not hide unavailable actions without explanation.
- Every queue item must reveal source, authority, due date, risk, and current action owner.

## Queue Card Anatomy

Each row/card must contain:

- title;
- source module;
- checkpoint family;
- current state;
- current step;
- current action owner;
- due date and aging;
- priority;
- readiness/blocking indicator;
- evidence completeness indicator;
- valid next action or disabled reason.

## Detail Page Anatomy

Approval Detail must answer:

1. What is being decided?
2. Who has authority?
3. What source record/evidence supports it?
4. What are the consequences?
5. What actions are valid?
6. What happens next?
7. What has already happened?

## Persona Defaults

| Persona                     | Default View                                |
| --------------------------- | ------------------------------------------- |
| Project Executive           | Escalated + high-risk + readiness gates     |
| Project Manager             | My project approvals + returned items       |
| Superintendent              | field readiness / inspection checkpoints    |
| Project Accountant          | budget seed, cost-code, buyout handoff      |
| Estimating Coordinator      | estimate freeze/handoff/mapping exceptions  |
| Lead/Chief Estimator        | estimate freeze and bid-leveling reviews    |
| Director of Preconstruction | estimating freeze/handoff executive posture |
| PCC Admin                   | admin verification and policy registry      |
| IT / Tenant Admin           | access/security execution-pending           |
| Executive Oversight         | high-impact escalations and overrides       |
| Project Viewer              | read-only decision history where authorized |

## Interaction Rules

- Selecting a queue item opens detail.
- Detail actions are disabled until required fields are valid.
- High-risk actions require confirmation.
- Source links open source module context, not external writeback.
- HBI summary can be expanded but cannot trigger decisions.
- History is always visible to authorized users.
