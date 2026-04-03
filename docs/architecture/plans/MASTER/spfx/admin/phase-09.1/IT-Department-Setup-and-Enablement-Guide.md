# IT Department Setup and Enablement Guide — White-Glove Device Deployment

## Purpose

This guide explains how the IT department prepares the Microsoft, Apple, and NinjaOne environments before using the white-glove device deployment feature inside the Admin SPFx IT Control Center.

This guide is written for setup and operational readiness.  
It is **not** a code guide.

---

## 1. What this feature depends on

The white-glove feature depends on four domains working together:

1. **HB Intel Admin SPFx**
   - operator console
   - connector setup
   - package launch
   - status / audit / recovery

2. **HB Intel backend control plane**
   - privileged execution
   - connector validation
   - orchestration
   - audit / evidence persistence

3. **Microsoft stack**
   - Entra ID
   - Intune
   - Windows Autopilot
   - Microsoft Graph permissions
   - conditional device / enrollment policies as needed

4. **Apple stack**
   - Apple Business Manager
   - APNs
   - Automated Device Enrollment
   - Intune MDM for Apple devices

5. **NinjaOne**
   - API access
   - device policies
   - software bundles
   - scripts / automations
   - custom fields / metadata as needed

---

## 2. Target operating model

## Microsoft owns
- Windows device enrollment authority
- Entra identity and device identity
- Autopilot registration and deployment profile assignment
- Intune MDM policy and enrollment ownership

## Apple owns
- ADE device ownership and automated enrollment eligibility
- supervised device enrollment posture
- Apple-side business enrollment trust and token lifecycle

## NinjaOne owns
- endpoint post-enrollment standardization
- software deployment
- scripted configuration
- validation and remediation steps after enrollment

## HB Intel owns
- package orchestration
- connector configuration UX
- readiness validation
- parent / child run tracking
- evidence / audit / status visibility
- recovery guidance

---

## 3. High-level setup order

Use this order:

1. confirm Microsoft licensing and Intune readiness
2. confirm Entra and Graph permission posture
3. configure Windows Autopilot prerequisites
4. configure Apple Business Manager
5. configure Apple APNs and Intune Apple enrollment
6. prepare NinjaOne API and endpoint standards
7. load connector settings into HB Intel Admin SPFx
8. run readiness probes
9. configure package templates and standards
10. execute a controlled first-use validation run

Do not skip the readiness validation sequence.

---

## 4. Microsoft prerequisites

## 4.1 Licensing and tenant readiness
Confirm the tenant has the required Microsoft licensing to support:

- Intune device management
- Entra device join and device objects
- Windows Autopilot workflows
- Graph-based app permissions used by the control plane

At a minimum, confirm the planned user/device population is licensed for the Intune and Entra capabilities required for enrollment and device management.

## 4.2 Intune readiness
Confirm:

- Intune is active and available in the tenant
- MDM authority is established
- device platform restrictions and enrollment restrictions are reviewed
- device groups needed for deployment profiles and compliance policy assignment are prepared
- naming conventions for device groups, device categories, and deployment profiles are defined

## 4.3 Entra / Graph readiness
Confirm:

- the backend control plane has the required app registration / managed identity design approved
- Graph permissions required by the implementation are approved by IT
- the approved permission model is documented
- privileged secrets or certificates are stored in the approved secret store
- least-privilege review is completed before production enablement

## 4.4 Windows Autopilot prerequisites
Confirm:

- corporate Windows devices are eligible for Autopilot
- hardware hashes or OEM / reseller registration path is defined
- Autopilot device import process is documented
- deployment profiles are created and named consistently
- enrollment status page behavior is reviewed
- technician-assisted pre-provisioning path is enabled for white-glove Windows builds
- target device groups are assigned correctly

## 4.5 Windows device package standards
Prepare and document:

- standard device names or naming logic
- standard local admin / privilege policy
- standard required apps
- standard required compliance policy
- standard required configuration profiles
- standard security baseline
- standard BitLocker posture if applicable
- standard Windows Update ring or patching posture

---

## 5. Apple prerequisites

## 5.1 Apple Business Manager readiness
Confirm:

- Apple Business Manager tenant exists and is active
- the organization’s Apple admin ownership is clear
- a dedicated managed Apple account is used for lifecycle-sensitive tokens where possible
- the team understands annual token renewal requirements

## 5.2 Device sourcing and assignment
Confirm the source path for Apple devices:

- purchased through Apple or approved reseller and automatically assigned into ABM, or
- manually added where supported through Apple Configurator for eligible scenarios

Ensure Apple device serials are available and assignable to the intended MDM server.

## 5.3 APNs / MDM push readiness
Confirm:

- Apple MDM Push Certificate is present and valid
- renewal owner is documented
- certificate renewal calendar reminder exists
- the same Apple account strategy for renewal is documented to reduce service interruption risk

## 5.4 Intune Apple enrollment readiness
Confirm inside Intune:

- Apple enrollment is enabled
- ABM / ASM token is uploaded and active
- Apple enrollment profiles are created
- user-affinity / non-user-affinity decisions are documented where relevant
- iPhone / iPad policy differences are documented
- macOS ADE posture is documented
- Company Portal / Setup Assistant / SSO path decisions are documented

## 5.5 Apple package standards
Prepare and document:

- iPhone baseline app set
- iPad baseline app set
- macOS baseline app set
- supervised device expectations
- configuration profile set
- compliance policy set
- Wi-Fi / VPN / certificate dependencies as needed
- Apple-specific activation / handoff expectations for field and office users

