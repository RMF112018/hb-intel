# Plan Summary — Wave 01

## Objective
Correct the handheld/mobile execution first.

## Why this wave exists
The most obvious current failure is the over-tall phone launcher posture. There is also a precise runtime/CSS mismatch in the band wrapper that is likely contributing to that result.

## Scope
- launcher band runtime/CSS contract
- handheld trigger geometry
- entry-stack spacing around the launcher
- hosted breakpoint proof for phone and short-height states

## Non-goals
- full overflow redesign
- desktop/tablet hierarchy rebuild
- broad IA changes beyond what is necessary to correct the current handheld defect
