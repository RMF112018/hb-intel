# Objective

Add proof-grade Storybook coverage for the redesigned Spotlight so the new compactness and disclosure contract is visible, testable, and hard to regress.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/**`

# Inspect these files and seams first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx`
- the updated Spotlight shared-surface files from prior prompts

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

Current story coverage does not prove:
- layout modes
- collapsed vs expanded details
- collapsed vs expanded history
- narrow nested states
- sparse-content behavior

# Required implementation outcome

Add or revise stories so they prove the redesigned contract.

Minimum expected stories:
- wide default
- medium default
- compact collapsed
- minimal collapsed
- details expanded
- history expanded
- sparse content
- no history / railless state
- narrow SharePoint-section width
- handheld width

# Proof of closure

Provide:
- the final story list
- what each story proves
- files changed

# Constraints

- Do not leave stories as broad wrappers with no state-specific proof.
- Do not rely on one “mobile” story to represent all compact/minimal behavior.
