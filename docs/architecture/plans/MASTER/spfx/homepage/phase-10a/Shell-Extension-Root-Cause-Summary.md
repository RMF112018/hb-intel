# Shell Extension Root-Cause Summary

## Objective

Summarize the currently confirmed root cause and establish the remediation sequencing for the shell extension.

## Confirmed evidence

The shell extension is now mounting into the SharePoint page. Browser inspection confirmed:

- `document.querySelectorAll('[data-hbc-shell-extension]')` returned two mounted containers
- one for `top-placeholder`
- one for `bottom-placeholder`

Further inspection confirmed both had:

- empty text
- zero height

This means the extension is active but not visibly rendering any configured content.

## Repo-truth basis

### 1. Mount seam behavior
`apps/hb-shell-extension/src/mount.tsx` currently renders:

- `TopPlaceholder` with `{ available: true }`
- `BottomPlaceholder` with `{ available: true }`

No content/config object is supplied to either placeholder.

### 2. Top placeholder behavior
`apps/hb-shell-extension/src/placeholders/TopPlaceholder.tsx` only renders visible content when it has either:

- ribbon items
- alert items

If both are absent, it returns a minimal empty wrapper.

### 3. Bottom placeholder behavior
`apps/hb-shell-extension/src/placeholders/BottomPlaceholder.tsx` only renders visible content when it has:

- footer links
- support items
- or operational text

If all are absent, it returns a minimal empty wrapper.

## Actual root cause

The current shell extension is not failing because of:

- App Catalog registration
- Tenant Wide Extensions registration
- package shape
- placeholder availability

Those are now functioning.

The current root cause is:

- the runtime path mounts the placeholders without any visible config/content
- the placeholder components are explicitly coded to render empty containers when that config/content is missing

## Remediation strategy

### Prompt 01
Investigate the full runtime path and confirm exactly where config should originate and where it is currently lost or omitted.

### Prompt 02
Implement an immediate visible proof remediation so the top and bottom placeholder surfaces render obvious content on the page.

### Prompt 03
Replace proof-only hardcoding with a governed config path, verify the build/package/runtime behavior, and document the activation/content model.

## Desired end state

After remediation, the shell extension should:

- mount successfully
- render visibly obvious shell surfaces
- support a governed config path rather than empty default wrappers
- remain safe and host-cooperative
- preserve the current Application Customizer activation posture
