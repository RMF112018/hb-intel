import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_HEADER_TEXT } from '../theme/tokens.js';
import { Notifications } from '../icons/index.js';
const useStyles = makeStyles({
    root: {
        position: 'relative',
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
    badge: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        minWidth: '16px',
        height: '16px',
        backgroundColor: '#FF4D4D',
        color: '#FFFFFF',
        fontSize: '0.625rem',
        fontWeight: '700',
        ...shorthands.borderRadius('8px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '4px',
        paddingRight: '4px',
    },
});
export const HbcNotificationBell = ({ unreadCount = 0, onClick, }) => {
    const styles = useStyles();
    return (_jsxs("button", { className: styles.root, onClick: onClick, "aria-label": `Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`, type: "button", children: [_jsx(Notifications, { size: "md", color: HBC_HEADER_TEXT }), unreadCount > 0 && (_jsx("span", { className: styles.badge, "aria-hidden": "true", children: unreadCount > 99 ? '99+' : unreadCount }))] }));
};
//# sourceMappingURL=HbcNotificationBell.js.map