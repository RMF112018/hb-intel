# HAR Capture and Browser Waterfall Checklist

## Objective

Capture one clean browser-side timing artifact after the remediation package is implemented. The goal is to prove whether:
- both primary requests begin in parallel,
- the page feels faster,
- additional backend bottleneck work is warranted.

---

# Capture Conditions

## Browser
- Chrome or Edge preferred
- Incognito/private window preferred for clean capture

## DevTools
- Open **Network** panel
- Enable:
  - Preserve log
  - Disable cache
- Filter can remain on **All** or **Fetch/XHR** after navigation

---

# Capture Run A — Fresh Page Load

1. Open the My Dashboard page.
2. Clear existing Network entries.
3. Reload the page.
4. Wait until:
   - My Projects reaches a non-loading state, and
   - Adobe card reaches a non-loading state.
5. Export HAR.

## Required observations
Record:
- page shell visible time if obvious from Performance panel or manual observation,
- request start order,
- `/home` start time and finish time,
- `/project-links` start time and finish time,
- whether the requests overlap,
- whether one request starts only after the other completes.

---

# Capture Run B — Adobe Completed Toggle

1. Keep Network open.
2. Click the Adobe completed/history toggle.
3. Confirm exactly one deferred recent-completions request starts.
4. Record its duration.

---

# Capture Run C — Warm Refresh

1. Reload immediately after Run A.
2. Compare:
   - `/home` duration,
   - `/project-links` duration,
   - useful-state arrival.

This gives a crude warm comparison even before Azure-side telemetry review.

---

# Optional Performance Panel Capture

Use the Performance panel to confirm the User Timing marks appear:
- `my-dashboard:shell:mounted`
- request start/end/duration marks
- module useful-state marks

---

# Required Closeout Notes

Paste the following into the performance closeout template:

```text
Run date/time:
Tenant/page:
Browser:
Fresh or warm:
Observed time to shell:
Observed time to My Projects useful:
Observed time to Adobe useful:
Home request start/end/duration:
Project-links request start/end/duration:
Request overlap observed? yes/no:
Adobe recent-completions deferred correctly? yes/no:
HAR file saved as:
```
