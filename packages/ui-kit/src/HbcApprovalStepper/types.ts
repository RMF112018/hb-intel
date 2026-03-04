/** HbcApprovalStepper — PH4.13 §13.3 approval workflow stepper */

export interface ApprovalStep {
  /** Unique step identifier */
  id: string;
  /** Display name of the approver */
  userName: string;
  /** Role/title of the approver */
  userRole: string;
  /** Avatar image URL (falls back to initials) */
  avatarUrl?: string;
  /** Decision state */
  decision?: 'approved' | 'rejected' | 'pending' | 'skipped';
  /** ISO timestamp of the decision */
  timestamp?: string;
  /** Optional comment from the approver */
  comment?: string;
}

export interface HbcApprovalStepperProps {
  /** Approval steps in order */
  steps: ApprovalStep[];
  /** Layout orientation (default 'vertical') */
  orientation?: 'vertical' | 'horizontal';
  /** Additional CSS class */
  className?: string;
}
