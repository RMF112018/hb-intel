# 07-Prioritized-Enhancement-and-Redesign-Plan

## Implement now

### 1. Rebuild compact and handheld composition
**Gap closed:** desktop composition compressed onto phone  
**Direction:** create a truly distinct compact layout for featured recognition. On phone, treat the featured story as a stacked editorial capsule, not a shrunken desktop card.  
**Impact:** highest UX gain; directly addresses the hard-stop failure.  
**Type:** redesign

### 2. Remove hard-coded badge/header collision pattern
**Gap closed:** hard-coded featured header geometry  
**Direction:** replace absolute badge + fixed right-padding dependency with a breakpoint-aware slot strategy.  
**Impact:** stabilizes recipient/title hierarchy across widths.  
**Type:** redesign

### 3. Rebalance the first view around recognition system value, not just the featured story
**Gap closed:** top-heavy information strategy  
**Direction:** strengthen the second tier with either a compact recent strip, status summary, or “activity this week” layer that preserves current-tense value even when content is light.  
**Impact:** improves homepage usefulness and cadence.  
**Type:** redesign

## Implement next

### 4. Add explicit recent-empty and light-data states
**Gap closed:** weak recent-empty narrative  
**Direction:** preserve a small, honest recent-activity state instead of dropping immediately into archive emphasis.  
**Impact:** better homepage storytelling under thin data conditions.  
**Type:** refinement

### 5. Add responsive proof guards
**Gap closed:** limited responsive proof  
**Direction:** add breakpoint assertions and screenshot-based closure checks for desktop, laptop, tablet portrait, and phone portrait.  
**Impact:** reduces regression risk.  
**Type:** refinement

### 6. Tighten mobile footer actions and spacing
**Gap closed:** celebrate / metadata posture on phone  
**Direction:** reduce visual competition between submitter metadata and celebrate action, while maintaining target size compliance.  
**Impact:** cleaner tap/read experience.  
**Type:** refinement

## Later / conditional

### 7. Revisit homepage row strategy if hbKudos remains a primary right-lane anchor
**Gap closed:** right-lane rhythm under stack conditions  
**Direction:** if the broader homepage keeps this arrangement, align neighboring surfaces and empty-state posture so hbKudos is not carrying all perceived product quality alone.  
**Impact:** better cross-surface consistency.  
**Type:** refinement that may require shell coordination
