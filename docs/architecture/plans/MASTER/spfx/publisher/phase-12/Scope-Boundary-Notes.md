# Scope Boundary Notes

## This package is not

- a whole-app re-audit
- a backend remediation package
- a publishing-orchestrator rewrite
- a new architecture plan for future destinations
- a broad repo-wide design-system migration

## This package is

A closure package for the **remaining adoption-critical UI, interaction, accessibility, and visual-system work** inside the Publisher seams already touched by Wave 01.

## Included because they are required for Wave 01 closure

- shell cohesion
- tokenization completion and CSS cleanup
- iconography / avatar / toolbar interaction upgrades
- preview-readiness confidence flow
- team and gallery product-grade completion
- author-facing label governance completion
- selector/search accessibility hardening where it directly affects the Wave 01 authoring experience

## Explicitly not expanded here unless discovered as blocking during implementation

- new destinations beyond the currently supported scope
- broad workflow model redesign
- backend publish-orchestration redesign
- unrelated list-schema work
- repo-wide UI-kit refactors outside Publisher dependencies
- large feature additions that are not necessary to close the current product-quality gap

## Boundary-call rule

If implementation uncovers work that is not obviously in scope, answer this question:

> Is this required to close one of the specific Wave 01 product seams in a truthful, non-hand-wavy way?

- If **yes**, do it now and document why.
- If **no**, do not smuggle it into the wave.

