# Plan Summary — Wave 02

Wave 02 is about the relationship between the hero and the homepage entry stack.

## Core repo seams
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- hero files from Wave 01

## Rules
- Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Keep shell-owned measurement and authority seams intact unless inspection proves a blocker.
- Do not collapse the launcher back into the old brittle pattern.
