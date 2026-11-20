import React, { useState, useEffect } from 'react';
import { Award, Printer, Download, CheckCircle } from 'lucide-react';
import { Student, Subject, SchoolClass, GradeScale } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const ReportCardGenerator: React.FC = () => {
  const { school, selectedAcademicYear } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [marks, setMarks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const stdList = await dbService.getCollection<Student>('students');
      const subList = await dbService.getCollection<Subject>('subjects');
      const marksList = await dbService.getCollection<any>('marks');
      setStudents(stdList);
      setSubjects(subList);
      setMarks(marksList);
      if (stdList.length > 0) setSelectedStudentId(stdList[0].id);
    };
    load();
  }, []);

  const activeStudent = students.find(s => s.id === selectedStudentId);

  // Dynamic real marks from database
  const subjectMarks = subjects.map((sub) => {
    const record = marks.find(m => m.studentId === selectedStudentId && m.subjectId === sub.id);
    const marksObtained = record ? Number(record.marksObtained) : null;
    let grade = '--';
    if (marksObtained !== null) {
      const pct = (marksObtained / sub.maxMarks) * 100;
      if (pct >= 91) grade = 'A1';
      else if (pct >= 81) grade = 'A2';
      else if (pct >= 71) grade = 'B1';
      else if (pct >= 61) grade = 'B2';
      else if (pct >= 51) grade = 'C1';
      else if (pct >= 41) grade = 'C2';
      else if (pct >= 33) grade = 'D';
      else grade = 'E';
    }
    return {
      name: sub.name,
      code: sub.code,
      max: sub.maxMarks,
      obtained: marksObtained,
      grade,
    };
  });

  const evaluatedSubjects = subjectMarks.filter(s => s.obtained !== null);
  const totalMax = evaluatedSubjects.reduce((sum, s) => sum + s.max, 0);
  const totalObtained = evaluatedSubjects.reduce((sum, s) => sum + (s.obtained || 0), 0);
  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;
  const overallGrade = overallPct !== null
    ? overallPct >= 91 ? 'A1 (Outstanding)' : overallPct >= 81 ? 'A2 (Excellent)' : overallPct >= 71 ? 'B1 (Very Good)' : 'B2 (Good)'
    : 'Pending Evaluation';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Control Bar - hidden during print */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Official Student Report Cards</h1>
          <p className="text-xs text-slate-500 mt-0.5">CBSE format cumulative evaluation and grade certificate</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.className}-{s.sectionName})
              </option>
            ))}
          </select>

          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print Report Card
          </Button>
        </div>
      </div>

      {/* Official Report Card Printable Document */}
      {activeStudent && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-lg print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-lg">
                SN
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {school?.name || 'School Next International Academy'}
              </h2>
            </div>
            <p className="text-xs text-slate-600">{school?.address}, {school?.city}, {school?.state} - {school?.pinCode}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Affiliated to CBSE, New Delhi (Affiliation No: {school?.affiliationNumber || 'CBSE/AFF/2130894'})
            </p>
            <div className="mt-3">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                Annual Academic Performance Statement • Session 2026-2027
              </span>
            </div>
          </div>

          {/* Student Bio Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Student Name:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{activeStudent.fullName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Class & Section:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{activeStudent.className} ({activeStudent.sectionName})</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Admission Number:</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{activeStudent.admissionNumber}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Roll Number:</span>
              <p className="font-bold text-slate-900 mt-0.5">#{activeStudent.rollNumber}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Father's Name:</span>
              <p className="font-medium text-slate-800 mt-0.5">{activeStudent.fatherName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Mother's Name:</span>
              <p className="font-medium text-slate-800 mt-0.5">{activeStudent.motherName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Attendance Rate:</span>
              <p className="font-bold text-emerald-600 mt-0.5">96.4% (116 / 120 Days)</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Date of Birth:</span>
              <p className="font-medium text-slate-800 mt-0.5">{activeStudent.dob}</p>
            </div>
          </div>

          {/* Marks Table */}
          <div className="py-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Part 1: Scholastic Areas (Academic Achievement)
            </h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Subject Code</th>
                  <th className="p-2.5">Subject Name</th>
                  <th className="p-2.5 text-center">Maximum Marks</th>
                  <th className="p-2.5 text-center">Marks Obtained</th>
                  <th className="p-2.5 text-center">Percentage</th>
                  <th className="p-2.5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {subjectMarks.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono">{sub.code}</td>
                    <td className="p-2.5 font-bold text-slate-900">{sub.name}</td>
                    <td className="p-2.5 text-center font-mono">{sub.max}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-900">{sub.obtained !== null ? sub.obtained : '--'}</td>
                    <td className="p-2.5 text-center font-mono">{sub.obtained !== null ? `${Math.round((sub.obtained / sub.max) * 100)}%` : '--'}</td>
                    <td className="p-2.5 text-center font-bold text-brand-600">{sub.grade}</td>
                  </tr>
                ))}
                {/* Grand Total Row */}
                <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="p-3 text-right uppercase tracking-wider">Grand Aggregate Total:</td>
                  <td className="p-3 text-center font-mono">{totalMax}</td>
                  <td className="p-3 text-center font-mono text-emerald-700 text-sm">{totalObtained}</td>
                  <td className="p-3 text-center font-mono text-sm">{overallPct}%</td>
                  <td className="p-3 text-center font-black text-brand-700">{overallGrade.split(' ')[0]}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Result & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <p><span className="text-slate-400 font-medium">Result Status:</span> <strong className="text-emerald-700 text-sm">QUALIFIED & PROMOTED</strong></p>
              <p className="mt-1"><span className="text-slate-400 font-medium">Class Teacher Remarks:</span> <span className="text-slate-800 italic">"Exceptional analytical understanding and classroom participation. Highly recommended."</span></p>
            </div>
            <div>
              <p><span className="text-slate-400 font-medium">Grading System:</span> <span className="text-slate-600 font-mono">A1 (91-100), A2 (81-90), B1 (71-80), B2 (61-70)</span></p>
              <p className="mt-1"><span className="text-slate-400 font-medium">Co-Curricular:</span> <span className="text-slate-800">Robotics Club Captain, Cricket Team</span></p>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-12 text-xs text-slate-500">
            <div className="text-center">
              <span className="font-mono text-slate-800 italic block">Priya Sharma</span>
              <p className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Class Teacher Signature</p>
            </div>
            <div className="text-center">
              <span className="font-mono text-slate-800 italic block">Dr. Rajesh Sharma</span>
              <p className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Principal Signature & Seal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

