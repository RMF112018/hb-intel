# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 6
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 6. Component Library

All components are built on **Fluent UI v9 + Griffel**, exported from `@hbc/ui-kit`, styled exclusively with HBC design tokens.

### Component File Structure

```
packages/ui-kit/src/HbcComponentName/
├── index.tsx                         # Main component. Controlled props. data-hbc-ui attribute.
├── styles.ts                         # Griffel makeStyles. Only var(--hbc-*) tokens.
├── types.ts                          # TypeScript props interfaces. Full JSDoc.
└── HbcComponentName.stories.tsx      # Default, AllVariants, FieldMode, A11yTest stories.
```

> **[V2.1]** All components now require a `FieldMode` Storybook story in addition to Default, AllVariants, and A11yTest.

### Priority Build Order

1. **`HbcStatusBadge`** — Validates token system + dual-channel encoding **[V2.1]**
2. **`HbcConnectivityBar`** — Validates service worker state integration **[V2.1]**
3. **`HbcTypography`** — Validates intent-based type scale
4. **`HbcEmptyState`** — Validates layout + icon + button composition
5. **`HbcErrorBoundary`** — Wraps all major page sections
6. **`HbcButton`** — All variants required before any interactive component
7. **`HbcInput`** — Full input suite including voice dictation **[V2.1]**
8. **`HbcForm` / `HbcFormSection`** — Required before `CreateUpdateLayout`
9. **`HbcPanel`** — Required before detail views
10. **`HbcCommandBar`** — Required before `ToolLandingLayout`
11. **`HbcCommandPalette`** — Required before any tool is shipped **[V2.1]**
12. **`HbcDataTable`** — Complex. See Section 7.
13. **`HbcChart`** — Lazy-loaded. Build last.

### Component Authoring Rules

1. Every component renders `data-hbc-ui="component-name"` for automated test targeting.
2. All interactive components must be fully keyboard-navigable.
3. Never hardcode hex values — always reference `var(--hbc-token-name)`.
4. All components must render correctly in both `hbcLightTheme` and `hbcFieldTheme`.
5. Every component must have Default, AllVariants, FieldMode, and A11yTest Storybook stories. **[V2.1]**
6. All exported types must have JSDoc on every prop.

### Component Specifications

#### `HbcStatusBadge` **[V2.1 — Dual-Channel Encoding]**

Variants: `success` | `danger` | `warning` | `info` | `neutral`
Sizes: `sm` (12px label) | `md` (14px label)

Every variant renders **both** a color fill AND a paired icon shape. Color is never the sole indicator of status.

| Variant | Color (bg) | Text Color | Icon | Aria Label Pattern |
|---|---|---|---|---|
| `success` | `--hbc-green-90` | `--hbc-green-30` | `StatusCompleteIcon` (filled circle + checkmark) | `"Status: [label]"` |
| `danger` | `--hbc-red-90` | `--hbc-red-30` | `StatusOverdueIcon` (triangle + exclamation) | `"Status: [label]"` |
| `warning` | `--hbc-amber-90` | `--hbc-amber-30` | `StatusAttentionIcon` (circle + clock) | `"Status: [label]"` |
| `info` | `--hbc-info-90` | `--hbc-info-30` | `StatusInfoIcon` (circle + i) | `"Status: [label]"` |
| `neutral` | `--hbc-gray-90` | `--hbc-gray-30` | `StatusDraftIcon` (dashed circle) | `"Status: [label]"` |

Badge anatomy: `[Icon sm] [Label text]` — icon always left of label, always visible. In the `sm` size, the icon is 10px; in the `md` size, 12px.

#### `HbcConnectivityBar` **[V2.1]**

A stateless presentational component that reads connectivity state from a React context (`HbcConnectivityContext`) provided at the app root.

Props: `state` (`"online"` | `"syncing"` | `"offline"`). Height expands from 2px to 4px when `state` is `"syncing"` or `"offline"`. Pulse animation: `opacity 0.6 → 1.0 → 0.6` at 1.5s cycle when offline.

#### `HbcCommandPalette` **[V2.1]**

**Component:** `packages/ui-kit/src/HbcCommandPalette/index.tsx`

