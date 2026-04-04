# White-Glove NinjaOne Adapter — Architecture Decisions

## Purpose

Document design decisions for the NinjaOne adapter lane. For the full reference, see [white-glove-ninjaone-adapter.md](../../../../../reference/white-glove/white-glove-ninjaone-adapter.md).

## Decision 1: Downstream standardization only

**Choice:** NinjaOne is modeled strictly as a post-enrollment system. It never participates in device enrollment, identity registration, or MDM authority decisions.

**Why:**
- NinjaOne operates after a device is enrolled in Intune (Windows) or MDM (Apple). It cannot see a device until the enrollment system registers it.
- The no-go list explicitly prohibits treating NinjaOne as an enrollment authority.
- Keeping NinjaOne downstream simplifies the orchestration: enrollment completes → NinjaOne standardization begins.

## Decision 2: Bundle mapping as code-default with governed override path

**Choice:** `DEFAULT_BUNDLE_MAPPINGS` provides code-default mappings from package family + platform to NinjaOne bundles. The governed configuration system can overlay admin-maintained overrides.

**Why:**
- Initial bundle assignments are determined by the IT team's standards. Code defaults capture the baseline.
- IT may need to change software bundles, add scripts, or modify policies without a code deployment.
- The mapping structure supports the `WhiteGloveTemplateAttributeGovernance.GovernedOverride` pattern.

## Decision 3: Idempotent operations with safe retry

**Choice:** All NinjaOne adapter descriptors declare `idempotent: true`. Retry semantics allow 3 retries with 5s backoff.

**Why:**
- NinjaOne policy assignment is inherently idempotent (re-assigning the same policy is a no-op).
- Software bundle triggers check installed state before reinstalling.
- Scripts should be designed as idempotent (the bundle mapping documents this expectation).
- Safe retry significantly simplifies recovery from transient NinjaOne API failures.

## Decision 4: Platform-aware bundle resolution

**Choice:** `resolveBundlesForDevice()` takes both `packageFamily` and `platform` parameters. iPhone/iPad get policy + validation only; Windows/macOS get full bundles.

**Why:**
- iOS/iPadOS devices have limited NinjaOne agent capabilities compared to desktop platforms.
- Software and script bundles are primarily for Windows/macOS where NinjaOne can install applications and run scripts.
- iPhone/iPad standardization is primarily policy-based (app deployment handled by Intune MDM, not NinjaOne).

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md)
- [No-go list](white-glove-no-go-list.md) — NG-6: No NinjaOne as enrollment authority
- [NinjaOne adapter reference](../../../../../reference/white-glove/white-glove-ninjaone-adapter.md)
