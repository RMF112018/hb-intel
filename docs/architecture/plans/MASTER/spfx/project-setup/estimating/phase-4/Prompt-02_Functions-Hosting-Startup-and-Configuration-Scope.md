# Prompt 02 — Functions Hosting, Startup, and Configuration Scope

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 4 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **Functions hosting / startup scoping / configuration validation** work required to make Project Setup infrastructure production-safe.

This prompt is focused on reducing over-broad boot blockers and making runtime prerequisites explicit.

## Critical instructions

- Use the Phase 4 infrastructure baseline created in Prompt 01 as the governing source.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** broaden this into auth redesign or data-contract work.
- Do **not** preserve eager startup validation for features that the isolated Project Setup deployment does not actually require.

## Required working approach

1. Review Azure Functions entrypoint, validator logic, feature gating, and service-factory initialization.
2. Separate core Project Setup runtime requirements from optional or future-capability dependencies.
3. Implement scoped startup validation and dependency initialization.
4. Define the exact required production app settings and runtime-mode prerequisites.
5. Add explicit operator-usable diagnostics for missing required configuration.

## Specific outcomes required

By the end of this prompt:
- Project Setup should be able to boot with only its actual required infrastructure in place
- unrelated future dependencies should no longer block startup
- required configuration should be documented and validated explicitly
- startup failure diagnostics should be clear enough for novice operators to act on

## Required implementation outputs

Make the code changes necessary to:
- scope validators to Project Setup deployment needs
- tighten service initialization
- clarify required vs optional settings
- improve startup diagnostics for missing or invalid config

Update or create markdown summarizing:
- validators changed
- services no longer eagerly initialized
- required app settings
- remaining optional/inactive dependencies

## Acceptance criteria

- The isolated Project Setup deployment can boot without unsupported feature dependencies being configured.
- Missing required configuration produces clear, safe diagnostics.
- The startup/config contract is documented and testable.

## Required summary back to me

When done, report:
- files changed
- validators changed
- dependencies no longer required at startup
- required app settings introduced or clarified
- any remaining startup blockers that must be handled in later prompts
