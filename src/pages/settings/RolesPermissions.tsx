import React, { useState, useEffect } from 'react';
import { Shield, Check, Save } from 'lucide-react';
import { UserRole } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const RolesPermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [permissionsMap, setPermissionsMap] = useState<Record<string, Record<string, boolean>>>({});
  const [saving, setSaving] = useState(false);
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

  const actions = ['view', 'create', 'edit', 'delete', 'export', 'approve'];

  useEffect(() => {
    const loadRolePermissions = async () => {
      const stored = await dbService.getDocument<any>('rolePermissions', selectedRole);
      if (stored && stored.matrix) {
        setPermissionsMap(stored.matrix);
      } else {
        // Compute standard dynamic baseline permissions based on role
        const matrix: Record<string, Record<string, boolean>> = {};
        const isAdmin = selectedRole === 'super_admin' || selectedRole === 'school_admin';
        const isTeacher = selectedRole === 'teacher';
        const isAccountant = selectedRole === 'accountant';

        modules.forEach(m => {
          matrix[m.key] = {
            view: isAdmin || (isTeacher && ['attendance', 'examinations', 'homework', 'timetable', 'students'].includes(m.key)) || (isAccountant && ['fees', 'staff', 'reports'].includes(m.key)),
            create: isAdmin || (isTeacher && ['attendance', 'homework', 'examinations'].includes(m.key)) || (isAccountant && ['fees'].includes(m.key)),
            edit: isAdmin || (isTeacher && ['attendance', 'homework'].includes(m.key)) || (isAccountant && ['fees'].includes(m.key)),
            delete: isAdmin,
            export: isAdmin || isAccountant,
            approve: isAdmin || selectedRole === 'principal',
          };
        });
        setPermissionsMap(matrix);
      }
    };
    loadRolePermissions();
  }, [selectedRole]);

  const handleToggle = (moduleKey: string, action: string) => {
    setPermissionsMap(prev => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] || {}),
        [action]: !prev[moduleKey]?.[action],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await dbService.getDocument('rolePermissions', selectedRole);
      if (existing) {
        await dbService.updateDocument('rolePermissions', selectedRole, { matrix: permissionsMap });
      } else {
        await dbService.createDocument('rolePermissions', {
          id: selectedRole,
          role: selectedRole,
          matrix: permissionsMap,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-slate-900 tracking-tight">Roles & Permissions Matrix</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure dynamic granular access controls across all 11 user personas with Firestore persistence.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          icon={<Save className="w-3.5 h-3.5" />}
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Permissions successfully saved & synchronized with Firestore rules!
        </div>
      )}

      {/* Role Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {roles.map(r => (
          <button
            key={r.role}
            onClick={() => setSelectedRole(r.role)}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
              selectedRole === r.role
                ? 'bg-[#4E2284] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#4E2284] text-white font-medium">
            <tr>
              <th className="p-3 font-medium">Module / Feature</th>
              <th className="p-3 text-center font-medium">View</th>
              <th className="p-3 text-center font-medium">Create</th>
              <th className="p-3 text-center font-medium">Edit</th>
              <th className="p-3 text-center font-medium">Delete</th>
              <th className="p-3 text-center font-medium">Export</th>
              <th className="p-3 text-center font-medium">Approve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {modules.map((m) => {
              const current = permissionsMap[m.key] || {};
              return (
                <tr key={m.key} className="hover:bg-slate-50/60">
                  <td className="p-3 font-medium text-slate-900">{m.label}</td>
                  {actions.map(act => (
                    <td key={act} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!current[act]}
                        onChange={() => handleToggle(m.key, act)}
                        className="rounded text-[#4E2284] focus:ring-[#4E2284] cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
