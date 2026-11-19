import React, { useState, useEffect } from 'react';
import { Clock, Calendar, DoorOpen, User, BookOpen } from 'lucide-react';
import { SchoolClass, Section } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

export const ClassTimetable: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_10');

  useEffect(() => {
    const load = async () => {
      const cls = await dbService.getCollection<SchoolClass>('classes');
      setClasses(cls);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
    };
    load();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [
    { period: 1, time: '08:00 - 08:45 AM' },
    { period: 2, time: '08:45 - 09:30 AM' },
    { period: 3, time: '09:30 - 10:15 AM' },
    { period: 'BREAK', time: '10:15 - 10:45 AM' },
    { period: 4, time: '10:45 - 11:30 AM' },
    { period: 5, time: '11:30 - 12:15 PM' },
    { period: 6, time: '12:15 - 01:00 PM' },
    { period: 7, time: '01:00 - 01:45 PM' },
  ];

  // Schedule matrix
  const timetableMatrix: Record<string, { subject: string; teacher: string; room: string }[]> = {
    Monday: [
      { subject: 'Mathematics', teacher: 'Priya Sharma', room: 'Room 301' },
      { subject: 'Science (Lab)', teacher: 'Amit Verma', room: 'Physics Lab' },
      { subject: 'English', teacher: 'Sunita Rao', room: 'Room 301' },
      { subject: 'Social Studies', teacher: 'Deepak Patel', room: 'Room 301' },
      { subject: 'Hindi', teacher: 'Kavita Joshi', room: 'Room 301' },
      { subject: 'Computer Sci', teacher: 'Rohan Mehra', room: 'IT Lab 2' },
      { subject: 'Physical Ed', teacher: 'Vikram Singh', room: 'Ground' },
    ],
    Tuesday: [
      { subject: 'Science', teacher: 'Amit Verma', room: 'Room 301' },
      { subject: 'Mathematics', teacher: 'Priya Sharma', room: 'Room 301' },
      { subject: 'English', teacher: 'Sunita Rao', room: 'Room 301' },
      { subject: 'Computer Sci', teacher: 'Rohan Mehra', room: 'IT Lab 2' },
      { subject: 'Social Studies', teacher: 'Deepak Patel', room: 'Room 301' },
      { subject: 'Art & Craft', teacher: 'Shalini Roy', room: 'Art Studio' },
      { subject: 'Library', teacher: 'Sunita Rao', room: 'Library' },
    ],
    Wednesday: [
      { subject: 'English', teacher: 'Sunita Rao', room: 'Room 301' },
      { subject: 'Mathematics', teacher: 'Priya Sharma', room: 'Room 301' },
      { subject: 'Science (Chem)', teacher: 'Amit Verma', room: 'Chem Lab' },
      { subject: 'Social Studies', teacher: 'Deepak Patel', room: 'Room 301' },
      { subject: 'Hindi', teacher: 'Kavita Joshi', room: 'Room 301' },
      { subject: 'Robotics Club', teacher: 'Rohan Mehra', room: 'STEM Lab' },
      { subject: 'Games', teacher: 'Vikram Singh', room: 'Sports Arena' },
    ],
    Thursday: [
      { subject: 'Mathematics', teacher: 'Priya Sharma', room: 'Room 301' },
      { subject: 'Science', teacher: 'Amit Verma', room: 'Room 301' },
      { subject: 'Social Studies', teacher: 'Deepak Patel', room: 'Room 301' },
      { subject: 'English', teacher: 'Sunita Rao', room: 'Room 301' },
      { subject: 'Hindi', teacher: 'Kavita Joshi', room: 'Room 301' },
      { subject: 'Music', teacher: 'Anand Kumar', room: 'Music Hall' },
      { subject: 'Value Education', teacher: 'Dr. Rajesh Sharma', room: 'Room 301' },
    ],
    Friday: [
      { subject: 'Science (Bio)', teacher: 'Amit Verma', room: 'Bio Lab' },
      { subject: 'Mathematics', teacher: 'Priya Sharma', room: 'Room 301' },
      { subject: 'English', teacher: 'Sunita Rao', room: 'Room 301' },
      { subject: 'Computer Sci', teacher: 'Rohan Mehra', room: 'IT Lab 2' },
      { subject: 'Social Studies', teacher: 'Deepak Patel', room: 'Room 301' },
      { subject: 'Debate / Drama', teacher: 'Sunita Rao', room: 'Auditorium' },
      { subject: 'Club Activity', teacher: 'Faculty', room: 'Campus' },
    ],
    Saturday: [
      { subject: 'Mathematics Test', teacher: 'Priya Sharma', room: 'Room 301' },
      { subject: 'Science Quiz', teacher: 'Amit Verma', room: 'Room 301' },
      { subject: 'Remedial Class', teacher: 'Deepak Patel', room: 'Room 301' },
      { subject: 'House Sports', teacher: 'Vikram Singh', room: 'Main Ground' },
      { subject: 'Assembly', teacher: 'Principal', room: 'Auditorium' },
      { subject: 'Self Study', teacher: 'Class Teacher', room: 'Room 301' },
      { subject: 'Dispersal', teacher: 'Staff', room: 'Gate' },
    ],
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Class Timetable Schedule</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Weekly period schedule, room allocations, and faculty conflict prevention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Class:</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} - Section A</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead className="bg-slate-900 text-white font-semibold">
            <tr>
              <th className="p-3 w-28 border-r border-slate-800">Day</th>
              <th className="p-3 border-r border-slate-800">Period 1<br/><span className="text-[10px] text-slate-400 font-normal">08:00 AM</span></th>
              <th className="p-3 border-r border-slate-800">Period 2<br/><span className="text-[10px] text-slate-400 font-normal">08:45 AM</span></th>
              <th className="p-3 border-r border-slate-800">Period 3<br/><span className="text-[10px] text-slate-400 font-normal">09:30 AM</span></th>
              <th className="p-3 bg-amber-500/20 text-amber-300 border-r border-slate-800 text-center">BREAK</th>
              <th className="p-3 border-r border-slate-800">Period 4<br/><span className="text-[10px] text-slate-400 font-normal">10:45 AM</span></th>
              <th className="p-3 border-r border-slate-800">Period 5<br/><span className="text-[10px] text-slate-400 font-normal">11:30 AM</span></th>
              <th className="p-3 border-r border-slate-800">Period 6<br/><span className="text-[10px] text-slate-400 font-normal">12:15 PM</span></th>
              <th className="p-3">Period 7<br/><span className="text-[10px] text-slate-400 font-normal">01:00 PM</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {days.map(day => {
              const slots = timetableMatrix[day] || [];
              return (
                <tr key={day} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                    {day}
                  </td>
                  {slots.slice(0, 3).map((slot, idx) => (
                    <td key={idx} className="p-2.5 border-r border-slate-100 align-top">
                      <p className="font-bold text-slate-900">{slot.subject}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{slot.teacher}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                        {slot.room}
                      </span>
                    </td>
                  ))}
                  {/* Break slot */}
                  <td className="p-2 text-center bg-amber-50/50 text-[10px] font-bold text-amber-700 border-r border-slate-100">
                    Snacks
                  </td>
                  {slots.slice(3, 7).map((slot, idx) => (
                    <td key={idx} className="p-2.5 border-r border-slate-100 align-top last:border-r-0">
                      <p className="font-bold text-slate-900">{slot.subject}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{slot.teacher}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                        {slot.room}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

