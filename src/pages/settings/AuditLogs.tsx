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
      setLogs(data);
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
    <div className="space-y-6 w-full">
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

