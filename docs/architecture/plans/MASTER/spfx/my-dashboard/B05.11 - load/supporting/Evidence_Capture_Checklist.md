# Evidence Capture Checklist

## 1. Pre-Deployment Baseline Already Captured

Use the baseline in:

```text
supporting/Live_Telemetry_Baseline.md
```

Do not replace it. Add post-remediation evidence alongside it.

---

## 2. Deployment Required

Because this package changes backend runtime code, the backend Function App must be redeployed before live KQL validation.

This package does not require an SPPKG rebuild/deploy unless a separate frontend closeout demands it.

---

## 3. Post-Deploy Live Requests

After backend deployment, trigger:

1. Fresh My Dashboard page load.
2. Repeat My Dashboard page load inside the 60-second registry cache TTL.
3. One later page load after the TTL expires, when practical.

---

## 4. Required KQL Evidence

Run:

- handler duration summary
- Project Links source timings
- Project Links source + reconcile join
- registry cache state breakdown

Use the corrected trace-based queries only.

---

## 5. Evidence to Record

Capture values for:

| Metric | Before | After |
|---|---:|---:|
| Registry row count | 825 | |
| Registry duration | ~1,056–2,150 ms | |
| Project Links handler | ~1,067–2,184 ms | |
| Reconcile | ~1–32 ms | |
| Matched items | 5 | |

Also record:
- cache state observed,
- whether server filter telemetry says applied,
- whether final assigned-project counts remain correct.

---

## 6. Result Classification

Choose exactly one:

1. **Strong success**
   - lower registry rows,
   - lower registry duration,
   - lower handler duration,
   - no correctness regression.

2. **Partial success**
   - correctness preserved,
   - some performance improvement,
   - next bottleneck still measurable.

3. **No material improvement**
   - correctness preserved,
   - performance not materially improved,
   - next package required.

4. **Regression**
   - correctness or source-status behavior broke,
   - stop and remediate before further optimization.
