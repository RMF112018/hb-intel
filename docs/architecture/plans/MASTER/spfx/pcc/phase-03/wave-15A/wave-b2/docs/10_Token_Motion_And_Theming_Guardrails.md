---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 10 — Token, Motion, and Theming Guardrails

## Purpose

Prevent visual drift by requiring existing branded UI-kit tokens and restrained shell motion.

## Token Rules

Use existing UI-kit tokens already available to PCC. Do not introduce one-off colors unless the token system lacks a required semantic slot and the user approves the addition.

## Token Mapping

| Use Case | Token Intent |
|---|---|
| Shell background | surface/canvas token |
| Hero surface | elevated/surface token |
| Canvas background | subtle surface token |
| Shell divider | border/default token |
| Primary title | text/primary token |
| Secondary text | text/muted or text/secondary token |
| Mandatory facts | label/value token pair |
| Active tab | branded accent + accessible foreground |
| Tab hover | hover/surface token |
| Focus ring | existing focus/accent token |
| Disabled command | disabled foreground/background token |
| Unavailable state | neutral/warning token depending severity |

## Motion Rules

Motion is allowed only where it improves orientation.

### Required Motion

- tab active indicator transition;
- hover/focus color transitions;
- subtle surface entrance only if no layout jump.

### Prohibited Motion

- dramatic canvas slides;
- height animation that causes SharePoint page jump;
- sticky/fixed shell transitions;
- motion that ignores `prefers-reduced-motion`.

### Durations

| Interaction | Recommended Duration |
|---|---:|
| Tab active indicator | 160–220ms |
| Hover/focus color | 120–180ms |
| Canvas opacity transition | 120–180ms |
| Reduced motion | no transform/slide; keep instant or minimal opacity |

## Acceptance Criteria

- CSS uses existing CSS variables/theme tokens.
- Reduced-motion media query exists where motion is added.
- Focus ring has sufficient visibility.
- No arbitrary color literals except documented token bridge variables.
