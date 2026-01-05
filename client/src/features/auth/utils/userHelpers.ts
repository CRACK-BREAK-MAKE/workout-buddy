/**
 * User Helper Utilities
 *
 * SRP: Only handles user-related display and formatting logic
 * DRY: Centralized user utilities to avoid duplication
 * YAGNI: Simple utilities without unnecessary complexity
 */

import type { User } from '../types/auth.types';

/**
 * Get display name for a user
 *
 * Prioritizes username over full_name, with fallback to 'User'
 *
 * @param user - User object (can be null)
 * @returns Display name string
 *
 * @example
 * ```typescript
 * getDisplayName({ username: 'john_doe', full_name: 'John Doe' }) // => 'john_doe'
 * getDisplayName({ full_name: 'John Doe' }) // => 'John Doe'
 * getDisplayName(null) // => 'User'
 * ```
 */
export const getDisplayName = (user: User | null): string => {
  return user?.username || user?.full_name || 'User';
};

/**
 * Get user initials from full name or username
 *
 * @param user - User object (can be null)
 * @returns Initials (1-2 characters) or empty string
 *
 * @example
 * ```typescript
 * getUserInitials({ full_name: 'John Doe' }) // => 'JD'
 * getUserInitials({ username: 'john_doe' }) // => 'JD'
 * getUserInitials(null) // => ''
 * ```
 */
export const getUserInitials = (user: User | null): string => {
  if (!user) {
    return '';
  }

  const name = user.full_name || user.username;
  if (!name) {
    return '';
  }

  // Split by space or underscore
  const parts = name.split(/[\s_]+/);

  if (parts.length >= 2) {
    // Two or more parts: take first letter of first two parts
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Single part: take first two letters
  return name.substring(0, 2).toUpperCase();
};
