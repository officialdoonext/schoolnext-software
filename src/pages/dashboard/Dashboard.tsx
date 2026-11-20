import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  AlertCircle, 
  UserPlus, 
  Layers,
  Calendar,
  CreditCard,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useSchool } from '@/context/SchoolContext';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/services/dbService';
import { Student, FeePayment, SchoolClass, AttendanceRecord, Announcement } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const Dashboard: React.FC = () => {
  const { stats, school, selectedAcademicYear } = useSchool();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);
        const [payList, stdList, clsList, attList, annList] = await Promise.all([
          dbService.getCollection<FeePayment>('payments'),
          dbService.getCollection<Student>('students'),
          dbService.getCollection<SchoolClass>('classes'),
          dbService.getCollection<AttendanceRecord>('attendance'),
          dbService.getCollection<Announcement>('announcements'),
        ]);

        setPayments(payList);
        setStudents(stdList);
        setClasses(clsList);
        setAttendance(attList);
        setAnnouncements(annList);
      } catch (err) {
        console.error('Failed to load dynamic dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 1. Dynamic Monthly Fee Collections
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyFeeData = months.map(m => {
    const monthPayments = payments.filter(p => {
      if (!p.paymentDate) return false;
      const date = new Date(p.paymentDate);
      return !isNaN(date.getTime()) && date.toLocaleString('en-US', { month: 'short' }) === m;
    });
    const collected = monthPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const target = collected > 0 ? Math.round(collected * 1.15) : 0;
    return { month: m, collected, target };
  });

  // 2. Dynamic Class Distribution
  const classDistributionMap: Record<string, number> = {};
  classes.forEach(c => {
    classDistributionMap[c.name] = 0;
  });
  students.forEach(s => {
    const cName = s.className || 'Unassigned';
    classDistributionMap[cName] = (classDistributionMap[cName] || 0) + 1;
  });
  const classDistributionData = Object.entries(classDistributionMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 3. Dynamic Gender Breakdown
  const boysCount = students.filter(s => s.gender === 'male').length;
  const girlsCount = students.filter(s => s.gender === 'female').length;
  const totalWithGender = boysCount + girlsCount || 1;
  const boysPct = Math.round((boysCount / totalWithGender) * 100);
  const girlsPct = Math.round((girlsCount / totalWithGender) * 100);
  const genderData = [
    { name: 'Boys', value: boysCount, color: '#4E2284' },
    { name: 'Girls', value: girlsCount, color: '#A855F7' },
  ];

  // 4. Dynamic Attendance Trend (Last 6 Days)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const attendanceTrendData = daysOfWeek.map(day => {
    const dayRecords = attendance.filter(a => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return !isNaN(d.getTime()) && d.toLocaleDateString('en-US', { weekday: 'short' }) === day;
    });
    if (dayRecords.length === 0) {
      return { day, present: 0, absent: 0 };
    }
    const presentCount = dayRecords.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'half_day').length;
    const presentPct = Math.round((presentCount / dayRecords.length) * 100);
    return {
      day,
      present: presentPct,
      absent: 100 - presentPct,
    };
  });

  return (
    <div className="space-y-5 w-full">
      {/* Top Banner / Welcome Header: Primary #4E2284 */}
      <div className="bg-[#4E2284] rounded p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[11px] font-medium">
              Academic Session {selectedAcademicYear?.name || '2026-2027'}
            </span>
            <span className="text-xs text-white/70">|</span>
            <span className="text-xs text-white/90 capitalize font-medium">{currentUser?.displayName || 'Administrator'}</span>
          </div>
          <h1 className="text-xl font-medium tracking-tight mt-1.5 text-white">
            {school?.name || 'School Next ERP'}
          </h1>
          <p className="text-white/80 text-xs mt-0.5">
            Real-time analytics and management dashboard for academic operations, attendance tracking, and fee collections.
          </p>
        </div>

        {/* Quick Action Buttons: max-h-[36px] */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/students/add')}
            icon={<UserPlus className="w-3.5 h-3.5 text-[#4E2284]" />}
            className="bg-white text-[#4E2284] hover:bg-slate-100 border-none shadow-sm"
          >
            Admit Student
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/attendance/student')}
            icon={<Calendar className="w-3.5 h-3.5 text-[#4E2284]" />}
            className="bg-white text-[#4E2284] hover:bg-slate-100 border-none shadow-sm"
          >
            Attendance
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/fees/collection')}
            icon={<CreditCard className="w-3.5 h-3.5 text-[#4E2284]" />}
            className="bg-white text-[#4E2284] hover:bg-slate-100 border-none shadow-sm"
          >
            Collect Fees
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<GraduationCap className="w-5 h-5" />}
          colorScheme="primary"
          subtitle="Enrolled students"
        />
        <StatCard
          title="Total Faculty"
          value={stats.totalTeachers}
          icon={<Users className="w-5 h-5" />}
          colorScheme="blue"
          subtitle={`${stats.totalStaff} total staff members`}
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.presentStudents}`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="emerald"
          subtitle={`${stats.absentStudents} absent recorded`}
        />
        <StatCard
          title="Today's Fee Collection"
          value={formatCurrency(stats.todayFeeCollection)}
          icon={<IndianRupee className="w-5 h-5" />}
          colorScheme="amber"
          subtitle="Real-time verified collections"
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(stats.pendingFees)}
          icon={<AlertCircle className="w-5 h-5" />}
          colorScheme="rose"
          subtitle="Outstanding receivables"
        />
      </div>

      {/* Analytical Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Fee Collection Trend */}
        <Card
          className="lg:col-span-2"
          title="Monthly Fee Collection Analytics"
          subtitle="Monthly collections from Firestore verified payments (in ₹)"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/fees/collection')}>
              View Collections <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="h-64 w-full pt-3">
            {payments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
                <span>No fee collection payments recorded yet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFeeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                    contentStyle={{ backgroundColor: '#4E2284', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
                  />
                  <Bar dataKey="collected" fill="#4E2284" radius={[4, 4, 0, 0]} name="Collected" />
                  <Bar dataKey="target" fill="#C4B5FD" radius={[4, 4, 0, 0]} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Gender Demographics */}
        <Card
          title="Student Gender Ratio"
          subtitle="Dynamic enrollment breakdown from student records"
        >
          <div className="h-56 w-full flex items-center justify-center">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                <Users className="w-8 h-8 text-slate-300 mb-1.5" />
                <span>No enrolled students yet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#4E2284', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {students.length > 0 && (
            <div className="flex justify-center gap-5 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#4E2284]" />
                <span className="text-slate-600">Boys ({boysPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#A855F7]" />
                <span className="text-slate-600">Girls ({girlsPct}%)</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Row 2: Attendance Weekly Trend & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="Weekly Attendance Consistency"
          subtitle="Dynamic daily student attendance from attendance register"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendance/reports')}>
              Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="h-60 w-full pt-3">
            {attendance.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 text-slate-300 mb-1.5" />
                <span>No attendance sessions saved yet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#4E2284', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10B981' }}
                    name="Present %"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Student Count per Class */}
        <Card
          title="Student Distribution By Class"
          subtitle="Enrolled active strength per class"
        >
          <div className="h-60 w-full pt-3">
            {classDistributionData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Layers className="w-8 h-8 text-slate-300 mb-1.5" />
                <span>No classes or sections configured yet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#4E2284', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#4E2284" radius={[0, 4, 4, 0]} name="Strength" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Activities & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card
          className="lg:col-span-2"
          title="Recent Fee Transactions"
          subtitle="Real-time verified payments from Firestore"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/fees/collection')}>
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          {payments.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
              <CreditCard className="w-8 h-8 text-slate-300 mb-1.5" />
              <span>No fee transactions recorded yet. Click "Collect Fees" to record a receipt.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.slice(0, 5).map((pay) => (
                <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#4E2284]/10 text-[#4E2284] flex items-center justify-center font-medium">
                      ₹
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{pay.studentName}</p>
                      <p className="text-slate-400 text-[11px]">
                        Receipt #{pay.receiptNumber} • {pay.paymentMethod} {pay.paymentDate ? `• ${formatDate(pay.paymentDate)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-slate-900">{formatCurrency(pay.amountPaid)}</span>
                    <span className="block text-[10px] text-emerald-600 font-medium capitalize">
                      {pay.status || 'Completed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Campus Announcements */}
        <Card
          title="Campus Announcements"
          subtitle="Latest published official school notices"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/homework')}>
              Notice Board
            </Button>
          }
        >
          {announcements.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
              <span>No announcements published yet.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {announcements.slice(0, 4).map((ann) => (
                <div key={ann.id} className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" size="sm">{ann.targetAudience || 'General'}</Badge>
                    <span className="text-[10px] text-slate-400">{formatDate(ann.publishDate)}</span>
                  </div>
                  <h5 className="font-medium text-slate-900 mt-1.5">{ann.title}</h5>
                  <p className="text-slate-500 mt-0.5 line-clamp-2 text-[11px]">
                    {ann.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
