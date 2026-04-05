# HB Shell Extension Root-Cause Investigation and Resolution Prompt Package

## Objective

This package contains a sequential set of prompts for a local code agent to investigate and resolve the current root cause in the `hb-shell-extension` domain.

## Confirmed current state

The shell extension is now mounting on the page, but it is rendering two empty containers:

- `top-placeholder`
- `bottom-placeholder`

The current repo truth indicates:

- `apps/hb-shell-extension/src/mount.tsx` mounts `TopPlaceholder` and `BottomPlaceholder` with only `available: true`
- no config is passed into either placeholder
- `TopPlaceholder.tsx` renders an effectively empty container when there are no ribbon items and no alerts
- `BottomPlaceholder.tsx` renders an effectively empty container when there are no footer links, support items, or operational text

That means the current extension is no longer failing to activate. It is activating successfully and rendering empty placeholder wrappers.

## Included files

- `README.md`
- `Shell-Extension-Root-Cause-Summary.md`
- `Prompt-01-Runtime-Path-Investigation.md`
- `Prompt-02-Visible-Proof-Remediation.md`
- `Prompt-03-Governed-Config-Path-and-Verification.md`

## Recommended execution order

1. `Prompt-01-Runtime-Path-Investigation.md`
2. `Prompt-02-Visible-Proof-Remediation.md`
3. `Prompt-03-Governed-Config-Path-and-Verification.md`

## Execution notes

- The code agent should not re-read files already in its current context or memory.
- The code agent should treat live repo truth as authoritative.
- The code agent should not broaden this into homepage redesign or shell-takeover work.
- The objective is to investigate and resolve the current root cause that results in mounted but empty shell-extension surfaces.
