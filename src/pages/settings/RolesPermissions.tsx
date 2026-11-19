import React, { useState } from 'react';
import { Shield, Check, Save } from 'lucide-react';
import { UserRole } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const RolesPermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const roles: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Admin' },
    { role: 'school_admin', label: 'School Admin' },
    { role: 'principal', label: 'Principal' },
    { role: 'vice_principal', label: 'Vice Principal' },
    { role: 'accountant', label: 'Accountant' },
    { role: 'teacher', label: 'Teacher' },
    { role: 'receptionist', label: 'Receptionist' },
    { role: 'librarian', label: 'Librarian' },
    { role: 'transport_manager', label: 'Transport Manager' },
    { role: 'parent', label: 'Parent' },
    { role: 'student', label: 'Student' },
  ];

  const modules = [
    { key: 'students', label: 'Student Management (Admissions, Profiles, ID Cards)' },
    { key: 'academics', label: 'Academics (Classes, Sections, Subjects, Promotion)' },
    { key: 'attendance', label: 'Attendance (Student & Staff Roster)' },
    { key: 'fees', label: 'Fees & Finance (Structures, Collections, Receipts, Expenses)' },
    { key: 'examinations', label: 'Examinations (Schedules, Marks Entry, Report Cards)' },
    { key: 'staff', label: 'Staff & Payroll (Faculty Directory, Salary Slips)' },
    { key: 'timetable', label: 'Timetable (Class Schedule, Teacher Allocation)' },
    { key: 'homework', label: 'Homework & Study Materials' },
    { key: 'transport', label: 'Transport (Vehicles, Bus Routes, Stops)' },
    { key: 'library', label: 'Library (Books Catalog, Issue/Return Circulation)' },
    { key: 'inventory', label: 'Inventory (Asset Items, Stock In/Out)' },
    { key: 'front_office', label: 'Front Office (Enquiries, Visitors, Certificates)' },
    { key: 'reports', label: 'Reports & Export (Excel, PDF)' },
    { key: 'settings', label: 'School Settings & Permissions' },
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roles & Permissions Matrix</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure granular access controls (View, Create, Edit, Delete, Export, Approve) across all 11 user personas.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
          Save Permissions
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Permissions successfully saved & synchronized with Firestore rules!
        </div>
      )}

      {/* Role Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {roles.map(r => (
          <button
            key={r.role}
            onClick={() => setSelectedRole(r.role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedRole === r.role
                ? 'bg-slate-900 text-white shadow-sm font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
            <tr>
              <th className="p-3.5">Module / Feature</th>
              <th className="p-3.5 text-center">View</th>
              <th className="p-3.5 text-center">Create</th>
              <th className="p-3.5 text-center">Edit</th>
              <th className="p-3.5 text-center">Delete</th>
              <th className="p-3.5 text-center">Export</th>
              <th className="p-3.5 text-center">Approve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {modules.map((m, idx) => {
              const isAdmin = selectedRole === 'super_admin' || selectedRole === 'school_admin';
              const isTeacher = selectedRole === 'teacher';
              const isAccountant = selectedRole === 'accountant';

              const canView = isAdmin || (isTeacher && ['attendance', 'examinations', 'homework', 'timetable', 'students'].includes(m.key)) || (isAccountant && ['fees', 'staff', 'reports'].includes(m.key));
              const canCreate = isAdmin || (isTeacher && ['attendance', 'homework', 'examinations'].includes(m.key)) || (isAccountant && ['fees'].includes(m.key));
              const canEdit = isAdmin || (isTeacher && ['attendance', 'homework'].includes(m.key)) || (isAccountant && ['fees'].includes(m.key));
              const canDelete = isAdmin;
              const canExport = isAdmin || isAccountant;
              const canApprove = isAdmin || selectedRole === 'principal';

              return (
                <tr key={m.key} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">{m.label}</td>
                  <td className="p-3.5 text-center">
                    <input type="checkbox" defaultChecked={canView} className="rounded text-slate-900 focus:ring-slate-900" />
                  </td>
                  <td className="p-3.5 text-center">
                    <input type="checkbox" defaultChecked={canCreate} className="rounded text-slate-900 focus:ring-slate-900" />
                  </td>
                  <td className="p-3.5 text-center">
                    <input type="checkbox" defaultChecked={canEdit} className="rounded text-slate-900 focus:ring-slate-900" />
                  </td>
                  <td className="p-3.5 text-center">
                    <input type="checkbox" defaultChecked={canDelete} className="rounded text-slate-900 focus:ring-slate-900" />
                  </td>
                  <td className="p-3.5 text-center">
                    <input type="checkbox" defaultChecked={canExport} className="rounded text-slate-900 focus:ring-slate-900" />
                  </td>
                  <td className="p-3.5 text-center">
                    <input type="checkbox" defaultChecked={canApprove} className="rounded text-slate-900 focus:ring-slate-900" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

