import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_HEADER_ICON_MUTED } from '../theme/tokens.js';
import { elevationLevel2 } from '../theme/elevation.js';
import { Z_INDEX } from '../theme/z-index.js';
import { Toolbox } from '../icons/index.js';
const useStyles = makeStyles({
    root: {
        position: 'relative',
    },
    trigger: {
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
    flyout: {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '4px',
        minWidth: '320px',
        backgroundColor: '#FFFFFF',
        ...shorthands.borderRadius('8px'),
        boxShadow: elevationLevel2,
        zIndex: Z_INDEX.popover,
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '16px',
        paddingBottom: '16px',
    },
    placeholder: {
        color: '#6B7280',
        fontSize: '0.875rem',
        textAlign: 'center',
    },
});
export const HbcToolboxFlyout = ({ onToolboxOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const triggerRef = useRef(null);
    const styles = useStyles();
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKey);
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [isOpen]);
    const handleToggle = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (next)
            onToolboxOpen?.();
    };
    return (_jsxs("div", { className: styles.root, ref: ref, children: [_jsx("button", { ref: triggerRef, className: styles.trigger, onClick: handleToggle, "aria-label": "Open toolbox", "aria-expanded": isOpen, type: "button", children: _jsx(Toolbox, { size: "md", color: HBC_HEADER_ICON_MUTED }) }), isOpen && (_jsx("div", { className: styles.flyout, role: "dialog", "aria-label": "Toolbox", children: _jsx("p", { className: styles.placeholder, children: "Tool grid \u2014 filtered by role (Phase 5)" }) }))] }));
};
//# sourceMappingURL=HbcToolboxFlyout.js.map