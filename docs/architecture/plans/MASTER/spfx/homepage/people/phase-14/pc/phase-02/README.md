# People & Culture Full Compliance Prompt Package

## Objective

This package instructs a local code agent with direct access to the live repository to bring the People & Culture application to full compliance across architecture, workflow, persistence, UX, accessibility, packaging, and release proof.

This package is **not constrained by any historical prompt package**. It uses current repo truth, the current governing plan set, and the current split-boundary requirements as the authority.

## Package Contents

1. `Plan-Summary.md`
2. `Prompt-00-Authority-and-Execution-Lock.md`
3. `Prompt-01-Persistence-and-Contract-Closure.md`
4. `Prompt-02-Workflow-Ownership-and-Operating-Model-Closure.md`
5. `Prompt-03-Public-Surface-and-Premium-UI-Closure.md`
6. `Prompt-04-Accessibility-Responsive-and-Full-Width-Compliance.md`
7. `Prompt-05-Packaging-Test-Closeout-and-Release-Proof.md`

## Recommended Execution Order

- Run Prompt 00 first.
- Then run Prompts 01 through 04 in order.
- Run Prompt 05 last after the implementation work is complete.

## Locked Expectations

- Use **repo truth first**. Do not treat older prompt packages as authoritative.
- Preserve the split product boundary:
  - People & Culture Public
  - People & Culture HR Companion
  - HB Kudos Public
  - HB Kudos Companion
  - Legacy merged People & Culture seam for backward compatibility until explicit migration completion
- Do **not** recouple HB Kudos into People & Culture Public or People & Culture Companion.
- Do **not** delete or repoint legacy manifest/GUID seams unless the repo already contains an approved migration-completion path.
- Keep `hb-webparts` packaging healthy and fully verified.
- Promote reusable UI/interaction patterns into governed shared surfaces where appropriate instead of deepening one-off local inline styling.

## Required Agent Behavior

- **Do not re-read files that are still in your active context or memory. Reuse current context first. Only open additional files when needed to progress, verify, or resolve uncertainty.**
- Work directly against the live local repository.
- Make real code and documentation changes. Do not stop at analysis unless a true blocker exists.
- When a blocker exists, document it precisely and propose the smallest credible unblock path.
- Prefer first-class typed contracts and durable persistence over tag-based or ad hoc workflow markers.
- Keep all changes aligned with the existing package boundaries and the `@hbc/ui-kit/homepage` doctrine.

## Required Final Deliverable from the Agent

The final agent response for the full package execution should include:

- What changed
- Remaining blockers or residual risks
- Files added/updated
- Validation performed
- Build/package/test proof
- Exact follow-up steps still required, if any
