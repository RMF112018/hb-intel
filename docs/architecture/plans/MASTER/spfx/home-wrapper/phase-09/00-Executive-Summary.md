# Executive Summary

## Bottom line

The HB Homepage shell on `main` is **not architecturally primitive**. It already has stronger foundations than the screenshots suggest. The repo contains a defined homepage contract, a wrapper/shell split, breakpoint policy, preset and band orchestration seams, first-lane logic, launcher-band integration, and conformance diagnostics.

The current shortfall is different:

> The implementation foundation is credible, but the **active shell grammar, width strategy, and hosted-surface fit model remain too limited** to produce the intended world-class homepage result.

## What is working

1. **Ownership is clearer than the rendered output implies.**  
   The wrapper owns the pre-shell region and the shell owns placement, breakpoint handling, layout, pairing, preset resolution, and diagnostics. That is the right authority split.

2. **The shell is already container-aware.**  
   The implementation includes container measurement, breakpoint policy, band layout resolution, first-lane resolution, and shell conformance evaluation.

3. **The homepage is not a raw SharePoint stack anymore.**  
   There is a launcher band seam, an entry stack wrapper, a typed preset, and a shell orchestration path with diagnostics and governance.

## What is still materially wrong

1. **The active layout grammar is still too thin.**  
   In practice, the shell still resolves mostly into:
   - a stacked single-column sequence, or
   - one fixed paired lane with a 3:2 distribution.

   That is not enough to deliver a premium, editorial, mixed-density intranet homepage.

2. **Measurement authority is split across the entry experience.**  
   The shell computes authoritative width using the entry-stack envelope, but the launcher band also resolves its own responsive behavior from container measurement. That invites breakpoint drift, visible-count drift, and inconsistent decisions between shell and launcher.

3. **Hosted surfaces are not yet governed by a strong shell-fit contract.**  
   The registry carries width and eligibility metadata, but the richer nested-mode contract implied by doctrine is not fully closed. Compact and summary-collapse capabilities are effectively dormant.

4. **Ultrawide usage is still too timid.**  
   The screenshots show a narrow, centered content experience with excessive unused width. The shell may be technically responsive, but it is not yet compositionally confident.

5. **Closure proof is weaker than the doctrine demands.**  
   The repo has diagnostics and governance hooks, but the required black-box evidence standard for host-fit, reflow, zoom, width usage, and rendered closure needs to be formalized.

## Most important remediation decisions

### Decision 1
Create a **single entry-experience measurement truth** that both the shell and launcher band consume.

### Decision 2
Expand the shell from a narrow paired/stacked grammar into a governed set of **band recipes / layout archetypes**.

### Decision 3
Introduce explicit **hosted-surface shell-fit contracts** so zones can declare what stable nested modes they support.

### Decision 4
Add a **proof harness** that validates host-fit behavior across required widths, zoom/reflow states, and launcher/shell alignment.

## Severity view

| Severity | Issue |
|---|---|
| Critical | Split measurement truth across launcher band and shell |
| Critical | Layout grammar too limited for target-state homepage |
| High | Hosted-surface shell-fit contracts underdeveloped |
| High | Width use and density too timid on large desktop surfaces |
| High | Closure evidence harness incomplete |
| Medium | First-lane and vacancy handling need stronger governance |
| Medium | Preset/config bounds need hardening so richer layouts do not sprawl |

## Recommended execution stance

Execute this package as a **single in-scope remediation program**.  
Do not reclassify any of the major issues as optional follow-up work.
