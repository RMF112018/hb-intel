# Wave 14 Domain Model and State Machine

## Purpose

This anchor defines governing domain boundaries for approvals/checkpoints in Wave 14 without introducing runtime implementation.

## Authority Scope

Wave 14 owns:

- checkpoint queue semantics;
- route-step and transition semantics;
- decision states and decision history semantics;
- approval/checkpoint audit-event semantics.

## Boundary Lock

- Underlying module records remain module-owned.
- Wave 14 semantics are cross-module governance, not source-record reassignment.
- No backend command-route execution is authorized in this prompt.
