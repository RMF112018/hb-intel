# Prompt 01 — SPFx Shell and Action Catalog Foundation

Use the local repo at HEAD as the final authority.

## Objective

Implement the SPFx webpart shell for the PnP Operations utility and establish the initial action catalog UI and operator workflow.

## Product goal

Create a polished internal admin webpart that:

- uses `@hbc/ui-kit`,
- accepts target site URL input from the operator,
- allows selection of a supported operation,
- shows operation description, scope, and warnings,
- starts a run,
- shows progress / result state,
- and exposes download links for generated output files.

## Required shell capabilities

1. **Target input**
   - site URL input field
   - support for one target site in v1, with architecture left clean for multiple targets later
   - validation for expected SharePoint URL patterns

2. **Action catalog**
   - cards, list, or command surface for supported operations
   - each action should show summary, expected outputs, and permission/warning notes

3. **Run panel**
   - selected target
   - selected action
   - any action-specific options
   - execution button

4. **Result surface**
   - queued/running/completed/failed state
   - concise logs / progress messages
   - file manifest
   - download buttons/links

5. **Operator guidance**
   - clear explanation that heavy extraction runs through a backend seam
   - clear warnings for permission/tenant limitations

## Required initial actions visible in the UI

At minimum include:

- Site starting-point template extraction
- List schema extraction
- Page/layout extraction
- Site inventory export

The agent may include an additional "coming soon" section for deferred operations if helpful, but do not overbuild those actions yet.

## Styling rules

- Use `@hbc/ui-kit`.
- Keep the surface polished, operational, and admin-grade.
- Do not fall back to bland placeholder form styling if existing UI-kit primitives can support stronger composition.
- Add strong empty, loading, running, success, and failure states.

## Implementation rules

- Do not yet hardwire privileged execution logic into the client.
- Implement a clean service layer or client adapter boundary for backend calls.
- Preserve mock/dev mode where useful for UI validation.
- Keep action definitions centralized so the backend catalog and UI catalog can stay aligned.

## Deliverables

Implement:

1. the SPFx webpart shell,
2. the initial action catalog/config model,
3. client-side request/result service boundaries,
4. strong UI states,
5. and a brief usage/help surface.

## Final response requirements

Report:

- created/updated files,
- chosen UI composition,
- supported visible actions,
- backend integration seam placeholders or live calls,
- and anything intentionally deferred.
