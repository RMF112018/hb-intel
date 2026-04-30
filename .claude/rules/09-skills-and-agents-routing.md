# 09 — Skills and Agents Routing

## Primary Rule

Use the smallest effective routing layer.

- Rules define durable policy.
- Skills define repeatable workflows.
- Agents provide specialist review or investigation.
- Direct work is acceptable for simple, local, low-risk tasks.

## Authoritative Indexes

- Skills: `.claude/skills/README.md`
- Agents: `.claude/agents/README.md`
- Hooks: `.claude/hooks/README.md`
- Settings: `.claude/settings.json`

Do not duplicate full Skill or agent inventories here.

## Direct Work Is Enough When

- the task is simple;
- touched area is local and obvious;
- no sensitive operation is involved;
- no package/architecture boundary is affected;
- no reusable workflow is needed;
- no specialist review would add value.

## Use a Skill When

The work is a recurring workflow: audit, prompt package, plan review, closeout, validation routing, sensitive operation review, SPFx parity, UI doctrine, docs classification, platform primitive adoption, backend artifact routing, PCC routing, or brand governance.

## Use an Agent When

Specialist judgment reduces risk: security, tenant/deployment, SPFx parity, package boundaries, plan review, verification, docs, UI/UX, commit diff, Claude config, or unfamiliar repo research.
