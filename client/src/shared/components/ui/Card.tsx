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
  const baseStyles = 'bg-white rounded-xl shadow-md border border-gray-100';
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer'
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
