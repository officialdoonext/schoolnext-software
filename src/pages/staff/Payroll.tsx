import React, { useState, useEffect } from 'react';
import { IndianRupee, Printer, CheckCircle, FileText, Plus, RefreshCw, Inbox } from 'lucide-react';
import { Staff, PayrollRecord } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const Payroll: React.FC = () => {
  const { school } = useSchool();
  const [payrollRows, setPayrollRows] = useState<PayrollRecord[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [generating, setGenerating] = useState(false);

  const fetchPayroll = async () => {
    const list = await dbService.getCollection<PayrollRecord>('payroll');
    setPayrollRows(list);
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGeneratePayroll = async () => {
    setGenerating(true);
    try {
      const staffList = await dbService.getCollection<Staff>('staff');
      const activeStaff = staffList.filter(s => s.status === 'active');
      
      for (const st of activeStaff) {
        const basic = Number(st.basicSalary) || 45000;
        const hra = Math.round(basic * 0.20);
        const allowances = Math.round(basic * 0.10);
        const bonus = 0;
        const totalEarnings = basic + hra + allowances + bonus;

        const pf = Math.round(basic * 0.12);
        const esi = basic < 21000 ? Math.round(totalEarnings * 0.0075) : 0;
        const tax = Math.round(basic * 0.05);
        const totalDeductions = pf + esi + tax;
        const netSalary = totalEarnings - totalDeductions;

        const newRecord: Omit<PayrollRecord, 'id'> = {
          schoolId: school?.id || 'school_next_main_01',
          staffId: st.id,
          staffName: st.fullName,
          employeeId: st.employeeId,
          departmentName: st.departmentName,
          salaryMonth: selectedMonth,
          basicSalary: basic,
          hra,
          allowances,
          bonus,
          deductions: {
            pf,
            esi,
            advanceDeduction: 0,
            tax,
            other: 0,
          },
          totalEarnings,
          totalDeductions,
          netSalary,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Bank Transfer',
          paymentStatus: 'paid',
          transactionReference: `NEFT/${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await dbService.createDocument('payroll', newRecord);
      }

      await fetchPayroll();
      alert(`Payroll generated successfully for ${activeStaff.length} staff members.`);
    } catch (err) {
      console.error('Failed to generate payroll:', err);
    } finally {
      setGenerating(false);
    }
  };

  const totalPayrollOutflow = payrollRows.reduce((sum, r) => sum + r.netSalary, 0);

  const columns: Column<PayrollRecord>[] = [
    {
      header: 'Employee ID',
      accessorKey: 'employeeId',
      sortable: true,
      className: 'font-mono text-slate-900',
    },
    {
      header: 'Staff Name',
      accessorKey: 'staffName',
      sortable: true,
      className: 'font-medium text-slate-900',
    },
    {
      header: 'Department',
      accessorKey: 'departmentName',
    },
    {
      header: 'Salary Month',
      accessorKey: 'salaryMonth',
      sortable: true,
    },
    {
      header: 'Gross Earnings',
      cell: (r) => <span className="font-mono text-slate-700">{formatCurrency(r.totalEarnings)}</span>,
    },
    {
      header: 'Deductions (PF/Tax)',
      cell: (r) => <span className="font-mono text-rose-600 font-medium">- {formatCurrency(r.totalDeductions)}</span>,
    },
    {
      header: 'Net Take-Home',
      sortable: true,
      cell: (r) => <span className="font-mono font-medium text-emerald-700">{formatCurrency(r.netSalary)}</span>,
    },
    {
      header: 'Status',
      cell: (r) => <Badge variant="success" size="sm" dot>{r.paymentStatus || 'Disbursed'}</Badge>,
    },
    {
      header: 'Payslip',
      className: 'text-right',
      cell: (r) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedPayslip(r)}
          icon={<FileText className="w-3.5 h-3.5" />}
        >
          Slip
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-slate-900 tracking-tight">Staff Monthly Payroll</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Dynamic salary calculations, statutory PF/tax deductions, and electronic payslips from Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded px-3 py-1.5 font-medium max-h-[36px]"
          >
            <option value="November 2026">November 2026</option>
            <option value="December 2026">December 2026</option>
            <option value="January 2027">January 2027</option>
            <option value="February 2027">February 2027</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGeneratePayroll}
            disabled={generating}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />}
          >
            {generating ? 'Processing...' : 'Generate Payroll'}
          </Button>

          <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] uppercase font-medium text-emerald-700 tracking-wider block">Total Outflow</span>
            <p className="text-sm font-medium text-emerald-800 font-mono">{formatCurrency(totalPayrollOutflow)}</p>
          </div>
        </div>
      </div>

      <DataTable
        data={payrollRows}
        columns={columns}
        searchPlaceholder="Search employee, name, or month..."
        emptyMessage="No payroll disbursement records generated yet. Click 'Generate Payroll' to calculate staff salaries."
      />

      {/* Payslip Modal */}
      <Modal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Electronic Staff Payslip"
        maxWidth="lg"
      >
        {selectedPayslip && (
          <div className="space-y-6 text-xs">
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-4">
              <h3 className="text-base font-medium text-slate-900 uppercase">
                {school?.name || 'School Next International Academy'}
              </h3>
              <p className="text-[11px] text-slate-500">{school?.address}, {school?.city}</p>
              <span className="inline-block bg-[#4E2284]/10 text-[#4E2284] px-3 py-0.5 rounded font-medium mt-2">
                Salary Slip for {selectedPayslip.salaryMonth}
              </span>
            </div>

            {/* Employee Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium block">Employee ID:</span>
                <strong className="text-slate-800 font-mono">{selectedPayslip.employeeId}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Staff Name:</span>
                <strong className="text-slate-800">{selectedPayslip.staffName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Department:</span>
                <strong className="text-slate-800">{selectedPayslip.departmentName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Payment Method:</span>
                <strong className="text-slate-800">{selectedPayslip.paymentMethod}</strong>
              </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded overflow-hidden">
              {/* Earnings */}
              <div>
                <div className="bg-slate-100 px-3 py-1.5 font-medium text-slate-800 border-b border-slate-200">
                  Gross Earnings
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowances</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.allowances)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-medium text-slate-900">
                    <span>Total Earnings</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.totalEarnings)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border-t sm:border-t-0 sm:border-l border-slate-200">
                <div className="bg-slate-100 px-3 py-1.5 font-medium text-slate-800 border-b border-slate-200">
                  Statutory Deductions
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (PF - 12%)</span>
                    <span className="font-mono text-rose-600">{formatCurrency(selectedPayslip.deductions.pf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Income Tax (TDS)</span>
                    <span className="font-mono text-rose-600">{formatCurrency(selectedPayslip.deductions.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ESI / Medical</span>
                    <span className="font-mono text-rose-600">{formatCurrency(selectedPayslip.deductions.esi)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-medium text-rose-700">
                    <span>Total Deductions</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Amount Banner */}
            <div className="bg-[#4E2284]/10 border border-[#4E2284]/20 rounded p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#4E2284] font-medium uppercase tracking-wide block">
                  Net Salary Payable
                </span>
                <span className="text-xs text-slate-600">Disbursed via {selectedPayslip.transactionReference}</span>
              </div>
              <div className="text-2xl font-medium text-[#4E2284] font-mono">
                {formatCurrency(selectedPayslip.netSalary)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPayslip(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} icon={<Printer className="w-3.5 h-3.5" />}>
                Print Payslip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
