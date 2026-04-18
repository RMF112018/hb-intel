# 00 — Audit Delta from the Attached Wave 01 Package

## Purpose

This file explains exactly why the attached Wave 01 package was replaced instead of lightly edited.

## What the attached package got right

- It correctly identified the three highest-value flagship gaps:
  1. entry-stack budget
  2. action-layer governance
  3. empty-state-first early-lane composition
- It correctly kept Wave 01 focused on production-facing correction rather than broad future-state work.
- It correctly recognized the need for repeatable viewport-based acceptance proof.

## What it got partially right

### 1. Priority Actions framing
The attached package correctly treated Priority Actions as the right action-layer product, but it under-modeled current repo truth.

What changed:
- the public rail already exists
- the data readers already exist
- the admin surface already exists

Therefore the open work is narrower:
- page-level cutover
- runtime alignment
- closure proof
- documentation drift cleanup

### 2. Rail / shell alignment
The attached package correctly identified a runtime mismatch, but it implied that shell alignment had not started.

What changed:
- a governance seam already maps rail device classes to shell entry-state vocabulary

Therefore the remaining problem is not “invent alignment,” but “finish and operationalize alignment.”

### 3. Acceptance harness
The attached package correctly asked for acceptance proof, but it did not account for existing shell policy / conformance tests already present on `main`.

Therefore the new package narrows acceptance work to:
- integrated entry-stack proof
- viewport/state evidence
- closure output that certifies the real flagship page experience

## What the attached package missed or under-explained

### 1. It did not split the first-lane work correctly
The package treated shell-safe content-state signaling and promotion logic as one thing.

That is too coarse.

The new package splits them into:
- a **content-state contract**
- a **promotion / demotion resolver**

### 2. It did not call out repo/document drift
The repo includes docs that still describe Priority Actions public list-read adapters as pending even though those seams are now present in code.

That drift matters because it can mislead the code agent about what still needs to be built.

### 3. It did not sharply separate page-level proof from product-level existence
The rail existing in the repo is not the same thing as the flagship page being correctly cut over and verified.

The replacement package forces that distinction.

### 4. It did not explicitly bound untouched future-state work
The attached audit materials contain useful future-state thinking around control-panel evolution and broader shell composition. Those ideas remain valid, but most of them are not required for Wave 01 closure.

## Prompt restructuring decisions

### Original Prompt 01
**Kept, but sharpened.**  
Still required, but now explicitly anchored to measurable vertical budget and hero-governance proof.

### Original Prompt 02
**Kept, but narrowed and made more concrete.**  
Focus is live flagship page cutover + migration proof + authoring/provisioning closure, not greenfield Priority Actions creation.

### Original Prompt 03
**Split into Prompt 04 + Prompt 05.**  
One prompt for the shell-visible content-state contract, one for the resolver.

### Original Prompt 04
**Kept, but materially reframed.**  
No longer about inventing shell vocabulary alignment from scratch. Now about finishing runtime/container-aware alignment.

### Original Prompt 05
**Kept, but narrowed.**  
No longer “create acceptance from nothing.” Now it extends the existing proof surface into a certifiable flagship acceptance package.

## Replacement-package design standard

Each prompt in this replacement package defines:

- the exact problem still open on `main`
- what done actually looks like
- the exact seams to inspect
- the boundaries to preserve
- proof of closure

That is the central difference between this package and the attached one.
