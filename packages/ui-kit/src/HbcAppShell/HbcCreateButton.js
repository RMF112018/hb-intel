import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_ACCENT_ORANGE } from '../theme/tokens.js';
import { label } from '../theme/typography.js';
import { CloudOffline, Create } from '../icons/index.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: HBC_ACCENT_ORANGE,
        color: '#FFFFFF',
        ...label,
        ...shorthands.borderStyle('none'),
        ...shorthands.borderRadius('4px'),
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        paddingBottom: '8px',
        cursor: 'pointer',
        transitionProperty: 'background-color',
        transitionDuration: '150ms',
        ':hover': {
            backgroundColor: '#E0641A',
        },
        ':active': {
            backgroundColor: '#CC5A17',
        },
    },
});
export const HbcCreateButton = ({ onClick }) => {
    const styles = useStyles();
    const status = useOnlineStatus();
    const isOffline = status === 'offline';
    const tooltip = isOffline
        ? 'This action requires a network connection and will sync when you reconnect.'
        : undefined;
    const handleClick = () => {
        if (isOffline)
            return;
        onClick?.();
    };
    return (_jsxs("button", { className: styles.root, onClick: handleClick, "aria-label": isOffline ? 'Create new item (offline unavailable)' : 'Create new item', type: "button", title: tooltip, children: [isOffline ? _jsx(CloudOffline, { size: "sm", color: "#FFFFFF" }) : _jsx(Create, { size: "sm", color: "#FFFFFF" }), _jsx("span", { children: "Create" })] }));
};
//# sourceMappingURL=HbcCreateButton.js.map