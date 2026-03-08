# FEAT-PX-Dashboard-Decisions.md

**Feature Title:** PX Dashboard – Project Executive Entry Point  
**Document ID:** FEAT-PX-Dashboard-Decisions  
**Version:** 1.0 (MVP decisions locked after structured interview – March 2026)  
**Status:** MVP Decisions Finalized – Future extensions documented  
**Governed by:**  
- HB-Intel Blueprint V4 §2i (roles & cross-domain aggregation)  
- hb-intel-foundation-plan.md (monorepo, shared packages, PWA + SPFx parity)  
- PH7-BW-* series (infrastructure & breakout pattern)  
- PH9b-UX-Enhancement-Plan.md (My Work Feed, progressive coaching, lightweight instrumentation)  
- Procore UX Study & Con-Tech UX Study (cognitive load reduction, progressive disclosure, field-first resilience)

**Interview Outcome Summary**  
After structured interview with product owner, the following UX and feature decisions were locked for MVP implementation. All choices prioritize:  
- cognitive load reduction for senior executives  
- role-aware progressive disclosure  
- maximum reusability / shared component strategy  
- identical core experience across PWA workspace and SPFx breakout webpart  
- graceful offline behaviour  
- configurability via admin workspace where appropriate  
- fixed layout for MVP with explicit future extension path documented

## 1. Overall Layout & Entry Experience

**1.1 Primary Layout**  
Balanced Executive Overview  
- Top: 4–5 Insight Cards (Portfolio Health Overview, Projects Requiring My Attention, Key Performance Snapshot, Top Risk Areas, dynamic Spotlight card)  
- Middle: compact “{Role} Priorities” section (dynamic title based on signed-in user’s role)  
- Bottom: searchable, filterable project grid with balanced smart project cards

**1.2 PWA vs SPFx Breakout Webpart**  
Identical Core Experience with Smart Adaptation  
- Core content, layout, cards, interactions, colours, and behaviour are 100% identical  
- Only outer chrome adapts: PWA uses PWA shell/navigation; SPFx uses SharePoint page context/header  
- Goal: zero re-learning when switching environments

**1.3 Responsive Behaviour (Desktop vs Tablet)**  
Single Responsive Experience with Smart Tablet Optimisation  
- One design, automatically adapts  
- Tablet: larger touch targets, stacked cards, one-handed reachability for priority & search areas  
- Desktop: wider grid layout utilizing extra horizontal space  
- No device-specific code paths; all components responsive by default

## 2. Summary & Insight Cards (Top Row)

**2.1 Portfolio Health Score**  
Smart Balanced Score  
- Single clean overall score (0–100) displayed as large coloured number/bar  
- Colour bands: Green (90+), Yellow (70–89), Red (<70)  
- Calculation: weighted composite (configurable in admin workspace)  
- Subtle hover/tap breakdown (“Why this score”) showing contributing factors  
- Future: admin-configurable metrics and weighting rules

**2.2 Trend Indicators**  
Subtle Smart Trend Arrows  
- Small ↑ (green) or ↓ (red) arrow beside each health score  
- Hover/tap reveals tooltip with delta (“+8% this month”)  
- Role-aware: highlights trends most relevant to executive oversight

**2.3 Dynamic Spotlight Card**  
Smart Default with Admin Tuning  
- Highlights single most urgent executive-level item/decision  
- Default logic: highest-risk + pending approvals + health score urgency  
- Admin workspace can tune weighting or add custom rules  
- Includes clear “Why this is highlighted” explanation  
- One-tap action link when applicable

**2.4 Freshness / Sync Status**  
Subtle Global Freshness Indicator  
- Single small text at top: “Last synced 12 minutes ago”  
- Offline: “Showing cached data – will sync when online”  
- Includes one-click “Refresh now” button  
- Applies to entire dashboard (health scores, grid, priorities)

## 3. Project Grid & Navigation

