# Phase 11F — Support and Status Rebuild: Summary

## Phase objective

Rebuild the Tool Launcher utility rail from a passive metadata display into an operational support surface that helps users understand what needs attention, where to get help, how to request access, and who owns support — with clear urgency hierarchy and resilient sparse-data handling.

## What changed

### 1. Notice treatment — tone-specific rendering

**Before:** All notices rendered identically with a text name + inline badge. Urgency was conveyed only by the section-level left border and icon color.

**After:** Each notice item receives tone-specific treatment:
- **Per-item severity icon:** Critical notices get `AlertTriangle`, warnings get `AlertCircle`, success gets `CheckCircle2`, info gets `Info` — each in the appropriate tone color.
- **Per-item accent border:** Critical and warning items receive a left accent border in their tone color with a subtle tinted background, making individual urgent items scannable within a mixed-tone list.
- **Urgency summary:** When the section contains critical or warning notices, a summary line ("2 critical, 1 warning") appears below the heading for rapid scanning.
- **Structured layout:** Each notice uses a two-column layout (icon + content) instead of flat inline text, improving readability.

### 2. Help and request-access sections — actionable affordances

**Before:** Plain text links ("Procore Help", "Viewpoint") with an external-link icon. No context about the platform or support ownership.

**After:**
- **Card-style action items:** Each action is a horizontally structured row with icon container, name, and contextual descriptor — feels like a product affordance, not a text link.
- **Support owner context:** Help actions show "Supported by {name}" when support owner data is available, giving users confidence about who maintains the resource.
- **Access request clarity:** Each access-request item shows "Request access" as a descriptor, making the action unambiguous.
- **Section descriptions:** Both sections include a brief description below the heading ("Help resources for your platforms" / "Request access to additional platforms") that provides operational context, especially useful when only 1-2 items are present.
- **Count badges:** Both sections show item counts in the heading for scan-awareness.
- **Increased item limit:** Raised from 5 to 8 items to show more of the available surface when data is rich.

### 3. Support contacts — owner-first directory

**Before:** Text list showing "Platform Name · Owner Name" with optional link. Owner was secondary to platform name.

**After:**
- **Owner-first layout:** Support owner name is primary (larger, bolder), platform name is secondary — because users look for "who can help" not "which platform has a support owner."
- **Monogram avatar:** Each contact gets a circular monogram avatar (first initial) providing visual rhythm and reducing the flat-list feel.
- **Mail indicator:** Contacts with a URL show a subtle mail icon, signaling that clicking leads to a contact channel.
- **Section description:** "Platform owners and support contacts" provides context.
- **Count badge:** Shows total contact count.

### 4. Rail-level improvements

- **Shield icon** replaces Info icon in the rail header, better communicating the operational/support nature of the surface.
- **Section icon** for Request Access changed from `Link2` to `Shield`, reinforcing the access/security intent.

### 5. Sparse-data handling

| Scenario | Treatment |
|----------|-----------|
| Only notices present | Notices section renders alone with full treatment; no empty-feeling rail |
| Only help actions present | Help section with description + count; feels complete even with 1 item |
| Only contacts present | Contact directory with avatars; single-contact doesn't feel broken |
| Mixed partial (e.g., notices + 1 contact) | Both sections render with separator; no dead space |
| All sections populated | Full operational surface with clear hierarchy and separators |
| Zero support data | Rail suppresses entirely (unchanged from prior phases) |

## Files changed

| File | Changes |
|------|---------|
| `LauncherUtilityRail.tsx` | Complete support/status surface rebuild |
| `package.json` | Version bump to 0.0.10 |

## What remained intentionally bounded

- **No new data contracts or normalization changes.** The support/status data model from Phase 11C is sufficient. This phase only changes rendering.
- **No new search integration.** The support section is a utility rail, not a discovery surface. Search is handled in 11E.
- **No governance health display.** The `governanceSummary` data (from 11C) is available but governance visualization is an admin concern, not an end-user support concern. Deferred.
- **No notification/alert system.** The notices section displays static data from the SharePoint list. Real-time notifications are out of scope.
