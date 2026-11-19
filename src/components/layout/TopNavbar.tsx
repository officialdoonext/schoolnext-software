import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Calendar, 
  UserCircle, 
  LogOut, 
  RefreshCw, 
  Settings, 
  Shield, 
  Check, 
  School as SchoolIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSchool } from '@/context/SchoolContext';
import { UserRole } from '@/types';
import { dbService } from '@/services/dbService';

interface TopNavbarProps {
  onOpenMobile: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobile }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const { school, academicYears, selectedAcademicYear, setSelectedAcademicYear } = useSchool();
  const navigate = useNavigate();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'school_admin', label: 'School Admin', desc: 'Full administrative access' },
    { role: 'principal', label: 'Principal', desc: 'Approvals, academic oversight' },
    { role: 'teacher', label: 'Senior Teacher', desc: 'Attendance, marks, assignments' },
    { role: 'accountant', label: 'Chief Accountant', desc: 'Fee collection, payroll, finance' },
    { role: 'parent', label: 'Parent', desc: 'Child profile, fees, results' },
    { role: 'student', label: 'Student', desc: 'My timetable, homework, reports' },
    { role: 'librarian', label: 'Librarian', desc: 'Book issues, returns, catalog' },
    { role: 'transport_manager', label: 'Transport Mgr', desc: 'Buses, routes, driver logs' },
    { role: 'receptionist', label: 'Receptionist', desc: 'Enquiries, visitors, passes' },
    { role: 'vice_principal', label: 'Vice Principal', desc: 'Discipline, schedules' },
    { role: 'super_admin', label: 'Super Admin', desc: 'Multi-school platform owner' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setRoleDropdownOpen(false);
    navigate('/dashboard');
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to clean initial seed data? This will refresh all demo records.')) {
      dbService.resetDatabase();
    }
  };

  return (
    <header className="h-14 max-h-[56px] bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & School Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 max-h-[36px]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-slate-800">
          <SchoolIcon className="w-4 h-4 text-[#4E2284]" />
          <span className="font-medium text-xs tracking-tight truncate max-w-xs md:max-w-md">
            {school?.name || 'School Next'}
          </span>
        </div>
      </div>

      {/* Right Controls: All buttons max-height 36px, radius 6px */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Academic Year Selector */}
        <div className="flex items-center bg-slate-50 rounded px-2.5 py-1 border border-slate-200 text-xs text-slate-700 h-[34px] max-h-[36px]">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          <select
            value={selectedAcademicYear?.id || ''}
            onChange={(e) => {
              const y = academicYears.find(ay => ay.id === e.target.value);
              if (y) setSelectedAcademicYear(y);
            }}
            className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
          >
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                AY {ay.name} {ay.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Role Quick-Switcher Pill (max-height 36px, primary #4E2284) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#4E2284]/10 border border-[#4E2284]/20 text-[#4E2284] text-xs font-medium hover:bg-[#4E2284]/15 transition-colors h-[34px] max-h-[36px]"
            title="Switch demo user role"
          >
            <Shield className="w-3.5 h-3.5 text-[#4E2284]" />
            <span className="capitalize hidden md:inline">Role:</span>
            <span className="font-medium capitalize">{currentUser?.role.replace('_', ' ')}</span>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-medium text-slate-800">Switch Role (11 Portals)</p>
                <p className="text-[10px] text-slate-500">Test the ERP from any persona view</p>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                {rolesList.map(({ role, label, desc }) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors ${
                      currentUser?.role === role ? 'bg-[#4E2284]/10 font-medium text-[#4E2284]' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-[10px] text-slate-400">{desc}</p>
                    </div>
                    {currentUser?.role === role && <Check className="w-3.5 h-3.5 text-[#4E2284]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors h-[34px] w-[34px] max-h-[36px] flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded bg-rose-500" />
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-900">Notifications</span>
                <span className="text-[10px] bg-[#4E2284]/10 text-[#4E2284] font-medium px-1.5 py-0.5 rounded">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-2.5 hover:bg-slate-50 cursor-pointer">
                  <p className="font-medium text-slate-800">Term 1 Fees Due Reminder</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Automated fee due notifications sent for pending students.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                </div>
                <div className="p-2.5 hover:bg-slate-50 cursor-pointer">
                  <p className="font-medium text-slate-800">New Admission Enquiry</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Vivaan Agarwal applied for Class 6 enrollment.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded hover:bg-slate-100 transition-colors h-[34px] max-h-[36px]"
          >
            <div className="w-7 h-7 rounded bg-[#4E2284] text-white flex items-center justify-center font-medium text-xs">
              {currentUser?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-medium text-slate-900 truncate max-w-[110px]">
                {currentUser?.displayName?.split(' ')[0] || 'Admin'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role.replace('_', ' ')}</p>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-900 truncate">{currentUser?.displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>

              <div className="py-1 text-xs text-slate-700">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings/school');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  School Settings
                </button>
                <button
                  onClick={handleResetData}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-amber-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  Reset Demo DB
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 text-xs">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
