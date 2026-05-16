# 04 — Risk Exposure and Rollback

## 1. Risk: Filter Predicate Excludes Legitimate Rows

### Exposure
The provider currently filters some registry rows after fetch. Moving the predicate server-side is correct only if it exactly mirrors current eligibility.

### Mitigation
- Preserve the same status universe:
  - `matched`
  - `unmatched`
  - `review-required`
- Preserve active rows only.
- Add tests proving parity.

### Rollback
Revert Prompt 01 changes only. Telemetry remains useful.

---

## 2. Risk: Cache Introduces Stale Source Rows

### Exposure
A 60-second registry cache may delay visibility of a new registry change.

### Mitigation
- Cache source rows only, not personalized results.
- TTL is intentionally short.
- Cache failures never persist.
- Post-deploy evidence should confirm correctness for warm reads.

### Rollback
Disable or remove cache seam, retain server-side filter and metadata memoization.

---

## 3. Risk: Memoization Masks Retry Behavior

### Exposure
A rejected in-flight Promise could poison future calls if not cleared.

### Mitigation
- Clear in-flight Promise on rejection.
- Add tests proving retry after failure.

### Rollback
Revert Prompt 03 only.

---

## 4. Risk: Telemetry Adds Noise or Privacy Leakage

### Exposure
Additional diagnostics could accidentally emit sensitive content.

### Mitigation
- All new properties must be primitive and closed-set where possible.
- No URLs, actor identifiers, project names, role arrays, or raw Graph filter strings in telemetry.
- Add privacy-shape tests where relevant.

### Rollback
Remove new diagnostic fields, not the core optimization.

---

## 5. Risk: Optimization Does Not Materially Improve Handler Time

### Exposure
The registry row set may remain large, or network/list-catalog overhead may dominate.

### Mitigation
- Package includes separate memoization work.
- Package requires live before/after telemetry.
- The next package is not preselected; it must follow evidence.

### Rollback
Not required if correctness is preserved; retain transparent telemetry and classify as partial/no material improvement.

---

## 6. Rollback Priority

If live deployment shows correctness regression:

1. revert cache changes,
2. revert registry filter if the filtered row universe is proven too narrow,
3. preserve telemetry improvements unless they caused the regression,
4. do not roll back unrelated B05.8 frontend improvements.
