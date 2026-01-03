import { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  hover = false,
  padding = 'md',
  className,
  ...props
}: CardProps) => {
  const baseStyles =
    'bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700';
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all cursor-pointer'
    : '';

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={clsx(baseStyles, hoverStyles, paddingStyles[padding], className)} {...props}>
      {children}
    </div>
  );
};
