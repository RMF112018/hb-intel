# Prompt 07 — Validate B05 OAuth Configuration, Runtime Readiness, and Closeout

You are Claude Code using Opus 4.7. Perform the final B05 validation and closeout. Do not re-read files that are still within your current context or memory.

## Objective

Validate that the repository now reflects a coherent B05 runtime/OAuth implementation backbone and that the operator-facing Adobe OAuth configuration can be performed without route/config drift.

## Validation checklist

### A. Route truth
Confirm:
```text
POST /api/my-work/me/adobe-sign/oauth/start
GET  /api/my-work/adobe-sign/oauth/callback
```

### B. OAuth registration truth
Confirm docs/runbook preserve:
```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback
```

Confirm documentation says:
- verify live Azure hostname before Adobe Save,
- Adobe scope `agreement_read`,
- modifier `self`,
- no speculative staging/prod URI additions.

### C. Security truth
Confirm:
- no Adobe token/secret/code values committed,
- no frontend secret config,
- no raw callback query logging,
- no shared-principal fallback,
- no UPN/email primary grant key.

### D. Actor/principal truth
Confirm:
- stable actor key uses trusted tenant context + `claims.oid`,
- app-only identities do not resolve as personal queue users,
- grant lookup route does not accept user override parameters.

### E. Provider/search truth
Confirm:
- queue retrieval baseline remains bounded `POST v6/search`,
- exact six-status union,
- source-state mapping aligns with B04/B05,
- no unbounded detail fan-out.

### F. Handoff truth
Confirm:
- URL policy exists or is explicitly wired through an existing approved helper,
- row CTA is optional/backend-supplied only,
- signing URL not treated as default row open contract.

## Commands

Run the repo-appropriate:
- typechecks,
- tests,
- grep guards,
- package-specific validation.

Report exact commands and outcomes.

## Final closeout format

Return:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files created
4. Files updated
5. Exact OAuth routes
6. Exact Adobe redirect URI preserved
7. Validation commands/results
8. Production-live dependencies still operator-gated
9. Any follow-on prompt/package recommendation
10. Suggested commit title and description
