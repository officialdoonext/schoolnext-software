import React, { useState, useEffect } from 'react';
import { Clock, Calendar, DoorOpen, User, BookOpen, Plus, Save } from 'lucide-react';
import { SchoolClass, Section, Subject, Staff } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

interface TimetableSlot {
  id: string;
  classId: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
}

export const ClassTimetable: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);

  // Assign modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [slotDay, setSlotDay] = useState('Monday');
  const [slotPeriod, setSlotPeriod] = useState(1);
  const [slotSubject, setSlotSubject] = useState('');
  const [slotTeacher, setSlotTeacher] = useState('');
  const [slotRoom, setSlotRoom] = useState('Room 101');
  const [saving, setSaving] = useState(false);

  const fetchTimetables = async () => {
    const list = await dbService.getCollection<TimetableSlot>('timetables');
    setTimetableSlots(list);
  };

  useEffect(() => {
    const load = async () => {
      const [clsList, subList, staffList] = await Promise.all([
        dbService.getCollection<SchoolClass>('classes'),
        dbService.getCollection<Subject>('subjects'),
        dbService.getCollection<Staff>('staff'),
      ]);
      setClasses(clsList);
      setSubjects(subList);
      setStaff(staffList);
      if (clsList.length > 0) setSelectedClassId(clsList[0].id);
      if (subList.length > 0) setSlotSubject(subList[0].name);
      if (staffList.length > 0) setSlotTeacher(staffList[0].fullName);
      await fetchTimetables();
    };
    load();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periodTimes: Record<number, string> = {
    1: '08:00 - 08:45 AM',
    2: '08:45 - 09:30 AM',
    3: '09:30 - 10:15 AM',
    4: '10:45 - 11:30 AM',
    5: '11:30 - 12:15 PM',
    6: '12:15 - 01:00 PM',
    7: '01:00 - 01:45 PM',
  };

  const handleOpenAssignModal = (day: string, period: number) => {
    setSlotDay(day);
    setSlotPeriod(period);
    // check if slot already exists
    const existing = timetableSlots.find(
      s => s.classId === selectedClassId && s.day === day && s.period === period
    );
    if (existing) {
      setSlotSubject(existing.subject);
      setSlotTeacher(existing.teacher);
      setSlotRoom(existing.room);
    }
    setModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !slotSubject) return;

    setSaving(true);
    try {
      const existing = timetableSlots.find(
        s => s.classId === selectedClassId && s.day === slotDay && s.period === slotPeriod
      );

      if (existing) {
        await dbService.updateDocument('timetables', existing.id, {
          subject: slotSubject,
          teacher: slotTeacher,
          room: slotRoom,
        });
      } else {
        await dbService.createDocument('timetables', {
          classId: selectedClassId,
          day: slotDay,
          period: slotPeriod,
          subject: slotSubject,
          teacher: slotTeacher,
          room: slotRoom,
        });
      }

      await fetchTimetables();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save timetable slot:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-slate-900 tracking-tight">Class Timetable Schedule</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Dynamic period schedule and faculty classroom assignments from Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-medium text-slate-700">Select Class:</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded px-3 py-1.5 font-medium max-h-[36px]"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead className="bg-[#4E2284] text-white font-medium">
            <tr>
              <th className="p-3 w-28 border-r border-[#4E2284]/40 font-medium">Day</th>
              <th className="p-3 border-r border-[#4E2284]/40 font-medium">Period 1<br/><span className="text-[10px] text-white/70 font-normal">08:00 AM</span></th>
              <th className="p-3 border-r border-[#4E2284]/40 font-medium">Period 2<br/><span className="text-[10px] text-white/70 font-normal">08:45 AM</span></th>
              <th className="p-3 border-r border-[#4E2284]/40 font-medium">Period 3<br/><span className="text-[10px] text-white/70 font-normal">09:30 AM</span></th>
              <th className="p-3 bg-amber-500/30 text-amber-200 border-r border-[#4E2284]/40 text-center font-medium">BREAK</th>
              <th className="p-3 border-r border-[#4E2284]/40 font-medium">Period 4<br/><span className="text-[10px] text-white/70 font-normal">10:45 AM</span></th>
              <th className="p-3 border-r border-[#4E2284]/40 font-medium">Period 5<br/><span className="text-[10px] text-white/70 font-normal">11:30 AM</span></th>
              <th className="p-3 border-r border-[#4E2284]/40 font-medium">Period 6<br/><span className="text-[10px] text-white/70 font-normal">12:15 PM</span></th>
              <th className="p-3 font-medium">Period 7<br/><span className="text-[10px] text-white/70 font-normal">01:00 PM</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {days.map(day => {
              const getSlot = (period: number) => {
                return timetableSlots.find(
                  s => s.classId === selectedClassId && s.day === day && s.period === period
                );
              };

              const renderSlotCell = (period: number) => {
                const slot = getSlot(period);
                return (
                  <td
                    key={period}
                    onClick={() => handleOpenAssignModal(day, period)}
                    className="p-2.5 border-r border-slate-100 align-top cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    {slot ? (
                      <div>
                        <p className="font-medium text-slate-900 leading-tight">{slot.subject}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{slot.teacher}</p>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                          {slot.room}
                        </span>
                      </div>
                    ) : (
                      <div className="h-12 flex items-center justify-center text-slate-300 hover:text-[#4E2284]">
                        <span className="text-[11px]">+ Assign</span>
                      </div>
                    )}
                  </td>
                );
              };

              return (
                <tr key={day} className="hover:bg-slate-50/60">
                  <td className="p-3 font-medium text-slate-900 bg-slate-50 border-r border-slate-200">
                    {day}
                  </td>
                  {renderSlotCell(1)}
                  {renderSlotCell(2)}
                  {renderSlotCell(3)}
                  {/* Break slot */}
                  <td className="p-2 text-center bg-amber-50/50 text-[10px] font-medium text-amber-700 border-r border-slate-100">
                    Snacks
                  </td>
                  {renderSlotCell(4)}
                  {renderSlotCell(5)}
                  {renderSlotCell(6)}
                  {renderSlotCell(7)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Assign / Edit Slot Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Assign Timetable: ${slotDay} (Period ${slotPeriod})`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Subject</label>
            <select
              value={slotSubject}
              onChange={e => setSlotSubject(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 font-medium max-h-[36px]"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Teacher</label>
            <select
              value={slotTeacher}
              onChange={e => setSlotTeacher(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 font-medium max-h-[36px]"
              required
            >
              <option value="">Select Faculty</option>
              {staff.map(st => <option key={st.id} value={st.fullName}>{st.fullName} ({st.departmentName})</option>)}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Classroom / Room Number</label>
            <input
              type="text"
              value={slotRoom}
              onChange={e => setSlotRoom(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 max-h-[36px]"
              placeholder="e.g. Room 301, Physics Lab"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving} icon={<Save className="w-3.5 h-3.5" />}>
              {saving ? 'Saving...' : 'Save Period'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
