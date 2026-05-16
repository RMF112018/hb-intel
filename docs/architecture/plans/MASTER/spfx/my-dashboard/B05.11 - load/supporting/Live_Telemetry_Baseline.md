# Live Telemetry Baseline — 2026-05-16

## Source

Observed from Azure Logs screenshots and corrected trace-based KQL outputs supplied after commit `9ee780657249de23bb188e7d2d008b465e46c1bb`.

---

## 1. My Work Handler Duration Summary

Representative rows observed:

| Operation | Duration |
|---|---:|
| `getMyWorkHome` | ~1,452 ms |
| `getMyWorkHome` | ~746 ms |
| `getMyWorkHome` | ~425 ms |
| `getMyWorkProjectLinks` | ~2,184 ms |
| `getMyWorkProjectLinks` | ~1,179 ms |
| `getMyWorkProjectLinks` | ~1,067 ms |
| `getMyWorkAdobeSignRecentCompletions` | ~425 ms |

---

## 2. Adobe Stage Pivot

Representative rows observed:

| Principal | Token | Refresh | Search | Overall |
|---:|---:|---:|---:|---:|
| 470 ms | 715 ms | 655 ms | 264 ms | 1,451 ms |
| 348 ms | 44 ms | — | 354 ms | 746 ms |
| 29 ms | 29 ms | — | 366 ms | 424 ms |

### Interpretation
- Refresh-path Adobe reads can materially exceed warm/no-refresh reads.
- However, this is a secondary remediation candidate after Project Links registry optimization.

---

## 3. Project Links Source Timings

Representative rows observed:

| Projects source | Registry source | Projects rows | Registry rows |
|---:|---:|---:|---:|
| 291 ms | 1,177 ms | 3 | 825 |
| 304 ms | 1,056 ms | 3 | 825 |
| 930 ms | 2,150 ms | 3 | 825 |

### Interpretation
- Registry is the dominant source lane.
- Projects source is not the primary remediation target in this package.

---

## 4. Project Links Source + Reconcile Join

Representative rows observed:

| Registry source | Reconcile | Matched | Assigned | Dual Ready | SP Ready | Procore Ready |
|---:|---:|---:|---:|---:|---:|---:|
| 1,177 ms | 2 ms | 5 | 5 | 5 | 5 | 5 |
| 1,056 ms | 1 ms | 5 | 5 | 5 | 5 | 5 |
| 2,150 ms | 32 ms | 5 | 5 | 5 | 5 | 5 |

### Interpretation
- Reconcile is already negligible.
- Acquisition breadth is the problem.

---

## 5. Baseline Conclusion

The next remediation package must optimize:

1. registry source breadth,
2. repeated registry source acquisition,
3. cold-path Graph metadata duplication.

It must not waste effort on reconcile logic.
