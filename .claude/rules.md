# Claude Code Context Rules – HB Intel

## Global File Access Boundaries (enforced on every prompt)
- **Default scope**: Only read files inside the **currently targeted package** (the one mentioned in the user's current task) plus the two authoritative documents:
  - `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`
  - `docs/architecture/plans/hb-intel-foundation-plan.md`
- Never automatically read or search any other `packages/*` folders unless the user explicitly names them.
- Never perform broad searches like `Search(pattern: "packages/*/package.json")` or `Search(pattern: "packages/shell/**")` unless the current task is explicitly for that package.
- For any task targeting `@hbc/ui-kit`, limit reads exclusively to:
  - `packages/ui-kit/**`
  - The two blueprint documents above
  - Root config files only if needed for build verification (`turbo.json`, `tsconfig.base.json`, `pnpm-workspace.yaml`)
- When the user starts a new phase/task, automatically restrict scope to that phase’s package(s) only.
- If a file outside the allowed scope is needed, ask the user for explicit permission before reading it.

These rules take precedence over any default indexing behavior. Enforce them strictly.