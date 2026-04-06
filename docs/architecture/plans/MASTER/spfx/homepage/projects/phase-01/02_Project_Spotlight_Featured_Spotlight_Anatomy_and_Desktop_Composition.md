# Prompt 02 — Project Spotlight Featured Spotlight Anatomy and Desktop Composition

## Objective

Implement the **featured spotlight** as the dominant desktop-first flagship surface for Project Spotlight.

This phase should prove the premium hierarchy before the supporting rail is added.

## Prerequisite

Complete Prompt 01 first.

Carry forward the approved ownership map and component anatomy.

Do **not** re-read files already in your current context or memory unless they changed, your context is stale, or the task scope expanded.

## Primary Repo Targets

Focus on the actual Project Spotlight implementation path established in Prompt 01, including relevant local/shared files under:

- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/**`
- `apps/hb-webparts/src/homepage/shared/**`
- `apps/hb-webparts/src/homepage/helpers/**`
- `apps/hb-webparts/src/homepage/models/**`
- `packages/ui-kit/**` only where generic reuse is already justified
- `apps/hb-webparts/src/webparts/hbHeroBanner/**` only for alignment benchmarking

## Required Product Outcome

Build a featured spotlight surface that feels like:

- a mini project case-study teaser
- a polished editorial homepage module
- a premium image-led card
- a natural sibling to the Signature Hero

It must **not** feel like:

- a dashboard card
- a KPI surface
- a project summary widget
- a dense metadata block

## Required Featured Spotlight Structure

The featured surface must include:

- strong dominant image
- project name
- location and sector/market
- highlight headline
- short summary
- one milestone/status expression
- one freshness expression
- clear primary CTA
- placeholder location reserved for the Project Team strip, but do **not** fully implement the interactive detail layer yet

## Required Desktop Layout Direction

Use the desktop-first flagship composition established in Prompt 01.

The featured surface should be designed assuming a future 70/30 desktop relationship with the supporting rail, but this prompt should focus on making the featured surface strong on its own.

## Specific Implementation Work

### 1. Implement the featured shell
Build the dominant media/content shell with disciplined hierarchy.

### 2. Tune image treatment
- crop from center intelligently
- preserve impact
- do not flatten the image with excessive overlays
- ensure text remains readable

### 3. Tune content hierarchy
Order content so the user reads:
1. image
2. project name
3. highlight headline
4. milestone/freshness
5. short summary
6. metadata
7. CTA

### 4. Keep chrome restrained
Avoid over-badging, extra dividers, noisy containers, or generic card framing.

### 5. Preserve team-placement seam
Reserve the right internal layout slot for the future Project Team strip.

## Required Deliverables

### A. Implementation Summary
Explain what was built and what was intentionally deferred.

### B. Reuse vs New Build Summary
State:
- what was reused from hero/homepage/shared/ui-kit
- what was built new
- why any new pieces remain local

### C. Hierarchy Rationale
Explain why the featured surface now reads as the dominant story surface.

## Validation Requirements

Before closing:

- verify the featured spotlight is clearly premium and editorial
- verify it does not read as a dashboard card
- verify the content hierarchy is stable with realistic text lengths
- verify missing non-critical data fails gracefully
- run the smallest credible lint/type/test validation for the touched scope

## Risk Exposure

Watch for:
- too much metadata
- too much overlay chrome
- weak title/headline hierarchy
- CTA clutter
- image underperformance

## Standards / Best Practices

- image first
- text concise
- hierarchy stronger than decoration
- desktop-first composition
- local ownership unless generic reuse is proven

## Final Instruction

Do not add the supporting rail in this prompt.

This prompt is complete only when the featured spotlight is strong enough to serve as the visual anchor of the final module.
