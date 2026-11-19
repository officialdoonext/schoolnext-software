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
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import { Student, FeePayment, Homework, AttendanceRecord } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const ParentPortal: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stdList = await dbService.getCollection<Student>('students');
      const payList = await dbService.getCollection<FeePayment>('payments');
      const hwList = await dbService.getCollection<Homework>('homework');

      setStudents(stdList);
      if (stdList.length > 0) {
        setSelectedStudent(stdList[0]);
        setPayments(payList.filter(p => p.studentId === stdList[0].id));
      }
      setHomeworkList(hwList);
    };
    load();
  }, []);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setLeaveReason('');
    setTimeout(() => setLeaveSubmitted(false), 3000);
  };

  if (!selectedStudent) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
            Parent Guardian Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Welcome, Mr. {selectedStudent.fatherName}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Access your linked ward's academic progress, attendance records, fee statements, and bus routes.
          </p>
        </div>

        {/* Linked Children Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-300 px-2 font-medium">Child:</span>
          {students.slice(0, 2).map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectStudent(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStudent.id === s.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {s.fullName.split(' ')[0]} ({s.className})
            </button>
          ))}
        </div>
      </div>

      {/* Ward Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Attendance">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600">96.4%</span>
            <CalendarCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">116 days present / 120 total</p>
        </Card>

        <Card title="Term Fees Status">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900">Paid</span>
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">No dues for Quarter 1</p>
        </Card>

        <Card title="Latest Examination">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-brand-600">Grade A1</span>
            <Award className="w-6 h-6 text-brand-500" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">92.5% Aggregate Score</p>
        </Card>

        <Card title="Bus Transport">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-900 truncate">Bus #UP-16-9821</span>
            <Bus className="w-6 h-6 text-sky-600" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Pickup: 06:55 AM (Gate 2)</p>
        </Card>
      </div>

      {/* Grid: Assignments & Fee Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Homework */}
        <Card title="Active Homework & Assignments">
          <div className="divide-y divide-slate-100">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="py-3 flex items-start justify-between text-xs gap-3">
                <div>
                  <Badge variant="brand" size="sm">{hw.subjectName}</Badge>
                  <h4 className="font-bold text-slate-900 mt-1">{hw.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{hw.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-rose-600 font-bold block">{formatDate(hw.dueDate)}</span>
                  <span className="text-[10px] text-slate-400">Due Deadline</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leave Request Form */}
        <Card title="Submit Student Leave Request" subtitle="Inform class teacher of anticipated absence">
          {leaveSubmitted ? (
            <div className="p-6 bg-emerald-50 rounded-xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-emerald-900 text-xs">Leave Application Submitted</p>
              <p className="text-[11px] text-emerald-700">Notification dispatched to Class Teacher (Priya Sharma).</p>
            </div>
          ) : (
            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  required
                  placeholder="e.g. Family function / Medical consultation"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    defaultValue="2026-05-20"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Number of Days</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={leaveDays}
                    onChange={e => setLeaveDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

