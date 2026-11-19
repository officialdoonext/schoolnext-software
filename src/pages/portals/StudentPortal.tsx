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
  Download
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const StudentPortal: React.FC = () => {
  const navigate = useNavigate();

  const homework = [
    { subject: 'Mathematics', title: 'Quadratic Equations Exercise 4.2', due: '12 May 2026', status: 'Submitted' },
    { subject: 'Science', title: 'Chemical Reactions Practical Lab File', due: '14 May 2026', status: 'Pending' },
    { subject: 'English', title: 'Essay on Artificial Intelligence in Education', due: '18 May 2026', status: 'Pending' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-2xl text-sky-300">
            A
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
              Student Dashboard
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-1 text-white">
              Aarav Kumar Singh
            </h1>
            <p className="text-slate-300 text-xs mt-0.5">
              Class 10 - Section A • Roll #101 • Admission #ADM-2026-1001
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/examinations/report-cards')}
          icon={<Award className="w-4 h-4 text-brand-600" />}
        >
          View My Report Card
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card title="Attendance Consistency">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-emerald-600">96.4%</span>
            <CalendarCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 mt-2">116 Days Present (Well above 75% CBSE requirement)</p>
        </Card>

        <Card title="Academic Rank & GPA">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-brand-600">Rank #4</span>
            <Award className="w-8 h-8 text-brand-500" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Grade A1 (92.5% Aggregate Score)</p>
        </Card>

        <Card title="Homework Completed">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-indigo-600">18 / 20</span>
            <FileCheck className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-xs text-slate-500 mt-2">90% submission completion rate</p>
        </Card>
      </div>

      {/* Homework Tasks List */}
      <Card title="Assigned Homework & Deadlines" subtitle="Upcoming subject assignments">
        <div className="divide-y divide-slate-100">
          {homework.map((hw, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="sm">{hw.subject}</Badge>
                  <h4 className="font-bold text-slate-900">{hw.title}</h4>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">Due Deadline: {hw.due}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={hw.status === 'Submitted' ? 'success' : 'warning'} size="sm" dot>
                  {hw.status}
                </Badge>
                {hw.status === 'Pending' && (
                  <Button variant="primary" size="sm">
                    Submit Solution
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

