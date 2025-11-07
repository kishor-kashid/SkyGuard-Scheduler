import { useEffect, useState } from 'react';
import { getStudents } from '../services/students.service';
import { Student } from '../types';
import { StudentCard } from '../components/students/StudentCard';
import { Card } from '../components/common/Card';
import { Users, Search } from 'lucide-react';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search term
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.trainingLevel.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error: any) {
      console.error('Failed to load students:', error);
      toast.error(error.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-600 mt-1">View and manage all students</p>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, phone, or training level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Student Pilots</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter((s) => s.trainingLevel === 'STUDENT_PILOT').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Private & Instrument Rated</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(
                  (s) => s.trainingLevel === 'PRIVATE_PILOT' || s.trainingLevel === 'INSTRUMENT_RATED'
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Students List */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading students...</p>
          </div>
        </Card>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No students found matching your search.' : 'No students found.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

