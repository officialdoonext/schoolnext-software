import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SchoolProvider } from './context/SchoolContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Main Pages
import { Dashboard } from './pages/dashboard/Dashboard';

// Students
import { StudentList } from './pages/students/StudentList';
import { StudentAdd } from './pages/students/StudentAdd';
import { StudentProfile } from './pages/students/StudentProfile';
import { StudentPromotion } from './pages/students/StudentPromotion';
import { StudentIdCards } from './pages/students/StudentIdCards';

// Academics
import { AcademicYears } from './pages/academics/AcademicYears';
import { ClassesSections } from './pages/academics/ClassesSections';
import { Subjects } from './pages/academics/Subjects';

// Attendance
import { StudentAttendance } from './pages/attendance/StudentAttendance';
import { StaffAttendance } from './pages/attendance/StaffAttendance';
import { AttendanceReports } from './pages/attendance/AttendanceReports';

// Fees & Finance
import { FeeCollection } from './pages/fees/FeeCollection';
import { FeeStructures } from './pages/fees/FeeStructures';
import { PendingFees } from './pages/fees/PendingFees';

// Examinations
import { MarksEntry } from './pages/examinations/MarksEntry';
import { ReportCardGenerator } from './pages/examinations/ReportCardGenerator';

// Staff & Payroll
import { StaffList } from './pages/staff/StaffList';
import { Payroll } from './pages/staff/Payroll';

// Operations
import { ClassTimetable } from './pages/timetable/ClassTimetable';
import { HomeworkList } from './pages/homework/HomeworkList';
import { Routes as TransportRoutes } from './pages/transport/Routes';
import { BookList } from './pages/library/BookList';
import { InventoryItems } from './pages/inventory/InventoryItems';
import { AdmissionEnquiries } from './pages/frontOffice/AdmissionEnquiries';
import { Certificates } from './pages/frontOffice/Certificates';

// Portals
import { ParentPortal } from './pages/portals/ParentPortal';
import { TeacherPortal } from './pages/portals/TeacherPortal';
import { StudentPortal } from './pages/portals/StudentPortal';

// Reports & Settings
import { ReportsCenter } from './pages/reports/ReportsCenter';
import { SchoolSettings } from './pages/settings/SchoolSettings';
import { RolesPermissions } from './pages/settings/RolesPermissions';
import { AuditLogs } from './pages/settings/AuditLogs';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Authenticated ERP Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Student Management */}
              <Route path="students" element={<StudentList />} />
              <Route path="students/add" element={<StudentAdd />} />
              <Route path="students/:studentId" element={<StudentProfile />} />
              <Route path="students/promotion" element={<StudentPromotion />} />
              <Route path="students/id-cards" element={<StudentIdCards />} />
              <Route path="students/alumni" element={<StudentList />} />

              {/* Academics */}
              <Route path="academics/years" element={<AcademicYears />} />
              <Route path="academics/classes" element={<ClassesSections />} />
              <Route path="academics/subjects" element={<Subjects />} />
              <Route path="academics/teachers" element={<Subjects />} />

              {/* Attendance */}
              <Route path="attendance/student" element={<StudentAttendance />} />
              <Route path="attendance/staff" element={<StaffAttendance />} />
              <Route path="attendance/reports" element={<AttendanceReports />} />
              <Route path="attendance/leaves" element={<AttendanceReports />} />

              {/* Fees */}
              <Route path="fees/collection" element={<FeeCollection />} />
              <Route path="fees/structures" element={<FeeStructures />} />
              <Route path="fees/categories" element={<FeeStructures />} />
              <Route path="fees/pending" element={<PendingFees />} />
              <Route path="fees/expenses" element={<FeeStructures />} />

              {/* Examinations */}
              <Route path="examinations/schedule" element={<MarksEntry />} />
              <Route path="examinations/marks" element={<MarksEntry />} />
              <Route path="examinations/grades" element={<MarksEntry />} />
              <Route path="examinations/report-cards" element={<ReportCardGenerator />} />

              {/* Staff */}
              <Route path="staff" element={<StaffList />} />
              <Route path="staff/add" element={<StaffList />} />
              <Route path="staff/payroll" element={<Payroll />} />

              {/* Timetable & Homework */}
              <Route path="timetable/class" element={<ClassTimetable />} />
              <Route path="timetable/teacher" element={<ClassTimetable />} />
              <Route path="timetable/manage" element={<ClassTimetable />} />
              <Route path="homework" element={<HomeworkList />} />
              <Route path="homework/create" element={<HomeworkList />} />
              <Route path="homework/materials" element={<HomeworkList />} />

              {/* Transport, Library, Inventory, Front Office */}
              <Route path="transport/routes" element={<TransportRoutes />} />
              <Route path="transport/vehicles" element={<TransportRoutes />} />
              <Route path="library" element={<BookList />} />
              <Route path="library/issue-return" element={<BookList />} />
              <Route path="inventory" element={<InventoryItems />} />
              <Route path="front-office/enquiries" element={<AdmissionEnquiries />} />
              <Route path="front-office/visitors" element={<AdmissionEnquiries />} />
              <Route path="front-office/certificates" element={<Certificates />} />

              {/* Portals */}
              <Route path="portals/parent" element={<ParentPortal />} />
              <Route path="portals/teacher" element={<TeacherPortal />} />
              <Route path="portals/student" element={<StudentPortal />} />

              {/* Reports & Settings */}
              <Route path="reports" element={<ReportsCenter />} />
              <Route path="settings/school" element={<SchoolSettings />} />
              <Route path="settings/users" element={<SchoolSettings />} />
              <Route path="settings/roles" element={<RolesPermissions />} />
              <Route path="settings/audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

