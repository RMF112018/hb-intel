# 06 — Responsive and Host-Fit Validation Plan

## Objective

Define evidence required to prove Wave D layout behavior across SharePoint-hosted constraints.

## Validation Modes

| Mode | Width / context | Purpose |
| --- | --- | --- |
| Wide desktop | >= 1280px app container | Confirm canvas is used efficiently and command cards anchor scan path. |
| Standard desktop | 1024–1279px app container | Confirm no excessive dead canvas or cramped cards. |
| Simulated SharePoint constrained | Host chrome/container reduced by rail/header/page margins | Confirm local-dev-only assumptions are not present. |
| Tablet portrait | 480–719px app container | Confirm protected spans do not create unreadable two-column cards. |
| Phone/narrow | < 480px app container | Confirm single-column narrative order and no clipped/hidden content. |

## Surface Screenshot Matrix

Capture every current routed surface:

- `project-home`
- `team-and-access`
- `documents`
- `project-readiness`
- `approvals`
- `external-systems`
- `control-center-settings`
- `site-health`

At minimum, capture:

- wide desktop;
- simulated SharePoint constrained;
- tablet;
- narrow container.

Team & Access requires extra emphasis and before/after comparison.

## Acceptance Criteria

- Tier 1 card visible without horizontal scrolling.
- No card text clipped by 8px/row-span collapse.
- No non-phone card below usable minimum inline width.
- No major dead canvas while cards are cramped elsewhere.
- Operational cards appear before reference cards in DOM and visual order.
- Reference cards have lower visual weight than operational cards.
- Keyboard focus remains visible in route and drawer contexts.
- Portal drawer for External Systems does not enter bento direct-child count.

## Required Screenshot Index Path

Use:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-D/evidence/screenshots/INDEX.md
```

Store images under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-D/evidence/screenshots/before/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-D/evidence/screenshots/after/
```

If prior screenshots already exist under Prompt 04, link them and identify which are still valid after current changes.

## Tenant Evidence

Tenant-hosted proof is not required to complete implementation prompts 01–05, but the closeout must state that final 56/56 cannot be claimed without tenant-hosted evidence. If tenant evidence is captured, place it under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-D/evidence/tenant/
```
