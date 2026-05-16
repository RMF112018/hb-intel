# Risk Register and Rollout Plan

## Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Signing URL scope absent | Resolver fails for users | Verify `ADOBE_SIGN_OAUTH_SCOPES`; implement reconnect state |
| Existing grants stale | Users authorized before scope change cannot use resolver | Detect scope insufficiency; guide reconnect |
| Wrong recipient URL selected | User may land in wrong action context | Match actor identity; instrument recipient-match failures |
| Sensitive URL logged | Security exposure | Explicit telemetry and logger tests; never log URL/query |
| URLs persisted in DTOs | Security and staleness issue | Contract tests prohibit `esignUrl` persistence |
| Rate limiting | Failed resolver / unstable UX | Click-time only; normalize 429; respect retry guidance |
| Not-ready agreement | 404 / user confusion | Map to truthful `not-ready` state |
| Non-signature action unsupported | False promise to user | Generic resolver attempt + normalized no-action-url result + hosted validation |
| Search row view URL still absent | Completed-row view fallback may remain incomplete | Keep as separate follow-up only if live payload proves a durable view path exists |
| Scope change triggers reconsent work | Operational communication need | Include operator runbook and reconnect messaging |

## Rollout sequence

1. Merge backend resolver implementation and tests.
2. Deploy backend with existing scope config if adequate.
3. If scope must change:
   - update governed scope configuration;
   - redeploy backend;
   - validate reconnect state;
   - ask users to reconnect through existing OAuth path as needed.
4. Deploy frontend CTA changes.
5. Perform hosted validation matrix.
6. Confirm telemetry is safe and useful.
7. Close implementation only after proof.

## Go / no-go conditions

### Go
- signature resolver works end to end;
- at least one non-signature resolver attempt behaves truthfully;
- tests green;
- telemetry redaction verified;
- no lockfile mutation;
- no unrelated files staged.

### No-go
- raw direct URL appears in DTOs, fixtures, or logs;
- action CTA renders but resolver lacks safe failure behavior;
- reconnect path absent when scope insufficient;
- provider 429 / 404 not normalized;
- staged diff includes unrelated drift.
