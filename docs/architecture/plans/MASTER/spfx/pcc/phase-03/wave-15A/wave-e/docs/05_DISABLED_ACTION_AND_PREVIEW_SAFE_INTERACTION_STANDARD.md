# 05 — Disabled Action and Preview-Safe Interaction Standard

## Purpose

Define how PCC should present disabled, inert, preview-only, read-only, setup-required, and unavailable actions.

## Core Rule

A disabled control must never be shown without a visible product-grade explanation.

Every action must be one of:

1. **Active** — performs the actual operation.
2. **Reference action** — opens a detail, guide, review context, or read-only drawer.
3. **Disabled with reason** — visible but inert, with explanation and next step.
4. **Removed** — omitted when there is no useful user action.
5. **Setup-required action** — visible only if it explains configuration/owner/activation path.

## Approved Disabled Action Pattern

Use `PccDisabledAffordance` or an equivalent shared primitive when a visible inert control is needed.

Minimum fields:

- visible label;
- required `reason`;
- optional `nextStep`;
- stable test marker;
- `aria-disabled="true"`;
- `aria-describedby` pointing to the visible reason text.

## Anti-Patterns

| Anti-pattern | Required correction |
|---|---|
| Disabled `<button>` with no nearby reason | Replace with `PccDisabledAffordance` or add visible explanatory text and accessible relationship. |
| Button text says "Preview only" | Replace with business language such as "Reference", "Review details", or "Action unavailable" plus reason. |
| Disabled action relies on tooltip only | Add visible copy; tooltip can supplement but cannot be the only explanation. |
| CTA shown for impossible workflow | Remove the CTA or convert to reference action. |
| Generic "Unavailable" chip | Specify whether source is not connected, setup is required, role is restricted, or execution is disabled. |
| Action says "Not implemented" | Replace with operational explanation unless visible only to administrators/developers. |

## Surface Rules

| Surface | Disabled-action expectations |
|---|---|
| Project Home | Priority action chips/cards must identify reference-only vs setup-required vs blocked. |
| Team & Access | Invite/request/access-manager actions must use disabled-affordance pattern when execution is off. |
| Documents | Browse/open/review/approval actions must explain source binding or access requirement. |
| Project Readiness | Workflow actions must explain read-only and blocked conditions. |
| Approvals | Approve/reject/escalate/route controls must show decision context and disabled reason. |
| External Systems | Launch/edit/save actions must show source activation state and data ownership. |
| Settings | Save/edit controls must distinguish locked, preview-only, and setup-required states. |
| Site Health | Repair/remediate controls must explain owner and prerequisites. |

## Test Requirements

- Assert every rendered disabled action has visible reason text.
- Assert every `PccDisabledAffordance` has `aria-disabled="true"`.
- Assert `aria-describedby` resolves to non-empty text.
- Assert disabled affordances do not invoke click handlers.
- Assert no primary action uses "preview-safe", "inert preview", or "not implemented" in user-visible text.

## Screenshot Requirements

Capture at least one disabled-action example per affected surface, including:

- normal width;
- SharePoint-constrained width where text wrapping may occur;
- keyboard focus state if the control is focusable.

## Closeout Requirements

The local agent must provide:

- a count/list of all disabled affordances inspected;
- exact files changed;
- tests added/updated;
- any remaining disabled controls with justified exceptions.
