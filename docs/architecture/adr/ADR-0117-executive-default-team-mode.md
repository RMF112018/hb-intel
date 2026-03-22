# ADR-0117: Executive Default Team Mode

**Status:** Accepted
**Date:** 2026-03-22
**Deciders:** Architecture review (remediation 4-B)

## Context

Two plan documents prescribe contradictory behavior for the Executive role's default team mode on the My Work Hub:

- **P2-D5 §3**: "Executive defaults to `my-team` mode"
- **P2-B2 §4**: "Bare `/my-work` seeds from personal-first draft" (applies to all roles)

The implementation defaulted all roles to `personal`, which satisfied P2-B2 §4 but violated P2-D5 §3.

## Decision

**P2-D5 §3 governs for the Executive role.** Executive users default to `my-team` mode on first visit (when no persisted team-mode draft exists). All other roles default to `personal` per P2-B2 §4.

## Rationale

- Executives primarily oversee team work — the `my-team` view is their primary operating context
- The `personal` view remains one click away via the mode selector
- P2-D5 is the personalization-specific spec; P2-B2's seed rule is a general-purpose default that P2-D5 intentionally overrides for role-aware behavior

## Consequences

- `useHubPersonalization` reads the user's resolved role and applies `my-team` as the default for Executive when no draft is persisted
- P2-B2 §4 is superseded for Executive role only — the section should reference this ADR
- The persisted team-mode draft (16h TTL) takes precedence once the user has made an explicit choice

## Supersedes

P2-B2 §4 "personal-first seed" for the Executive role only.
