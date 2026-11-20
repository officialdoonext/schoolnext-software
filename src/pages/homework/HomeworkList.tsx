import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, CheckCircle2, Clock, Upload, FileText } from 'lucide-react';
import { Homework, SchoolClass, Subject } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatDate } from '@/utils/formatters';

export const HomeworkList: React.FC = () => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: 'Quadratic Equations Practice Set 4.2',
    description: 'Solve questions 1 through 10 from NCERT Chapter 4 on quadratic roots and factorization.',
    classId: 'cls_10',
    subjectId: 'sub_10_math',
    dueDate: '2026-05-15',
    maxMarks: 20,
  });

  useEffect(() => {
    const load = async () => {
      const hw = await dbService.getCollection<Homework>('homework');
      const cls = await dbService.getCollection<SchoolClass>('classes');
      const sub = await dbService.getCollection<Subject>('subjects');

      setClasses(cls);
      setSubjects(sub);
      setHomeworkList(hw);
    };
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selClass = classes.find(c => c.id === formData.classId);
    const selSub = subjects.find(s => s.id === formData.subjectId);

    const newHw: Omit<Homework, 'id'> = {
      schoolId: 'school_next_main_01',
      academicYearId: 'ay_2026_2027',
      classId: formData.classId,
      className: selClass?.name || 'Class 10',
      sectionId: 'sec_10_a',
      sectionName: 'A',
      subjectId: formData.subjectId,
      subjectName: selSub?.name || 'Mathematics',
      assignedTeacherId: 'staff_2',
      assignedTeacherName: 'Priya Sharma',
      title: formData.title,
      description: formData.description,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      maxMarks: formData.maxMarks,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await dbService.createDocument<Homework>('homework', newHw);
    setHomeworkList(prev => [saved, ...prev]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homework & Assignments</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Assign classroom homework, manage deadlines, and review student submissions.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Assign Homework
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {homeworkList.map((hw) => (
          <Card key={hw.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="sm">{hw.subjectName}</Badge>
                  <span className="text-xs text-slate-500 font-medium">{hw.className} ({hw.sectionName})</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{hw.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{hw.description}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Due: <strong className="text-slate-800">{formatDate(hw.dueDate)}</strong></span>
              </div>
              <div>
                <span>Max Marks: <strong className="text-slate-900 font-mono">{hw.maxMarks}</strong></span>
              </div>
              <span className="text-[11px] text-slate-400">By {hw.assignedTeacherName}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Homework Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Assign New Homework" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Homework Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Class</label>
              <select
                value={formData.classId}
                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subjectId}
                onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Instructions / Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                value={formData.maxMarks}
                onChange={e => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Assign Homework</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

