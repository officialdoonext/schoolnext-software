import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  BookOpen, 
  Award, 
  Clock, 
  Users, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const TeacherPortal: React.FC = () => {
  const navigate = useNavigate();

  const assignedClasses = [
    { class: 'Class 10 - Section A', subject: 'Mathematics', students: 42, room: 'Room 301' },
    { class: 'Class 9 - Section A', subject: 'Mathematics', students: 38, room: 'Room 201' },
    { class: 'Class 8 - Section A', subject: 'Mathematics', students: 40, room: 'Room 101' },
  ];

  const todaySchedule = [
    { period: 'Period 1 (08:00 AM)', class: 'Class 10-A', subject: 'Mathematics', topic: 'Quadratic Equations Ex 4.2' },
    { period: 'Period 2 (08:45 AM)', class: 'Class 9-A', subject: 'Mathematics', topic: 'Number Systems' },
    { period: 'Period 4 (10:45 AM)', class: 'Class 8-A', subject: 'Mathematics', topic: 'Linear Equations' },
    { period: 'Period 6 (12:15 PM)', class: 'Class 10-A', subject: 'Math Doubt Clearing', topic: 'Board Exam Revision' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
            Faculty Teaching Workspace
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Welcome, Priya Sharma (Senior PGT Mathematics)
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Class Teacher for Class 10-A • 3 Assigned Batches • 120 Total Students
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/attendance/student')}
            icon={<CalendarCheck className="w-4 h-4 text-emerald-600" />}
          >
            Mark Daily Attendance
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/homework/create')}
            icon={<BookOpen className="w-4 h-4 text-brand-600" />}
          >
            Assign Homework
          </Button>
        </div>
      </div>

      {/* Assigned Classes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assignedClasses.map((cls, idx) => (
          <Card key={idx} title={cls.class} subtitle={`Subject: ${cls.subject}`}>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Batch Strength:</span>
                <strong className="text-slate-800">{cls.students} Enrolled</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Classroom:</span>
                <span className="font-mono text-slate-800">{cls.room}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/attendance/student')}>
                  Attendance
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/examinations/marks')}>
                  Enter Marks
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's Teaching Schedule */}
      <Card title="Today's Teaching Schedule" subtitle="Live timetable sequence">
        <div className="divide-y divide-slate-100">
          {todaySchedule.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{item.class} • {item.subject}</h4>
                  <p className="text-slate-500 mt-0.5">{item.topic}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-semibold text-slate-700">{item.period}</span>
                <Badge variant="neutral" size="sm">Scheduled</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

