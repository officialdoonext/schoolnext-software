import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { Subject, SchoolClass, Staff } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

export const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    classId: '',
    type: 'theory' as 'theory' | 'practical' | 'both',
    maxMarks: 100,
    passingMarks: 33,
    assignedTeacherName: '',
  });

  const fetchData = async () => {
    const sub = await dbService.getCollection<Subject>('subjects');
    const cls = await dbService.getCollection<SchoolClass>('classes');
    const st = await dbService.getCollection<Staff>('staff');
    setSubjects(sub);
    setClasses(cls);
    setStaff(st);
    if (cls.length > 0) {
      setFormData(prev => ({ ...prev, classId: cls[0].id }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selClass = classes.find(c => c.id === formData.classId);
    const newSubject = await dbService.createDocument<Subject>('subjects', {
      ...formData,
      className: selClass?.name || 'Class',
      schoolId: 'school_next_main_01',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSubjects(prev => [newSubject, ...prev]);
    setModalOpen(false);
  };

  const columns: Column<Subject>[] = [
    {
      header: 'Subject Code',
      accessorKey: 'code',
      sortable: true,
      className: 'font-mono font-medium text-slate-900',
    },
    {
      header: 'Subject Name',
      accessorKey: 'name',
      sortable: true,
      cell: (sub) => (
        <div>
          <p className="font-semibold text-slate-900">{sub.name}</p>
          <p className="text-[11px] text-slate-400 capitalize">{sub.type} Assessment</p>
        </div>
      ),
    },
    {
      header: 'Class',
      accessorKey: 'className',
      sortable: true,
      className: 'font-medium text-slate-800',
    },
    {
      header: 'Marks Scheme',
      cell: (sub) => (
        <span className="text-slate-700 text-xs">
          Pass: <strong>{sub.passingMarks}</strong> / Max: <strong>{sub.maxMarks}</strong>
        </span>
      ),
    },
    {
      header: 'Assigned Faculty',
      accessorKey: 'assignedTeacherName',
      cell: (sub) => (
        <span className="font-medium text-slate-800">{sub.assignedTeacherName || 'Unassigned'}</span>
      ),
    },
    {
      header: 'Status',
      cell: (sub) => <Badge variant="success" size="sm" dot>Active</Badge>,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum Subjects</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage educational subjects, assign specialized teachers, and define assessment marking schemes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Subject
        </Button>
      </div>

      <DataTable
        data={subjects}
        columns={columns}
        searchPlaceholder="Search subject by name, code or teacher..."
        searchFields={['name', 'code', 'assignedTeacherName', 'className']}
        exportFileName="School_Subjects"
      />

      {/* Add Subject Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Academic Subject" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Physics"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="PHY-10"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Class *</label>
              <select
                value={formData.classId}
                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="both">Both Theory & Lab</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Maximum Marks *</label>
              <input
                type="number"
                value={formData.maxMarks}
                onChange={e => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Passing Marks *</label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={e => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Teacher</label>
            <select
              value={formData.assignedTeacherName}
              onChange={e => setFormData({ ...formData, assignedTeacherName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">Select subject teacher</option>
              {staff.filter(s => s.role === 'teacher').map(t => (
                <option key={t.id} value={t.fullName}>{t.fullName} ({t.departmentName})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save Subject</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

