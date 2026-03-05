/**
 * 16-shade brand ramp generated via HSL lightness interpolation from #004B87.
 * Shade 80 = the primary brand color.
 */
export const hbcBrandRamp = {
    10: '#001A2F',
    20: '#002540',
    30: '#003052',
    40: '#003B63',
    50: '#004575',
    60: '#004B87',
    70: '#1A6399',
    80: '#337AAB',
    90: '#4D92BD',
    100: '#66A9CF',
    110: '#80C0E0',
    120: '#99D1EA',
    130: '#B3E0F2',
    140: '#CCEDFA',
    150: '#E6F6FD',
    160: '#F5FBFF',
};
/** HB Intel primary blue — logo background color */
export const HBC_PRIMARY_BLUE = '#004B87';
/** HB Intel accent orange — CTA and active state color */
export const HBC_ACCENT_ORANGE = '#F37021';
// ---------------------------------------------------------------------------
// Header tokens (V2.1)
// ---------------------------------------------------------------------------
/** Dark header background */
export const HBC_DARK_HEADER = '#1E1E1E';
/** Header text color */
export const HBC_HEADER_TEXT = '#FFFFFF';
/** Header muted icon color */
export const HBC_HEADER_ICON_MUTED = '#A0A0A0';
// ---------------------------------------------------------------------------
// V2.1 Sunlight-optimized status colors
// ---------------------------------------------------------------------------
/** Semantic status colors for badges, indicators, and alerts (V2.1) */
export const HBC_STATUS_COLORS = {
    success: '#00C896',
    warning: '#FFB020',
    error: '#FF4D4D',
    info: '#3B9FFF',
    neutral: '#8B95A5',
    onTrack: '#00C896',
    atRisk: '#FFB020',
    critical: '#FF4D4D',
    pending: '#8B95A5',
    inProgress: '#3B9FFF',
    completed: '#00C896',
    draft: '#8B95A5',
};
// ---------------------------------------------------------------------------
// HSL status ramps (lightness levels: 10 / 30 / 50 / 70 / 90)
// ---------------------------------------------------------------------------
export const HBC_STATUS_RAMP_GREEN = {
    10: '#003D2E',
    30: '#007A5C',
    50: '#00C896',
    70: '#66DDB8',
    90: '#CCF3E6',
};
export const HBC_STATUS_RAMP_RED = {
    10: '#4D0000',
    30: '#B30000',
    50: '#FF4D4D',
    70: '#FF9999',
    90: '#FFE0E0',
};
export const HBC_STATUS_RAMP_AMBER = {
    10: '#4D3300',
    30: '#996600',
    50: '#FFB020',
    70: '#FFD07A',
    90: '#FFF0D4',
};
export const HBC_STATUS_RAMP_INFO = {
    10: '#001A4D',
    30: '#0050B3',
    50: '#3B9FFF',
    70: '#8CC5FF',
    90: '#DCE9FF',
};
export const HBC_STATUS_RAMP_GRAY = {
    10: '#1A1D23',
    30: '#4A5060',
    50: '#8B95A5',
    70: '#B8BFC9',
    90: '#E8EAED',
};
// ---------------------------------------------------------------------------
// Surface tokens — Light mode
// ---------------------------------------------------------------------------
export const HBC_SURFACE_LIGHT = {
    'surface-0': '#FFFFFF',
    'surface-1': '#FAFBFC',
    'surface-2': '#F0F2F5',
    'surface-3': '#E4E7EB',
    'border-default': '#D1D5DB',
    'border-focus': '#004B87',
    'text-primary': '#1A1D23',
    'text-muted': '#6B7280',
    'responsibility-bg': '#F0F7FF',
};
// ---------------------------------------------------------------------------
// Surface tokens — Field Mode (dark)
// ---------------------------------------------------------------------------
export const HBC_SURFACE_FIELD = {
    'surface-0': '#0F1419',
    'surface-1': '#1A2332',
    'surface-2': '#243040',
    'surface-3': '#2E3D50',
    'border-default': '#3A4A5C',
    'border-focus': '#337AAB',
    'text-primary': '#E8EAED',
    'text-muted': '#8B95A5',
    'responsibility-bg': '#1A2A3D',
};
// ---------------------------------------------------------------------------
// Connectivity bar colors
// ---------------------------------------------------------------------------
export const HBC_CONNECTIVITY = {
    online: '#00C896',
    syncing: '#FFB020',
    offline: '#FF4D4D',
};
//# sourceMappingURL=tokens.js.map