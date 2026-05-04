# Implementation Roadmap Machine-Readable Contract

## Purpose

The documentation update must add a machine-readable roadmap artifact that directs future code agents through Procore remediation and implementation without relying on prose interpretation.

## Required Artifact

`artifacts/procore_data_layer_phase3_roadmap.json`

## Required Semantics

The artifact must include:

- package identity and generation date,
- current phase/wave context,
- guardrails,
- Wave 13A-13F overlay sequence,
- dependencies between overlay waves,
- runtime eligibility flags,
- primary outputs,
- first live-read gate,
- excluded behavior.

## Wave Overlay Summary

- 13A — Remediation Gate.
- 13B — HB Central Projects Registry + Procore Mapping Contract.
- 13C — Shared Procore Data Layer Models and Fixtures.
- 13D — Backend Mock Adapter Boundary.
- 13E — SPFx Fixture Integration Into Core Surfaces.
- 13F — Module Remediation and Closeout.

## Agent Behavior

Agents must treat this JSON as an execution contract. If prose and JSON conflict, stop and update the documentation or artifact so the conflict is resolved explicitly.
