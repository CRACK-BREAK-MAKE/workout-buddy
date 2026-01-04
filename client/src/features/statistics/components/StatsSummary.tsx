import { StatCard } from './StatCard';
import { StatisticsSummary } from '../types/statistics.types';

export interface StatsSummaryProps {
  stats: StatisticsSummary;
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
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
          label="Total Workouts"
          value={stats.total_workouts}
          subtitle="All time"
        />

        <StatCard
          icon="🔢"
          label="Total Reps"
          value={stats.total_reps.toLocaleString()}
          subtitle={`Avg ${stats.average_reps_per_workout} per workout`}
        />

        <StatCard
          icon="⏱️"
          label="Time Exercising"
          value={formatDuration(stats.total_duration_seconds)}
          subtitle="Total duration"
        />

        <StatCard
          icon="🔥"
          label="Calories Burned"
          value={Math.round(stats.total_calories_burned).toLocaleString()}
          subtitle="Total burned"
        />
      </div>

      {/* Personal Records */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Personal Records
          </h3>
          <span className="text-3xl">🏆</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon="💪"
            label="Push-ups"
            value={stats.personal_records['push-up']}
            subtitle="Most in one session"
          />
          <StatCard
            icon="🦘"
            label="Jump Rope"
            value={stats.personal_records['jump-rope']}
            subtitle="Most in one session"
          />
        </div>
      </div>
    </div>
  );
};
