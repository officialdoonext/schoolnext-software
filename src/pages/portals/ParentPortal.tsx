import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Award, 
  BookOpen, 
  Bus, 
  Send, 
  CheckCircle, 
  Inbox,
  AlertCircle 
} from 'lucide-react';
import { Student, FeePayment, FeeStructure, Homework, AttendanceRecord } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const ParentPortal: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);

  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);

  useEffect(() => {
    const loadParentData = async () => {
      const [stdList, payList, structList, attList, marksList, hwList] = await Promise.all([
        dbService.getCollection<Student>('students'),
        dbService.getCollection<FeePayment>('payments'),
        dbService.getCollection<FeeStructure>('feeStructures'),
        dbService.getCollection<AttendanceRecord>('attendance'),
        dbService.getCollection<any>('marks'),
        dbService.getCollection<Homework>('homework'),
      ]);

      setStudents(stdList);
      setFeeStructures(structList);
      setAttendance(attList);
      setMarks(marksList);
      setHomeworkList(hwList);

      if (stdList.length > 0) {
        setSelectedStudent(stdList[0]);
        setPayments(payList.filter(p => p.studentId === stdList[0].id));
      }
    };
    loadParentData();
  }, []);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !leaveReason) return;

    setSubmittingLeave(true);
    try {
      await dbService.createDocument('leaveRequests', {
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName,
        className: selectedStudent.className,
        reason: leaveReason,
        numberOfDays: leaveDays,
        status: 'pending',
        appliedDate: new Date().toISOString().split('T')[0],
      });
      setLeaveSubmitted(true);
      setLeaveReason('');
      setTimeout(() => setLeaveSubmitted(false), 4000);
    } catch (err) {
      console.error('Failed to submit leave request:', err);
    } finally {
      setSubmittingLeave(false);
    }
  };

  if (!selectedStudent) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
        <Users className="w-10 h-10 text-slate-300 mb-2" />
        <span>No student records found linked to parent account.</span>
      </div>
    );
  }

  // 1. Dynamic Attendance Calculation
  const studentAttendance = attendance.filter(a => a.studentId === selectedStudent.id);
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half_day').length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // 2. Dynamic Fee Outstanding
  const studentPayments = payments.filter(p => p.studentId === selectedStudent.id);
  const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  const classFee = feeStructures.find(f => f.classId === selectedStudent.classId)?.totalAmount || 0;
  const dueAmount = Math.max(0, classFee - totalPaid);

  // 3. Dynamic Marks
  const studentMarks = marks.filter(m => m.studentId === selectedStudent.id);
  const totalMarksObtained = studentMarks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
  const totalMaxMarks = studentMarks.reduce((sum, m) => sum + (Number(m.maxMarks) || 100), 0);
  const marksPct = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : null;

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Banner */}
      <div className="bg-[#4E2284] rounded p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[11px] font-medium">
            Parent Guardian Portal
          </span>
          <h1 className="text-xl font-medium tracking-tight mt-1.5 text-white">
            Welcome, {selectedStudent.fatherName ? `Mr. ${selectedStudent.fatherName}` : 'Parent / Guardian'}
          </h1>
          <p className="text-white/80 text-xs mt-0.5">
            Active ward: {selectedStudent.fullName} • Class {selectedStudent.className} ({selectedStudent.sectionName || 'A'})
          </p>
        </div>

        {/* Linked Children Switcher */}
        {students.length > 1 && (
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded border border-white/20">
            <span className="text-xs text-white/80 px-1 font-medium">Child:</span>
            {students.slice(0, 4).map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectStudent(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  selectedStudent.id === s.id
                    ? 'bg-white text-[#4E2284] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {s.fullName.split(' ')[0]} ({s.className})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ward Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Attendance Consistency">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-medium text-emerald-600">
              {totalDays > 0 ? `${attendancePct}%` : 'N/A'}
            </span>
            <CalendarCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {totalDays > 0 ? `${presentDays} days present / ${totalDays} total` : 'No attendance marked yet'}
          </p>
        </Card>

        <Card title="Term Fees Status">
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-medium ${dueAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {dueAmount === 0 ? 'Fully Paid' : formatCurrency(dueAmount)}
            </span>
            <CreditCard className="w-5 h-5 text-[#4E2284]" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {dueAmount === 0 ? 'No outstanding balance' : 'Pending fee dues'}
          </p>
        </Card>

        <Card title="Examination Performance">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-medium text-[#4E2284]">
              {marksPct !== null ? `${marksPct}%` : 'Pending'}
            </span>
            <Award className="w-5 h-5 text-[#4E2284]" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {studentMarks.length > 0 ? `${studentMarks.length} subjects evaluated` : 'Exams not yet scored'}
          </p>
        </Card>

        <Card title="Transport Details">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-slate-900 truncate">
              {(selectedStudent as any).transportRoute || selectedStudent.transportRouteId || 'Self Commute'}
            </span>
            <Bus className="w-5 h-5 text-[#4E2284]" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {selectedStudent.pickupPoint || 'Campus Gate'}
          </p>
        </Card>
      </div>

      {/* Grid: Assignments & Leave Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Homework */}
        <Card title="Assigned Homework & Projects" subtitle="Active curriculum tasks">
          {homeworkList.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
              <span>No homework assigned for this class yet.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {homeworkList.map((hw) => (
                <div key={hw.id} className="py-3 flex items-start justify-between text-xs gap-3">
                  <div>
                    <Badge variant="brand" size="sm">{hw.subjectName}</Badge>
                    <h5 className="font-medium text-slate-900 mt-1">{hw.title}</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{hw.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-rose-600 font-medium block">{formatDate(hw.dueDate)}</span>
                    <span className="text-[10px] text-slate-400">Due Deadline</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Leave Request Form */}
        <Card title="Submit Student Leave Request" subtitle="Dispatches official leave record to class teacher">
          {leaveSubmitted ? (
            <div className="p-6 bg-emerald-50 rounded text-center space-y-2 border border-emerald-100">
              <CheckCircle className="w-7 h-7 text-emerald-600 mx-auto" />
              <p className="font-medium text-emerald-900 text-xs">Leave Application Submitted Successfully</p>
              <p className="text-[11px] text-emerald-700">Recorded in school database for administrative approval.</p>
            </div>
          ) : (
            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason for Absence</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-2.5 focus:outline-none focus:border-[#4E2284]"
                  placeholder="e.g. Medical illness, family function, urgent travel..."
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Number of Days</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={leaveDays}
                  onChange={e => setLeaveDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 max-h-[36px]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={submittingLeave}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  {submittingLeave ? 'Submitting...' : 'Send Leave Application'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
