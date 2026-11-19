import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, Check } from 'lucide-react';
import { Student, SchoolClass, Section, AttendanceRecord, AttendanceStatus } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const StudentAttendance: React.FC = () => {
  const { selectedAcademicYear, refreshStats } = useSchool();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const cls = await dbService.getCollection<SchoolClass>('classes');
      const sec = await dbService.getCollection<Section>('sections');
      setClasses(cls);
      setSections(sec);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
      if (sec.length > 0) setSelectedSectionId(sec[0].id);
    };
    init();
  }, []);

  // When class or section changes, load relevant students
  useEffect(() => {
    const loadClassStudents = async () => {
      if (!selectedClassId) return;
      const allStudents = await dbService.getCollection<Student>('students');
      const filtered = allStudents.filter(s => s.classId === selectedClassId && s.status === 'active');
      setStudents(filtered);

      // Check if attendance already recorded for this date
      const existingRecords = await dbService.getCollection<AttendanceRecord>('attendance');
      const dayRecords = existingRecords.filter(
        r => r.classId === selectedClassId && r.date === selectedDate
      );

      const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      filtered.forEach(s => {
        const found = dayRecords.find(r => r.studentId === s.id);
        initialMap[s.id] = {
          status: found ? found.status : 'present',
          remarks: found?.remarks || '',
        };
      });
      setAttendanceMap(initialMap);
      setSavedSuccess(false);
    };
    loadClassStudents();
  }, [selectedClassId, selectedSectionId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated = { ...attendanceMap };
    students.forEach(s => {
      if (updated[s.id]) updated[s.id].status = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const existing = await dbService.getCollection<AttendanceRecord>('attendance');
      // Remove any previously recorded attendance for this class and date to prevent duplicates
      const cleaned = existing.filter(r => !(r.classId === selectedClassId && r.date === selectedDate));

      const newRecords: AttendanceRecord[] = students.map(s => ({
        id: `att_${s.id}_${selectedDate}`,
        schoolId: 'school_next_main_01',
        academicYearId: selectedAcademicYear?.id || 'ay_2026_2027',
        classId: selectedClassId,
        sectionId: selectedSectionId,
        studentId: s.id,
        studentName: s.fullName,
        rollNumber: s.rollNumber,
        date: selectedDate,
        status: attendanceMap[s.id]?.status || 'present',
        remarks: attendanceMap[s.id]?.remarks || '',
        recordedBy: 'Priya Sharma (Teacher)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Store in db
      localStorage.setItem('school_next_db_attendance', JSON.stringify([...newRecords, ...cleaned]));
      window.dispatchEvent(new CustomEvent('school_next_db_change', { detail: { collection: 'attendance' } }));
      
      await refreshStats();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => attendanceMap[s.id]?.status === 'present').length;
  const absentCount = students.filter(s => attendanceMap[s.id]?.status === 'absent').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Attendance Register</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Mark daily attendance, register student leaves, and notify parents of unexcused absences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Attendance Saved!
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAttendance}
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Filter & Selection Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)] grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block text-slate-500 font-medium mb-1">Class</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-slate-900"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">Section</label>
          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-slate-900"
          >
            {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleMarkAll('present')}>
              All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>
              All Absent
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center gap-4 text-xs font-medium">
        <span className="text-slate-500">Total Enrolled: <strong className="text-slate-900">{students.length}</strong></span>
        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          Present: <strong>{presentCount}</strong>
        </span>
        <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
          Absent: <strong>{absentCount}</strong>
        </span>
      </div>

      {/* Attendance Register Table */}
      <Card title="Daily Roster" subtitle="Toggle attendance status and specify remarks">
        <div className="divide-y divide-slate-100">
          {students.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No students enrolled in this class.</p>
          ) : (
            students.map((student) => {
              const currentStatus = attendanceMap[student.id]?.status || 'present';
              const remarks = attendanceMap[student.id]?.remarks || '';

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

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                    {/* Status Pill Buttons */}
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          currentStatus === 'present' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          currentStatus === 'absent' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          currentStatus === 'late' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'leave')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          currentStatus === 'leave' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Leave
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Optional remarks..."
                      value={remarks}
                      onChange={e => handleRemarksChange(student.id, e.target.value)}
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white w-36 sm:w-44 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

