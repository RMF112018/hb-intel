# PCC Card Tier Contract Remediation Package

## Objective

Use this package to instruct a local code agent to close the PCC card tier contract resolution issue.

The code agent must make source changes, tests, and closeout documentation that convert the current shared `PccDashboardCard` system from a partially migrated primitive into a fully enforced cross-surface card classification contract.

## What This Package Resolves

The Prompt 02 audit found that the primitive architecture is materially improved but still incomplete:

- `PccDashboardCard` already supports `tier`, `region`, `headingLevel`, `density`, `ariaDescribedBy`, and active-surface data markers.
- `PccBentoGrid` already supports container-aware layout and direct child card placement.
- `footprints.ts` already includes `rail` and `detail`, with 8 responsive modes.
- `useBentoRowSpan` already protects against the prior 8px collapse symptom.
- Project Home has the best current tests, but the cross-surface contract is not yet enforced.
- Several current route surfaces still rely on legacy `hierarchy` or defaults.
- Deferred, reference, unavailable, and seam cards frequently risk appearing as normal operational cards.
- Hosted screenshots still show too much generic thin-border white-card posture.

## Package Contents

- `PACKAGE_MANIFEST.md` — execution overview, constraints, validation, and commit requirements.
- `docs/00_REPO_TRUTH_BASELINE.md` — audited baseline facts.
- `docs/01_TARGET_CARD_CONTRACT.md` — desired primitive/card architecture.
- `docs/02_SURFACE_CLASSIFICATION_MATRIX.md` — required target classification by surface/card pattern.
- `docs/03_TEST_AND_EVIDENCE_REQUIREMENTS.md` — required automated and hosted validation evidence.
- `docs/04_IMPLEMENTATION_GUARDRAILS.md` — constraints and regression guards.
- `prompts/*.md` — executable local code-agent prompts in sequence.

## How To Use

Run each prompt in order in a clean local code-agent session unless your workflow intentionally uses one long session.

Before executing each prompt:

```bash
git status --short
```

After each prompt:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
git diff --check
```

At final closeout, run the full validation set from `PACKAGE_MANIFEST.md`.

## Expected Closeout State

The issue is resolved only when:

1. All current PCC card elements have explicit card classification.
2. All route command cards are explicit Tier 1 command cards.
3. Loading/error/missing/restricted cards are explicit state cards.
4. Deferred/read-only/reference seams are not operational by default.
5. Automated tests enforce the contract across every current route.
6. Closeout documentation records validation evidence and any remaining hosted screenshot obligations.
