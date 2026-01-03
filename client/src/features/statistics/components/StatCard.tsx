import { Card } from '../../../shared/components/ui';

export interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
}

export const StatCard = ({ icon, label, value, subtitle }: StatCardProps) => {
  return (
    <Card padding="md" className="flex items-center gap-4">
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
        {subtitle && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};
