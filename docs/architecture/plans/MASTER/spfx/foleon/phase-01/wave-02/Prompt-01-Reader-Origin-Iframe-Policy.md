# Prompt 01 — Reader / Origin / iframe Policy

## Objective

Implement and prove the Foleon Reader security model: typed gating, exact-origin allowlist, preview rejection, iframe hardening, and safe `postMessage` handling.

## Governing Authorities

- Foleon publishing/Docs/API guidance
- Microsoft SharePoint iframe trusted-domain guidance
- MDN `postMessage`, iframe, and CSP `frame-ancestors` guidance
- W3C/WAI iframe title accessibility technique

## Files / Seams to Inspect

- `FoleonReaderGate`
- `FoleonOriginPolicy`
- Reader route/component
- iframe component
- route config / `foleonReaderRoutePath`
- Reader unit tests and browser/E2E tests

## Current Gap

The Reader route and services were not inspectable in repo truth. This is the highest-risk functional seam because it controls third-party embeds inside HB Central.

## Required Implementation Outcome

- Fail closed before iframe render unless all predicates pass: visible, published, display window, embed allowed, not external-only, non-empty URL, HTTPS, exact allowed origin, preview policy, trusted-domain runbook.
- Reject wildcard origins.
- Validate `postMessage` origin, source, shape, event type, and numeric height bounds.
- Cleanup event listeners on unmount/content change.
- Add accessible iframe title and safe error/loading states.

## Proof of Closure

- Unit tests covering every typed gate failure.
- Malformed URL and malformed message tests.
- E2E Reader test showing unsafe content does not render an iframe.
- E2E proof that Highlights route has no iframe.
- Runbook for SharePoint HTML Field Security and Foleon/custom-domain frame-ancestor verification.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
