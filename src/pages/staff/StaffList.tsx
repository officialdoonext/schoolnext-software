import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, UserPlus, Eye, Trash2, IndianRupee, Phone, Mail } from 'lucide-react';
import { Staff } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      const data = await dbService.getCollection<Staff>('staff');
      setStaff(data);
    };
    fetchStaff();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await dbService.deleteDocument('staff', deleteId);
    setStaff(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
  };

  const columns: Column<Staff>[] = [
    {
      header: 'Employee ID',
      accessorKey: 'employeeId',
      sortable: true,
      className: 'font-mono text-slate-900',
    },
    {
      header: 'Staff Name',
      accessorKey: 'fullName',
      sortable: true,
      cell: (st) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {st.firstName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{st.fullName}</p>
            <p className="text-[11px] text-slate-400 capitalize">{st.role.replace('_', ' ')}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'departmentName',
      sortable: true,
      cell: (st) => <Badge variant="neutral" size="sm">{st.departmentName}</Badge>,
    },
    {
      header: 'Designation',
      accessorKey: 'designationName',
      sortable: true,
      className: 'font-medium text-slate-800',
    },
    {
      header: 'Contact',
      cell: (st) => (
        <div>
          <p className="font-mono text-slate-900">{st.mobile}</p>
          <p className="text-[11px] text-slate-400">{st.email}</p>
        </div>
      ),
    },
    {
      header: 'Basic Salary',
      accessorKey: 'basicSalary',
      sortable: true,
      cell: (st) => <span className="font-mono font-bold text-slate-900">{formatCurrency(st.basicSalary)}</span>,
    },
    {
      header: 'Status',
      cell: (st) => <Badge variant="success" size="sm" dot>Active</Badge>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (st) => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setDeleteId(st.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Faculty Directory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage teaching faculty, administrative officers, and employee contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/staff/payroll')}>
            Monthly Payroll
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/staff/add')} icon={<UserPlus className="w-4 h-4" />}>
            Add Staff Member
          </Button>
        </div>
      </div>

      <DataTable
        data={staff}
        columns={columns}
        searchPlaceholder="Search staff by name, employee ID, department..."
        searchFields={['fullName', 'employeeId', 'departmentName', 'designationName', 'mobile']}
        exportFileName="Faculty_Directory"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Staff Record"
        message="Are you sure you want to remove this staff profile? This action will archive their record."
        confirmLabel="Remove Staff"
        variant="danger"
      />
    </div>
  );
};

