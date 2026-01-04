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
    'bg-white/70 backdrop-blur-xl rounded-xl shadow-md border border-white/50 shadow-neutral-200/30 dark:bg-white/5 dark:backdrop-blur-2xl dark:border-white/10 dark:shadow-black/20';
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:bg-white/80 hover:border-primary-200 dark:hover:bg-white/10 dark:hover:border-primary-500 transition-all cursor-pointer'
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
