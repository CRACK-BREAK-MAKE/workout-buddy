import { Card } from '../../../shared/components/ui';
import { ExerciseInfo } from '../constants/exerciseTypes';

export interface ExerciseCardProps {
  exercise: ExerciseInfo;
  onSelect: (exerciseId: string) => void;
}

export const ExerciseCard = ({ exercise, onSelect }: ExerciseCardProps) => {
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
      <h3 className="text-2xl font-bold text-gray-900">{exercise.name}</h3>

      {/* Difficulty Badge */}
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          exercise.difficulty === 'Easy'
            ? 'bg-green-100 text-green-800'
            : exercise.difficulty === 'Medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        }`}
      >
        {exercise.difficulty}
      </span>

      {/* Description */}
      <p className="text-gray-600">{exercise.description}</p>

      {/* Target Muscles */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exercise.targetMuscles.map(muscle => (
          <span key={muscle} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
            {muscle}
          </span>
        ))}
      </div>
    </Card>
  );
};
