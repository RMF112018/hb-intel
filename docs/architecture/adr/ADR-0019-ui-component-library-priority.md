# ADR-0019: UI Component Library Priority & Design Decisions

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.6

## Context

Phase 4.5 delivered three canonical page layouts. Phase 4.6 needs to build the 11 highest-priority components that populate those layouts. Several exist as thin Fluent wrappers needing V2.1 enhancements; four are entirely new.

## Decision

### Why These 11 First

Priority order based on dependency analysis:
1. **HbcStatusBadge** — Used in every data view; dual-channel is a V2.1 requirement
2. **HbcConnectivityBar** — Already complete; stories needed for testing
3. **HbcTypography** — Foundation for all text rendering across components
4. **HbcEmptyState** — Zero-data states needed before data components
5. **HbcErrorBoundary** — Error handling wrapper for all pages
6. **HbcButton** — Primary interaction element, used everywhere
7. **HbcInput suite** — Form inputs needed for Create/Update layouts
8. **HbcForm/FormSection** — Wraps inputs into organized forms
9. **HbcPanel** — Side panels for detail views, config
10. **HbcCommandBar** — Toolbar for every list/table view
11. **HbcCommandPalette** — Power-user navigation + AI integration

### Dual-Channel Decision (V2.1 Dec 26)

Status indicators must convey meaning through both **color AND shape** (icon). This ensures accessibility for colorblind users and visibility in bright outdoor conditions (construction field use). Each status variant maps to a distinct icon shape.

### Voice Dictation via Web Speech API

Chose the native Web Speech API over external libraries (e.g., react-speech-recognition) for:
- Zero bundle size impact
- No external service dependency
- Graceful fallback (mic hidden in unsupported browsers)
- Sufficient for dictation use case (not transcription)

### Command Palette AI Integration

The Command Palette accepts an `onAiQuery` prop for AI integration. This is intentionally decoupled from any specific AI provider — the consuming application provides the query handler. The palette handles:
- UI overlay and keyboard navigation
- Debounced input (200ms)
- Online/offline detection (hides AI when offline)
- Response display

## Consequences

- All 11 components follow the established pattern: Griffel styles, HBC tokens, data-hbc-ui attributes
- 44 Storybook stories provide visual regression testing coverage
- Voice dictation gracefully degrades across browsers
- Command Palette is provider-agnostic for AI integration
- Density tiers auto-detect from device capabilities

## References

- PH4.6-UI-Design-Plan.md §6
- Blueprint §1d
- V2.1 Design Decisions (Dec 14, 23, 26, 28, 31)
