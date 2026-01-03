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
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
};
