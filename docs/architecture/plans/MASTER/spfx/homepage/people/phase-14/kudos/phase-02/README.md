# HB Kudos Remediation Prompt Package

This package contains the next-pass code-agent prompts for closing the highest-risk gaps identified in the HB Kudos audit.

## Source of truth

- Live repo: `https://github.com/RMF112018/hb-intel`
- Branch: `main`
- Treat live repo truth as authoritative.

## Governing files

- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-05-Permissions-Notifications-and-Work-Management.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-06-Validation-Packaging-and-Closure.md`

## Package structure

1. `Prompt-01-Critical-Runtime-and-Authority-Model.md`
   - Fixes broken mutation plumbing.
   - Replaces simulated-role behavior with real SharePoint principal/group resolution.
   - Enforces the same authority model in UI and mutation seams.

2. `Prompt-02-Recipient-Model-Visibility-and-Queue-Model.md`
   - Completes typed recipient persistence.
   - Implements associated-item visibility rules.
   - Refactors the companion queue model to match the decision locks.

3. `Prompt-03-Notifications-Scheduling-and-Work-Management.md`
   - Implements overdue/reminder behavior.
   - Implements notification triggers.
   - Finishes claim/assignment/reassignment and state-specific authority behavior.
   - Closes scheduling/prominence rule enforcement.

4. `Prompt-04-Shared-UI-Closure-and-Packaging-Validation.md`
   - Promotes repeated local UI patterns into shared homepage-safe primitives.
   - Rebuilds the employee and governance surfaces for host-fit, density, and accessibility.
   - Performs final package validation and freshness proof.

## Execution order

Run the prompts in numeric order.

Do not skip Prompt 01. The current runtime has broken mutation calls that must be corrected before any closure pass is meaningful.

## Non-negotiable closure rules

- Do not claim completion while `submitKudosGovernanceAction` is still called with an empty `siteUrl`.
- Do not claim completion while `simulatedRole` remains the effective runtime authority model.
- Do not claim completion while team / department / project group recipients are still only parked in `ModeratorNotes` instead of being persisted to their real fields.
- Do not claim completion while associated-item visibility remains public/archive-only in practice.
- Do not claim completion while queue tabs and ordering still drift from the decision lock.
- Do not claim completion while notifications and overdue/reminder logic are absent.
- Do not claim completion while repeated recognition/governance patterns remain duplicated locally without clear justification.
- Do not re-read files that are still within your current context or memory unless a detail is genuinely uncertain.

## Required final proof

The final pass must prove:

- real authority enforcement
- working mutation plumbing
- typed recipient persistence
- associated-item visibility correctness
- queue-model compliance
- notification/reminder implementation
- shared-surface discipline
- current `.sppkg` freshness
