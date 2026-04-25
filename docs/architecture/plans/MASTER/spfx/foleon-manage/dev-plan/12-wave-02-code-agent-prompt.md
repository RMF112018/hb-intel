# 12 — Wave 02 Code-Agent Prompt: SPFx Connector UI

You are working in the live `hb-intel` repository on `main`.

## Objective

Build the premium SPFx Foleon Connector UI that allows selected users to manage Foleon content without directly editing SharePoint lists.

The UI must call the backend `/api/foleon/*` routes created in Wave 01 and must meet the design standards under:

```text
docs/reference/spfx-surfaces/**
docs/reference/ui-kit/doctrine/
```

## Required design posture

This must not look like a raw SharePoint list editor.

It must be:

- host-aware;
- premium;
- editorial/operational;
- accessible;
- breakpoint-governed;
- visibly non-generic;
- validated against the SPFx doctrine and audit scorecard.

Use the approved premium stack where relevant:

```text
motion
lucide-react
@floating-ui/react
@radix-ui/react-slot
@radix-ui/react-tooltip
@radix-ui/react-separator
@radix-ui/react-scroll-area
class-variance-authority
clsx
```

Do not install or import stack packages symbolically; use them materially.

## Required screens

Implement:

1. Connector Dashboard
2. Content Registry browser
3. Content detail/edit panel
4. Validation checklist
5. Publish/suppress action flow
6. Role-blocked state
7. Loading/empty/error states

## Required frontend behavior

- Fetch content from backend API.
- Create draft content through backend API.
- Update content through backend API.
- Validate content through backend API.
- Publish/suppress through backend API.
- Handle stale eTag conflict.
- Show correlation IDs on errors.
- Disable unauthorized actions based on frontend role awareness, but assume backend remains final authority.

## Required breakpoint contract

Implement explicit modes:

- wide desktop;
- standard desktop;
- tablet landscape;
- tablet portrait;
- phone portrait;
- short-height constrained.

Narrowest stable mode: 375px practical content width.

## Required state model

Implement professional states for:

- loading;
- empty;
- error;
- blocked by role;
- validation warning;
- validation blocked;
- unsaved changes;
- stale/conflict;
- save success.

## Tests required

Add tests for:

- content list render;
- editor validation;
- publish/suppress action visibility;
- API error display;
- eTag conflict handling;
- role-blocked state;
- compact layout behavior helpers;
- accessibility basics where repo tooling supports it.

## Final response required

Return:

1. implementation summary;
2. files changed;
3. design doctrine alignment summary;
4. route/API integration summary;
5. state model coverage;
6. breakpoint behavior;
7. tests run and results;
8. remaining Wave 03 requirements.
