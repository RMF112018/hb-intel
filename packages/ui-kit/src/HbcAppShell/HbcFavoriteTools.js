import { jsx as _jsx } from "react/jsx-runtime";
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_HEADER_TEXT } from '../theme/tokens.js';
const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    iconButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        ...shorthands.borderStyle('none'),
        cursor: 'pointer',
        paddingLeft: '6px',
        paddingRight: '6px',
        paddingTop: '6px',
        paddingBottom: '6px',
        ...shorthands.borderRadius('4px'),
        color: HBC_HEADER_TEXT,
        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
    },
});
export const HbcFavoriteTools = ({ items = [] }) => {
    const styles = useStyles();
    const favorites = items.filter((i) => i.isFavorite).slice(0, 6);
    if (favorites.length === 0)
        return null;
    return (_jsx("div", { className: styles.root, "aria-label": "Favorite tools", role: "toolbar", children: favorites.map((item) => (_jsx("button", { className: styles.iconButton, "aria-label": item.label, title: item.label, type: "button", children: item.icon }, item.id))) }));
};
//# sourceMappingURL=HbcFavoriteTools.js.map