import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { useProjectStore } from '@hbc/shell';
import { heading4 } from '../theme/typography.js';
import { HBC_HEADER_TEXT, HBC_HEADER_ICON_MUTED, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationLevel2 } from '../theme/elevation.js';
import { Z_INDEX } from '../theme/z-index.js';
import { ChevronDown } from '../icons/index.js';
const useStyles = makeStyles({
    root: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        ...heading4,
        color: HBC_HEADER_TEXT,
        backgroundColor: 'transparent',
        ...shorthands.borderStyle('none'),
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '4px',
        paddingBottom: '4px',
        ...shorthands.borderRadius('4px'),
        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
    },
    chevron: {
        marginLeft: '4px',
        transitionProperty: 'transform',
        transitionDuration: '150ms',
    },
    chevronOpen: {
        transform: 'rotate(180deg)',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: '0px',
        marginTop: '4px',
        minWidth: '240px',
        backgroundColor: '#FFFFFF',
        ...shorthands.borderRadius('4px'),
        boxShadow: elevationLevel2,
        zIndex: Z_INDEX.popover,
        overflowY: 'auto',
        maxHeight: '300px',
    },
    searchInput: {
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
        ...shorthands.borderStyle('none'),
        ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
        fontSize: '0.875rem',
        outlineStyle: 'none',
    },
    projectItem: {
        display: 'block',
        width: '100%',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
        backgroundColor: 'transparent',
        ...shorthands.borderStyle('none'),
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '0.875rem',
        color: HBC_SURFACE_LIGHT['text-primary'],
        ':hover': {
            backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
        },
    },
    activeItem: {
        fontWeight: '600',
    },
});
export const HbcProjectSelector = ({ onProjectSelect }) => {
    const { activeProject, availableProjects } = useProjectStore();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const styles = useStyles();
    const filtered = availableProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.number.toLowerCase().includes(search.toLowerCase()));
    const handleSelect = useCallback((projectId) => {
        onProjectSelect?.(projectId);
        setIsOpen(false);
        setSearch('');
    }, [onProjectSelect]);
    // Close on Escape or click outside
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
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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
    return (_jsxs("div", { ref: dropdownRef, style: { position: 'relative' }, children: [_jsxs("button", { ref: triggerRef, className: styles.root, onClick: () => setIsOpen((v) => !v), "aria-haspopup": "listbox", "aria-expanded": isOpen, "aria-label": "Select project", type: "button", children: [_jsx("span", { children: activeProject?.name ?? 'Select Project' }), _jsx("span", { className: mergeClasses(styles.chevron, isOpen && styles.chevronOpen), children: _jsx(ChevronDown, { size: "sm", color: HBC_HEADER_ICON_MUTED }) })] }), isOpen && (_jsxs("div", { className: styles.dropdown, role: "listbox", "aria-label": "Projects", children: [_jsx("input", { className: styles.searchInput, placeholder: "Search projects...", value: search, onChange: (e) => setSearch(e.target.value), autoFocus: true }), filtered.map((project) => (_jsxs("button", { className: mergeClasses(styles.projectItem, project.id === activeProject?.id && styles.activeItem), role: "option", "aria-selected": project.id === activeProject?.id, onClick: () => handleSelect(project.id), type: "button", children: [project.number, " \u2014 ", project.name] }, project.id)))] }))] }));
};
//# sourceMappingURL=HbcProjectSelector.js.map