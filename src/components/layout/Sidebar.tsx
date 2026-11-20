import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Bus, 
  BookMarked, 
  Package, 
  Building2, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronRight,
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
  const navigate = useNavigate();

  // Open all menus by default
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Track hovered item for portal popover in collapsed mode
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [popoverTop, setPopoverTop] = useState<number>(0);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const maxTop = window.innerHeight - 280;
    const computedTop = Math.max(10, Math.min(rect.top, maxTop));
    setPopoverTop(computedTop);
    setHoveredIndex(idx);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 120);
  };

  const handlePopoverMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => {
      const current = prev[key] !== undefined ? prev[key] : true;
      return { ...prev, [key]: !current };
    });
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      title: 'Students',
      icon: <Users className="w-4 h-4 shrink-0" />,
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
      icon: <GraduationCap className="w-4 h-4 shrink-0" />,
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
      icon: <CalendarCheck className="w-4 h-4 shrink-0" />,
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
      icon: <CreditCard className="w-4 h-4 shrink-0" />,
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
      icon: <Award className="w-4 h-4 shrink-0" />,
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
      icon: <Briefcase className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'accountant'],
      subItems: [
        { title: 'Staff Directory', path: '/staff' },
        { title: 'Add Staff Member', path: '/staff/add', allowedRoles: ['super_admin', 'school_admin'] },
        { title: 'Monthly Payroll', path: '/staff/payroll', allowedRoles: ['super_admin', 'school_admin', 'accountant'] },
      ],
    },
    {
      title: 'Timetable',
      icon: <Clock className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'teacher', 'student'],
      subItems: [
        { title: 'Class Timetable', path: '/timetable/class' },
        { title: 'Teacher Timetable', path: '/timetable/teacher' },
        { title: 'Manage Schedule', path: '/timetable/manage', allowedRoles: ['super_admin', 'school_admin', 'principal'] },
      ],
    },
    {
      title: 'Homework',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'teacher', 'student', 'parent'],
      subItems: [
        { title: 'Assignments List', path: '/homework' },
        { title: 'Assign Homework', path: '/homework/create', allowedRoles: ['teacher', 'school_admin'] },
        { title: 'Study Materials', path: '/homework/materials' },
      ],
    },
    {
      title: 'Transport',
      icon: <Bus className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'transport_manager', 'receptionist'],
      subItems: [
        { title: 'Bus Routes & Stops', path: '/transport/routes' },
        { title: 'Vehicles Directory', path: '/transport/vehicles' },
      ],
    },
    {
      title: 'Library',
      icon: <BookMarked className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'librarian'],
      subItems: [
        { title: 'Books Catalog', path: '/library' },
        { title: 'Issue / Return', path: '/library/issue-return' },
      ],
    },
    {
      title: 'Inventory',
      icon: <Package className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin'],
      subItems: [
        { title: 'Stock Items', path: '/inventory' },
      ],
    },
    {
      title: 'Front Office',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'receptionist', 'principal'],
      subItems: [
        { title: 'Admission Enquiries', path: '/front-office/enquiries' },
        { title: 'Visitors Log', path: '/front-office/visitors' },
        { title: 'Certificates Generator', path: '/front-office/certificates' },
      ],
    },
    {
      title: 'Portals',
      icon: <UserCheck className="w-4 h-4 shrink-0" />,
      subItems: [
        { title: 'Parent Portal', path: '/portals/parent' },
        { title: 'Teacher Portal', path: '/portals/teacher' },
        { title: 'Student Portal', path: '/portals/student' },
      ],
    },
    {
      title: 'Reports & Export',
      path: '/reports',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin', 'principal', 'accountant'],
    },
    {
      title: 'School Settings',
      icon: <Settings className="w-4 h-4 shrink-0" />,
      allowedRoles: ['super_admin', 'school_admin'],
      subItems: [
        { title: 'School Profile', path: '/settings/school' },
        { title: 'User Management', path: '/settings/users' },
        { title: 'Roles & Permissions', path: '/settings/roles' },
        { title: 'Audit Logs', path: '/settings/audit-logs' },
      ],
    },
  ];

  const userRole = currentUser?.role || 'school_admin';
  const visibleItems = menuItems.filter(item => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });

  const handleSubitemClick = (path: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredIndex(null);
    onCloseMobile();
    navigate(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar - Pure White Background */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white text-slate-700 transition-all duration-200 ease-in-out border-r border-slate-200 shadow-sm lg:static ${
          collapsed ? 'w-[68px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`h-14 max-h-[56px] flex items-center border-b border-slate-100 bg-white ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {collapsed ? (
            /* Clean centered logo with hover toggle in collapsed mode */
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="w-9 h-9 rounded bg-[#4E2284] flex items-center justify-center text-white font-medium text-xs shadow-sm hover:opacity-90 transition-opacity"
            >
              SN
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded bg-[#4E2284] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="font-medium text-white text-xs tracking-wider">SN</span>
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-medium text-slate-900 tracking-tight text-xs leading-tight">School Next</span>
                  <span className="text-[10px] text-[#4E2284] font-medium uppercase tracking-wider truncate">Enterprise ERP</span>
                </div>
              </div>

              <button
                onClick={onToggleCollapse}
                title="Collapse Sidebar"
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <div className={`flex-1 overflow-y-auto py-2.5 space-y-1 custom-scrollbar ${collapsed ? 'px-2' : 'px-3'}`}>
          {visibleItems.map((item, idx) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            const subKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            const isOpen = openSubmenus[subKey] !== undefined ? openSubmenus[subKey] : true;
            const isAnySubActive = hasSub && item.subItems?.some(s => location.pathname === s.path);
            const isDirectActive = item.path ? location.pathname === item.path : false;
            const isHovered = hoveredIndex === idx;

            // --- COLLAPSED MODE: Clean icons with floating popover submenus on hover ---
            if (collapsed) {
              return (
                <div
                  key={idx}
                  className="relative group flex justify-center"
                  onMouseEnter={(e) => handleMouseEnter(e, idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Collapsed Icon Button */}
                  {hasSub ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        if (isHovered) {
                          setHoveredIndex(null);
                        } else {
                          handleMouseEnter(e as any, idx);
                        }
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded text-xs font-medium transition-colors max-h-[36px] ${
                        isAnySubActive
                          ? 'bg-[#4E2284]/10 text-[#4E2284]'
                          : isHovered
                          ? 'bg-slate-100 text-[#4E2284]'
                          : 'text-slate-600 hover:text-[#4E2284] hover:bg-[#4E2284]/5'
                      }`}
                    >
                      {item.icon}
                    </button>
                  ) : (
                    <NavLink
                      to={item.path!}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `w-10 h-10 flex items-center justify-center rounded text-xs font-medium transition-colors max-h-[36px] ${
                          isActive
                            ? 'bg-[#4E2284] text-white shadow-sm'
                            : isHovered
                            ? 'bg-slate-100 text-[#4E2284]'
                            : 'text-slate-600 hover:text-[#4E2284] hover:bg-[#4E2284]/5'
                        }`
                      }
                    >
                      {item.icon}
                    </NavLink>
                  )}

                  {/* Floating Popover on Hover via React Portal to Document Body (Always on top of EVERYTHING) */}
                  {isHovered && typeof document !== 'undefined' && createPortal(
                    <div
                      style={{ top: `${popoverTop}px`, left: '72px' }}
                      className="fixed z-[99999] min-w-[210px] w-56 bg-white rounded border border-slate-200 shadow-2xl py-1.5 animate-in fade-in duration-100 before:content-[''] before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-5"
                      onMouseEnter={handlePopoverMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Popover Header Title */}
                      <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-900">{item.title}</span>
                        {item.path && (
                          <button
                            onClick={() => handleSubitemClick(item.path!)}
                            className="text-[10px] text-[#4E2284] font-medium hover:underline cursor-pointer"
                          >
                            Open
                          </button>
                        )}
                      </div>

                      {/* Popover Submenu Items */}
                      {hasSub ? (
                        <div className="py-1">
                          {item.subItems
                            ?.filter(sub => !sub.allowedRoles || sub.allowedRoles.includes(userRole))
                            .map((sub, sIdx) => {
                              const isActive = location.pathname === sub.path;
                              return (
                                <button
                                  key={sIdx}
                                  onClick={() => handleSubitemClick(sub.path)}
                                  className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                    isActive
                                      ? 'text-[#4E2284] bg-[#4E2284]/10'
                                      : 'text-slate-600 hover:text-[#4E2284] hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{sub.title}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4E2284]" />}
                                </button>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="p-2">
                          <button
                            onClick={() => handleSubitemClick(item.path!)}
                            className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-[#4E2284] hover:bg-[#4E2284]/5 cursor-pointer"
                          >
                            Go to {item.title} →
                          </button>
                        </div>
                      )}
                    </div>,
                    document.body
                  )}
                </div>
              );
            }

            // --- EXPANDED MODE ---
            if (!hasSub) {
              return (
                <NavLink
                  key={idx}
                  to={item.path!}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors max-h-[36px] ${
                      isActive
                        ? 'bg-[#4E2284] text-white shadow-sm'
                        : 'text-slate-600 hover:text-[#4E2284] hover:bg-[#4E2284]/5'
                    }`
                  }
                >
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </NavLink>
              );
            }

            return (
              <div key={idx} className="space-y-0.5">
                <button
                  onClick={() => toggleSubmenu(subKey)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors max-h-[36px] ${
                    isAnySubActive
                      ? 'text-[#4E2284] bg-[#4E2284]/10'
                      : 'text-slate-600 hover:text-[#4E2284] hover:bg-[#4E2284]/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {item.icon}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span className="text-slate-400">
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {/* Submenu links */}
                {isOpen && (
                  <div className="pl-8 pr-1 py-0.5 space-y-0.5 border-l border-slate-200 ml-4 my-0.5">
                    {item.subItems
                      ?.filter(sub => !sub.allowedRoles || sub.allowedRoles.includes(userRole))
                      .map((sub, sIdx) => {
                        const isActive = location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sIdx}
                            to={sub.path}
                            onClick={onCloseMobile}
                            className={`block py-1.5 px-2.5 rounded text-[11px] font-medium transition-colors ${
                              isActive
                                ? 'text-[#4E2284] bg-[#4E2284]/10'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
        <div className={`p-2.5 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}>
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          ) : (
            <>
              <span className="truncate">{school?.name || 'School Next'}</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#4E2284] text-[10px] font-medium">v1.0</span>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
