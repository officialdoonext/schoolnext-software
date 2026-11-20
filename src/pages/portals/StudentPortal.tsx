import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  Clock, 
  FileCheck,
  CheckCircle,
  Inbox
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/services/dbService';
import { Student, Homework, AttendanceRecord } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatDate } from '@/utils/formatters';

export const StudentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const [stdList, hwList, attList, marksList] = await Promise.all([
          dbService.getCollection<Student>('students'),
          dbService.getCollection<Homework>('homework'),
          dbService.getCollection<AttendanceRecord>('attendance'),
          dbService.getCollection<any>('marks'),
        ]);

        if (stdList.length > 0) {
          setStudent(stdList[0]);
          const studentAtt = attList.filter(a => a.studentId === stdList[0].id);
          setAttendance(studentAtt);
          const studentMarks = marksList.filter((m: any) => m.studentId === stdList[0].id);
          setMarks(studentMarks);
        }
        setHomeworkList(hwList);
      } catch (err) {
        console.error('Failed to load student portal:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  if (!student) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
        <GraduationCap className="w-10 h-10 text-slate-300 mb-2" />
        <span>No active student record linked to account.</span>
      </div>
    );
  }

  // Attendance computation
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half_day').length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Marks computation
  const totalObtained = marks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
  const totalMax = marks.reduce((sum, m) => sum + (Number(m.maxMarks) || 100), 0);
  const aggregateScore = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;

  return (
    <div className="space-y-6 w-full">
      {/* Student Banner */}
      <div className="bg-[#4E2284] rounded p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-white/10 border border-white/20 flex items-center justify-center font-medium text-lg text-white">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[11px] font-medium">
              Student Learning Desk
            </span>
            <h1 className="text-xl font-medium tracking-tight mt-1 text-white">
              {student.fullName}
            </h1>
            <p className="text-white/80 text-xs mt-0.5">
              Class {student.className} - Section {student.sectionName || 'A'} • Roll #{student.rollNumber} • Admission #{student.admissionNumber}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/examinations/report-cards')}
          icon={<Award className="w-3.5 h-3.5 text-[#4E2284]" />}
          className="bg-white text-[#4E2284] hover:bg-slate-100 border-none shadow-sm"
        >
          View My Report Card
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Attendance Consistency">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-medium text-emerald-600">
              {totalDays > 0 ? `${attendancePct}%` : 'N/A'}
            </span>
            <CalendarCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {totalDays > 0 ? `${presentDays} days present out of ${totalDays} working days` : 'No attendance recorded yet'}
          </p>
        </Card>

        <Card title="Academic Aggregate">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-medium text-[#4E2284]">
              {aggregateScore !== null ? `${aggregateScore}%` : 'Pending'}
            </span>
            <Award className="w-5 h-5 text-[#4E2284]" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {marks.length > 0 ? `${marks.length} subjects recorded in official evaluations` : 'Term examination results awaiting evaluation'}
          </p>
        </Card>

        <Card title="Homework Assigned">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-medium text-indigo-600">
              {homeworkList.length}
            </span>
            <FileCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {homeworkList.length} active subject tasks from teachers
          </p>
        </Card>
      </div>

      {/* Homework Tasks List */}
      <Card title="Assigned Homework & Deadlines" subtitle="Upcoming subject assignments from faculty">
        {homeworkList.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
            <span>No homework tasks currently assigned.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm">{hw.subjectName}</Badge>
                    <h5 className="font-medium text-slate-900">{hw.title}</h5>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">{hw.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-rose-600 font-medium block">{formatDate(hw.dueDate)}</span>
                  <span className="text-[10px] text-slate-400">Due Date</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
