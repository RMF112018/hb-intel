# Performance Evidence Closeout Template

## Purpose

Use this template after the remediation package is implemented and timing evidence has been collected.

---

# 1. Deployment / Branch Context

- Branch:
- Commit:
- Deployment target:
- Date/time:
- Reviewer:

---

# 2. UX Validation Summary

## Primary composition
- Shell rendered immediately: yes/no
- My Projects visible during home loading: yes/no
- Adobe visible during home loading: yes/no
- My Projects card-local loading state visible: yes/no
- Adobe card-local loading state visible: yes/no

## Deferred Adobe history
- Recent completions request still waits for user interaction: yes/no

---

# 3. Browser Waterfall Summary

| Measurement | Value |
|---|---:|
| Time to shell visible | |
| Time to My Projects useful | |
| Time to Adobe useful | |
| `/home` duration | |
| `/project-links` duration | |
| Requests overlap? | |
| Recent completions deferred? | |

HAR path/reference:
- 

---

# 4. Frontend User Timing Marks Observed

- `my-dashboard:shell:mounted`: yes/no
- `my-dashboard:request:home:start/end/duration`: yes/no
- `my-dashboard:request:project-links:start/end/duration`: yes/no
- `my-dashboard:module:my-projects:useful`: yes/no
- `my-dashboard:module:adobe-sign-action-queue:useful`: yes/no

---

# 5. Backend Telemetry Summary

## `/home`
- Handler duration:
- Auth duration:
- Principal resolution:
- Token acquisition:
- Refresh:
- Adobe search:
- Overall adapter duration:

## `/project-links`
- Handler duration:
- Projects loader duration:
- Registry loader duration:
- Projects row count:
- Registry row count:
- Reconcile duration:
- Matched item count:

---

# 6. Interpretation

## Primary latency owner
Choose one:
- frontend sequencing
- Adobe path
- Project Links path
- host/platform overhead
- mixed / inconclusive

Rationale:

---

# 7. Follow-On Recommendation

Choose one or more:
- no major follow-on needed
- Project Links backend optimization package
- Adobe upstream/read-model optimization package
- stale-while-revalidate/cache design package
- Azure Functions hosting/cold-start investigation package

Rationale:

---

# 8. Validation Commands Completed

```text
[ ] pnpm --filter @hbc/spfx-my-dashboard test
[ ] pnpm --filter @hbc/spfx-my-dashboard check-types
[ ] pnpm --filter @hbc/functions test
[ ] pnpm --filter @hbc/functions check-types
```

---

# 9. Commit / PR Summary

- Commit(s):
- PR:
- Notes:
