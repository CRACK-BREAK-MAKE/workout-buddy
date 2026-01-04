import { Card } from '../../../shared/components/ui';

export interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
}

export const StatCard = ({ icon, label, value, subtitle }: StatCardProps) => {
  return (
    <Card
      hover
      padding="lg"
      className="flex flex-col items-center text-center space-y-3 group hover:scale-105 transition-transform"
    >
      <div className="relative inline-block">
        <div className="text-5xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="absolute inset-0 bg-primary-200 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{label}</p>
        <p className="text-4xl font-black bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-white/10 px-3 py-1 rounded-full inline-block">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
};
