import { Instructor } from '../../types';
import { Card } from '../common/Card';
import { User, Mail, Phone, Award } from 'lucide-react';

interface InstructorCardProps {
  instructor: Instructor;
  onClick?: () => void;
}

export function InstructorCard({ instructor, onClick }: InstructorCardProps) {
  const certifications = Array.isArray(instructor.certifications)
    ? instructor.certifications
    : instructor.certifications
    ? [instructor.certifications]
    : [];

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {instructor.name}
            </h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Instructor
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {instructor.email && (
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Email:</span>
            <span>{instructor.email}</span>
          </div>
        )}

        {instructor.phone && (
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Phone:</span>
            <span>{instructor.phone}</span>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="flex items-start gap-2 text-gray-700">
            <Award className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">Certifications:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

