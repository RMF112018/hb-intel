# Prompt 06 — HB Kudos Reintegration

The shared picker extraction and contract work are complete or in place.

Now rewire HB Kudos so it consumes the shared picker correctly.

## Primary Goal

HB Kudos must consume the shared picker through the correct governed surface, with the required directory/photo behavior visible in the live composer experience.

## Read First

Do not reread files already in current context unless they changed, the context is stale, or scope expanded.

Focus on:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/homepage.ts`
- the shared picker files already modified
- the current search adapter files

## Required Changes

### 1. HB Kudos must consume the shared picker, not the duplicated local picker

Ensure the routed user path from `HbKudos.tsx` into the composer lands on the shared picker implementation.

### 2. Preserve current draft/write behavior unless a broader rewrite is necessary

If the current submit pipeline expects `individualEmails: string[]`, preserve that behavior through a clean adapter seam.

The user-facing picker may work with richer selected person objects internally, but HB Kudos write behavior must remain correct.

### 3. Show the required search-result content

In the live composer experience, search results must show:

- avatar/photo when available
- first name
- last name
- useful secondary metadata where appropriate

### 4. Keep name-first UX primary

The user should be able to find people by human name first.

Email/UPN support may remain, but the UX must not read as an email-entry-first control.

### 5. Maintain consumer correctness

Do not break:

- existing composer validation
- required recipient rules
- submit flow
- multi-recipient behavior if already supported
- keyboard interaction/accessibility

## Required Cleanup

- remove stale comments that imply the people-picker primitive has not landed yet
- remove or collapse now-obsolete local picker code paths
- update homepage exports/imports as required
- update any local tests/stories affected by the reintegration

## Deliverable

Leave HB Kudos consuming the shared picker cleanly, with no local duplicate picker behavior left behind.
