import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  BookOpen, 
  Award, 
  Clock, 
  Users, 
  CheckCircle,
  FileText,
  DoorOpen,
  Inbox
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/services/dbService';
import { SchoolClass, Student } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const TeacherPortal: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortal = async () => {
      try {
        setLoading(true);
        const [clsList, stdList, slots] = await Promise.all([
          dbService.getCollection<SchoolClass>('classes'),
          dbService.getCollection<Student>('students'),
          dbService.getCollection<any>('timetables'),
        ]);

        setClasses(clsList);
        setStudents(stdList);

        // Dynamic schedule for today's weekday
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()] || 'Monday';
        const filteredSlots = slots.filter((s: any) => s.day === todayName);
        setTodaySchedule(filteredSlots);
      } catch (err) {
        console.error('Failed to load teacher portal:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPortal();
  }, []);

  const totalStudents = students.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6 w-full">
      {/* Banner */}
      <div className="bg-[#4E2284] rounded p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[11px] font-medium">
            Faculty Teaching Workspace
          </span>
          <h1 className="text-xl font-medium tracking-tight mt-1.5 text-white">
            Welcome, {currentUser?.displayName || 'Faculty Member'}
          </h1>
          <p className="text-white/80 text-xs mt-0.5">
            {classes.length} Active Classes • {totalStudents} Total Students Enrolled
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/attendance/student')}
            icon={<CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />}
            className="bg-white text-slate-800 hover:bg-slate-100 border-none shadow-sm"
          >
            Mark Daily Attendance
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/homework/create')}
            icon={<BookOpen className="w-3.5 h-3.5 text-[#4E2284]" />}
            className="bg-white text-slate-800 hover:bg-slate-100 border-none shadow-sm"
          >
            Assign Homework
          </Button>
        </div>
      </div>

      {/* Assigned Classes */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-3">My Classes & Batches</h3>
        {classes.length === 0 ? (
          <Card>
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Users className="w-8 h-8 text-slate-300 mb-1.5" />
              <span>No classes assigned to this school yet.</span>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const classCount = students.filter(s => s.classId === cls.id).length;
              return (
                <Card key={cls.id} title={cls.name} subtitle={`Class Code: ${cls.code}`}>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Batch Strength:</span>
                      <strong className="text-slate-800 font-medium">{classCount} Enrolled</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Max Capacity:</span>
                      <span className="font-mono text-slate-800">{cls.maxStudents || 40}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <Badge variant="success" size="sm">Active</Badge>
                      <button
                        onClick={() => navigate('/attendance/student')}
                        className="text-[#4E2284] text-[11px] font-medium hover:underline"
                      >
                        Take Attendance &rarr;
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <Card
        title="Today's Teaching Schedule"
        subtitle="Dynamic period lecture slots from timetable register"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/timetables')}>
            Full Timetable
          </Button>
        }
      >
        {todaySchedule.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Clock className="w-8 h-8 text-slate-300 mb-1.5" />
            <span>No lecture periods scheduled for today in the timetable.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todaySchedule.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#4E2284]/10 text-[#4E2284] flex items-center justify-center font-medium">
                    P{item.period}
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-900">{item.subject}</h5>
                    <p className="text-[11px] text-slate-500">{item.teacher} • {item.room}</p>
                  </div>
                </div>
                <Badge variant="info" size="sm">Period {item.period}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
