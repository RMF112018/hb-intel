# PCC Phase 04B Surface-Specific Corrective Remediation Package

## Purpose

This package replaces the failed Phase 04 continuation path with eight focused remediation prompts, one for each PCC tab surface:

1. Project Home
2. Team & Access
3. Documents
4. Project Readiness
5. Approvals
6. External Platforms
7. Control Center Settings
8. Site Health

The prior Phase 04 package stated that the bento grid must begin with working operational content, not generic title/description cards. The current runtime still violates that intent on multiple surfaces, so this package resets the work around the actual UX objective rather than continuing to harden the flawed intermediate state.

## Governing Corrective UX Rule

```text
No PCC tab surface may begin with a bento card whose primary purpose is to restate the selected tab, explain the surface, or provide summary posture that belongs in the shell hero. The first bento card on every tab must be operational.
```

## Current Known Runtime State After Prompt 04

The Prompt 04 runtime pass removed duplicate/safe-removal cards for:

- Team & Access
- Control Center Settings
- External Platforms / External Systems Launch Pad

It also deleted the orphan `PccExternalSystemsHeaderCard`.

The Prompt 04 runtime pass intentionally retained or deferred:

- Project Home `PccProjectIntelligenceCard`
- Documents `PccDocumentsHeaderCard`
- Project Readiness hero/summary card
- Approvals home/summary card
- Site Health overview card

This package treats those retained cards as corrective remediation targets unless the surface-specific prompt proves the card is already operational and not functioning as a duplicate header.

## Package Files

- `README.md`
- `Prompt_01_Project_Home_Project_Intelligence_Remediation.md`
- `Prompt_02_Team_Access_First_Operational_Content_Audit.md`
- `Prompt_03_Documents_State_Aware_Seam_Remediation.md`
- `Prompt_04_Project_Readiness_Hero_Absorption_Remediation.md`
- `Prompt_05_Approvals_Home_Absorption_Remediation.md`
- `Prompt_06_External_Platforms_First_Operational_Content_Audit.md`
- `Prompt_07_Control_Center_Settings_First_Operational_Content_Audit.md`
- `Prompt_08_Site_Health_Overview_Absorption_Remediation.md`

## Recommended Execution Order

Execute the prompts one at a time, in this order:

1. **Project Home** — highest visible failure because `Project Intelligence` duplicates the shell hero.
2. **Documents** — requires a state-aware seam before `PccDocumentsHeaderCard` can be removed.
3. **Project Readiness** — move readiness posture into shell/operational content without losing metrics.
4. **Approvals** — move approval summary posture into shell/operational queue content.
5. **Site Health** — move severity/summary posture into shell or operational checks/drift content.
6. **Team & Access** — audit/harden the surface that should already be corrected.
7. **External Platforms** — audit/harden the surface that should already be corrected.
8. **Control Center Settings** — audit/harden the surface that should already be corrected.

If the user wants the safest incremental path, start with the audit-only prompts for Team, External Platforms, and Settings first. If the user wants to correct the failed UX fastest, start with Project Home, Documents, Readiness, Approvals, and Site Health.

## Non-Negotiable Acceptance Criteria

A surface-specific prompt is complete only when:

- the selected tab’s shell hero owns identity, description, posture, read-only/no-writeback cues, and high-level summary context;
- the target surface’s first bento card is operational;
- useful counts, facts, state, and posture are preserved;
- no surface ends with zero direct-child bento cards;
- shell `main[role="tabpanel"]` remains the semantic active-panel owner;
- compatibility-card vs shell-only expectations match actual runtime state;
- retained operational cards are not destructively removed;
- check-types and tests pass;
- no package/lockfile/manifest drift occurs unless separately and explicitly authorized.

## Active-Panel Contract Guidance

After Prompt 04, current test expectations are split:

```text
SURFACES_WITH_COMPATIBILITY_CARD = ['project-home', 'project-readiness', 'approvals', 'site-health', 'documents']
SURFACES_WITH_SHELL_ONLY_PANEL = ['team-and-access', 'external-systems', 'control-center-settings']
```

These sets must change only when runtime composition changes in the same commit.

If a prompt removes a card-level `dataActiveSurfacePanel="<surface>"` marker from a surface, move that surface to shell-only expectations in the same commit.

If a surface retains a legitimate operational/header-hybrid card that still emits the marker, keep it in compatibility-card expectations and document why.

## Validation Commands

Each prompt includes its own validation requirements. Standard baseline:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

## Live Evidence

Do not run hosted Playwright unless explicitly authorized by the user.

Any visible runtime composition change requires hosted/live evidence after commit:

```bash
pnpm pcc:e2e:live
pnpm pcc:e2e:evidence:registry
```

Expected deployed package version may be `1.0.0.20` if the user has already bumped and published the tenant package.

## Honest Scope

Do not claim that Phase 04 is complete until all eight surfaces satisfy the corrective UX rule.

Do not claim all duplicate top-level header cards are removed if Documents, Project Home, Readiness, Approvals, or Site Health still begin with header/summary cards.

## Commit Guidance

Use one commit per surface prompt unless the user explicitly combines them.

Suggested prefixes:

- `refactor(pcc):` for runtime composition remediation;
- `test(pcc):` for test-only guardrail hardening;
- `docs(pcc):` only for documentation sync prompts.

Avoid package/manifest/version changes in these prompts.
