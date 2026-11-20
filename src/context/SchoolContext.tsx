import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, AcademicYear } from '@/types';
import { dbService } from '@/services/dbService';

interface SchoolStats {
  totalStudents: number;
  totalStaff: number;
  totalTeachers: number;
  totalClasses: number;
  presentStudents: number;
  absentStudents: number;
  todayFeeCollection: number;
  pendingFees: number;
  newAdmissions: number;
}

interface SchoolContextType {
  school: School | null;
  academicYears: AcademicYear[];
  selectedAcademicYear: AcademicYear | null;
  setSelectedAcademicYear: (year: AcademicYear) => void;
  stats: SchoolStats;
  refreshStats: () => Promise<void>;
  loading: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [school, setSchool] = useState<School | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalStaff: 0,
    totalTeachers: 0,
    totalClasses: 0,
    presentStudents: 0,
    absentStudents: 0,
    todayFeeCollection: 0,
    pendingFees: 0,
    newAdmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadSchoolData = async () => {
    try {
      setLoading(true);
      const schools = await dbService.getCollection<School>('schools');
      if (schools.length > 0) {
        setSchool(schools[0]);
      }

      const years = await dbService.getCollection<AcademicYear>('academicYears');
      setAcademicYears(years);
      const current = years.find(y => y.isCurrent) || years[0] || null;
      setSelectedAcademicYear(current);

      await calculateStats();
    } catch (err) {
      console.error('Error loading school context:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    const students = await dbService.getCollection<any>('students');
    const staff = await dbService.getCollection<any>('staff');
    const classes = await dbService.getCollection<any>('classes');
    const payments = await dbService.getCollection<any>('payments');
    const feeStructures = await dbService.getCollection<any>('feeStructures');
    const attendance = await dbService.getCollection<any>('attendance');

    const totalStudents = students.filter(s => s.status === 'active').length;
    const totalStaff = staff.filter(s => s.status === 'active').length;
    const totalTeachers = staff.filter(s => s.role === 'teacher' && s.status === 'active').length;
    const totalClasses = classes.filter(c => c.status === 'active').length;

    // Real dynamic fee calculations
    const todayStr = new Date().toISOString().split('T')[0];
    const todayFeeCollection = payments
      .filter((p: any) => p.paymentDate === todayStr)
      .reduce((sum: number, p: any) => sum + (Number(p.amountPaid) || 0), 0);

    const totalExpectedFee = feeStructures.reduce((sum: number, f: any) => sum + (Number(f.totalAmount) * totalStudents || 0), 0);
    const totalCollectedFee = payments.reduce((sum: number, p: any) => sum + (Number(p.amountPaid) || 0), 0);
    const pendingFees = Math.max(0, totalExpectedFee - totalCollectedFee);

    // Dynamic real attendance for today or latest session
    const todayAttendance = attendance.filter((a: any) => a.date === todayStr);
    const presentStudents = todayAttendance.filter((a: any) => a.status === 'present' || a.status === 'late' || a.status === 'half_day').length;
    const absentStudents = todayAttendance.filter((a: any) => a.status === 'absent').length;

    // Dynamic new admissions (enrolled in current academic year)
    const currentYear = new Date().getFullYear().toString();
    const newAdmissions = students.filter((s: any) => s.admissionDate?.startsWith(currentYear)).length;

    setStats({
      totalStudents,
      totalStaff,
      totalTeachers,
      totalClasses,
      presentStudents,
      absentStudents,
      todayFeeCollection,
      pendingFees,
      newAdmissions,
    });
  };

  useEffect(() => {
    loadSchoolData();

    // Listen for custom change events to re-calculate stats
    const handleDbChange = () => {
      calculateStats();
    };
    window.addEventListener('school_next_db_change', handleDbChange);
    return () => window.removeEventListener('school_next_db_change', handleDbChange);
  }, []);

  return (
    <SchoolContext.Provider value={{
      school,
      academicYears,
      selectedAcademicYear,
      setSelectedAcademicYear,
      stats,
      refreshStats: calculateStats,
      loading
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) throw new Error('useSchool must be used within a SchoolProvider');
  return context;
};

