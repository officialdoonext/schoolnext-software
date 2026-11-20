import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, DoorOpen, Trash2 } from 'lucide-react';
import { SchoolClass, Section, Staff } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

export const ClassesSections: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);

  // Class Form
  const [classForm, setClassForm] = useState({
    name: 'Class 11',
    code: 'CLS-11',
    maxStudents: 50,
  });

  // Section Form
  const [sectionForm, setSectionForm] = useState({
    classId: '',
    name: 'C',
    roomNumber: 'Room 304',
    capacity: 45,
    classTeacherName: '',
  });

  const fetchData = async () => {
    const cls = await dbService.getCollection<SchoolClass>('classes');
    const sec = await dbService.getCollection<Section>('sections');
    const st = await dbService.getCollection<Staff>('staff');
    setClasses(cls);
    setSections(sec);
    setStaff(st);
    if (cls.length > 0) {
      setSectionForm(prev => ({ ...prev, classId: cls[0].id }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClass = await dbService.createDocument<SchoolClass>('classes', {
      ...classForm,
      academicYearId: 'ay_2026_2027',
      schoolId: 'school_next_main_01',
      status: 'active',
      order: classes.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setClasses(prev => [...prev, newClass]);
    setClassModalOpen(false);
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const parentClass = classes.find(c => c.id === sectionForm.classId);
    const newSection = await dbService.createDocument<Section>('sections', {
      ...sectionForm,
      className: parentClass?.name || 'Class',
      schoolId: 'school_next_main_01',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSections(prev => [...prev, newSection]);
    setSectionModalOpen(false);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Classes & Sections</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage school classes, allocate multiple sections, assign class teachers, and set room capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSectionModalOpen(true)}
            icon={<Plus className="w-4 h-4 text-slate-600" />}
          >
            Add Section
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setClassModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Class
          </Button>
        </div>
      </div>

      {/* Grid of Classes and their Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => {
          const classSections = sections.filter(s => s.classId === cls.id);

          return (
            <Card
              key={cls.id}
              title={cls.name}
              subtitle={`Code: ${cls.code} • Max Strength: ${cls.maxStudents}`}
              action={<Badge variant="brand" size="sm">{classSections.length} Sections</Badge>}
            >
              <div className="space-y-3">
                {classSections.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No sections configured for this class yet.</p>
                ) : (
                  classSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm">Section {sec.name}</span>
                        <div className="flex items-center gap-3 text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3.5 h-3.5 text-slate-400" /> {sec.roomNumber || 'Room N/A'}
                          </span>
                          <span>• Capacity: {sec.capacity}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Class Teacher</span>
                        <span className="font-medium text-slate-800">{sec.classTeacherName || 'Not Assigned'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Class Modal */}
      <Modal isOpen={classModalOpen} onClose={() => setClassModalOpen(false)} title="Create New Class" maxWidth="md">
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Class Name *</label>
            <input
              type="text"
              value={classForm.name}
              onChange={e => setClassForm({ ...classForm, name: e.target.value })}
              required
              placeholder="e.g. Class 11"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Class Code *</label>
              <input
                type="text"
                value={classForm.code}
                onChange={e => setClassForm({ ...classForm, code: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Max Capacity</label>
              <input
                type="number"
                value={classForm.maxStudents}
                onChange={e => setClassForm({ ...classForm, maxStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setClassModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Create Class</Button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal isOpen={sectionModalOpen} onClose={() => setSectionModalOpen(false)} title="Add Section to Class" maxWidth="md">
        <form onSubmit={handleCreateSection} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Class *</label>
            <select
              value={sectionForm.classId}
              onChange={e => setSectionForm({ ...sectionForm, classId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Section Name *</label>
              <input
                type="text"
                value={sectionForm.name}
                onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                required
                placeholder="A, B, C..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                value={sectionForm.roomNumber}
                onChange={e => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
                placeholder="Room 302"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Class Teacher</label>
            <select
              value={sectionForm.classTeacherName}
              onChange={e => setSectionForm({ ...sectionForm, classTeacherName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">Select teacher</option>
              {staff.filter(s => s.role === 'teacher').map(t => (
                <option key={t.id} value={t.fullName}>{t.fullName} ({t.departmentName})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setSectionModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save Section</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

