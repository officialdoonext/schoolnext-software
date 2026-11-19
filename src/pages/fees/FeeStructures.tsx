import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, IndianRupee, Layers } from 'lucide-react';
import { FeeStructure, FeeCategory, SchoolClass } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const FeeStructures: React.FC = () => {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    feeName: '',
    classId: '',
    feeCategoryId: '',
    totalAmount: 28500,
    paymentFrequency: 'quarterly' as 'one_time' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual',
    dueDate: '2026-05-10',
    lateFee: 500,
  });

  const fetchData = async () => {
    const s = await dbService.getCollection<FeeStructure>('feeStructures');
    const cat = await dbService.getCollection<FeeCategory>('feeCategories');
    const cls = await dbService.getCollection<SchoolClass>('classes');
    setStructures(s);
    setCategories(cat);
    setClasses(cls);
    if (cls.length > 0 && cat.length > 0) {
      setFormData(prev => ({
        ...prev,
        classId: cls[0].id,
        feeCategoryId: cat[0].id,
        feeName: `${cls[0].name} Term 1 Composite Fee`,
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selClass = classes.find(c => c.id === formData.classId);
    const selCat = categories.find(c => c.id === formData.feeCategoryId);

    const newStruct = await dbService.createDocument<FeeStructure>('feeStructures', {
      ...formData,
      schoolId: 'school_next_main_01',
      academicYearId: 'ay_2026_2027',
      academicYearName: '2026-2027',
      className: selClass?.name || 'Class',
      feeCategoryName: selCat?.name || 'Tuition Fee',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setStructures(prev => [newStruct, ...prev]);
    setModalOpen(false);
  };

  const columns: Column<FeeStructure>[] = [
    {
      header: 'Fee Title',
      accessorKey: 'feeName',
      sortable: true,
      className: 'font-bold text-slate-900',
    },
    {
      header: 'Category',
      accessorKey: 'feeCategoryName',
      sortable: true,
      cell: (s) => <Badge variant="neutral" size="sm">{s.feeCategoryName}</Badge>,
    },
    {
      header: 'Class',
      accessorKey: 'className',
      sortable: true,
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Frequency',
      accessorKey: 'paymentFrequency',
      className: 'capitalize text-slate-600 text-xs',
    },
    {
      header: 'Total Amount',
      accessorKey: 'totalAmount',
      sortable: true,
      cell: (s) => <span className="font-bold text-slate-900 font-mono">{formatCurrency(s.totalAmount)}</span>,
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (s) => <span className="text-slate-600 text-xs">{formatDate(s.dueDate)}</span>,
    },
    {
      header: 'Late Fine',
      accessorKey: 'lateFee',
      cell: (s) => <span className="text-rose-600 font-mono text-xs">{formatCurrency(s.lateFee)}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fee Structures & Slabs</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure tuition, transport, examination, and laboratory fee structures across classes.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Fee Structure
        </Button>
      </div>

      <DataTable
        data={structures}
        columns={columns}
        searchPlaceholder="Search fee structures by name or class..."
        searchFields={['feeName', 'className', 'feeCategoryName']}
        exportFileName="Fee_Structures"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Fee Structure" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Fee Structure Title *</label>
            <input
              type="text"
              value={formData.feeName}
              onChange={e => setFormData({ ...formData, feeName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Class *</label>
              <select
                value={formData.classId}
                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Fee Category *</label>
              <select
                value={formData.feeCategoryId}
                onChange={e => setFormData({ ...formData, feeCategoryId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Total Fee Amount (₹) *</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={e => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Frequency</label>
              <select
                value={formData.paymentFrequency}
                onChange={e => setFormData({ ...formData, paymentFrequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="annual">Annual</option>
                <option value="one_time">One Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Late Payment Fine (₹)</label>
              <input
                type="number"
                value={formData.lateFee}
                onChange={e => setFormData({ ...formData, lateFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save Fee Structure</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

