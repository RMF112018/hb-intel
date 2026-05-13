# 04 — B05 Implementation Gap Register

| Gap ID | Gap | Why it matters | Required remediation |
|---|---|---|---|
| B05-G01 | Existing repo B05 package is docs-only | User now needs runtime/OAuth implementation package | Treat this ZIP as runtime follow-on package; do not confuse it with the repo docs package |
| B05-G02 | OAuth start/callback route path needs final closure | Prevent Adobe registration / backend route drift | Lock `POST /api/my-work/me/adobe-sign/oauth/start` and `GET /api/my-work/adobe-sign/oauth/callback` |
| B05-G03 | Current dev redirect URI must be operationally documented | Needed to complete Adobe Configure OAuth safely | Use the exact current dev redirect URI and require live host confirmation before Save |
| B05-G04 | Delegated actor eligibility gate not yet runtime-specified | Avoid app-only/shared-principal queue reads | Normalize from `AuthContext`, reject app-only personal queue retrieval |
| B05-G05 | Stable actor/grant key must be codified | Avoid mutable email/UPN auth drift | Key grants by trusted tenant context + `claims.oid` |
| B05-G06 | Grant store technology is not selected by B05 | Avoid pretending production-live storage exists | Implement store abstraction/configuration gate; use deterministic mocks/tests until approved store is chosen |
| B05-G07 | OAuth state storage/validation must be explicit | Prevent CSRF/mix-up/replay | One-time, unpredictable, expiring, actor-bound, return-flow-bound state records |
| B05-G08 | Refresh-token lifecycle seam must exist | Authorization-required behavior depends on token lifecycle | Add token service abstraction, refresh outcomes, state mapping, no secret leakage |
| B05-G09 | Adobe search integration posture must match B05 | Avoid broad list fetch and local filtering | Implement bounded `POST v6/search` adapter posture around exact six statuses |
| B05-G10 | Source handoff URLs need policy validation | Prevent unsafe/guessed outbound links | Reuse/adapt existing URL policy posture and keep row CTA optional |
| B05-G11 | Signing URLs may be misused as default open links | Creates workflow/security/product drift | Explicitly prohibit default signing URL use for queue row handoff |
| B05-G12 | App-registration values can drift from code | OAuth fails when redirect URI differs | Runbook must mirror callback route and same redirect URI for registration + token exchange |
| B05-G13 | Production readiness could be overstated | Secrets/store may not exist yet | Closeout must separate code completion from live enablement readiness |
| B05-G14 | Future staging/prod URLs might be guessed | Creates false configuration authority | Do not add speculative URIs until real origins exist |
