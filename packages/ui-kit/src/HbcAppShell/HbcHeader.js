import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_DARK_HEADER, HBC_HEADER_TEXT } from '../theme/tokens.js';
import { Z_INDEX } from '../theme/z-index.js';
import { ViewGrid } from '../icons/index.js';
import { useFieldMode } from './hooks/useFieldMode.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { HbcProjectSelector } from './HbcProjectSelector.js';
import { HbcToolboxFlyout } from './HbcToolboxFlyout.js';
import { HbcFavoriteTools } from './HbcFavoriteTools.js';
import { HbcGlobalSearch } from './HbcGlobalSearch.js';
import { HbcCreateButton } from './HbcCreateButton.js';
import { HbcNotificationBell } from './HbcNotificationBell.js';
import { HbcUserMenu } from './HbcUserMenu.js';
const useStyles = makeStyles({
    root: {
        position: 'fixed',
        top: '2px',
        left: '0px',
        width: '100%',
        height: '56px',
        backgroundColor: HBC_DARK_HEADER,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '16px',
        paddingRight: '16px',
        boxSizing: 'border-box',
        zIndex: Z_INDEX.header,
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
    },
    center: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexGrow: 1,
        justifyContent: 'center',
        '@media (max-width: 1024px)': {
            display: 'none',
        },
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
    },
    logoLink: {
        display: 'flex',
        alignItems: 'center',
        textDecorationLine: 'none',
    },
    logoFallback: {
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '1rem',
        color: HBC_HEADER_TEXT,
    },
    m365Button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        ...shorthands.borderStyle('none'),
        cursor: 'pointer',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '8px',
        paddingBottom: '8px',
        ...shorthands.borderRadius('4px'),
        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
    },
});
export const HbcHeader = ({ user, logo, onSignOut, onCreateClick, onSearchOpen, onNotificationsOpen, onProjectSelect, onToolboxOpen, }) => {
    const styles = useStyles();
    const { isFieldMode, toggleFieldMode } = useFieldMode();
    const connectivityStatus = useOnlineStatus();
    const topOffset = connectivityStatus === 'online' ? '2px' : '4px';
    const shellUser = user
        ? {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl,
            initials: user.initials,
        }
        : null;
    return (_jsxs("header", { className: styles.root, role: "banner", "data-hbc-ui": "header", style: { top: topOffset }, children: [_jsxs("div", { className: styles.left, children: [_jsx("a", { href: "/", className: styles.logoLink, "aria-label": "Project Home", children: logo ?? _jsx("span", { className: styles.logoFallback, children: "HB" }) }), _jsx(HbcProjectSelector, { onProjectSelect: onProjectSelect })] }), _jsxs("div", { className: styles.center, children: [_jsx(HbcToolboxFlyout, { onToolboxOpen: onToolboxOpen }), _jsx(HbcFavoriteTools, {}), _jsx(HbcGlobalSearch, { onSearchOpen: onSearchOpen })] }), _jsxs("div", { className: styles.right, children: [_jsx(HbcCreateButton, { onClick: onCreateClick }), _jsx("button", { className: styles.m365Button, "aria-label": "Microsoft 365 apps", type: "button", children: _jsx(ViewGrid, { size: "lg", color: HBC_HEADER_TEXT }) }), _jsx(HbcNotificationBell, { onClick: onNotificationsOpen }), shellUser && (_jsx(HbcUserMenu, { user: shellUser, isFieldMode: isFieldMode, onToggleFieldMode: toggleFieldMode, onSignOut: onSignOut }))] })] }));
};
//# sourceMappingURL=HbcHeader.js.map