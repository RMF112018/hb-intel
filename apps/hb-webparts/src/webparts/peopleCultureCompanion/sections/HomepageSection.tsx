/**
 * Lightweight homepage governance surface for the People & Culture HR
 * operating companion. Phase-14 pc/ Prompt-03.
 *
 * Shows the current homepage composition (featured vs supporting),
 * surfaces conflicts from `detectHomepageConflicts`, and lets HR
 * override system placements (tier swap + pin toggle). This is the
 * lightweight governance surface described by the Decision-Lock
 * Appendix — not a full newsroom drag-and-drop editorial board.
 */

import * as React from 'react';
import type {
  PeopleCultureHomepageConflictReason,
  PeopleCultureHomepageTier,
  PeopleCultureItem,
  PeopleCultureRole,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import { hasPeopleCultureCapability } from '../../../homepage/helpers/peopleCultureSplitModel.js';
import {
  BADGE_STYLE,
  CARD_GRID_STYLE,
  CARD_LABEL_STYLE,
  CARD_STYLE,
  CARD_VALUE_STYLE,
  CHIP_BUTTON_ACTIVE_STYLE,
  CHIP_BUTTON_STYLE,
  EMPTY_STATE_STYLE,
  LIST_BODY_STYLE,
  LIST_META_ROW_STYLE,
  LIST_ROW_STYLE,
  LIST_ROW_TEXT_STYLE,
  LIST_STYLE,
  LIST_TITLE_STYLE,
  PANEL_STYLE,
  PINNED_BADGE_STYLE,
  SECTION_HINT_STYLE,
  SECTION_TITLE_STYLE,
  TOOLBAR_STYLE,
  WARNING_BADGE_STYLE,
} from '../companionStyles.js';

export interface HomepageSectionProps {
  items: PeopleCultureItem[];
  conflicts: Map<string, PeopleCultureHomepageConflictReason>;
  currentUserRole: PeopleCultureRole;
  onSetTier: (
    id: string,
    tier: PeopleCultureHomepageTier,
    hrOverride: boolean,
  ) => void;
  onTogglePinned: (id: string, pinned: boolean) => void;
}

const TIER_OPTIONS: ReadonlyArray<{ value: PeopleCultureHomepageTier; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'supporting', label: 'Supporting' },
  { value: 'excluded', label: 'Excluded' },
];

const CONFLICT_LABEL: Record<PeopleCultureHomepageConflictReason, string> = {
  pinnedOverflow: 'Pinned overflow',
  featuredOverflow: 'Featured overflow',
  supportingOverflow: 'Supporting overflow',
  audienceAmbiguity: 'Audience ambiguity',
  expiringWhilePinned: 'Expiring while pinned',
};

