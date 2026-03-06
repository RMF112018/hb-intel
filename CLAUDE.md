**Revised CLAUDE.md** (Version 1.2)

# CLAUDE.md

**HB Intel – AI Coding Agent Orchestration Guide**  
**Version:** 1.2 (Updated for Expanded Documentation Structure – Diátaxis + Docs-as-Code)  
**Locked Sources:**  
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` (complete target architecture)
- `docs/architecture/plans/hb-intel-foundation-plan.md` (exhaustive numbered implementation instructions)  

**Purpose**  
This file is the single binding operating manual for Claude Code (claude.ai/code) and any equivalent coding agent. Every response, plan, and code output must derive exclusively from the two locked sources above plus the expanded documentation requirements defined in this version. The agent is now responsible for **comprehensive, living documentation** aligned with 2026 elite-team best practices (Diátaxis framework, audience separation, “Docs as code”).

## 1. Immutable Core Directives (Non-Negotiable)
1. **Read-First Rule**  
   Before any action, confirm you have the full current contents of `CLAUDE.md`, the Blueprint, and the Foundation Plan. Quote the exact section (e.g., “Blueprint §2d” or “Foundation Plan Phase 2.4”) in every response.

2. **Zero-Deviation Rule**  
   Any deviation from the blueprint, foundation plan, or the documentation structure below must be rejected immediately with a reference to the violated section.

3. **Token-Efficient Workflow (mandatory for every task)**  
   a. State the exact phase/section being executed.  
   b. Output a 3-line plan only.  
   c. Generate or edit only the files required for that incremental step.  
   d. End with exact verification commands.  
   Never output more than one phase’s worth of work unless explicitly requested.

## 2. Development Sequence (Strictly Enforced)
Follow `docs/architecture/plans/hb-intel-foundation-plan.md` **exactly** in order:  
Phase 0 → Phase 1 (root config) → Phase 2 (shared packages) → Phase 3 (dev-harness) → Phase 4 (PWA) → Phase 5 (SPFx webparts) → Phase 6 (HB Site Control) → Phase 7 (backend) → Phase 8 (CI/CD) → Phase 9 (verification).

MVP rollout priority: Accounting → Estimating → Project Hub → Leadership → Business Development.

## 3. Architecture Enforcement Rules
(unchanged from v1.1 – ports/adapters, Zustand, TanStack Router, dual-mode auth, provisioning saga, ui-kit with HB Intel Design System, etc.)

## 4. Documentation Strategy (Mandatory – Diátaxis Framework)
The agent **must** produce and maintain comprehensive documentation as a core deliverable of every phase. All documentation follows the Diátaxis framework and the exact folder structure below:

```
docs/
├── README.md
├── tutorials/              # Learning-oriented (onboarding)
├── how-to/                 # Goal-oriented (user, administrator, developer)
├── reference/              # Technical facts (API, config, glossary)
├── explanation/            # Conceptual understanding
├── user-guide/             # End-user manual
├── administrator-guide/
├── maintenance/            # Runbooks (backup, patching, monitoring, DR)
├── troubleshooting/        # Known issues & common errors
├── architecture/
│   ├── adr/                # Architecture Decision Records (one .md per decision)
│   ├── diagrams/
│   ├── plans/              # Development plans
│   └── blueprint/          # Locked blueprints
├── release-notes/
├── security/
└── faq.md
```

**Core Principles the Agent Must Enforce**
- **Diátaxis**: Every new document goes into the correct quadrant (Tutorials / How-to / Reference / Explanation).
- **Audience Separation**: Clear entry points for Users, Administrators, Developers, and Operations.
- **“Docs as code”**: All files are Markdown, version-controlled, and updated with every change.
- **Minimal root clutter**: Only essential config files at repository root; everything else is under `docs/`, `packages/`, `apps/`, etc.
- **ADR Standard**: Every significant decision must have an ADR in `docs/architecture/adr/`.
- **Automation-Ready**: Structure supports CI linting (Vale), link checking, and future Docusaurus/MkDocs publishing.

After **every phase or major task**, the agent must:
- Create or update the relevant documentation files in the correct `docs/` subfolders (e.g., developer how-to guide after Phase 2, new ADR for any locked decision).
- Maintain the living audit trail in the blueprint and foundation plan (see rule 5 below).

## 5. Comment-Only Update & Documentation Generation Rule (Mandatory)
- **Blueprint & Foundation Plan**: Never change, delete, rephrase, or rearrange any original content. Insert comments **only** under `<!-- IMPLEMENTATION PROGRESS & NOTES -->` at the end of each file (or inline `<!-- PROGRESS: ... -->` after completed sections).
- **Full Documentation**: Actively generate proper Markdown files in the `docs/` structure above. These are **not** comment-only — they are full, professional documentation.
- Example comment block (for blueprint/plan only):
  ```markdown
  <!-- IMPLEMENTATION PROGRESS & NOTES
  Phase X completed: YYYY-MM-DD
  Documentation added: docs/how-to/developer/phase-x-guide.md
  ADR created: docs/architecture/adr/0002-ports-adapters.md
  Next: Phase Y
  -->
  ```

## 6. Build System & Commands
(unchanged from v1.1)

## 6.1 UI Kit Dual Entry-Point Guidance (Final)

When implementing UI in this repository, select imports by runtime target:

- `@hbc/ui-kit` — full component library for PWA, dev-harness, and non-constrained bundles.
- `@hbc/ui-kit/app-shell` — shell-only exports for constrained contexts (notably SPFx webparts).
- `@hbc/ui-kit/theme` — token/theme-only imports for styling without component payload.
- `@hbc/ui-kit/icons` — icon-only imports where components are unnecessary.

Rules:
- Do not import full `@hbc/ui-kit` into SPFx shell-only surfaces when `/app-shell` satisfies the use case.
- Prefer the narrowest entry point that meets requirements to preserve bundle budgets.
- Keep entry-point usage consistent with `docs/reference/ui-kit/entry-points.md` and `packages/ui-kit/DESIGN_SYSTEM.md`.

## 7. Common Pitfalls – Automatic Rejection
(unchanged from v1.1 plus new one): Failing to create or update documentation in the correct Diátaxis folder.

## 8. Verification Protocol
After every change:
1. `pnpm turbo run build`
2. Validate dev-harness
3. Confirm all new documentation files exist in the correct `docs/` location and follow Diátaxis structure.

**Agent Session Anchor (copy-paste into every new Claude Code session):**  
“You are now the HB Intel implementation agent. All actions are governed exclusively by `CLAUDE.md` v1.2, `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`, and `docs/architecture/plans/hb-intel-foundation-plan.md`. Begin every response by stating the exact phase/section you are executing. Documentation is a core deliverable. Proceed only when the user confirms the current phase.”

**End of CLAUDE.md**  
This file is the single source of truth. Future updates must be versioned and aligned with a new Blueprint version.
```

**Summary of Changes in v1.2**
- Updated all paths to the new `docs/architecture/blueprint/` and `docs/architecture/plans/` locations.
- Added a full, enforceable **Documentation Strategy** section that mandates Diátaxis, audience separation, ADRs, maintenance runbooks, and “Docs as code”.
- Strengthened the comment-only rule while explicitly requiring full documentation generation in the correct folders.
- Preserved token efficiency and all previous enforcement rules.
