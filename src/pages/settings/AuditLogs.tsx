import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileText, Filter } from 'lucide-react';
import { AuditLogRecord } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';
import { formatDateTime } from '@/utils/formatters';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await dbService.getCollection<AuditLogRecord>('auditLogs');
      if (data.length === 0) {
        // Pre-populate sample audit trail
        const sample: AuditLogRecord[] = [
          {
            id: 'log_01',
            schoolId: 'school_next_main_01',
            userId: 'usr_admin',
            userName: 'Anand Kumar (Admin)',
            userRole: 'school_admin',
            action: 'CREATE',
            module: 'students',
            recordId: 'std_1001',
            details: 'Enrolled new student Aarav Kumar Singh into Class 10-A',
            timestamp: '2026-05-01T09:15:00.000Z',
          },
          {
            id: 'log_02',
            schoolId: 'school_next_main_01',
            userId: 'usr_accountant',
            userName: 'Ramesh Gupta (Accountant)',
            userRole: 'accountant',
            action: 'COLLECT_FEE',
            module: 'payments',
            recordId: 'pay_001',
            details: 'Posted ₹27,000 fee receipt RCP-2026-0001 via UPI',
            timestamp: '2026-05-04T10:30:00.000Z',
          },
          {
            id: 'log_03',
            schoolId: 'school_next_main_01',
            userId: 'usr_teacher',
            userName: 'Priya Sharma (Teacher)',
            userRole: 'teacher',
            action: 'ATTENDANCE_RECORD',
            module: 'attendance',
            recordId: 'att_class10',
            details: 'Recorded daily attendance for Class 10-A (42 present, 2 absent)',
            timestamp: '2026-05-05T08:15:00.000Z',
          },
        ];
        setLogs(sample);
      } else {
        setLogs(data);
      }
    };
    fetchLogs();
  }, []);

  const columns: Column<AuditLogRecord>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      sortable: true,
      cell: (l) => <span className="font-mono text-xs text-slate-500">{formatDateTime(l.timestamp)}</span>,
    },
    {
      header: 'User & Role',
      cell: (l) => (
        <div>
          <p className="font-bold text-slate-900">{l.userName}</p>
          <p className="text-[10px] text-slate-400 capitalize">{l.userRole.replace('_', ' ')}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      sortable: true,
      cell: (l) => {
        const variant = l.action.includes('CREATE') ? 'success' : l.action.includes('DELETE') ? 'danger' : 'info';
        return <Badge variant={variant} size="sm">{l.action}</Badge>;
      },
    },
    {
      header: 'Module',
      accessorKey: 'module',
      sortable: true,
      cell: (l) => <span className="font-semibold text-slate-700 capitalize">{l.module}</span>,
    },
    {
      header: 'Details & Event Trail',
      accessorKey: 'details',
      cell: (l) => <span className="text-slate-800 text-xs">{l.details}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit & Compliance Logs</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Immutable system audit logs tracking fee transactions, marks modifications, and administrative operations.
          </p>
        </div>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        searchPlaceholder="Filter audit trail..."
        searchFields={['userName', 'action', 'module', 'details']}
        exportFileName="System_Audit_Logs"
      />
    </div>
  );
};

