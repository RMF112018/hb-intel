# Prompt 03 — Validate SharePoint CSS Load Path

## Objective

Prove in SharePoint-hosted runtime that the rebuilt Signature Hero styles are actually loading and applying.

This prompt is about browser/runtime proof, not source confidence.

## Required Tasks

### 1. Browser network proof
Capture proof of:
- stylesheet request URL
- request success/failure status
- whether the expected `hb-webparts` CSS asset is loaded

### 2. DOM/class proof
Using DevTools/runtime inspection, prove:
- the hero root has the expected generated CSS-module classes
- the class names correspond to emitted CSS rules
- the applied/computed styles match the rebuilt hero intent

### 3. Visual proof
Confirm the runtime result now visibly shows:
- dark premium surface
- reduced logo scale
- stronger tagline hierarchy
- subordinate greeting
- asymmetric composition instead of vanilla block flow

### 4. Override/conflict proof
Check whether any SharePoint host CSS or global site CSS is overriding the hero styles.

If so:
- identify the exact override
- fix only as much specificity/scoping as necessary
- do not escalate into heavy-handed `!important` abuse unless absolutely required and documented

## Hard Gates

- Do not mark success from local harness only.
- Do not mark success from package inspection only.
- Do not stop at “the class is present” if computed styles are still wrong.
- Do not use brute-force CSS overrides as the default answer.

## Deliverables

Produce a concise runtime validation note containing:
- CSS asset request evidence
- DOM/class evidence
- computed-style evidence
- visual outcome summary
- any remaining host-style conflicts

## Completion Standard

You are done only when SharePoint runtime proves the rebuilt hero styling is active and visible.
