import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Save, Clock } from 'lucide-react';
import { Staff, StaffAttendanceRecord, AttendanceStatus } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const StaffAttendance: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; checkIn: string }>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      const list = await dbService.getCollection<Staff>('staff');
      setStaffList(list);

      const map: Record<string, { status: AttendanceStatus; checkIn: string }> = {};
      list.forEach(s => {
        map[s.id] = { status: 'present', checkIn: '08:00 AM' };
      });
      setAttendanceMap(map);
    };
    fetchStaff();
  }, [selectedDate]);

  const handleStatusChange = (staffId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], status }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records: StaffAttendanceRecord[] = staffList.map(s => ({
        id: `att_staff_${s.id}_${selectedDate}`,
        schoolId: 'school_next_main_01',
        staffId: s.id,
        staffName: s.fullName,
        employeeId: s.employeeId,
        date: selectedDate,
        status: attendanceMap[s.id]?.status || 'present',
        checkInTime: attendanceMap[s.id]?.checkIn || '08:00 AM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      localStorage.setItem('school_next_db_staff_attendance', JSON.stringify(records));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Faculty Attendance</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitor daily employee check-ins, leaves, and biometric logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium"
          />
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
            Save Staff Register
          </Button>
        </div>
      </div>

      <Card title={`Faculty Roster (${staffList.length} Staff Members)`}>
        <div className="divide-y divide-slate-100">
          {staffList.map(st => {
            const currentStatus = attendanceMap[st.id]?.status || 'present';
            return (
              <div key={st.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    {st.firstName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{st.fullName}</h4>
                    <p className="text-slate-400 font-mono">{st.employeeId} • {st.departmentName} ({st.designationName})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(st.id, 'present')}
                    className={`px-3 py-1 rounded-md font-medium text-xs ${currentStatus === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleStatusChange(st.id, 'absent')}
                    className={`px-3 py-1 rounded-md font-medium text-xs ${currentStatus === 'absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Absent
                  </button>
                  <button
                    onClick={() => handleStatusChange(st.id, 'leave')}
                    className={`px-3 py-1 rounded-md font-medium text-xs ${currentStatus === 'leave' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    On Leave
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

