import { jsx as _jsx } from "react/jsx-runtime";
const SIZE_MAP = { sm: 16, md: 20, lg: 24 };
const WEIGHT_MAP = { light: 1.5, regular: 2, bold: 2.5 };
// ---------------------------------------------------------------------------
// Icon factory
// ---------------------------------------------------------------------------
function createIcon(name, pathData) {
    const Icon = ({ size = 'md', weight = 'regular', color = 'currentColor', 'aria-label': ariaLabel, className, }) => {
        const px = SIZE_MAP[size];
        const sw = WEIGHT_MAP[weight];
        return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: px, height: px, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", role: ariaLabel ? 'img' : 'presentation', "aria-label": ariaLabel, "aria-hidden": !ariaLabel, className: className, children: _jsx("g", { dangerouslySetInnerHTML: { __html: pathData } }) }));
    };
    Icon.displayName = name;
    return Icon;
}
// ===========================================================================
// CONSTRUCTION (14 icons)
// ===========================================================================
export const DrawingSheet = createIcon('DrawingSheet', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><line x1="7" y1="16" x2="10" y2="16"/>');
export const RFI = createIcon('RFI', '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>');
export const PunchItem = createIcon('PunchItem', '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>');
export const ChangeOrder = createIcon('ChangeOrder', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="12" y1="12" x2="12" y2="18"/>');
export const Submittal = createIcon('Submittal', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="8 13 12 9 16 13"/><line x1="12" y1="9" x2="12" y2="17"/>');
export const DailyLog = createIcon('DailyLog', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="4" x2="9" y2="2"/><line x1="15" y1="4" x2="15" y2="2"/><line x1="7" y1="14" x2="11" y2="14"/><line x1="7" y1="18" x2="14" y2="18"/>');
export const BudgetLine = createIcon('BudgetLine', '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>');
export const GoNoGo = createIcon('GoNoGo', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/><path d="M12 8v8"/>');
export const Turnover = createIcon('Turnover', '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>');
export const SafetyObservation = createIcon('SafetyObservation', '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
export const HardHat = createIcon('HardHat', '<path d="M2 18h20"/><path d="M4 18v-2a8 8 0 0 1 16 0v2"/><path d="M12 4v2"/><path d="M8 8h8"/>');
export const CraneEquipment = createIcon('CraneEquipment', '<line x1="6" y1="22" x2="6" y2="4"/><polyline points="6 4 18 4 18 8"/><line x1="18" y1="8" x2="18" y2="14"/><line x1="16" y1="14" x2="20" y2="14"/><rect x="4" y="20" width="4" height="2"/>');
export const BlueprintRoll = createIcon('BlueprintRoll', '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>');
export const Inspection = createIcon('Inspection', '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M8 11l2 2 4-4"/>');
// ===========================================================================
// NAVIGATION (13 icons)
// ===========================================================================
export const Home = createIcon('Home', '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>');
export const Toolbox = createIcon('Toolbox', '<rect x="2" y="10" width="20" height="10" rx="2"/><path d="M2 14h20"/><path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/>');
export const Search = createIcon('Search', '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>');
export const Notifications = createIcon('Notifications', '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>');
export const Settings = createIcon('Settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>');
export const ChevronBack = createIcon('ChevronBack', '<polyline points="15 18 9 12 15 6"/>');
export const ChevronForward = createIcon('ChevronForward', '<polyline points="9 18 15 12 9 6"/>');
export const ChevronDown = createIcon('ChevronDown', '<polyline points="6 9 12 15 18 9"/>');
export const ChevronUp = createIcon('ChevronUp', '<polyline points="18 15 12 9 6 15"/>');
export const Expand = createIcon('Expand', '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>');
export const Collapse = createIcon('Collapse', '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>');
export const Menu = createIcon('Menu', '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>');
export const CommandPalette = createIcon('CommandPalette', '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>');
// ===========================================================================
// ACTION (15 icons)
// ===========================================================================
export const Create = createIcon('Create', '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>');
export const Edit = createIcon('Edit', '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>');
export const Delete = createIcon('Delete', '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>');
export const Download = createIcon('Download', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>');
export const Upload = createIcon('Upload', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>');
export const Share = createIcon('Share', '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>');
export const Filter = createIcon('Filter', '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>');
export const Sort = createIcon('Sort', '<line x1="4" y1="6" x2="16" y2="6"/><line x1="4" y1="12" x2="12" y2="12"/><line x1="4" y1="18" x2="8" y2="18"/><polyline points="18 15 21 18 18 21"/>');
export const Save = createIcon('Save', '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>');
export const Cancel = createIcon('Cancel', '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>');
export const MoreActions = createIcon('MoreActions', '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>');
export const Star = createIcon('Star', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>');
export const StarFilled = createIcon('StarFilled', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>');
export const Microphone = createIcon('Microphone', '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>');
export const MicrophoneActive = createIcon('MicrophoneActive', '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>');
// ===========================================================================
// STATUS (5 icons)
// ===========================================================================
export const StatusCompleteIcon = createIcon('StatusCompleteIcon', '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>');
export const StatusOverdueIcon = createIcon('StatusOverdueIcon', '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>');
export const StatusAttentionIcon = createIcon('StatusAttentionIcon', '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
export const StatusInfoIcon = createIcon('StatusInfoIcon', '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>');
export const StatusDraftIcon = createIcon('StatusDraftIcon', '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>');
// ===========================================================================
// CONNECTIVITY (3 icons)
// ===========================================================================
export const CloudOffline = createIcon('CloudOffline', '<line x1="1" y1="1" x2="23" y2="23"/><path d="M18.73 18.73A7.5 7.5 0 0 1 7 15.5"/><path d="M22 15.5A7.5 7.5 0 0 0 10.27 8.27"/><path d="M4.1 4.1A5.5 5.5 0 0 0 2 9.5 5.5 5.5 0 0 0 7 15"/>');
export const CloudSyncing = createIcon('CloudSyncing', '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="12 12 12 16"/><polyline points="10 14 12 12 14 14"/>');
export const CloudSynced = createIcon('CloudSynced', '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="10 15 12 17 16 13"/>');
// ===========================================================================
// LAYOUT (9 icons)
// ===========================================================================
export const ViewList = createIcon('ViewList', '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>');
export const ViewGrid = createIcon('ViewGrid', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>');
export const ViewKanban = createIcon('ViewKanban', '<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>');
export const SidePanelOpen = createIcon('SidePanelOpen', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/><polyline points="10 8 12 10 10 12"/>');
export const SidePanelClose = createIcon('SidePanelClose', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/><polyline points="12 8 10 10 12 12"/>');
export const FullScreen = createIcon('FullScreen', '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 3 14 10"/><polyline points="3 21 10 14"/>');
export const ExitFullScreen = createIcon('ExitFullScreen', '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>');
export const FocusModeEnter = createIcon('FocusModeEnter', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>');
export const FocusModeExit = createIcon('FocusModeExit', '<circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/>');
// ===========================================================================
// AI (1 icon) — PH4.10
// ===========================================================================
export const SparkleIcon = createIcon('SparkleIcon', '<path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/><path d="M19 15l1.04 3.13L23 19l-2.96.87L19 23l-1.04-3.13L15 19l2.96-.87L19 15z"/><path d="M5 2l.78 2.34L8 5l-2.22.66L5 8l-.78-2.34L2 5l2.22-.66L5 2z"/>');
//# sourceMappingURL=index.js.map