**3.1 Default View / Sorting**  
Smart Role-Aware Default (with easy override)  
- Initial sort: highest-risk / “Needs My Attention” projects at top  
- Light grouping: “At Risk” section first, then healthy projects  
- Executive can change sort/filter with one click; preference remembered per user  
- Reset returns to smart role-aware default

**3.2 Project Cards**  
Balanced Smart Cards  
- Project name + number  
- Health score bar  
- 2–3 most important current highlights (“Schedule 12 days behind”, “3 items need approval”)  
- 1–2 context-sensitive quick-action buttons (prominent only when executive input required)  
- One-tap navigation to full Project Hub

**3.3 Navigation to Project Hub**  
Balanced Smart Transition  
- Smooth full-screen transition to Project Hub  
- Preserves dashboard filter, scroll position, highlights  
- Prominent “Back to PX Dashboard” button that restores exact previous state

**3.4 Search & Filtering**  
Balanced Smart Search & Saved Filters (MVP: fixed defaults)  
- Clean search box + small set of quick-filter buttons (“At Risk”, “Needs My Approval”, “Florida Projects”)  
- Ability to save filter combinations as quick buttons (MVP: fixed set)  
- Future extension path: user-saved filters documented

## 4. Role-Aware Priorities & Guidance

**4.1 Priorities Section**  
Subtle Executive Actions Integration  
- Compact section titled “{Role} Priorities” (dynamic based on signed-in user role)  
- Shows 4–7 intelligently curated executive-level items  
- Each item: one-line description + clear one-tap action + “Why this matters” note  
- “Show me all items” button expands to full list  
- Expansion: smart context-preserving inline/slide-out panel (keeps dashboard visible)

**4.2 Coaching / Guidance**  
Subtle, Context-Aware Coaching  
- Short, non-intrusive suggestions appear only when relevant  
- Location: next to relevant card, inside Spotlight, or small banner  
- Easy to dismiss forever; auto-disappear on action completion  
- Clearly labelled as suggestions

**4.3 Urgent Alerts / Notifications**  
Subtle Integrated Alerts  
- Small coloured badge/dot/highlight on affected project card or Spotlight  
- Subtle banner only for truly critical items  
- Never blocks screen; one-click dismiss  
- Avoids pop-ups / toasts to prevent notification fatigue

## 5. Offline & Resilience

**Offline Behaviour**  
Graceful Cached View with Transparency  
- Full dashboard usable with last cached data  
- Clear “Last synced X minutes ago” indicator  
- Actions queued with “Saved for later – will sync when online” confirmation  
- No disruption to reading or reviewing cached state

## 6. Personalisation (MVP vs Future)

**MVP**  
Fixed Layout – no user personalisation  
- Cards, order, filters, layout locked for consistency

**Future Extension Path (documented)**  
Balanced Smart Personalisation  
- Choose which insight cards appear  
- Save favourite filter combinations as quick buttons  
- Reorder project grid columns  
- All choices saved per user; core design remains shared/reusable

## 7. Reusability & Shared Component Strategy

All major visual and behavioural elements are intentionally designed to be extracted as shared/reusable components:

- Insight / Health Score cards (with configurable calculation)  
- Dynamic Spotlight logic  
- “{Role} Priorities” section (title + curation)  
- Smart project cards  
- Subtle trend arrows  
- Global freshness indicator  
- Context-aware coaching & alert system  
- Responsive layout primitives  
- Graceful offline wrapper  
- Smart navigation transition  

These will live in `@hbc/ui-kit` and/or `@hbc/features-shared-leadership` packages so Director, PMO, or other role dashboards can compose them with minimal new code.

**End of MVP Decisions**  
All choices locked for initial implementation.  
Future phases (personalisation, deeper admin tuning, expanded saved views) documented above and ready for sequenced rollout.

*Last updated: March 2026 – post-interview lock*  
*Prepared for: Hedrick Brothers Construction – HB Intel Platform Team*