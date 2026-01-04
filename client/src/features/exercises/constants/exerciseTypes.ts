export const EXERCISE_TYPES = {
  PUSH_UP: 'push-up',
  JUMP_ROPE: 'jump-rope',
} as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[keyof typeof EXERCISE_TYPES];

export interface ExerciseInfo {
  id: ExerciseType;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetMuscles: string[];
}

export const EXERCISES: Record<ExerciseType, ExerciseInfo> = {
  [EXERCISE_TYPES.PUSH_UP]: {
    id: EXERCISE_TYPES.PUSH_UP,
    name: 'Push-ups',
    description: 'Classic upper body exercise. AI tracks your elbow angle for perfect form.',
    icon: '💪',
    difficulty: 'Medium',
    targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
  },
  [EXERCISE_TYPES.JUMP_ROPE]: {
    id: EXERCISE_TYPES.JUMP_ROPE,
    name: 'Jump Rope',
    description: 'Cardio workout that burns calories. AI counts your jumps automatically.',
    icon: '🦘',
    difficulty: 'Easy',
    targetMuscles: ['Calves', 'Cardio', 'Coordination'],
  },
};
