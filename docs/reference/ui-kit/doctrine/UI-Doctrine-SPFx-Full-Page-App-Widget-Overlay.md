# UI Doctrine — SPFx Full-Page App and Widget Overlay

> **Governing Status:** Binding runtime overlay for non-homepage SPFx full-page app, widget, and PCC-style surfaces.
> **Inherits from:** [UI Doctrine — SPFx Governing Standard](./UI-Doctrine-SPFx-Governing-Standard.md)
> **Does not inherit by default:** Homepage-only hero, entry-stack, homepage shell, or `@hbc/ui-kit/homepage` import restrictions from [UI Doctrine — SPFx Homepage Overlay](./UI-Doctrine-SPFx-Homepage-Overlay.md).
> **PWA boundary:** PWA routes remain governed by [UI Doctrine — PWA Governing Standard](./UI-Doctrine-PWA-Governing-Standard.md).
>
> **Classification key:** Rules marked **BINDING** are mandatory. Rules marked **DIRECTIONAL** are strong guidance where justified deviation is acceptable.

---

## 1. Overlay intent and scope

This overlay governs SharePoint-hosted non-homepage SPFx surfaces where product teams need command-center grade composition without violating host constraints.

### 1.1 In-scope surfaces — BINDING

- Project Control Center (PCC)-style surfaces
- Project Sites and similar operational SharePoint-hosted domain apps
- major SPFx widgets and operational dashboard widgets
- embedded app frames hosted within SPFx pages where shell behavior is still host-aware
- command-center shells inside app-owned canvas regions

### 1.2 Out-of-scope surfaces — BINDING

- Homepage webparts governed by the Homepage Overlay
- PWA routes governed by the PWA Standard
- host-level SharePoint global shell ownership

## 2. Inheritance and boundary rules

### 2.1 Base inheritance — BINDING

All obligations in the SPFx Governing Standard remain binding unless this overlay defines a stricter or more specific rule for non-homepage app/widget surfaces.

### 2.2 Homepage rule non-inheritance — BINDING

Non-homepage SPFx full-page/widget/PCC surfaces do not automatically inherit homepage-specific rules for:

- homepage hero composition
- homepage entry-stack behavior
- homepage shell-specific arrangements
- homepage-only import restrictions centered on `@hbc/ui-kit/homepage`

Those rules apply only when a non-homepage surface explicitly and intentionally adopts them with documented rationale.

### 2.3 Runtime partitioning — BINDING

- SharePoint-hosted app/widget routes use SPFx Governing Standard + this overlay.
- Homepage surfaces use SPFx Governing Standard + Homepage Overlay.
- PWA routes use PWA Governing Standard.

## 3. Allowed host-safe composition patterns

### 3.1 Command-center composition posture — BINDING

The following patterns are explicitly allowed when implemented host-safely:

- app-local navigation that does not duplicate SharePoint global chrome
- dark intelligence headers for app-local hierarchy and status context
- command/search zones
- side rails
- KPI/status bands
- bento/cockpit dashboard composition
- variable card sizes
- flexible grid layouts
- structured workbench layouts for workflows, forms, logs, approvals, and detail review

### 3.2 Design intent — DIRECTIONAL

Use composition to express operational clarity and decision confidence, not ornamental complexity.

## 4. Prohibited outcomes

### 4.1 Host and shell violations — BINDING

Prohibited:

- fake SharePoint shell duplication
- direct host chrome competition
- suppression or collision behavior that undermines host-owned controls

### 4.2 Weak dashboard posture — BINDING

Prohibited as dominant outcomes:

- generic enterprise card-grid posture
- fixed equal-height row layouts as the default command-center dashboard strategy
- row-height whitespace traps that waste primary operational canvas

### 4.3 Governance misuse — BINDING

Prohibited:

- blind application of homepage-only rules to PCC/full-page SPFx surfaces
- unscored “looks good” acceptance closure without doctrine-aligned scoring and evidence

## 5. Widget contract requirements

Every major SPFx widget in this overlay scope must document and validate the following.

### 5.1 Purpose and domain contract — BINDING

- explicit purpose statement
- target operator/persona context
- accepted vs out-of-scope responsibilities

### 5.2 Footprint and layout contract — BINDING

- minimum stable width
- preferred span range
- compact mode rules
- container-fit behavior under constrained width/height

### 5.3 State and seam contract — BINDING

- explicit state model (loading/empty/error/success/partial/permission states as relevant)
- data seam ownership (read/write boundaries, freshness indicators where needed)
- deterministic behavior for refresh, mutation response, and fallback paths

### 5.4 Accessibility and interaction contract — BINDING

- keyboard path integrity
- focus-visible behavior
- no hover-only critical meaning
- reduced-motion behavior where motion exists
- touch-size and constrained-height viability

### 5.5 Evidence contract — BINDING

- scored acceptance record
- hosted/runtime proof where host behavior is material
- documented hard-stop failure check
- closure notes linking obligation to evidence

## 6. Acceptance and closure

### 6.1 Required model — BINDING

All in-scope surfaces must use [UI Doctrine — Acceptance and Scoring Model](./UI-Doctrine-Acceptance-and-Scoring-Model.md).

### 6.2 Hard-stop precedence — BINDING

Hard-stop failures cannot be overridden by high numeric scores.

### 6.3 Enforcement tiers — DIRECTIONAL

Apply stricter closure expectations for flagship, decision-critical, and high-risk operational surfaces.
