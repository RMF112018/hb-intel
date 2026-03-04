# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 15
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 15. NGX Modernization Strategy

### Build Modern From Day One

HB Intel introduces no legacy component patterns. Every component built in Phase 4 is the modern standard. There is no modernization backlog at launch.

### Modernization Tracker

| Tool | Modern UI Status | Notes |
|---|---|---|
| Go/No-Go Scorecards | ✅ Modern (Phase 4) | Responsibility heat map, Focus Mode, voice |
| RFIs | ✅ Modern (Phase 4) | Responsibility heat map, voice dictation |
| Punch List | ✅ Modern (Phase 4) | Responsibility heat map, card-stack mobile |
| Drawings | ✅ Modern (Phase 4) | Gesture-first canvas, offline pre-cache |
| Budget | ✅ Modern (Phase 4) | Auto-compact density, frozen columns |
| Daily Log | ✅ Modern (Phase 4) | Voice dictation (highest field value) |
| Turnover | ✅ Modern (Phase 4) | Responsibility heat map, Focus Mode |
| Documents | ✅ Modern (Phase 4) | Tree nav, offline service worker cache |

### Design Consistency Enforcement

- `enforce-hbc-tokens` ESLint rule active on all `styles.ts` files.
- No module may import colors, fonts, or spacing from outside `@hbc/ui-kit`.
- PR introducing a new UI component requires: Storybook story (Default + AllVariants + FieldMode + A11yTest). No exceptions.
- All components must pass in both `hbcLightTheme` and `hbcFieldTheme` before merge.
- `DESIGN_SYSTEM.md` in `packages/ui-kit/` documents all authoring rules.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.15 completed: 2026-03-04
- eslint-plugin-hbc: local CommonJS ESLint plugin at src/lint/eslint-plugin-hbc/
- enforce-hbc-tokens rule: warns on hardcoded hex (#xxxxxx) in src/**/*.{ts,tsx}
- Excluded: src/theme/**, src/icons/**, src/lint/**, *.stories.tsx
- no-restricted-imports: blocks @fluentui/react-theme with guidance message
- All 30+ core component stories now have Default + AllVariants + FieldMode + A11yTest
- DESIGN_SYSTEM.md created with 10 sections (tokens, imports, storybook, themes, naming, elevation, typography, spacing, a11y, file structure)
- NGX Tracker created at docs/architecture/ngx-tracker.md
- ADR-0029: docs/architecture/adr/ADR-0029-ui-ngx-modernization.md
- Developer guide: docs/how-to/developer/phase-4.15-ngx-modernization.md
-->