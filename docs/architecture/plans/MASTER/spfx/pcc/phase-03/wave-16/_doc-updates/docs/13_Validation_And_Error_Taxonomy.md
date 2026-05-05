# 13 — Validation and Error Taxonomy

| Code | Meaning | Severity | Remediation |
|---|---|---|---|
| `SETTING_REQUIRED_MISSING` | required setting missing | blocked | request setup |
| `SETTING_INVALID_URL` | URL fails policy | blocked | correct URL |
| `SETTING_INVALID_SCOPE` | invalid scope | blocked | admin correction |
| `SETTING_OVERRIDE_NOT_ALLOWED` | override blocked | blocked | no override |
| `SETTING_OVERRIDE_EXPIRED` | expired override | warning | renew/request |
| `SETTING_PENDING_REQUEST_EXISTS` | pending request exists | warning | view request |
| `SETTING_SOURCE_UNAVAILABLE` | source unavailable | warning/block | retry/recheck |
| `SETTING_BACKEND_UNAVAILABLE` | backend unavailable | warning/block | retry later |
| `SETTING_UNAUTHORIZED` | lacks auth | blocked | request access |
| `SETTING_FORBIDDEN` | role cannot access | blocked | contact admin |
| `SETTING_SECRET_VALUE_REJECTED` | raw secret entered | blocked | use secret reference |
| `SETTING_DRIFT_DETECTED` | drift detected | warning/block | Site Health review |
| `SETTING_HBI_REFUSAL` | unsafe HBI request | info | use governed workflow |
