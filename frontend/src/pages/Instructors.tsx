import { useEffect, useState } from 'react';
import { getInstructors } from '../services/instructors.service';
import { Instructor } from '../types';
import { InstructorCard } from '../components/instructors/InstructorCard';
import { Card } from '../components/common/Card';
import { Users, Search } from 'lucide-react';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';

export function Instructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInstructors();
  }, []);

  useEffect(() => {
    // Filter instructors based on search term
    if (!searchTerm.trim()) {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(instructor.certifications)
            ? instructor.certifications.some((c) =>
                c.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : instructor.certifications?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const data = await getInstructors();
      setInstructors(data);
      setFilteredInstructors(data);
    } catch (error: any) {
      console.error('Failed to load instructors:', error);
      toast.error(error.response?.data?.message || 'Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  const instructorsWithCertifications = instructors.filter(
    (i) => i.certifications && (Array.isArray(i.certifications) ? i.certifications.length > 0 : true)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
        <p className="text-gray-600 mt-1">View and manage all instructors</p>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, phone, or certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Instructors</p>
              <p className="text-2xl font-bold text-gray-900">{instructors.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">With Certifications</p>
              <p className="text-2xl font-bold text-gray-900">{instructorsWithCertifications}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Instructors List */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading instructors...</p>
          </div>
        </Card>
      ) : filteredInstructors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No instructors found matching your search.' : 'No instructors found.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

