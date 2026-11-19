import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Receipt, 
  Printer
} from 'lucide-react';
import { Student, FeeStructure, FeePayment } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const FeeCollection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlStudentId = searchParams.get('studentId');
  const { school, selectedAcademicYear, refreshStats } = useSchool();

  const [students, setStudents] = useState<Student[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);

  // Selection
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);

  // Form Fields
  const [receiptNumber, setReceiptNumber] = useState<string>(`RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [discount, setDiscount] = useState<number>(0);
  const [lateFee, setLateFee] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(28500);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque'>('UPI');
  const [transactionReference, setTransactionReference] = useState<string>('UPI/5129384729/HDFC');
  const [remarks, setRemarks] = useState<string>('Term fee collection');

  const [saving, setSaving] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<FeePayment | null>(null);

  useEffect(() => {
    const init = async () => {
      const stdList = await dbService.getCollection<Student>('students');
      const structList = await dbService.getCollection<FeeStructure>('feeStructures');
      const payList = await dbService.getCollection<FeePayment>('payments');

      setStudents(stdList);
      setFeeStructures(structList);
      setPayments(payList);

      if (urlStudentId) {
        const found = stdList.find(s => s.id === urlStudentId);
        if (found) setSelectedStudent(found);
      } else if (stdList.length > 0) {
        setSelectedStudent(stdList[0]);
      }

      if (structList.length > 0) {
        setSelectedFeeStructure(structList[0]);
        setAmountPaid(structList[0].totalAmount);
      }
    };
    init();
  }, [urlStudentId]);

  const baseFee = selectedFeeStructure?.totalAmount || 28500;
  const totalPayable = Math.max(0, baseFee - discount + lateFee);
  const remainingBalance = Math.max(0, totalPayable - amountPaid);

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedFeeStructure) {
      alert('Please select student and fee structure.');
      return;
    }

    setSaving(true);
    try {
      const newPayment: Omit<FeePayment, 'id'> = {
        receiptNumber,
        schoolId: 'school_next_main_01',
        academicYearId: selectedAcademicYear?.id || 'ay_2026_2027',
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName,
        admissionNumber: selectedStudent.admissionNumber,
        classId: selectedStudent.classId,
        className: selectedStudent.className,
        sectionId: selectedStudent.sectionId,
        sectionName: selectedStudent.sectionName,
        feeStructureId: selectedFeeStructure.id,
        feeName: selectedFeeStructure.feeName,
        totalFee: baseFee,
        previousBalance: 0,
        discount,
        lateFee,
        amountPaid,
        remainingBalance,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod,
        transactionReference,
        collectedBy: 'Ramesh Gupta (Accountant)',
        remarks,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await dbService.createDocument<FeePayment>('payments', newPayment);
      setPayments(prev => [saved, ...prev]);
      setCurrentReceipt(saved);
      await refreshStats();
      setReceiptModalOpen(true);

      setReceiptNumber(`RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-slate-900 tracking-tight">Fee Collection & Counter</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Accept school tuition, transport, lab, and examination payments with instant receipt generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleCollectPayment}>
            <Card title="Fee Collection Receipt Form" subtitle="Enter payment details and record transaction">
              <div className="space-y-3.5 text-xs">
                {/* Student Selection */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Student *</label>
                  <select
                    value={selectedStudent?.id || ''}
                    onChange={(e) => {
                      const s = students.find(std => std.id === e.target.value);
                      setSelectedStudent(s || null);
                    }}
                    className="w-full px-2.5 h-[36px] max-h-[36px] bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284] font-medium"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} • Adm: {s.admissionNumber} ({s.className}-{s.sectionName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fee Structure */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fee Structure & Installment *</label>
                  <select
                    value={selectedFeeStructure?.id || ''}
                    onChange={(e) => {
                      const f = feeStructures.find(struct => struct.id === e.target.value);
                      setSelectedFeeStructure(f || null);
                      if (f) setAmountPaid(f.totalAmount);
                    }}
                    className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
                  >
                    {feeStructures.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.feeName} ({f.className}) — {formatCurrency(f.totalAmount)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculation Fields */}
                <div className="grid grid-cols-3 gap-3 p-2.5 bg-slate-50 rounded border border-slate-100">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Base Fee</label>
                    <p className="font-mono font-medium text-slate-900 text-xs">{formatCurrency(baseFee)}</p>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={e => setDiscount(Number(e.target.value))}
                      className="w-full px-2 h-[30px] max-h-[36px] bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Late Fine (₹)</label>
                    <input
                      type="number"
                      value={lateFee}
                      onChange={e => setLateFee(Number(e.target.value))}
                      className="w-full px-2 h-[30px] max-h-[36px] bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Amount Collecting (₹) *</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={e => setAmountPaid(Number(e.target.value))}
                      required
                      className="w-full px-2.5 h-[36px] max-h-[36px] bg-emerald-50 text-emerald-900 font-medium border border-emerald-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Remaining Due Balance</label>
                    <p className="font-mono font-medium text-rose-600 text-xs mt-2">{formatCurrency(remainingBalance)}</p>
                  </div>
                </div>

                {/* Payment Method & Ref */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash at Counter</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                      <option value="Card">Debit / Credit Card (POS)</option>
                      <option value="Cheque">Bank Cheque / DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Transaction Ref / Cheque No</label>
                    <input
                      type="text"
                      value={transactionReference}
                      onChange={e => setTransactionReference(e.target.value)}
                      placeholder="e.g. UPI/12345/SBI"
                      className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button variant="primary" type="submit" loading={saving} icon={<Receipt className="w-3.5 h-3.5" />}>
                    Collect Payment & Print Receipt
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Right: Selected Student Snapshot & Recent Collections */}
        <div className="space-y-5">
          {selectedStudent && (
            <Card title="Student Snapshot">
              <div className="space-y-1.5 text-xs">
                <p><span className="text-slate-400">Name:</span> <strong className="text-slate-900 font-medium">{selectedStudent.fullName}</strong></p>
                <p><span className="text-slate-400">Class:</span> <span className="text-slate-800">{selectedStudent.className} ({selectedStudent.sectionName})</span></p>
                <p><span className="text-slate-400">Adm No:</span> <span className="font-mono text-slate-800">{selectedStudent.admissionNumber}</span></p>
                <p><span className="text-slate-400">Father:</span> <span className="text-slate-800">{selectedStudent.fatherName} ({selectedStudent.fatherPhone})</span></p>
              </div>
            </Card>
          )}

          <Card title="Recent Counter Collections">
            <div className="divide-y divide-slate-100">
              {payments.slice(0, 5).map(p => (
                <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-medium text-slate-900">{p.receiptNumber}</span>
                    <p className="text-slate-500 text-[11px]">{p.studentName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-emerald-600 block">{formatCurrency(p.amountPaid)}</span>
                    <span className="text-[10px] text-slate-400">{p.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {currentReceipt && (
        <Modal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          title="Official Fee Payment Receipt"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-5 bg-white border border-slate-200 rounded space-y-3.5 print:p-0 print:border-none">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-medium text-slate-900 uppercase tracking-tight">
                  {school?.name || 'School Next International Academy'}
                </h2>
                <p className="text-xs text-slate-500">{school?.address}, {school?.city} ({school?.pinCode})</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Affiliation: {school?.affiliationNumber} • Phone: {school?.phone}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-[#4E2284] text-white text-[10px] font-medium uppercase tracking-wider">
                  Fee Receipt (Student Copy)
                </span>
              </div>

              <div className="grid grid-cols-2 text-xs gap-3">
                <div>
                  <p><span className="text-slate-400">Receipt No:</span> <strong className="font-mono text-slate-900 font-medium">{currentReceipt.receiptNumber}</strong></p>
                  <p><span className="text-slate-400">Student:</span> <strong className="text-slate-900 font-medium">{currentReceipt.studentName}</strong></p>
                  <p><span className="text-slate-400">Admission No:</span> <span className="font-mono">{currentReceipt.admissionNumber}</span></p>
                </div>
                <div className="text-right">
                  <p><span className="text-slate-400">Date:</span> <strong className="font-medium">{formatDate(currentReceipt.paymentDate)}</strong></p>
                  <p><span className="text-slate-400">Class & Section:</span> <strong className="font-medium">{currentReceipt.className} - {currentReceipt.sectionName}</strong></p>
                  <p><span className="text-slate-400">Payment Mode:</span> <span>{currentReceipt.paymentMethod}</span></p>
                </div>
              </div>

              {/* Table of items */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700">
                  <tr>
                    <th className="p-2 font-medium">Description</th>
                    <th className="p-2 text-right font-medium">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-medium">{currentReceipt.feeName}</td>
                    <td className="p-2 text-right font-mono">{formatCurrency(currentReceipt.totalFee)}</td>
                  </tr>
                  {currentReceipt.discount > 0 && (
                    <tr>
                      <td className="p-2 text-emerald-600">Less: Concession / Discount</td>
                      <td className="p-2 text-right font-mono text-emerald-600">- {formatCurrency(currentReceipt.discount)}</td>
                    </tr>
                  )}
                  {currentReceipt.lateFee > 0 && (
                    <tr>
                      <td className="p-2 text-rose-600">Add: Late Payment Fine</td>
                      <td className="p-2 text-right font-mono text-rose-600">+ {formatCurrency(currentReceipt.lateFee)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-medium text-slate-900 border-t border-slate-200">
                    <td className="p-2">Total Amount Received</td>
                    <td className="p-2 text-right font-mono text-xs text-emerald-700 font-medium">
                      {formatCurrency(currentReceipt.amountPaid)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-400">
                <div>
                  <p>Collected by: {currentReceipt.collectedBy}</p>
                  <p>Computer-generated receipt, valid without physical seal.</p>
                </div>
                <div className="text-right">
                  <p className="border-t border-slate-300 pt-1 font-medium text-slate-700">Authorized Accounts Cashier</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setReceiptModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={handlePrintReceipt} icon={<Printer className="w-3.5 h-3.5" />}>Print Receipt</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
