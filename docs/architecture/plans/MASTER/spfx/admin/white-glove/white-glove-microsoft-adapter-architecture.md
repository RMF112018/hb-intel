# White-Glove Microsoft Adapter — Architecture Decisions

## Purpose

Document design decisions for the Microsoft device management adapter lane. For the full reference, see [white-glove-microsoft-adapter.md](../../../../../reference/white-glove/white-glove-microsoft-adapter.md).

## Decision 1: Separate from existing Graph service

**Choice:** New services under `device-management/microsoft/` rather than adding device-management methods to `graph-service.ts`.

**Why:**
- The existing Graph service handles identity, groups, and site access for provisioning and hybrid identity. Adding Intune/Autopilot device management would overload it with unrelated responsibilities.
- Device management has different auth requirements (Intune API permissions vs. Graph group permissions).
- The identity service delegates to `IGraphService` for user/group lookups — it composes, not duplicates.
- This follows the prompt's explicit instruction: "do not overload the existing Graph group service."

## Decision 2: Three services by concern

**Choice:** `MicrosoftIdentityService`, `MicrosoftIntuneService`, `MicrosoftAutopilotService` as distinct classes.

**Why:**
- Identity resolution (user lookup, group management) is a cross-cutting concern used by both Intune and Autopilot flows.
- Intune enrollment/compliance and Autopilot registration/profiles are distinct platform capabilities with different APIs and failure modes.
- Separate services enable independent testing and replacement.

## Decision 3: Technician pre-provisioning as checkpoint

**Choice:** Technician-assisted Windows pre-provisioning is modeled as an `ExternalEventWait` checkpoint with structured instructions.

**Why:**
- The technician must physically interact with the device. This is inherently an external event — the backend cannot observe it directly.
- Modeling it as a checkpoint integrates naturally with the device run status machine and the existing checkpoint approval UX.
- `buildTechnicianPreProvisioningContext()` produces structured instructions, making the checkpoint self-documenting for the operator.

## Decision 4: Stub implementations with real connector checks

**Choice:** Service methods that call Intune/Autopilot APIs return stub data. Connector readiness checks are real (backed by `IConnectionRegistryService`).

**Why:**
- Real Intune/Autopilot API calls require tenant configuration and live credentials. Stubs allow API route testing and SPFx integration now.
- Connector readiness checks are real because they validate the infrastructure preconditions that must be met before any API calls. This is testable with the existing connection registry.
- Real API implementations will replace stubs when connectors are live.

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md)
- [Boundary matrix](white-glove-boundary-matrix.md)
- [Microsoft adapter reference](../../../../../reference/white-glove/white-glove-microsoft-adapter.md)
