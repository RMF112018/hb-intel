# Prompt-01 — Runtime Path Investigation

## Objective

Investigate the live `hb-shell-extension` runtime path end-to-end and identify exactly where visible placeholder content/config should originate, how it is supposed to reach the placeholder components, and why it currently does not.

Do not re-read files already in your current context or memory.

---

## Confirmed current state

The shell extension now mounts into the page, but the mounted containers are empty and have zero height.

The current known repo truth already suggests a likely root cause:

- `mount.tsx` passes only `available: true`
- `TopPlaceholder.tsx` and `BottomPlaceholder.tsx` render empty wrappers when config is absent

However, you must still perform a disciplined runtime-path audit before remediation so the fix is not shallow or mislocated.

---

## Required investigation scope

Audit the live repo truth in all relevant areas, including but not limited to:

- `apps/hb-shell-extension/src/extensions/`
- `apps/hb-shell-extension/src/mount.tsx`
- `apps/hb-shell-extension/src/placeholders/TopPlaceholder.tsx`
- `apps/hb-shell-extension/src/placeholders/BottomPlaceholder.tsx`
- `apps/hb-shell-extension/src/placeholders/types.ts`
- any config parsing utilities
- manifest/component-properties handling
- any code that should provide placeholder content or defaults
- any packaging/runtime seam that passes properties into the extension

---

## Required work

### 1. Trace the runtime path
Trace the extension from:
- Application Customizer initialization
- placeholder acquisition
- any component properties parsing
- mount API usage
- placeholder component render inputs

You must identify the full intended data flow.

### 2. Confirm where config is missing
Determine whether the actual problem is:
- no config source exists at all
- config exists but is never parsed
- config is parsed but never passed to mount functions
- mount functions accept no config
- placeholder components rely on config that is never provided
- defaults are absent where visible defaults should exist

### 3. Produce a root-cause finding
At the end of the investigation, state precisely:
- what the root cause is
- where the fix belongs
- whether the minimal mount-only seam is intentionally incomplete or accidentally broken

### 4. Add minimal instrumentation if needed
If useful, add concise diagnostic logging to confirm:
- Application Customizer initialization is firing
- placeholder acquisition succeeds
- config values seen at runtime
- what is passed into mountTop and mountBottom

Keep the instrumentation disciplined and easy to remove or reduce later.

---

## Hard gates

- Do not jump straight to a fix without completing the runtime-path audit.
- Do not assume the only fix is in `mount.tsx` until the full flow is verified.
- Do not broaden this into visual redesign work.
- Do not break the current working activation/mounting posture.
- Do not re-read files already in your current context or memory.

---

## Deliverables

Provide:

1. a precise runtime-path audit
2. a precise root-cause statement
3. the exact file(s) where remediation belongs
4. any minimal instrumentation added
5. a concise final report explaining:
   - how config is supposed to flow
   - where it currently stops
   - what must be fixed next

---

## Acceptance criteria

- the runtime path is fully traced
- the root cause is stated precisely
- the remediation location is identified correctly
- no speculative redesign is introduced
