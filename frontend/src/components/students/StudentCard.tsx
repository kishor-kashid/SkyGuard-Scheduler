import { Student } from '../../types';
import { Card } from '../common/Card';
import { User, Mail, Phone, Award } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  const getTrainingLevelColor = (level: string) => {
    switch (level) {
      case 'STUDENT_PILOT':
        return 'bg-blue-100 text-blue-800';
      case 'PRIVATE_PILOT':
        return 'bg-green-100 text-green-800';
      case 'INSTRUMENT_RATED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainingLevelLabel = (level: string) => {
    switch (level) {
      case 'STUDENT_PILOT':
        return 'Student Pilot';
      case 'PRIVATE_PILOT':
        return 'Private Pilot';
      case 'INSTRUMENT_RATED':
        return 'Instrument Rated';
      default:
        return level.replace('_', ' ');
    }
  };

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {student.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrainingLevelColor(student.trainingLevel)}`}>
              {getTrainingLevelLabel(student.trainingLevel)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {student.email && (
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Email:</span>
            <span>{student.email}</span>
          </div>
        )}

        {student.phone && (
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Phone:</span>
            <span>{student.phone}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700">
          <Award className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Training Level:</span>
          <span>{getTrainingLevelLabel(student.trainingLevel)}</span>
        </div>
      </div>
    </Card>
  );
}

