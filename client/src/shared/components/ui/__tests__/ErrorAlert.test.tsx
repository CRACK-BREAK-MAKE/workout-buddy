/**
 * ErrorAlert Component Tests
 *
 * TDD: Write tests FIRST
 * SRP: Only displays error messages with dismiss action
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorAlert } from '../ErrorAlert';

describe('ErrorAlert', () => {
  describe('rendering', () => {
    it('should render error message', () => {
      render(<ErrorAlert message="Test error message" onDismiss={() => {}} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should render with error icon', () => {
      render(<ErrorAlert message="Error" onDismiss={() => {}} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have accessible role', () => {
      render(<ErrorAlert message="Error" onDismiss={() => {}} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('should not render when message is empty string', () => {
      const { container } = render(<ErrorAlert message="" onDismiss={() => {}} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when message is null', () => {
      const { container } = render(<ErrorAlert message={null} onDismiss={() => {}} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('dismissal', () => {
    it('should call onDismiss when close button clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(<ErrorAlert message="Error" onDismiss={onDismiss} />);

      const closeButton = screen.getByRole('button', { name: /dismiss|close/i });
      await user.click(closeButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should have accessible close button label', () => {
      render(<ErrorAlert message="Error" onDismiss={() => {}} />);

      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveAccessibleName();
    });
  });

  describe('styling', () => {
    it('should have error styling classes', () => {
      render(<ErrorAlert message="Error" onDismiss={() => {}} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-red');
    });
  });
});
