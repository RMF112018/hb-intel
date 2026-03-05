import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_HEADER_ICON_MUTED } from '../theme/tokens.js';
import { CommandPalette } from '../icons/index.js';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut.js';
const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        ...shorthands.borderRadius('4px'),
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '6px',
        paddingBottom: '6px',
        minWidth: '240px',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
        '@media (min-width: 1200px)': {
            minWidth: '320px',
        },
    },
    text: {
        color: HBC_HEADER_ICON_MUTED,
        fontSize: '0.875rem',
        flexGrow: 1,
    },
    badge: {
        color: HBC_HEADER_ICON_MUTED,
        fontSize: '0.75rem',
        ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.2)'),
        ...shorthands.borderRadius('4px'),
        paddingLeft: '4px',
        paddingRight: '4px',
        paddingTop: '2px',
        paddingBottom: '2px',
    },
});
export const HbcGlobalSearch = ({ onSearchOpen }) => {
    const styles = useStyles();
    const handleOpen = useCallback(() => {
        onSearchOpen?.();
    }, [onSearchOpen]);
    useKeyboardShortcut('k', handleOpen);
    return (_jsxs("button", { className: styles.root, onClick: handleOpen, "aria-label": "Search (Command+K or Control+K)", type: "button", children: [_jsx(CommandPalette, { size: "sm", color: HBC_HEADER_ICON_MUTED }), _jsx("span", { className: styles.text, children: "Search..." }), _jsx("kbd", { className: styles.badge, children: "\u2318K" })] }));
};
//# sourceMappingURL=HbcGlobalSearch.js.map