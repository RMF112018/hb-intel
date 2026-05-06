# 06 — Surface First-Screen Priority Rules

## Objective

Prevent correct content from becoming visually ineffective. Every surface must have an intentional first-screen sequence.

## Global First-Screen Rules

1. The first card in ready-state DOM order must be the Tier 1 command card.
2. No Tier 3 reference/deferred card may appear before all mandatory Tier 2 operational cards unless the surface is unavailable.
3. State cards may appear early only when they explain route availability, access, or setup blockers.
4. On standard laptop, the first screen must communicate:
   - where the user is
   - current operational posture
   - what requires attention
   - whether the surface is read-only/preview/degraded
5. The command card must not consume so much height that no Tier 2 operational card is visible on standard laptop.

## Surface Rules

### Project Home

Priority order:

1. Project Intelligence
2. Priority Actions
3. Missing Configurations if blocking; otherwise Site Health
4. Site Health
5. Approvals / Readiness / Documents
6. Team / External / Activity / Procore / HBI references

### Team & Access

Priority order:

1. Team & Access command
2. Restricted state if user is not access manager
3. Team Viewer
4. Permission Request
5. Access Manager if persona allows
6. Execution/status details

### Documents

Priority order:

1. Document Control command
2. Project Record lane
3. Reviews & Approvals
4. My Project Files
5. Permissions & Guardrails
6. External Systems lane

### Project Readiness

Priority order:

1. Project Readiness command
2. Blockers and exceptions
3. Lifecycle map
4. Domain posture
5. Ownership / Priority Actions eligibility
6. Permit & Inspection / Responsibility / Constraints / Buyout detail regions
7. Evidence/source/downstream/reference seams

### Approvals

Priority order:

1. Approvals home
2. Approval queue
3. My approvals
4. Escalation
5. Admin verification
6. Registry
7. Policy / module integration / decision history / lineage / HBI boundary

### External Systems

Priority order:

1. Launch Pad command
2. Summary
3. Project Links
4. Review Queue
5. Mapping Status
6. Registry / Source Health / Audit / HBI / Procore seams

### Control Center Settings

Priority order:

1. Settings command
2. Settings scope/detail workbench
3. Missing setup
4. Governance/reference notes if added later

### Site Health

Priority order:

1. Site Health command
2. Site Health Checks
3. Drift
4. Repair Requests
5. Procore sync/repair seam

## Testable Contract

Each route test should assert:

- first card has `data-pcc-card-tier='tier1'` and `data-pcc-card-region='command'`
- first card has the active surface panel marker
- no `data-pcc-card-region='reference'` or `deferred` card appears before the first Tier 2 card
- all cards have tier/region markers
