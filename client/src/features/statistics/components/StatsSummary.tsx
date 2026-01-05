import { useTranslation } from 'react-i18next';
import { StatCard } from './StatCard';
import { StatisticsSummary } from '../types/statistics.types';

export interface StatsSummaryProps {
  stats: StatisticsSummary;
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  const { t } = useTranslation('statistics');
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="🏋️"
          label={t('statistics.totalWorkouts')}
          value={stats.total_workouts}
          subtitle={t('statistics.allTime')}
        />

        <StatCard
          icon="🔢"
          label={t('statistics.totalReps')}
          value={stats.total_reps.toLocaleString()}
          subtitle={t('statistics.avgPerWorkout', { count: stats.average_reps_per_workout })}
        />

        <StatCard
          icon="⏱️"
          label={t('statistics.timeExercising')}
          value={formatDuration(stats.total_duration_seconds)}
          subtitle={t('statistics.totalDuration')}
        />

        <StatCard
          icon="🔥"
          label={t('statistics.caloriesBurned')}
          value={Math.round(stats.total_calories_burned).toLocaleString()}
          subtitle={t('statistics.totalBurned')}
        />
      </div>

      {/* Personal Records */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {t('statistics.personalRecords')}
          </h3>
          <span className="text-3xl">🏆</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon="💪"
            label={t('statistics.pushups')}
            value={stats.personal_records['push-up']}
            subtitle={t('statistics.mostInSession')}
          />
          <StatCard
            icon="🦘"
            label={t('statistics.jumprope')}
            value={stats.personal_records['jump-rope']}
            subtitle={t('statistics.mostInSession')}
          />
        </div>
      </div>
    </div>
  );
};
