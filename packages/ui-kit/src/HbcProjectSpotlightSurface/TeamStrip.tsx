/**
 * TeamStrip — avatar stack + on-demand team detail panel.
 *
 * The panel behaves as a popover at desktop widths and as a fixed
 * bottom sheet on mobile widths via CSS alone. Trigger + panel are
 * keyboard-accessible (Escape closes, outside click dismisses, focus
 * returns to the trigger). Motion is cut when `reducedMotion` is set.
 */
import * as React from 'react';
import { motion } from 'motion/react';
import { Users, X } from 'lucide-react';
import { HbcAvatarStack } from '../HbcAvatarStack/index.js';
import type { ProjectSpotlightTeamMember } from './types.js';
import {
  EASE_OUT_EXPO,
  MAX_VISIBLE_AVATARS,
  getInitials,
  toAvatarStackPerson,
} from './internals.js';
import styles from './project-spotlight-surface.module.css';

export interface TeamStripProps {
  members: ProjectSpotlightTeamMember[];
  reducedMotion: boolean;
}

export function TeamStrip({
  members,
  reducedMotion,
}: TeamStripProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent): void {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (members.length === 0) return null;

  const people = members.slice(0, MAX_VISIBLE_AVATARS).map(toAvatarStackPerson);
  const sheetMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: EASE_OUT_EXPO },
      };

  return (
    <div className={styles.teamStripWrap} data-hbc-homepage="team-strip">
      <button
        ref={triggerRef}
        type="button"
        className={styles.teamStripButton}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Project team: ${members.length} member${members.length !== 1 ? 's' : ''}`}
      >
        <HbcAvatarStack
          people={people}
          size="sm"
          max={MAX_VISIBLE_AVATARS}
          overflow={members.length > MAX_VISIBLE_AVATARS ? 'count' : 'none'}
        />
        <span className={styles.teamStripLabel}>
          <Users
            size={12}
            aria-hidden="true"
            className={styles.teamStripIcon}
            strokeWidth={2.25}
          />
          {members.length}{' '}
          {members.length === 1 ? 'team member' : 'team members'}
        </span>
      </button>

      {isOpen ? (
        <>
          <div
            className={styles.teamBackdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Project team members"
            className={styles.teamPanel}
            {...sheetMotionProps}
          >
            <div className={styles.teamPanelHeader}>
              <span>Project Team</span>
              <button
                type="button"
                className={styles.teamPanelClose}
                onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close team panel"
              >
                <X size={16} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>
            <ul className={styles.teamPanelList}>
              {members.map((member) => (
                <li key={member.id} className={styles.teamPanelRow}>
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.displayName}
                      width={42}
                      height={42}
                      decoding="async"
                      className={styles.teamPanelAvatar}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          'none';
                      }}
                    />
                  ) : (
                    <span
                      className={styles.teamPanelInitials}
                      aria-hidden="true"
                    >
                      {getInitials(member.displayName)}
                    </span>
                  )}
                  <div className={styles.teamPanelBody}>
                    <div className={styles.teamPanelName}>
                      {member.displayName}
                    </div>
                    {member.role ? (
                      <div className={styles.teamPanelRole}>{member.role}</div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