export function HomepageSection({
  items,
  conflicts,
  currentUserRole,
  onSetTier,
  onTogglePinned,
}: HomepageSectionProps): React.JSX.Element {
  const canManage = hasPeopleCultureCapability(currentUserRole, 'canManageHomepage');
  const canPin = hasPeopleCultureCapability(currentUserRole, 'canPin');

  const visibleItems = React.useMemo(
    () =>
      items.filter(
        (item) =>
          item.lifecycleState === 'live' ||
          item.lifecycleState === 'expiringSoon' ||
          item.lifecycleState === 'scheduled',
      ),
    [items],
  );

  const featured = visibleItems.filter((i) => i.homepage.tier === 'featured');
  const supporting = visibleItems.filter((i) => i.homepage.tier === 'supporting');
  const excluded = visibleItems.filter((i) => i.homepage.tier === 'excluded');

  const renderRow = (item: PeopleCultureItem): React.JSX.Element => {
    const conflictReason = conflicts.get(item.id);
    return (
      <li
        key={item.id}
        style={LIST_ROW_STYLE}
        data-hbc-companion-homepage-item={item.id}
        data-hbc-companion-homepage-tier={item.homepage.tier}
        data-hbc-companion-homepage-override={item.homepage.overrideSource}
        data-hbc-companion-homepage-conflict={conflictReason ?? ''}
      >
        <div style={LIST_ROW_TEXT_STYLE}>
          <p style={LIST_TITLE_STYLE}>{item.title}</p>
          <p style={LIST_BODY_STYLE}>{item.body}</p>
          <div style={LIST_META_ROW_STYLE}>
            <span style={BADGE_STYLE}>{item.family}</span>
            <span style={BADGE_STYLE}>{item.homepage.overrideSource}</span>
            {item.homepage.isPinned ? (
              <span style={PINNED_BADGE_STYLE}>Pinned</span>
            ) : null}
            {conflictReason ? (
              <span style={WARNING_BADGE_STYLE}>{CONFLICT_LABEL[conflictReason]}</span>
            ) : null}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minWidth: 280,
          }}
        >
          <div style={TOOLBAR_STYLE}>
            {TIER_OPTIONS.map((tier) => (
              <button
                key={tier.value}
                type="button"
                onClick={() => onSetTier(item.id, tier.value, true)}
                disabled={!canManage}
                style={
                  item.homepage.tier === tier.value
                    ? CHIP_BUTTON_ACTIVE_STYLE
                    : CHIP_BUTTON_STYLE
                }
                data-hbc-companion-action="set-tier"
                data-hbc-companion-action-target={item.id}
                data-hbc-companion-tier-value={tier.value}
              >
                {tier.label}
              </button>
            ))}
          </div>
          <div style={TOOLBAR_STYLE}>
            <button
              type="button"
              onClick={() => onTogglePinned(item.id, !item.homepage.isPinned)}
              disabled={!canPin}
              style={
                item.homepage.isPinned ? CHIP_BUTTON_ACTIVE_STYLE : CHIP_BUTTON_STYLE
              }
              data-hbc-companion-action="toggle-pin"
              data-hbc-companion-action-target={item.id}
            >
              {item.homepage.isPinned ? 'Pinned' : 'Pin to homepage'}
            </button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div
      role="tabpanel"
      aria-label="Homepage governance"
      data-hbc-companion-section="homepage"
      style={PANEL_STYLE}
    >
      <div>
        <h3 style={SECTION_TITLE_STYLE}>Homepage composition</h3>
        <p style={SECTION_HINT_STYLE}>
          Lightweight governance surface. System-default placements are
          derived from content rules; HR overrides take priority. Pinning
          or unpinning forces the hybrid approval path.
        </p>
      </div>

      <div style={CARD_GRID_STYLE}>
        <div style={CARD_STYLE} data-hbc-companion-homepage-card="featured">
          <span style={CARD_LABEL_STYLE}>Featured tier</span>
          <span style={CARD_VALUE_STYLE}>{featured.length}</span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-homepage-card="supporting">
          <span style={CARD_LABEL_STYLE}>Supporting tier</span>
          <span style={CARD_VALUE_STYLE}>{supporting.length}</span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-homepage-card="excluded">
          <span style={CARD_LABEL_STYLE}>Excluded</span>
          <span style={CARD_VALUE_STYLE}>{excluded.length}</span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-homepage-card="conflicts">
          <span style={CARD_LABEL_STYLE}>Conflicts</span>
          <span style={CARD_VALUE_STYLE}>{conflicts.size}</span>
        </div>
      </div>

      <h4 style={{ ...SECTION_TITLE_STYLE, fontSize: '0.9375rem' }}>Featured</h4>
      {featured.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No featured items. Promote a supporting item or pin a new one.
        </div>
      ) : (
        <ul style={LIST_STYLE} data-hbc-companion-homepage-list="featured">
          {featured.map(renderRow)}
        </ul>
      )}

      <h4 style={{ ...SECTION_TITLE_STYLE, fontSize: '0.9375rem' }}>Supporting</h4>
      {supporting.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No supporting items.
        </div>
      ) : (
        <ul style={LIST_STYLE} data-hbc-companion-homepage-list="supporting">
          {supporting.map(renderRow)}
        </ul>
      )}

      {excluded.length > 0 ? (
        <>
          <h4 style={{ ...SECTION_TITLE_STYLE, fontSize: '0.9375rem' }}>
            Excluded from homepage
          </h4>
          <ul style={LIST_STYLE} data-hbc-companion-homepage-list="excluded">
            {excluded.map(renderRow)}
          </ul>
        </>
      ) : null}
    </div>
  );
}
