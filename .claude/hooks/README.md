# HB Claude Hooks Index

## Purpose

Hooks enforce narrow deterministic behavior outside model judgment.

---

## Current Hook

| Hook | Use |
| --- | --- |
| `plan-library-guard.sh` | Blocks accidental mutation of `docs/architecture/plans/**` unless explicitly authorized. |

---

## Hook Rules

- Hooks must be narrow and explainable.
- Hooks do not replace plan gates.
- Hooks do not inspect archives.
- Hooks must not call tenant, deployment, Graph/PnP, Procore, app catalog, or live endpoint commands.
