import { useTranslation } from 'react-i18next';
import { Card } from '../../../shared/components/ui';
import { ExerciseInfo } from '../constants/exerciseTypes';

export interface ExerciseCardProps {
  exercise: ExerciseInfo;
  onSelect: (exerciseId: string) => void;
}

export const ExerciseCard = ({ exercise, onSelect }: ExerciseCardProps) => {
  const { t } = useTranslation('exercises');

  // Map exercise IDs to translation keys
  const exerciseKey = exercise.id === 'push-up' ? 'pushup' : 'jumprope';

  return (
    <Card
      hover
      padding="lg"
      onClick={() => onSelect(exercise.id)}
      className="flex flex-col items-center text-center gap-4"
    >
      {/* Icon */}
      <div className="text-6xl">{exercise.icon}</div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        {t(`exercises.${exerciseKey}.name`)}
      </h3>

      {/* Difficulty Badge */}
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          exercise.difficulty === 'Easy'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : exercise.difficulty === 'Medium'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}
      >
        {t(`exercises.${exerciseKey}.difficulty`)}
      </span>

      {/* Description */}
      <p className="text-neutral-700 dark:text-neutral-300">
        {t(`exercises.${exerciseKey}.description`)}
      </p>

      {/* Target Muscles */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exercise.targetMuscles.map((muscle, index) => (
          <span
            key={muscle}
            className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-md font-medium"
          >
            {t(`exercises.${exerciseKey}.muscles.${index}`)}
          </span>
        ))}
      </div>
    </Card>
  );
};
