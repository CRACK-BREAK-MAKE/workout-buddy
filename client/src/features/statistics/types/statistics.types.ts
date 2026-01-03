export interface PersonalRecords {
  'push-up': number;
  'jump-rope': number;
}

export interface WorkoutCountByType {
  'push-up': number;
  'jump-rope': number;
}

export interface StatisticsSummary {
  total_workouts: number;
  total_reps: number;
  total_duration_seconds: number;
  total_calories_burned: number;
  average_reps_per_workout: number;
  personal_records: PersonalRecords;
  workout_count_by_type: WorkoutCountByType;
}

export interface Workout {
  id: string;
  exercise_type: string;
  reps_count: number;
  duration_seconds: number;
  calories_burned: number;
  created_at: string;
}
