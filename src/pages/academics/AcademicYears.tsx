import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock } from 'lucide-react';
import { AcademicYear } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatDate } from '@/utils/formatters';

export const AcademicYears: React.FC = () => {
  const { academicYears, setSelectedAcademicYear } = useSchool();
  const [years, setYears] = useState<AcademicYear[]>(academicYears);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '2027-2028',
    startDate: '2027-04-01',
    endDate: '2028-03-31',
    admissionStartDate: '2027-01-15',
    admissionEndDate: '2027-07-31',
    isCurrent: false,
    status: 'upcoming' as 'active' | 'completed' | 'upcoming',
  });

  useEffect(() => {
    setYears(academicYears);
  }, [academicYears]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newYear = await dbService.createDocument<AcademicYear>('academicYears', {
      ...formData,
      schoolId: 'school_next_main_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setYears(prev => [newYear, ...prev]);
    setModalOpen(false);
  };

  const handleSetCurrent = async (year: AcademicYear) => {
    for (const y of years) {
      await dbService.updateDocument<AcademicYear>('academicYears', y.id, {
        isCurrent: y.id === year.id,
      });
    }
    setYears(prev => prev.map(y => ({ ...y, isCurrent: y.id === year.id })));
    setSelectedAcademicYear(year);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Sessions & Years</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure school academic sessions, admission calendars, and active terms.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Academic Year
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {years.map((y) => (
          <Card key={y.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Session {y.name}</h3>
                  {y.isCurrent && <Badge variant="success" size="sm" dot>Active Current</Badge>}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Term: {formatDate(y.startDate)} to {formatDate(y.endDate)}
                </p>
                {y.admissionStartDate && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Admissions: {formatDate(y.admissionStartDate)} - {formatDate(y.admissionEndDate)}
                  </p>
                )}
              </div>

              {!y.isCurrent && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSetCurrent(y)}
                  icon={<CheckCircle className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Set as Current
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal to add Academic Year */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Academic Year"
        subtitle="Create academic year session calendar"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Academic Year Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. 2027-2028"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Academic Year
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

