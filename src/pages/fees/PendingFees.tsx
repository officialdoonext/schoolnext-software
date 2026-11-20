import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Send, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';
import { Student, FeePayment, FeeStructure } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils/formatters';

interface PendingFeeRow {
  id: string;
  studentId: string;
  admissionNumber: string;
  studentName: string;
  className: string;
  fatherName: string;
  fatherPhone: string;
  totalFee: number;
  paidFee: number;
  dueAmount: number;
  dueDate: string;
}

export const PendingFees: React.FC = () => {
  const navigate = useNavigate();
  const [pendingList, setPendingList] = useState<PendingFeeRow[]>([]);
  const [remindedId, setRemindedId] = useState<string | null>(null);

  useEffect(() => {
    const calculatePending = async () => {
      const students = await dbService.getCollection<Student>('students');
      const payments = await dbService.getCollection<FeePayment>('payments');
      const structures = await dbService.getCollection<FeeStructure>('feeStructures');

      const rows: PendingFeeRow[] = students.map((s) => {
        const classStructure = structures.find(st => st.classId === s.classId) || structures[0];
        const studentFee = classStructure ? Number(classStructure.totalAmount) : 0;
        const studentPayments = payments.filter(p => p.studentId === s.id);
        const paidFee = studentPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
        const dueAmount = Math.max(0, studentFee - paidFee);

        return {
          id: s.id,
          studentId: s.id,
          admissionNumber: s.admissionNumber,
          studentName: s.fullName,
          className: `${s.className || ''} (${s.sectionName || ''})`,
          fatherName: s.fatherName,
          fatherPhone: s.fatherPhone,
          totalFee: studentFee,
          paidFee,
          dueAmount,
          dueDate: classStructure?.dueDate || 'Due on Term Start',
        };
      }).filter(r => r.dueAmount > 0);

      setPendingList(rows);
    };
    calculatePending();
  }, []);

  const handleSendReminder = (studentName: string, phone: string, id: string) => {
    setRemindedId(id);
    alert(`Fee payment notification & SMS dispatch triggered for ${studentName} (${phone})!`);
    setTimeout(() => setRemindedId(null), 3000);
  };

  const totalOutstanding = pendingList.reduce((sum, r) => sum + r.dueAmount, 0);

  const columns: Column<PendingFeeRow>[] = [
    {
      header: 'Admission No',
      accessorKey: 'admissionNumber',
      sortable: true,
      className: 'font-mono text-slate-900',
    },
    {
      header: 'Student Name',
      accessorKey: 'studentName',
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.studentName}</p>
          <p className="text-[11px] text-slate-400">Class: {row.className}</p>
        </div>
      ),
    },
    {
      header: 'Parent Contact',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.fatherName}</p>
          <p className="font-mono text-slate-500 text-[11px]">{row.fatherPhone}</p>
        </div>
      ),
    },
    {
      header: 'Total Fee',
      cell: (row) => <span className="font-mono text-slate-700">{formatCurrency(row.totalFee)}</span>,
    },
    {
      header: 'Paid Fee',
      cell: (row) => <span className="font-mono text-emerald-600 font-semibold">{formatCurrency(row.paidFee)}</span>,
    },
    {
      header: 'Pending Due',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {formatCurrency(row.dueAmount)}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleSendReminder(row.studentName, row.fatherPhone, row.id)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
            title="Send Parent SMS Reminder"
          >
            <Send className="w-4 h-4" />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/fees/collection?studentId=${row.studentId}`)}
            icon={<CreditCard className="w-3.5 h-3.5" />}
          >
            Collect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Dues & Defaulters</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Identify outstanding fee balances, send automated parent reminders, and record collections.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Total Outstanding</span>
          <p className="text-xl font-bold text-rose-700 font-mono">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <DataTable
        data={pendingList}
        columns={columns}
        searchPlaceholder="Filter defaulters by student name, roll or parent..."
        searchFields={['studentName', 'admissionNumber', 'fatherName', 'fatherPhone']}
        exportFileName="Fee_Defaulters_List"
      />
    </div>
  );
};