Activated via `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux) from anywhere in the application, or by clicking the `⌘K` badge in the header search bar.

**Anatomy:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Overlay backdrop — rgba(0,0,0,0.6) — full viewport             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  [ 🔍 What do you need? (AI-powered)      ] [ esc ]      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  RECENT  |  TOOLS  |  ITEMS  |  ACTIONS                  │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  > RFI Log                    Navigate                    │  │
│  │  > Create Punch Item          Action                      │  │
│  │  > Overdue RFIs               Filtered View               │  │
│  │  > Budget Variance            AI Query                 ✦  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction modes:**

| Input | Behavior | Requires Network |
|---|---|---|
| `"rfi"` or `"punch list"` | Navigate to tool | No — cached intent map |
| `"create rfi"` | Open `CreateUpdateLayout` for RFI | No — local navigation |
| `"overdue rfis"` | Navigate to RFI log with overdue filter pre-applied | No — cached intent map |
| `"what's the budget variance on phase 2"` | Anthropic API query — returns inline data answer | Yes |
| `"show me rfis assigned to me"` | Anthropic API query + navigation | Yes |

**Offline behavior:** When offline, the AI query mode is disabled. The input still accepts keyword navigation commands against a locally cached intent map (JSON file, cached by service worker). A subtle `CloudOffline` indicator appears in the input right region when in offline mode. A tooltip on hover: `"AI queries require a connection. Navigation commands work offline."`.

**Anthropic API integration:**
- Model: `claude-sonnet-4-20250514`
- System prompt (injected at runtime): current user role, active project context, available tools list
- Each query sends: user's natural language input + project context
- Response is parsed for intent: navigate, filter, create, or answer
- Answers render inline in the palette result list — not in a separate panel
- AI results are marked with a ✦ sparkle icon to distinguish from deterministic results

**Result actions:**
- Arrow keys navigate results. Enter executes. Escape closes.
- Tab cycles between result categories.
- Each result shows: icon + label + action type tag (Navigate / Action / AI Query)

**Props:** `isOpen`, `onClose`, `projectContext`, `userRole`.

#### `HbcButton`

| Variant | Style | Usage |
|---|---|---|
| `primary` | `#F37021` filled, white text | Single highest-priority action per page |
| `secondary` | `#004B87` outlined, blue text | Supporting actions |
| `ghost` | Transparent, `#004B87` text | Cancel, tertiary actions |
| `danger` | `#FF4D4D` outlined or filled | Destructive actions |

> **Rule:** Never place more than one `primary` variant button on a single page view.

Sizes: `sm` (32px height) | `md` (40px height) | `lg` (48px height)

In Touch density tier, all buttons scale up one size automatically: `sm` → `md`, `md` → `lg`. **[V2.1]**

#### `HbcInput` Suite **[V2.1 — Voice Dictation]**

All inputs share: `label`, `required`, `error`, `helperText`, `disabled` props.

`HbcTextArea` and `HbcRichTextEditor` additionally accept a `voiceDictation` prop (default: `true`). When enabled, a microphone icon button (`MicrophoneIcon`, `sm` size) renders in the field's top-right corner. Tapping/clicking it:

1. Requests microphone permission via the browser (one-time, standard browser permission prompt).
2. Activates the Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`).
3. The microphone icon transitions to `MicrophoneActiveIcon` with a subtle pulse animation.
4. Transcribed text is appended to the field's current value in real time.
5. Tapping again or pressing `Escape` stops dictation.
6. If the Speech API is unavailable (non-supporting browser or no microphone), the microphone icon is hidden entirely — graceful degradation, no error shown.

| Component | Construction Use Case | Voice |
|---|---|---|
| `HbcTextInput` | Item titles, subjects, short text | No |
| `HbcTextArea` | Long descriptions, notes, meeting minutes | **Yes** |
| `HbcRichTextEditor` | RFI questions/responses, formal correspondence | **Yes** |
| `HbcCurrencyInput` | Budget amounts, cost impacts | No |
| `HbcNumberInput` | Quantities, percentages | No |
| `HbcDateSelect` | Due dates, scheduled dates | No |
| `HbcSingleSelect` | Status, type, priority | No |
| `HbcMultiSelect` | Distribution lists, assignees | No |
| `HbcTieredSelect` | Cost code hierarchies | No |
| `HbcPillSelect` | Compact multi-value | No |
| `HbcContactPicker` | User/company assignment | No |
| `HbcCheckbox` | Boolean fields, checklist items | No |
| `HbcRadioGroup` | Mutually exclusive options | No |
| `HbcSwitch` | Feature toggles | No |
| `HbcSlider` | Confidence levels, completion percentages | No |

#### `HbcPanel`

Right-side slide-in surface. Animation: `transform: translateX` from `100%` to `0`, duration `250ms cubic-bezier(0.4, 0, 0.2, 1)`. **[V2.1 updated timing]**

Widths: `sm` (360px) | `md` (480px) | `lg` (640px)

On mobile (`< 768px`), all panels render as bottom sheets (slide up from bottom, full width) regardless of the `width` prop.

#### `HbcCommandBar`

Toolbar component for all `ToolLandingLayout` screens:
- `HbcSearch` (local, left-aligned)
- Active filter chips (dismissable pills)
- Saved view selector dropdown (three-tier: personal / project / org)
- View mode toggle (List / Grid)
- Density override control (Compact / Standard / Touch) — shows auto-detected tier, allows override **[V2.1]**
- Secondary action buttons (Export, Reports)
- Column configurator trigger (gear icon)