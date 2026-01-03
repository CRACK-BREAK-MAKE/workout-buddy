import { ExerciseCard } from './ExerciseCard';
import { EXERCISES } from '../constants/exerciseTypes';

export interface ExerciseSelectorProps {
  onSelectExercise: (exerciseId: string) => void;
}

export const ExerciseSelector = ({ onSelectExercise }: ExerciseSelectorProps) => {
  const exercises = Object.values(EXERCISES);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Choose Your Exercise
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Select an exercise to start your workout
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {exercises.map(exercise => (
          <ExerciseCard key={exercise.id} exercise={exercise} onSelect={onSelectExercise} />
        ))}
      </div>
    </div>
  );
};
