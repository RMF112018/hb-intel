# Prompt 05 — Permissions, Intake, Notifications, and Work Management

## Objective

Implement the locked People & Culture role behavior, intake model, notification model, and approval-work-management behavior.

## Required Inputs

- live repo: `https://github.com/RMF112018/hb-intel`
- `apps/hb-webparts/src/webparts/peopleCulture/`
- adjacent homepage/data/contracts/helper seams
- `packages/ui-kit/`
- `docs/reference/ui-kit/`
- `Decision-Lock-Appendix.md`
- `Plan-Summary.md`

## Governing Rules

- Treat repo truth as authoritative.
- Implement the locked decisions exactly unless a hard repo-truth conflict prevents it.
- Preserve split boundaries and role clarity.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.
- Keep the work model operational without turning the companion into a heavy ticketing system.

## Scope

1. Editor vs Approver/Admin role behavior
2. Claim/reassign for approvals only
3. Notification rules
4. Limited non-HR intake
5. Overview health signals and queue behavior
6. Audience-targeting guardrails, where needed

## Instructions for the Agent

1. Implement the two-role model:
   - Editor
   - Approver/Admin
2. Enforce role behavior consistently in both UI visibility and action/mutation paths.
3. Implement claim/reassignment only for approval work.
4. Do not introduce broad assignment for all live/scheduled content unless repo truth makes that unavoidable.
5. Implement notifications for:
   - operators
   - content owner / submitter
6. Do not auto-notify featured people by default.
7. Implement the limited intake path for designated non-HR users:
   - managers
   - leaders
   - business partners
   - or equivalent repo-supported designated submitter classes
8. Ensure outside submitters cannot publish directly.
9. Update the Overview/dashboard surface so it reflects:
   - lifecycle counts
   - pending approvals
   - scheduled upcoming
   - expiring soon
   - homepage conflicts
10. Implement any necessary targeting guardrails so targeted items remain safe and understandable in workflow.

## Deliverables

- role-aware UI and action enforcement
- approval-only claim/reassign behavior
- notification flows
- limited intake flow
- overview health indicators

## Validation

- verify role gating by surface/action
- verify claim/reassign is limited correctly
- verify intake submitters cannot bypass HR authority
- verify notification audiences are correct
- verify Overview signals reflect the actual queue/state model

## Required Report Back

Return:
1. permission model implemented
2. work-management behavior implemented
3. intake behavior implemented
4. notification behavior implemented
5. overview/queue validation performed
