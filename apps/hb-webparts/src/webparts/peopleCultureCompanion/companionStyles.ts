/**
 * Shared inline styles for the People & Culture HR operating companion
 * webpart. Phase-14 pc/ Prompt-03.
 *
 * Styles are exposed as `React.CSSProperties` constants so the webpart
 * stays consistent with the rest of `apps/hb-webparts/` (no CSS modules
 * or runtime CSS systems). Tokens mirror the HB Intel brand blue + warm
 * HR accent used by the PC public surface and legacy PC merged webpart.
 */

import type * as React from 'react';

export const COMPANION_COLORS = {
  inkPrimary: '#0a1b33',
  inkMuted: 'rgba(10, 27, 51, 0.7)',
  inkSubtle: 'rgba(10, 27, 51, 0.55)',
  brandBlue: '#225391',
  brandBlueSoft: 'rgba(34, 83, 145, 0.1)',
  brandBlueLine: 'rgba(34, 83, 145, 0.18)',
  accentOrange: '#c2410c',
  accentOrangeSoft: 'rgba(226, 113, 37, 0.12)',
  surface: '#ffffff',
  surfaceMuted: '#f7f8fa',
  surfaceLine: 'rgba(10, 27, 51, 0.08)',
  conflictRed: '#b42318',
  conflictRedSoft: 'rgba(180, 35, 24, 0.1)',
  successGreen: '#047857',
  successGreenSoft: 'rgba(4, 120, 87, 0.1)',
} as const;

export const COMPANION_ROOT_STYLE: React.CSSProperties = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  color: COMPANION_COLORS.inkPrimary,
  background: COMPANION_COLORS.surface,
  borderRadius: 14,
  padding: 0,
  maxWidth: 1200,
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  overflow: 'hidden',
};

export const COMPANION_HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 24px 12px',
  borderBottom: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  background: COMPANION_COLORS.surfaceMuted,
  gap: 16,
};

export const COMPANION_EYEBROW_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: COMPANION_COLORS.brandBlue,
};

export const COMPANION_HEADING_STYLE: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  color: COMPANION_COLORS.inkPrimary,
};

export const TAB_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '0 18px',
  borderBottom: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  overflowX: 'auto',
};

export const TAB_BUTTON_STYLE: React.CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: COMPANION_COLORS.inkMuted,
  fontSize: '0.875rem',
  fontWeight: 700,
  padding: '14px 16px',
  cursor: 'pointer',
  borderBottom: '3px solid transparent',
  letterSpacing: '0.01em',
};

export const TAB_BUTTON_ACTIVE_STYLE: React.CSSProperties = {
  ...TAB_BUTTON_STYLE,
  color: COMPANION_COLORS.brandBlue,
  borderBottomColor: COMPANION_COLORS.brandBlue,
};

export const PANEL_STYLE: React.CSSProperties = {
  padding: '22px 24px 26px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export const SECTION_TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 800,
  color: COMPANION_COLORS.inkPrimary,
};

export const SECTION_HINT_STYLE: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  color: COMPANION_COLORS.inkSubtle,
};

export const CARD_GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
};

export const CARD_STYLE: React.CSSProperties = {
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  borderRadius: 10,
  padding: '14px 16px',
  background: COMPANION_COLORS.surface,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

export const CARD_LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: COMPANION_COLORS.inkSubtle,
};

export const CARD_VALUE_STYLE: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: COMPANION_COLORS.inkPrimary,
  lineHeight: 1.1,
};

export const BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  borderRadius: 999,
  background: COMPANION_COLORS.brandBlueSoft,
  color: COMPANION_COLORS.brandBlue,
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

export const WARNING_BADGE_STYLE: React.CSSProperties = {
  ...BADGE_STYLE,
  background: COMPANION_COLORS.conflictRedSoft,
  color: COMPANION_COLORS.conflictRed,
};

export const SUCCESS_BADGE_STYLE: React.CSSProperties = {
  ...BADGE_STYLE,
  background: COMPANION_COLORS.successGreenSoft,
  color: COMPANION_COLORS.successGreen,
};

export const PINNED_BADGE_STYLE: React.CSSProperties = {
  ...BADGE_STYLE,
  background: COMPANION_COLORS.accentOrangeSoft,
  color: COMPANION_COLORS.accentOrange,
};

export const LIST_STYLE: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

export const LIST_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  background: COMPANION_COLORS.surface,
  cursor: 'pointer',
};

export const LIST_ROW_SELECTED_STYLE: React.CSSProperties = {
  ...LIST_ROW_STYLE,
  borderColor: COMPANION_COLORS.brandBlue,
  boxShadow: `0 0 0 2px ${COMPANION_COLORS.brandBlueSoft}`,
};