---

## 6. NinjaOne prerequisites

## 6.1 Platform access
Confirm:

- system admin access exists
- API access is approved
- OAuth or token strategy is approved and documented
- the backend system identity that will call NinjaOne is approved

## 6.2 Standardization model
Prepare and document:

- baseline scripts for new laptop / desktop builds
- baseline scripts for macOS support if applicable
- software bundles by package type
- policy bundles by package type
- validation scripts / checks used to confirm a device reached standard
- any required custom fields or tags used to map package metadata

## 6.3 Operational data model
Define what NinjaOne will receive or derive:

- package type
- device role
- user assignment
- office vs field designation if relevant
- software bundle
- policy bundle
- validation bundle
- escalation label or service desk routing tag if applicable

## 6.4 Production readiness
Before first production use, confirm:

- scripts are tested in a non-production set
- software packages install cleanly
- policy conflicts are understood
- technicians know which failures are handled by NinjaOne remediation vs HB Intel operator action

---

## 7. HB Intel setup inside the Admin app

## 7.1 Connector setup
Inside the Admin SPFx white-glove connection setup experience, IT should be able to:

- enter Microsoft connection and identity configuration details
- validate Microsoft connector health
- enter Apple connector / token metadata and validate readiness
- enter NinjaOne API / OAuth settings and validate connectivity
- view last successful validation time
- view failure messages and remediation guidance

## 7.2 Standards and template setup
Inside the Admin app, IT should be able to:

- define or confirm the six employee package templates
- map each package to platform-specific standards bundles
- map Microsoft standards for Windows devices
- map Apple standards for Apple devices
- map NinjaOne post-enrollment bundles
- set checkpoint policies where needed
- review governed version history

## 7.3 First-use readiness checks
Run all readiness checks before first production use:

- Microsoft connector validation
- Apple connector validation
- NinjaOne connector validation
- package-template completeness
- required policy / bundle presence
- required group / profile / assignment references
- run-store and audit-store health
- notification and operator visibility checks

---

## 8. First-use validation workflow

Perform a controlled first-use validation before production rollout.

## 8.1 Use a controlled test employee / test package
Use a non-production test target that represents a real package path.

Recommended validation sequence:

1. one Windows package
2. one Apple package
3. one mixed-device package

## 8.2 Validate end-to-end behaviors
Confirm:

- package launch works from SPFx
- readiness validation blocks incomplete environments
- backend run starts correctly
- connector snapshots are recorded
- child device runs are created
- checkpoints surface correctly
- downstream statuses normalize correctly
- NinjaOne post-enrollment actions trigger correctly
- evidence and audit records are visible in Admin SPFx

## 8.3 Validate recovery behavior
Confirm:

- readable error messages
- retry guidance
- repair guidance
- checkpoint pause behavior
- evidence persistence on partial failure
- operator attribution for recovery actions

---

## 9. Common mistakes to avoid

## Microsoft
- assuming Autopilot can be treated like generic device registration
- using hybrid-first logic when cloud-native Entra join is the intended default
- skipping profile / group assignment review
- forgetting enrollment restrictions and ESP behavior
- treating Intune and Entra permissions as informal instead of governed

## Apple
- failing to plan annual token renewals
- using unmanaged Apple accounts for critical renewal ownership
- assuming all Apple devices can be retroactively made ADE-eligible without the correct path
- treating iPhone, iPad, and macOS as if they have identical enrollment behavior
- skipping supervision and assignment validation

## NinjaOne
- using production scripts before controlled testing
- making NinjaOne the source of truth for enrollment ownership
- failing to define custom-field / tagging strategy
- failing to separate standardization bundles by device package

## HB Intel
- entering connection values without validating them
- launching package runs before readiness passes
- editing live standards without governance or version awareness
- expecting SPFx to perform privileged actions directly

---

## 10. Environment-ready checklist

The environment is ready for first production use only when all items below are true.

### Microsoft
- [ ] licensing confirmed
- [ ] Intune ready
- [ ] Entra / Graph permissions approved
- [ ] Autopilot process defined
- [ ] Windows deployment profiles prepared
- [ ] Windows standards bundles prepared

### Apple
- [ ] ABM active
- [ ] APNs valid
- [ ] Intune Apple enrollment configured
- [ ] ADE profiles created
- [ ] serial assignment process documented
- [ ] Apple standards bundles prepared

### NinjaOne
- [ ] API / OAuth configured
- [ ] software bundles tested
- [ ] scripts tested
- [ ] policies assigned
- [ ] metadata model defined

### HB Intel
- [ ] connector settings loaded
- [ ] all connector health probes passing
- [ ] package templates configured
- [ ] standards mapped
- [ ] run / audit / evidence paths validated
- [ ] test execution completed successfully

---

## 11. Operating support model

When the feature is live, support ownership should be split as follows.

### IT operator / technician
- run launches
- readiness review
- checkpoint handling
- first-line recovery actions
- validation of device completion

### Platform admin
- connector maintenance
- token renewals
- permission posture
- standards updates
- package-template governance

### Development / product support
- adapter defects
- data contract defects
- run-store / audit-store failures
- UI / orchestration defects
- cross-system normalization issues

---

## 12. Final operating note

The feature should not be treated as a “one-click magic button.”  
It should be treated as a **governed orchestration system** that makes the workflow operationally simple for IT while preserving platform-native responsibilities, visibility, and control.
