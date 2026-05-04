# Wave 13A-13F Sequence Overview

## 13A — Procore Data Layer Remediation Gate

Audit and scope lock. No runtime. Produces module remediation target matrix.

## 13B — HB Central Projects Registry + Procore Mapping Contract

Defines canonical mapping between HB Central Projects, PCC project identity, SharePoint site identity, and Procore company/project identity.

## 13C — Shared Procore Data Layer Models and Fixtures

Adds runtime-independent shared contracts and deterministic fixtures.

## 13D — Backend Mock Adapter Boundary

Introduces backend provider boundaries and mock-only envelopes. No live Procore calls.

## 13E — SPFx Fixture Integration Into Core Surfaces

Adds fixture-backed Procore mapping/status/signal cards and degraded states through existing read-model seams.

## 13F — Module Remediation and Closeout

Patches Waves 6-13 with source-lineage/object-link/freshness/degraded-state posture and closes the remediation package.
