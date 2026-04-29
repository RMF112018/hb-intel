---
name: hb-brand-asset-governance
description: Govern HB Intel brand asset usage, including logo source files, curated web-ready assets, font package placement, UI brand application, and documentation under docs/reference/brand.
when_to_use: Use when work touches brand files, logos, fonts, curated web-ready assets, brand governance docs, visual identity, UI branding, or asset placement in the repo.
argument-hint: "[brand asset, file, or usage question]"
allowed-tools: Read, Grep, Glob
---

# HB Brand Asset Governance

Review brand asset usage for:

```text
$ARGUMENTS
```

## Objective

Ensure HB brand assets are stored, documented, transformed, and consumed in a controlled way that protects authentic source files while enabling web-ready product usage.

## Governance Model

Use this default structure unless repo truth says otherwise:

```text
docs/reference/brand/
  README.md
  BRAND-ASSET-INVENTORY.md
  BRAND-USAGE-GOVERNANCE.md
  source/
    logos/
    fonts/
    brand-guides/
  curated/
    web/
      logos/
      icons/
      marks/
```

## Rules

1. Preserve authentic source files.
2. Generate curated web-ready assets from source assets rather than editing originals.
3. Do not commit font files into new locations unless the repo has already approved that placement and licensing posture.
4. Never expose font files unnecessarily in generated packages, prompt outputs, or downloadable artifacts.
5. Reference brand governance docs before changing UI brand treatment.
6. Distinguish:
   - source assets;
   - optimized web assets;
   - UI-kit token usage;
   - app-specific composition.
7. Do not reinvent common UI primitives solely for brand expression.

## Output Format

## Brand Governance Verdict

Use one:

- **Compliant**
- **Needs Inventory Update**
- **Needs Curated Asset Generation**
- **Licensing / Placement Risk**
- **Usage Drift**

## Findings

- <finding>

## Recommended File Placement

- <path>

## Follow-Up Prompt

Provide copy-ready instructions when implementation is needed.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

