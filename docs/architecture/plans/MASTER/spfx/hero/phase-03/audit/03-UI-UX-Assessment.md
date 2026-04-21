# 03 — UI / UX Assessment

## Desktop assessment

### Strengths
- The hero has real brand presence.
- The greeting, tagline, and logo hierarchy is understandable.
- The overall feel is materially better than a generic SharePoint banner.
- The launcher row beneath the hero is clean and orderly.
- The first lane is visible on first screen.

### Weaknesses
- The hero still depends heavily on the underlying photo doing compositional work.
- The greeting line is too fragile relative to the image brightness and detail.
- The right-side logo lighting solution is serviceable but not fully premium.
- The top band still feels like two surfaces rather than one authored flagship experience.

## Tablet assessment

### Strengths
- The shell is not forcing obviously broken multi-column shell behavior.
- The launcher remains usable and understandable.
- The portrait states do reduce information versus desktop.

### Weaknesses
- The hero crop becomes much less controlled.
- The greeting sits over busier image regions.
- The logo becomes compositionally louder relative to the available hero area.
- The launcher transition from row mode to mobile/single-entry mode is functionally correct but visually abrupt.

## Handheld assessment

### Strengths
- The single “HB Toolbox” / single overflow entry posture is the right direction.
- The homepage remains scannable.
- The first shell lane begins quickly enough.

### Weaknesses
- The greeting line is too small and too low-contrast in several provided handheld crops.
- The text block is not anchored to a truly protected focal zone.
- The logo occupies too much visual authority for the available surface height.
- The hero still feels like an image crop with overlay text, not a handheld-native composition.

## Specific problem areas

### 1. Contrast and readability
The current hero cannot be confidently signed off for reliable real-world contrast across the approved image/crop set.

Most vulnerable elements:
- greeting line
- greeting name in some crops
- logo over brighter right-side image regions
- tagline when the crop brings brighter construction lighting too close behind it

### 2. Focal-area governance
`background-position: center center` is not enough governance for a flagship hero system. It is a generic crop posture.

A world-class hero needs:
- approved focal zones per image
- protected text-safe regions
- protected logo-safe regions
- crop-aware fallback behavior for smaller modes

### 3. Logo treatment
The logo is not universally “wrong,” but it is not consistently optimal:
- acceptable on large desktop
- increasingly dominant on smaller states
- not sufficiently tuned as a distinct responsive composition object

### 4. Doctrine drift in fallback treatment
The stricter homepage overlay rejects a blue/orange gradient-wash fallback posture. The current no-image fallback still uses visible presentation-color pools over charcoal, which is too close to the prohibited treatment.

### 5. Top-band productization
The top band is better than a generic banner-plus-links stack, but it still does not read as a fully unified flagship object.
