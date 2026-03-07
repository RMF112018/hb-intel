# ADR-0055: Deprecated Token Removal Policy for @hbc/ui-kit

**Status:** Accepted
**Date:** 2026-03-07
**Blueprint Reference:** §2c — ui-kit maintenance and upgrades
**Foundation Plan Reference:** PH4C (Code Quality Remediation Phase)

## Context

Fluent UI v9 periodically deprecates tokens as the design system evolves. When a token is
deprecated, we have two options:

1. **Migrate immediately** — Replace all uses and remove the deprecated token
2. **Phase out gradually** — Maintain deprecated tokens temporarily while users migrate

The challenge: Without a clear policy, deprecated tokens can linger indefinitely, creating
technical debt and confusion about which tokens are safe to use going forward.

## Decision

### Scan-Gated Removal Process

Deprecated tokens are removed only after passing a two-step gate:

1. **Automated Scan** — Run a codebase-wide scan to find all usages of the deprecated token
   ```bash
   grep -r "tokens\.deprecatedTokenName" packages/
   ```
   If zero usages found, proceed to step 2.

2. **Manual Audit** — Architecture owner reviews the scan results and:
   - Confirms all consumers have migrated or are documented
   - Verifies no external packages depend on the deprecated token
   - Approves removal in an ADR

### Migration Path

For each deprecated token:

| Phase | Action | Owner | Timeline |
|-------|--------|-------|----------|
| Deprecation Announcement | ADR created noting the token will be removed | Architecture Owner | Immediately upon Fluent update |
| Grace Period | Automated scan runs quarterly | DevOps | 3 months from announcement |
| Review & Approval | Manual audit + removal approval | Architecture Owner | Upon scan completion |
| Removal | Delete deprecated token + update consumers | Frontend | 1 week after approval |

### Documentation Requirements

Each deprecated token removal must include:
- A new ADR (or amendment to this ADR) documenting what was removed and why
- A migration guide in `docs/how-to/developer/` showing the replacement token
- Link to the PR that removes the deprecated token

## Consequences

1. **Clarity**: The codebase never has "mystery" deprecated tokens; all removals are intentional.

2. **Safety**: Manual audit ensures we don't accidentally break consuming packages.

3. **Documentation**: Developers have a migration guide for each token change.

4. **Burden**: Removing tokens requires more process overhead, but this is acceptable
   since Fluent deprecations are rare (typically 1–2 per major version).

## Alternatives Considered

1. **Immediate removal** — Rejected because it could break consuming packages.

2. **Never remove** — Rejected because deprecated tokens clutter the API and create confusion.

3. **Deprecation warnings at runtime** — Rejected because Griffel CSS-in-JS doesn't support
   runtime warnings (tokens are resolved at build time).

## Validation

- [x] Automated scan tool configured
- [x] Manual audit process documented
- [x] Migration guide template created in docs/how-to/

## References

- `packages/ui-kit/src/theme.ts` — Token definitions
- `docs/how-to/developer/token-migration-guide.md` — Template
