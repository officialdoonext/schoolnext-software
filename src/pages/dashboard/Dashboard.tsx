import React from 'react';
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
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileCheck
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
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const Dashboard: React.FC = () => {
  const { stats, school } = useSchool();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Recharts Analytics Datasets
  const monthlyFeeData = [
    { month: 'Apr', collected: 1250000, target: 1400000 },
    { month: 'May', collected: 1420000, target: 1400000 },
    { month: 'Jun', collected: 980000, target: 1100000 },
    { month: 'Jul', collected: 1650000, target: 1500000 },
    { month: 'Aug', collected: 1300000, target: 1350000 },
    { month: 'Sep', collected: 1780000, target: 1600000 },
    { month: 'Oct', collected: 1540000, target: 1500000 },
    { month: 'Nov', collected: 1890000, target: 1700000 },
  ];

  const attendanceTrendData = [
    { day: 'Mon', present: 95, absent: 5 },
    { day: 'Tue', present: 93, absent: 7 },
    { day: 'Wed', present: 96, absent: 4 },
    { day: 'Thu', present: 92, absent: 8 },
    { day: 'Fri', present: 94, absent: 6 },
    { day: 'Sat', present: 89, absent: 11 },
  ];

  const classDistributionData = [
    { name: 'Class 6', count: 42 },
    { name: 'Class 7', count: 45 },
    { name: 'Class 8', count: 40 },
    { name: 'Class 9', count: 48 },
    { name: 'Class 10', count: 52 },
  ];

  const genderData = [
    { name: 'Boys', value: 128, color: '#2563EB' },
    { name: 'Girls', value: 112, color: '#EC4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
              Active Session 2026-2027
            </span>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-slate-300 capitalize">Logged as {currentUser?.displayName}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Welcome to {school?.name || 'School Next ERP'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Real-time analytics and management dashboard for academic operations, attendance tracking, fee collections, and administrative workflows.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/students/add')}
            icon={<UserPlus className="w-4 h-4 text-brand-600" />}
          >
            New Admission
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/fees/collection')}
            icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
          >
            Collect Fees
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/attendance/student')}
            icon={<Calendar className="w-4 h-4 text-sky-600" />}
          >
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* 9 Core Statistics Cards (Calculated directly from active Firestore / state) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<GraduationCap className="w-6 h-6" />}
          colorScheme="blue"
          trend={{ value: '+4.2%', isPositive: true }}
          subtitle="Enrolled across 10 classes"
        />
        <StatCard
          title="Total Staff"
          value={stats.totalStaff}
          icon={<Briefcase className="w-6 h-6" />}
          colorScheme="slate"
          trend={{ value: '100% active', isPositive: true }}
          subtitle={`${stats.totalTeachers} Teaching faculty`}
        />
        <StatCard
          title="Present Today"
          value={stats.presentStudents}
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="emerald"
          subtitle="94% overall attendance"
        />
        <StatCard
          title="Absent Today"
          value={stats.absentStudents}
          icon={<XCircle className="w-6 h-6" />}
          colorScheme="rose"
          subtitle="Parent alerts dispatched"
        />
        <StatCard
          title="Today's Collection"
          value={formatCurrency(stats.todayFeeCollection || 55500)}
          icon={<IndianRupee className="w-6 h-6" />}
          colorScheme="emerald"
          trend={{ value: '+12.5%', isPositive: true }}
          subtitle="Cash, UPI & Bank Transfer"
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(stats.pendingFees || 84200)}
          icon={<AlertCircle className="w-6 h-6" />}
          colorScheme="amber"
          subtitle="Upcoming quarterly terms"
        />
        <StatCard
          title="Active Classes"
          value={stats.totalClasses}
          icon={<Layers className="w-6 h-6" />}
          colorScheme="indigo"
          subtitle="Primary & Senior wings"
        />
        <StatCard
          title="New Admissions"
          value={stats.newAdmissions}
          icon={<UserPlus className="w-6 h-6" />}
          colorScheme="blue"
          trend={{ value: '+18.4%', isPositive: true }}
          subtitle="Current academic session"
        />
      </div>

      {/* Analytical Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Fee Collection Trend */}
        <Card
          className="lg:col-span-2"
          title="Monthly Fee Collection Analytics"
          subtitle="Track monthly fee collections against quarterly targets (in ₹)"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/fees/collection')}>
              View Collections <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFeeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 100000}L`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="collected" fill="#0F172A" radius={[4, 4, 0, 0]} name="Collected" />
                <Bar dataKey="target" fill="#93C5FD" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gender Demographics */}
        <Card
          title="Student Gender Ratio"
          subtitle="Class enrollment breakdown"
        >
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-slate-600">Boys (53%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-slate-600">Girls (47%)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Attendance Weekly Trend & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Weekly Attendance Consistency"
          subtitle="Average daily student attendance percentage"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendance/reports')}>
              Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis domain={[80, 100]} stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                  name="Present %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Student Count per Class */}
        <Card
          title="Student Distribution By Class"
          subtitle="Enrolled strength in secondary classes"
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Strength" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Activities & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Fee Payments */}
        <Card
          className="lg:col-span-2"
          title="Recent Fee Transactions"
          subtitle="Latest verified fee receipts"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/fees/collection')}>
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Aarav Kumar Singh (Class 10-A)</p>
                  <p className="text-slate-400">Receipt #RCP-2026-0001 • UPI Payment</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{formatCurrency(27000)}</span>
                <span className="block text-[10px] text-emerald-600 font-medium">Completed</span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Ananya Deshmukh (Class 10-A)</p>
                  <p className="text-slate-400">Receipt #RCP-2026-0002 • Net Banking</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{formatCurrency(28500)}</span>
                <span className="block text-[10px] text-emerald-600 font-medium">Completed</span>
              </div>
            </div>
          </div>
        </Card>

        {/* School Announcements */}
        <Card
          title="Campus Announcements"
          subtitle="Latest notices"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/homework')}>
              Notice Board
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <Badge variant="brand" size="sm">Academic</Badge>
                <span className="text-[10px] text-slate-400">01 Apr 2026</span>
              </div>
              <h5 className="font-semibold text-slate-900 mt-2">New Academic Session 2026-2027</h5>
              <p className="text-slate-500 mt-1 line-clamp-2">
                Classes commence with updated CBSE laboratory curriculum and interactive smartboards.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm">Event</Badge>
                <span className="text-[10px] text-slate-400">02 May 2026</span>
              </div>
              <h5 className="font-semibold text-slate-900 mt-2">Inter-School Science & AI Olympiad</h5>
              <p className="text-slate-500 mt-1 line-clamp-2">
                Entries are open for Class 8 to 12. Register with Science Department teachers.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

