# Audit Findings to Remediation Prompt Map

| Audit Finding | Prompt That Closes It |
|---|---|
| Deployed/uploaded `.sppkg` appeared out of parity with live repo source | Prompt 00 |
| Production package appeared to omit usable backend runtime config | Prompt 01 |
| Build path can package My Dashboard with empty `FUNCTION_APP_URL` / `API_AUDIENCE` | Prompt 01 |
| `MyWorkShell` ignores `getApiToken` | Prompt 02 |
| Read-model client factory exists but is not used in production render path | Prompt 02 |
| Router renders surfaces without readiness/data props | Prompt 03 |
| Home and Adobe surfaces default to `non-ready` | Prompt 03 |
| Cards are static placeholder/pending shells | Prompt 04 |
| Adobe OAuth initiation backend exists but frontend/package truth needs reconciliation | Prompt 05 |
| Regression tests and package-truth evidence insufficient for closure | Prompt 06 |
