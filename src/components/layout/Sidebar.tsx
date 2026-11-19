import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  CreditCard, 
  Award, 
  Briefcase, 
  Clock, 
  BookOpen, 
  Bell, 
  Bus, 
  BookMarked, 
  Package, 
  Building2, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSchool } from '@/context/SchoolContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  allowedRoles?: string[];
  subItems?: { title: string; path: string; allowedRoles?: string[] }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentUser } = useAuth();
  const { school } = useSchool();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    students: true,
    academics: false,
    fees: false,
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      title: 'Students',
      icon: <Users className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'vice_principal', 'teacher', 'receptionist'],
      subItems: [
        { title: 'Student List', path: '/students' },
        { title: 'Admission / Add', path: '/students/add', allowedRoles: ['super_admin', 'school_admin', 'receptionist'] },
        { title: 'Promotion', path: '/students/promotion', allowedRoles: ['super_admin', 'school_admin', 'principal'] },
        { title: 'ID Cards', path: '/students/id-cards' },
        { title: 'Alumni', path: '/students/alumni' },
      ],
    },
    {
      title: 'Academics',
      icon: <GraduationCap className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'vice_principal', 'teacher'],
      subItems: [
        { title: 'Academic Years', path: '/academics/years' },
        { title: 'Classes & Sections', path: '/academics/classes' },
        { title: 'Subjects', path: '/academics/subjects' },
        { title: 'Teacher Allocation', path: '/academics/teachers' },
      ],
    },
    {
      title: 'Attendance',
      icon: <CalendarCheck className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'teacher', 'receptionist'],
      subItems: [
        { title: 'Student Attendance', path: '/attendance/student' },
        { title: 'Staff Attendance', path: '/attendance/staff', allowedRoles: ['super_admin', 'school_admin', 'principal'] },
        { title: 'Attendance Reports', path: '/attendance/reports' },
        { title: 'Leave Requests', path: '/attendance/leaves' },
      ],
    },
    {
      title: 'Fees & Finance',
      icon: <CreditCard className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'accountant'],
      subItems: [
        { title: 'Fee Collection', path: '/fees/collection' },
        { title: 'Fee Structures', path: '/fees/structures' },
        { title: 'Fee Categories', path: '/fees/categories' },
        { title: 'Pending Fees', path: '/fees/pending' },
        { title: 'School Expenses', path: '/fees/expenses' },
      ],
    },
    {
      title: 'Examinations',
      icon: <Award className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'teacher'],
      subItems: [
        { title: 'Exam Schedule', path: '/examinations/schedule' },
        { title: 'Marks Entry', path: '/examinations/marks' },
        { title: 'Grade Scales', path: '/examinations/grades' },
        { title: 'Report Cards', path: '/examinations/report-cards' },
      ],
    },
    {
      title: 'Staff & HR',
      icon: <Briefcase className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'accountant'],
      subItems: [
        { title: 'Staff Directory', path: '/staff' },
        { title: 'Add Staff Member', path: '/staff/add', allowedRoles: ['super_admin', 'school_admin'] },
        { title: 'Monthly Payroll', path: '/staff/payroll', allowedRoles: ['super_admin', 'school_admin', 'accountant'] },
      ],
    },
    {
      title: 'Timetable',
      icon: <Clock className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'teacher', 'student'],
      subItems: [
        { title: 'Class Timetable', path: '/timetable/class' },
        { title: 'Teacher Timetable', path: '/timetable/teacher' },
        { title: 'Manage Schedule', path: '/timetable/manage', allowedRoles: ['super_admin', 'school_admin', 'principal'] },
      ],
    },
    {
      title: 'Homework',
      icon: <BookOpen className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
      subItems: [
        { title: 'Assignments List', path: '/homework' },
        { title: 'Assign Homework', path: '/homework/create', allowedRoles: ['teacher', 'school_admin'] },
        { title: 'Study Materials', path: '/homework/materials' },
      ],
    },
    {
      title: 'Transport',
      icon: <Bus className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'transport_manager', 'receptionist'],
      subItems: [
        { title: 'Bus Routes & Stops', path: '/transport/routes' },
        { title: 'Vehicles Directory', path: '/transport/vehicles' },
      ],
    },
    {
      title: 'Library',
      icon: <BookMarked className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'librarian'],
      subItems: [
        { title: 'Books Catalog', path: '/library' },
        { title: 'Issue / Return', path: '/library/issue-return' },
      ],
    },
    {
      title: 'Inventory',
      icon: <Package className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin'],
      subItems: [
        { title: 'Stock Items', path: '/inventory' },
      ],
    },
    {
      title: 'Front Office',
      icon: <Building2 className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'receptionist', 'principal'],
      subItems: [
        { title: 'Admission Enquiries', path: '/front-office/enquiries' },
        { title: 'Visitors Log', path: '/front-office/visitors' },
        { title: 'Certificates Generator', path: '/front-office/certificates' },
      ],
    },
    {
      title: 'Portals',
      icon: <UserCheck className="w-5 h-5 shrink-0" />,
      subItems: [
        { title: 'Parent Portal', path: '/portals/parent' },
        { title: 'Teacher Portal', path: '/portals/teacher' },
        { title: 'Student Portal', path: '/portals/student' },
      ],
    },
    {
      title: 'Reports & Export',
      path: '/reports',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'accountant'],
    },
    {
      title: 'School Settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin'],
      subItems: [
        { title: 'School Profile', path: '/settings/school' },
        { title: 'User Management', path: '/settings/users' },
        { title: 'Roles & Permissions', path: '/settings/roles' },
        { title: 'Audit Logs', path: '/settings/audit-logs' },
      ],
    },
  ];

  // Filter items based on user role
  const userRole = currentUser?.role || 'school_admin';
  const visibleItems = menuItems.filter(item => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-xl lg:static ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 p-0.5 flex items-center justify-center shrink-0 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-sky-400 text-lg tracking-wider">SN</span>
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-white tracking-wide text-base leading-tight">School Next</span>
                <span className="text-[10px] text-sky-400 font-medium uppercase tracking-widest truncate">ERP Enterprise</span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {visibleItems.map((item, idx) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            const subKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            const isOpen = openSubmenus[subKey];
            const isAnySubActive = hasSub && item.subItems?.some(s => location.pathname === s.path);
            const isDirectActive = item.path ? location.pathname === item.path : false;

            if (!hasSub) {
              return (
                <NavLink
                  key={idx}
                  to={item.path!}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`
                  }
                  title={collapsed ? item.title : undefined}
                >
                  {item.icon}
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              );
            }

            return (
              <div key={idx} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(subKey)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isAnySubActive
                      ? 'text-white bg-slate-800/90'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={collapsed ? item.title : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.icon}
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </div>
                  {!collapsed && (
                    <span className="text-slate-500">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  )}
                </button>

                {/* Submenu links */}
                {isOpen && !collapsed && (
                  <div className="pl-10 pr-2 py-1 space-y-1 border-l border-slate-800 ml-5 my-1">
                    {item.subItems
                      ?.filter(sub => !sub.allowedRoles || sub.allowedRoles.includes(userRole))
                      .map((sub, sIdx) => {
                        const isActive = location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sIdx}
                            to={sub.path}
                            onClick={onCloseMobile}
                            className={`block py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors ${
                              isActive
                                ? 'text-sky-400 bg-slate-800/80 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            {sub.title}
                          </NavLink>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="truncate">{school?.name || 'School Next'}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 text-[10px] font-mono">v1.0</span>
          </div>
        )}
      </aside>
    </>
  );
};

