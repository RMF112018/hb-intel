# Prompt 02 — Lane B Shell-Extension Premiumization

## Objective

Rebuild the HB Central shell-extension lane so it stops reading like technical placeholder scaffolding and starts behaving like a premium, restrained shell layer that elevates the homepage.

## Scope

Primary targets:

- `apps/hb-shell-extension/*`
- `tools/spfx-shell/*`
- relevant `@hbc/ui-kit/app-shell` primitives
- related shell docs/doctrine and tests

## Current-State Problem to Solve

The current top and bottom placeholder rendering is structurally valid but visually weak. It reads like a utility strip prototype rather than a deliberate shell product. This weakens the entire homepage before the user even gets to the real content.

## Hard Gates

- Do **not** reread files already in your active context or memory.
- Do **not** leave raw strip-like placeholder UI in place.
- Do **not** keep text-abbreviation pseudo-icons.
- Do **not** mount visible empty containers when a placeholder has no content.
- Do **not** attempt unsupported SharePoint chrome takeover behavior.

## Required Outcomes

The shell-extension should provide:

- a premium top utility posture
- a stronger alert / notification posture
- a support/status/footer posture that feels authored, not incidental
- a cleaner visual handoff into the homepage top band
- real shared shell primitives where appropriate

## Implementation Requirements

1. Audit current top and bottom placeholder rendering and strip out scaffold-grade presentation patterns.
2. Promote any reusable shell primitives into `@hbc/ui-kit/app-shell` if they belong there.
3. Redesign the top placeholder into a more intentional utility bar / alert stack composition.
4. Redesign the bottom placeholder into a support/status rail, not a generic footer strip.
5. Ensure true no-render behavior when no content is configured.
6. Preserve all SPFx placeholder lifecycle correctness and loader contract stability.

## Validation

Show proof that:

- top placeholder is visibly stronger and more productized
- bottom placeholder no longer feels like generic support text in a strip
- no placeholder renders empty visual scaffolding
- packaging and loader behavior still work
- no unsupported DOM takeover was introduced

## Output Format

Return:

1. summary of shell weaknesses removed
2. files changed
3. proof of placeholder behavior correctness
4. proof of visual improvement

## Final Instruction

Do not soften this work.

The current homepage is not acceptable. The goal of this phase is to produce measurable visual improvement that can be seen immediately in the rendered experience, not merely explained in code review.
