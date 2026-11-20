import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { Student, SchoolClass, AcademicYear } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const StudentPromotion: React.FC = () => {
  const navigate = useNavigate();
  const { academicYears } = useSchool();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // Selection state
  const [fromYearId, setFromYearId] = useState<string>('ay_2026_2027');
  const [fromClassId, setFromClassId] = useState<string>('cls_9');
  const [toYearId, setToYearId] = useState<string>('ay_2026_2027');
  const [toClassId, setToClassId] = useState<string>('cls_10');

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const cls = await dbService.getCollection<SchoolClass>('classes');
      const std = await dbService.getCollection<Student>('students');
      setClasses(cls);
      setAllStudents(std);
      if (cls.length > 1) {
        setFromClassId(cls[0].id);
        setToClassId(cls[1].id);
      }
    };
    loadData();
  }, []);

  const candidates = allStudents.filter(s => s.classId === fromClassId);

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(new Set(candidates.map(c => c.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleToggleStudent = (id: string) => {
    const copy = new Set(selectedStudentIds);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelectedStudentIds(copy);
  };

  const handlePromote = async () => {
    if (selectedStudentIds.size === 0) {
      alert('Please select at least one student to promote.');
      return;
    }
    const targetClass = classes.find(c => c.id === toClassId);
    if (!targetClass) return;

    setLoading(true);
    try {
      for (const id of selectedStudentIds) {
        await dbService.updateDocument<Student>('students', id, {
          classId: targetClass.id,
          className: targetClass.name,
          academicYearId: toYearId,
          updatedAt: new Date().toISOString(),
        });
      }

      setSuccessMsg(`Successfully promoted ${selectedStudentIds.size} students to ${targetClass.name}!`);
      // Refresh local list
      const updated = await dbService.getCollection<Student>('students');
      setAllStudents(updated);
      setSelectedStudentIds(new Set());
    } catch (err) {
      console.error('Promotion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/students')}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Student Promotion</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Promote enrolled students to the next class grade while preserving historical examination and attendance records.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePromote}
          loading={loading}
          disabled={selectedStudentIds.size === 0}
          icon={<UserCheck className="w-4 h-4" />}
        >
          Promote Selected ({selectedStudentIds.size})
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Promotion Config Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Class */}
        <Card title="Source Class (From)" subtitle="Select current enrolled class">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Academic Year</label>
              <select
                value={fromYearId}
                onChange={e => setFromYearId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                {academicYears.map(y => <option key={y.id} value={y.id}>AY {y.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Current Class</label>
              <select
                value={fromClassId}
                onChange={e => {
                  setFromClassId(e.target.value);
                  setSelectedStudentIds(new Set());
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Target Class */}
        <Card title="Target Class (To)" subtitle="Select destination promotion grade">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Target Academic Year</label>
              <select
                value={toYearId}
                onChange={e => setToYearId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                {academicYears.map(y => <option key={y.id} value={y.id}>AY {y.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Promote To Class</label>
              <select
                value={toClassId}
                onChange={e => setToClassId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Candidate Students List */}
      <Card
        title={`Candidate Students in Selected Class (${candidates.length})`}
        subtitle="Select the qualifying students to promote"
        action={
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={candidates.length > 0 && selectedStudentIds.size === candidates.length}
              onChange={handleToggleSelectAll}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            Select All
          </label>
        }
      >
        <div className="divide-y divide-slate-100">
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              No active students found in this class. Try selecting a different source class.
            </p>
          ) : (
            candidates.map((s) => (
              <div
                key={s.id}
                onClick={() => handleToggleStudent(s.id)}
                className={`py-3 px-3 flex items-center justify-between rounded-lg cursor-pointer transition-colors ${
                  selectedStudentIds.has(s.id) ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.has(s.id)}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{s.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Adm: {s.admissionNumber} • Roll: #{s.rollNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <Badge variant="success" size="sm">Passed</Badge>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">
                    {classes.find(c => c.id === toClassId)?.name}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

