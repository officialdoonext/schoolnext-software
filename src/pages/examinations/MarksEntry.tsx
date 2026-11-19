import React, { useState, useEffect } from 'react';
import { Award, Save, CheckCircle, Search, Filter } from 'lucide-react';
import { Student, SchoolClass, Subject, MarksEntry as MarksEntryType, ExamType } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const MarksEntry: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Selection
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Marks map: studentId -> { marks: number, isAbsent: boolean, remarks: string }
  const [marksMap, setMarksMap] = useState<Record<string, { marks: number; isAbsent: boolean; remarks: string }>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const cls = await dbService.getCollection<SchoolClass>('classes');
      const sub = await dbService.getCollection<Subject>('subjects');
      const exams = await dbService.getCollection<ExamType>('examTypes');

      setClasses(cls);
      setSubjects(sub);
      setExamTypes(exams);

      if (exams.length > 0) setSelectedExamTypeId(exams[0].id);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
      if (sub.length > 0) setSelectedSubjectId(sub[0].id);
    };
    init();
  }, []);

  // When class changes, load students
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClassId) return;
      const allStudents = await dbService.getCollection<Student>('students');
      const filtered = allStudents.filter(s => s.classId === selectedClassId && s.status === 'active');
      setStudents(filtered);

      const map: Record<string, { marks: number; isAbsent: boolean; remarks: string }> = {};
      filtered.forEach((s, idx) => {
        // sample realistic marks
        const sampleMarks = [88, 92, 78, 85, 95, 68, 82, 91][idx % 8];
        map[s.id] = { marks: sampleMarks, isAbsent: false, remarks: 'Good performance' };
      });
      setMarksMap(map);
    };
    loadStudents();
  }, [selectedClassId, selectedSubjectId, selectedExamTypeId]);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const maxMarks = activeSubject?.maxMarks || 100;

  // Grade calculation helper
  const calculateGrade = (marks: number, max: number): string => {
    const pct = (marks / max) * 100;
    if (pct >= 91) return 'A1';
    if (pct >= 81) return 'A2';
    if (pct >= 71) return 'B1';
    if (pct >= 61) return 'B2';
    if (pct >= 51) return 'C1';
    if (pct >= 41) return 'C2';
    if (pct >= 33) return 'D';
    return 'E';
  };

  const handleMarksChange = (studentId: string, val: number) => {
    const clamped = Math.min(Math.max(0, val), maxMarks);
    setMarksMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: clamped }
    }));
  };

  const handleAbsentToggle = (studentId: string, isAbsent: boolean) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], isAbsent, marks: isAbsent ? 0 : 50 }
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const records: MarksEntryType[] = students.map(s => {
        const item = marksMap[s.id] || { marks: 0, isAbsent: false, remarks: '' };
        const grade = item.isAbsent ? 'AB' : calculateGrade(item.marks, maxMarks);
        return {
          id: `marks_${selectedExamTypeId}_${s.id}_${selectedSubjectId}`,
          schoolId: 'school_next_main_01',
          examScheduleId: selectedExamTypeId,
          academicYearId: 'ay_2026_2027',
          classId: selectedClassId,
          sectionId: s.sectionId,
          subjectId: selectedSubjectId,
          studentId: s.id,
          studentName: s.fullName,
          rollNumber: s.rollNumber,
          maxMarks,
          obtainedMarks: item.marks,
          percentage: Math.round((item.marks / maxMarks) * 100),
          grade,
          isAbsent: item.isAbsent,
          remarks: item.remarks,
          enteredBy: 'Priya Sharma (Teacher)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      localStorage.setItem('school_next_db_marks', JSON.stringify(records));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examination Marks Entry</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Enter subject marks, validate grade distributions, and publish academic report card marks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" /> Marks Saved Successfully!
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSaveMarks} loading={saving} icon={<Save className="w-4 h-4" />}>
            Save All Marks
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block text-slate-500 font-medium mb-1">Examination *</label>
          <select
            value={selectedExamTypeId}
            onChange={e => setSelectedExamTypeId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
          >
            {examTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">Class *</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">Subject *</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
          >
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code}) - Max: {s.maxMarks}</option>)}
          </select>
        </div>
      </div>

      {/* Marks Entry Table */}
      <Card
        title={`Student Marks Sheet (Max Marks: ${maxMarks}, Passing: ${activeSubject?.passingMarks || 33})`}
        subtitle="Enter obtained marks to auto-compute grades"
      >
        <div className="divide-y divide-slate-100">
          {students.map((student) => {
            const current = marksMap[student.id] || { marks: 0, isAbsent: false, remarks: '' };
            const grade = current.isAbsent ? 'AB' : calculateGrade(current.marks, maxMarks);
            const isPass = current.marks >= (activeSubject?.passingMarks || 33);

            return (
              <div key={student.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {student.rollNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{student.fullName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Adm: {student.admissionNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <label className="flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={current.isAbsent}
                      onChange={e => handleAbsentToggle(student.id, e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    Absent
                  </label>

                  {!current.isAbsent && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={maxMarks}
                        value={current.marks}
                        onChange={e => handleMarksChange(student.id, Number(e.target.value))}
                        className="w-20 px-2.5 py-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                      />
                      <span className="text-slate-400 font-mono">/ {maxMarks}</span>
                    </div>
                  )}

                  <div className="w-16 text-center">
                    <Badge variant={current.isAbsent ? 'danger' : isPass ? 'success' : 'danger'} size="md">
                      Grade: {grade}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

