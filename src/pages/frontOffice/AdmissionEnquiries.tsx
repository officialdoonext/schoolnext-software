import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, Calendar, UserPlus, CheckCircle } from 'lucide-react';
import { AdmissionEnquiry } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatDate } from '@/utils/formatters';

export const AdmissionEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    enquiryNumber: `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    studentName: '',
    parentName: '',
    phone: '',
    email: '',
    interestedClass: 'Class 6',
    previousSchool: 'Modern School',
    enquiryDate: new Date().toISOString().split('T')[0],
    followUpDate: '2026-05-20',
    assignedStaffName: 'Priya Sharma',
    notes: 'Interested in sports and coding lab',
  });

  useEffect(() => {
    const fetchEnquiries = async () => {
      const data = await dbService.getCollection<AdmissionEnquiry>('enquiries');
      setEnquiries(data);
    };
    fetchEnquiries();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEnq = await dbService.createDocument<AdmissionEnquiry>('enquiries', {
      ...formData,
      schoolId: 'school_next_main_01',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setEnquiries(prev => [newEnq, ...prev]);
    setModalOpen(false);
  };

  const columns: Column<AdmissionEnquiry>[] = [
    {
      header: 'Enquiry No',
      accessorKey: 'enquiryNumber',
      sortable: true,
      className: 'font-mono text-slate-900',
    },
    {
      header: 'Student Name',
      accessorKey: 'studentName',
      sortable: true,
      cell: (e) => (
        <div>
          <p className="font-bold text-slate-900">{e.studentName}</p>
          <p className="text-[11px] text-slate-400">Target: {e.interestedClass}</p>
        </div>
      ),
    },
    {
      header: 'Parent Contact',
      cell: (e) => (
        <div>
          <p className="font-medium text-slate-800">{e.parentName}</p>
          <p className="font-mono text-[11px] text-slate-500">{e.phone}</p>
        </div>
      ),
    },
    {
      header: 'Enquiry Date',
      cell: (e) => <span className="text-slate-600 text-xs">{formatDate(e.enquiryDate)}</span>,
    },
    {
      header: 'Follow-up Date',
      cell: (e) => <span className="text-slate-700 font-medium text-xs">{formatDate(e.followUpDate)}</span>,
    },
    {
      header: 'Assigned Staff',
      accessorKey: 'assignedStaffName',
      cell: (e) => <span className="text-slate-800 font-medium">{e.assignedStaffName || 'Reception Desk'}</span>,
    },
    {
      header: 'Status',
      cell: (e) => {
        const variant = e.status === 'admitted' ? 'success' : e.status === 'contacted' ? 'info' : 'warning';
        return <Badge variant={variant} size="sm" dot>{e.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Front Desk & Admission Enquiries</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Log new parent admission inquiries, campus tours, follow-up calls, and conversion tracking.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Enquiry
        </Button>
      </div>

      <DataTable
        data={enquiries}
        columns={columns}
        searchPlaceholder="Search enquiries by student, parent, phone..."
        searchFields={['studentName', 'parentName', 'phone', 'enquiryNumber']}
        exportFileName="Admission_Enquiries"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Admission Enquiry" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student Name *</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Class *</label>
              <input
                type="text"
                value={formData.interestedClass}
                onChange={e => setFormData({ ...formData, interestedClass: e.target.value })}
                required
                placeholder="Class 6"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Parent Name *</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Previous School</label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={e => setFormData({ ...formData, previousSchool: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Next Follow-Up Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes & Inquiries</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Log Enquiry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