export const LIST_ROW_TEXT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
  flex: 1,
};

export const LIST_TITLE_STYLE: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 700,
  color: COMPANION_COLORS.inkPrimary,
  margin: 0,
  lineHeight: 1.25,
};

export const LIST_BODY_STYLE: React.CSSProperties = {
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  color: COMPANION_COLORS.inkMuted,
  margin: 0,
};

export const LIST_META_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexWrap: 'wrap',
};

export const TOOLBAR_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
};

export const CHIP_BUTTON_STYLE: React.CSSProperties = {
  appearance: 'none',
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  background: COMPANION_COLORS.surface,
  color: COMPANION_COLORS.inkMuted,
  fontSize: '0.75rem',
  fontWeight: 700,
  padding: '6px 10px',
  borderRadius: 999,
  cursor: 'pointer',
};

export const CHIP_BUTTON_ACTIVE_STYLE: React.CSSProperties = {
  ...CHIP_BUTTON_STYLE,
  borderColor: COMPANION_COLORS.brandBlue,
  background: COMPANION_COLORS.brandBlueSoft,
  color: COMPANION_COLORS.brandBlue,
};

export const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  background: COMPANION_COLORS.brandBlue,
  color: COMPANION_COLORS.surface,
  fontSize: '0.8125rem',
  fontWeight: 700,
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
};

export const SECONDARY_BUTTON_STYLE: React.CSSProperties = {
  appearance: 'none',
  border: `1px solid ${COMPANION_COLORS.brandBlueLine}`,
  background: COMPANION_COLORS.surface,
  color: COMPANION_COLORS.brandBlue,
  fontSize: '0.8125rem',
  fontWeight: 700,
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
};

export const DANGER_BUTTON_STYLE: React.CSSProperties = {
  appearance: 'none',
  border: `1px solid ${COMPANION_COLORS.conflictRed}`,
  background: COMPANION_COLORS.surface,
  color: COMPANION_COLORS.conflictRed,
  fontSize: '0.8125rem',
  fontWeight: 700,
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
};

export const EMPTY_STATE_STYLE: React.CSSProperties = {
  padding: '28px 24px',
  borderRadius: 12,
  border: `1px dashed ${COMPANION_COLORS.surfaceLine}`,
  background: COMPANION_COLORS.surfaceMuted,
  color: COMPANION_COLORS.inkMuted,
  fontSize: '0.9375rem',
  lineHeight: 1.5,
  textAlign: 'center',
};

export const DRAWER_OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 27, 51, 0.4)',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'stretch',
  zIndex: 1000,
};

export const DRAWER_STYLE: React.CSSProperties = {
  width: 'min(420px, 100%)',
  background: COMPANION_COLORS.surface,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-4px 0 20px rgba(10, 27, 51, 0.15)',
};

export const DRAWER_HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: `1px solid ${COMPANION_COLORS.surfaceLine}`,
};

export const DRAWER_BODY_STYLE: React.CSSProperties = {
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  overflowY: 'auto',
  flex: 1,
};

export const DRAWER_FOOTER_STYLE: React.CSSProperties = {
  padding: '12px 20px',
  borderTop: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
};

export const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 27, 51, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  zIndex: 1100,
};

export const MODAL_STYLE: React.CSSProperties = {
  width: 'min(720px, 100%)',
  maxHeight: '90vh',
  background: COMPANION_COLORS.surface,
  borderRadius: 14,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 24px 48px rgba(10, 27, 51, 0.25)',
};

export const FIELD_GROUP_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

export const FIELD_LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: COMPANION_COLORS.inkSubtle,
};

export const INPUT_STYLE: React.CSSProperties = {
  appearance: 'none',
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: '0.875rem',
  color: COMPANION_COLORS.inkPrimary,
  background: COMPANION_COLORS.surface,
  fontFamily: 'inherit',
};

export const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  minHeight: 72,
  resize: 'vertical',
};

export const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
};

export const CALENDAR_GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 6,
};

export const CALENDAR_CELL_STYLE: React.CSSProperties = {
  minHeight: 70,
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  borderRadius: 8,
  padding: '6px 8px',
  background: COMPANION_COLORS.surface,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const CALENDAR_DAY_LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  color: COMPANION_COLORS.inkSubtle,
};

export const CALENDAR_ITEM_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: COMPANION_COLORS.brandBlue,
  background: COMPANION_COLORS.brandBlueSoft,
  borderRadius: 4,
  padding: '2px 4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};
