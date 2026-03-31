import { makeStyles } from '@griffel/react';

export const usePreviewShellStyles = makeStyles({
  scrollContainer: {
    height: '100%',
    overflow: 'auto',
  },
  columnContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  fillContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});
