import React, { useState, useEffect } from 'react';
import { IndianRupee, Printer, CheckCircle, FileText } from 'lucide-react';
import { Staff, PayrollRecord } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatCurrency } from '@/utils/formatters';

export const Payroll: React.FC = () => {
  const { school } = useSchool();
  const [payrollRows, setPayrollRows] = useState<PayrollRecord[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    const generatePayroll = async () => {
      const staffList = await dbService.getCollection<Staff>('staff');

      const rows: PayrollRecord[] = staffList.map(st => {
        const basic = st.basicSalary || 50000;
        const hra = Math.round(basic * 0.20);
        const allowances = Math.round(basic * 0.10);
        const bonus = 0;
        const totalEarnings = basic + hra + allowances + bonus;

        const pf = Math.round(basic * 0.12);
        const esi = basic < 21000 ? Math.round(totalEarnings * 0.0075) : 0;
        const tax = Math.round(basic * 0.05);
        const totalDeductions = pf + esi + tax;
        const netSalary = totalEarnings - totalDeductions;

        return {
          id: `pay_${st.id}_nov2026`,
          schoolId: 'school_next_main_01',
          staffId: st.id,
          staffName: st.fullName,
          employeeId: st.employeeId,
          departmentName: st.departmentName,
          salaryMonth: 'November 2026',
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
          paymentDate: '2026-11-01',
          paymentMethod: 'Bank Transfer',
          paymentStatus: 'paid',
          transactionReference: `NEFT/HDFC/${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      setPayrollRows(rows);
    };
    generatePayroll();
  }, []);

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
      className: 'font-bold text-slate-900',
    },
    {
      header: 'Department',
      accessorKey: 'departmentName',
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
      cell: (r) => <span className="font-mono font-bold text-emerald-700">{formatCurrency(r.netSalary)}</span>,
    },
    {
      header: 'Status',
      cell: () => <Badge variant="success" size="sm" dot>Disbursed</Badge>,
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Monthly Payroll</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Automated salary calculations, statutory PF/tax deductions, and electronic payslips.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Total Monthly Outflow</span>
          <p className="text-xl font-bold text-emerald-800 font-mono">{formatCurrency(totalPayrollOutflow)}</p>
        </div>
      </div>

      <DataTable
        data={payrollRows}
        columns={columns}
        searchPlaceholder="Search staff by employee ID, name..."
        searchFields={['staffName', 'employeeId', 'departmentName']}
        exportFileName="Monthly_Payroll_Sheet"
      />

      {/* Payslip Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={Boolean(selectedPayslip)}
          onClose={() => setSelectedPayslip(null)}
          title="Official Employee Salary Slip"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 print:p-0 print:border-none">
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="font-black text-slate-900 text-lg uppercase">
                  {school?.name || 'School Next International Academy'}
                </h3>
                <p className="text-xs text-slate-500">{school?.address}, {school?.city}</p>
                <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                  Payslip for {selectedPayslip.salaryMonth}
                </span>
              </div>

              <div className="grid grid-cols-2 text-xs gap-3">
                <div>
                  <p><span className="text-slate-400">Employee:</span> <strong className="text-slate-900">{selectedPayslip.staffName}</strong></p>
                  <p><span className="text-slate-400">Employee ID:</span> <span className="font-mono">{selectedPayslip.employeeId}</span></p>
                  <p><span className="text-slate-400">Department:</span> {selectedPayslip.departmentName}</p>
                </div>
                <div className="text-right">
                  <p><span className="text-slate-400">Payment Date:</span> {selectedPayslip.paymentDate}</p>
                  <p><span className="text-slate-400">Mode:</span> {selectedPayslip.paymentMethod}</p>
                  <p><span className="text-slate-400">Ref:</span> <span className="font-mono">{selectedPayslip.transactionReference}</span></p>
                </div>
              </div>

              {/* Salary Breakdown Table */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-50 p-2 font-bold text-slate-800 border-b border-slate-200">
                    Earnings
                  </div>
                  <div className="p-2 space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Basic Salary</span>
                      <span className="font-mono">{formatCurrency(selectedPayslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">House Rent Allowance (HRA)</span>
                      <span className="font-mono">{formatCurrency(selectedPayslip.hra)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Special Allowances</span>
                      <span className="font-mono">{formatCurrency(selectedPayslip.allowances)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
                      <span>Total Earnings</span>
                      <span className="font-mono">{formatCurrency(selectedPayslip.totalEarnings)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-50 p-2 font-bold text-slate-800 border-b border-slate-200">
                    Deductions
                  </div>
                  <div className="p-2 space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provident Fund (PF)</span>
                      <span className="font-mono">{formatCurrency(selectedPayslip.deductions.pf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Income Tax (TDS)</span>
                      <span className="font-mono">{formatCurrency(selectedPayslip.deductions.tax)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-rose-600">
                      <span>Total Deductions</span>
                      <span className="font-mono">{formatCurrency(selectedPayslip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-sm font-bold text-emerald-900">
                <span>Net Salary Payable:</span>
                <span className="font-mono text-lg">{formatCurrency(selectedPayslip.netSalary)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedPayslip(null)}>Close</Button>
              <Button variant="primary" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Payslip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

