# Evidence Gap Matrix — Project Home

## Purpose

This matrix helps the local agent distinguish product defects from evidence gaps and host-owned findings.

## Current evidence quality

| Evidence lane     | Current Project Home state                              | Issue                                                    | Required response                                   |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| Screenshot        | 3 screenshots, all 1280×720                             | Scroll segment is `scrollY: 0`; no real below-fold proof | Add real below-fold segments or document limitation |
| DOM card summary  | 16 card rows                                            | Good card order/tier source                              | Use as primary order evidence                       |
| Breakpoint matrix | 8 breakpoints, no horizontal overflow                   | Good layout evidence                                     | Preserve no overflow                                |
| Card measurements | Card heights available                                  | Priority Actions too tall; Ask HBI touch issues          | Remediate and compare                               |
| Accessibility     | 4 axe violations, 18 touch issues                       | Mix of PCC-owned and possibly host-owned                 | Fix PCC-owned; classify host-owned                  |
| Content           | 27 needs-review findings                                | High homepage copy exposure                              | Rewrite/clarify Project Home-owned copy             |
| Workflow          | 0 false-affordance needs-review                         | Host chrome pollutes action list                         | Preserve 0 and isolate PCC-owned actions            |
| HBI authority     | Workflow summary clean, content review flags risk terms | Needs copy review, not necessarily defect                | Clarify HBI boundary                                |
| Source summary    | Source observation limited                              | Evidence may not capture PCC source semantics deeply     | Improve copy/markers only if local and useful       |

## Product-owned evidence targets

### Must remediate

- Project Home command hierarchy.
- Priority Actions mobile height/density.
- Project Intelligence metric-label contrast.
- HBI boundary copy.
- Disabled/inert control reason copy.
- Real scroll screenshot evidence.

### Must classify

- Project Home 18 touch issues.
- ARIA needs-review host vs PCC ownership.
- SharePoint host chrome action observations.

### Must not chase as product defects without evidence

- Microsoft 365 app launcher behavior.
- SharePoint search box accessible-name issues.
- SharePoint app bar links.
- Site navigation owned by SharePoint chrome.

## Project Home evidence success criteria

A successful evidence closeout should include:

```text
Project Home above-fold screenshot
Project Home below-fold scroll screenshot 1
Project Home below-fold scroll screenshot 2
Project Home DOM card summary
Project Home breakpoint matrix rows for all 8 modes
Project Home card measurements for all cards
Project Home axe summary
Project Home content findings
Project Home workflow / false-affordance summary
Project Home HBI/source-authority summary
```

## Required operator notes

If an issue remains, classify it as:

```text
PCC-owned product defect
PCC-owned evidence gap
SharePoint-host-owned limitation
Operator-review item
Accepted residual risk
```
