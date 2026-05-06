# 04 — PCC 8-Mode Breakpoint Policy Specification

## Target File

```text
apps/project-control-center/src/layout/footprints.ts
```

## Current State

Current PCC source has 5 responsive modes:

```text
phone
tabletPortrait
tabletLandscape
standardDesktop
wideDesktop
```

## Target State

Replace with 8 modes:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

## Width Contract

| Mode | Width |
|---|---|
| `phone` | `< 480px` |
| `tabletPortrait` | `480px – 768px` |
| `tabletLandscape` | `769px – 1024px` |
| `smallLaptop` | `1025px – 1180px` |
| `standardLaptop` | `1181px – 1440px` |
| `largeLaptop` | `1441px – 1599px` |
| `desktop` | `1600px – 1919px` |
| `ultrawide` | `>= 1920px` |

## Resolver Contract

Use deterministic non-overlapping logic:

```ts
if (inlineSizePx < 480) return 'phone';
if (inlineSizePx <= 768) return 'tabletPortrait';
if (inlineSizePx <= 1024) return 'tabletLandscape';
if (inlineSizePx <= 1180) return 'smallLaptop';
if (inlineSizePx <= 1440) return 'standardLaptop';
if (inlineSizePx <= 1599) return 'largeLaptop';
if (inlineSizePx <= 1919) return 'desktop';
return 'ultrawide';
```

## Column Contract

Recommended starting columns:

| Mode | Columns |
|---|---:|
| `phone` | 1 |
| `tabletPortrait` | 2 |
| `tabletLandscape` | 6 |
| `smallLaptop` | 8 |
| `standardLaptop` | 10 |
| `largeLaptop` | 12 |
| `desktop` | 12 |
| `ultrawide` | 12 |

## Span Contract

The local agent may tune spans during implementation, but must define all maps exhaustively for all modes:

- `PCC_RESPONSIVE_COLUMNS`
- `FOOTPRINT_COLUMN_SPANS`
- `FOOTPRINT_MIN_COLUMN_SPANS`
- `FOOTPRINT_MIN_INLINE_SIZE_PX`
- `PCC_RESPONSIVE_THRESHOLDS_PX` or replacement threshold structure
- `resolveResponsiveMode`

## Mandatory Boundary Tests

Add/extend tests for:

| Width | Expected |
|---:|---|
| 479 | `phone` |
| 480 | `tabletPortrait` |
| 768 | `tabletPortrait` |
| 769 | `tabletLandscape` |
| 1024 | `tabletLandscape` |
| 1025 | `smallLaptop` |
| 1180 | `smallLaptop` |
| 1181 | `standardLaptop` |
| 1440 | `standardLaptop` |
| 1441 | `largeLaptop` |
| 1599 | `largeLaptop` |
| 1600 | `desktop` |
| 1919 | `desktop` |
| 1920 | `ultrawide` |

## Do Not Modify

Do not modify:

```text
apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts
```

That file governs homepage behavior, not PCC.
