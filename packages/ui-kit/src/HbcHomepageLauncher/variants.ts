/**
 * HbcHomepageLauncher — CVA variants.
 *
 * Keeps the surface-level variant vocabulary explicit and testable
 * without polluting the launcher root with conditional class strings.
 */
import { cva } from 'class-variance-authority';
import styles from './homepage-launcher.module.css';

export const launcherRoot = cva(styles.root);
export const launcherBand = cva(styles.band);
export const launcherChip = cva(styles.chip);
