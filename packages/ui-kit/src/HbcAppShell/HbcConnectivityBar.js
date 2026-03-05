import { jsx as _jsx } from "react/jsx-runtime";
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_CONNECTIVITY } from '../theme/tokens.js';
import { Z_INDEX } from '../theme/z-index.js';
import { keyframes } from '../theme/animations.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
const useStyles = makeStyles({
    root: {
        position: 'fixed',
        top: '0px',
        left: '0px',
        width: '100%',
        zIndex: Z_INDEX.connectivityBar,
        transitionProperty: 'height, background-color',
        transitionDuration: '250ms',
        transitionTimingFunction: 'ease-in-out',
    },
    online: {
        height: '2px',
        backgroundColor: HBC_CONNECTIVITY.online,
    },
    syncing: {
        height: '4px',
        backgroundColor: HBC_CONNECTIVITY.syncing,
        animationName: keyframes.pulse,
        animationDuration: '2s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
    },
    offline: {
        height: '4px',
        backgroundColor: HBC_CONNECTIVITY.offline,
        animationName: keyframes.pulse,
        animationDuration: '1.5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
    },
});
const ariaLabels = {
    online: 'Connected',
    syncing: 'Syncing data',
    offline: 'No connection',
};
export const HbcConnectivityBar = ({ status: statusOverride }) => {
    const detectedStatus = useOnlineStatus();
    const status = statusOverride ?? detectedStatus;
    const styles = useStyles();
    const connectivityHeight = status === 'online' ? '2px' : '4px';
    return (_jsx("div", { className: mergeClasses(styles.root, styles[status]), role: "status", "aria-live": "polite", "aria-label": ariaLabels[status], "data-hbc-ui": "connectivity-bar", "data-hbc-status": status, style: { '--hbc-connectivity-height': connectivityHeight } }));
};
//# sourceMappingURL=HbcConnectivityBar.js.map