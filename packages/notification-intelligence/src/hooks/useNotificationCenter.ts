// Placeholder stub — populated by T05
import type { INotificationEvent } from '../types';

/** Paginated in-app notification center items */
export function useNotificationCenter(): { notifications: readonly INotificationEvent[]; isLoading: boolean } {
  return { notifications: [], isLoading: false };
}
