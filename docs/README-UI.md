# UI System Doctrine / Architecture Package

This package provides the recommended new documentation set for the HB Intel two-lane UI refactoring effort.

## Included files

- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/explanation/ui-system/Why-Two-Lanes.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`

## Intent

These files establish:

- one shared UI foundation,
- a layered system of foundations → primitives → surface families → consumers,
- a distinct **presentation lane** for premium homepage / editorial / spotlight surfaces,
- a distinct **productive lane** for forms / tables / workflow / application UI,
- a migration posture that preserves compatibility through adapters and staged rollout.

## Suggested placement

These files are written to be dropped into the repository at the paths shown above.

## Notes

- The language is intentionally opinionated where needed to prevent the UI from collapsing back into generic shared-card patterns.
- The files are designed to work alongside the tightened `CLAUDE.md` and updated UI/UX reviewer agent guidance.
