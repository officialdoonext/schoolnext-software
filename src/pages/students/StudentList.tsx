import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  CreditCard, 
  FileSpreadsheet, 
  Printer, 
  Filter,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import { Student, SchoolClass, Section } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/formatters';

export const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Deletion modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCollection<Student>('students');
      const cls = await dbService.getCollection<SchoolClass>('classes');
      const sec = await dbService.getCollection<Section>('sections');
      setStudents(data);
      setClasses(cls);
      setSections(sec);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await dbService.deleteDocument('students', deleteId);
      setStudents(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter students based on dropdowns
  const filteredStudents = students.filter(s => {
    if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    return true;
  });

  const columns: Column<Student>[] = [
    {
      header: 'Admission No',
      accessorKey: 'admissionNumber',
      sortable: true,
      className: 'font-mono font-medium text-slate-900',
    },
    {
      header: 'Student Name',
      sortable: true,
      cell: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {student.firstName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{student.fullName}</p>
            <p className="text-[11px] text-slate-400">Roll: #{student.rollNumber} • {student.gender}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Class & Section',
      cell: (student) => (
        <span className="font-medium text-slate-800">
          {student.className} - {student.sectionName}
        </span>
      ),
    },
    {
      header: 'Parent Contact',
      cell: (student) => (
        <div>
          <p className="text-slate-800 font-medium">{student.fatherName}</p>
          <p className="text-[11px] text-slate-500 font-mono">{student.fatherPhone}</p>
        </div>
      ),
    },
    {
      header: 'Admission Date',
      cell: (student) => (
        <span className="text-slate-600">{formatDate(student.admissionDate)}</span>
      ),
    },
    {
      header: 'Transport',
      cell: (student) => (
        student.transportRequired ? (
          <Badge variant="info" size="sm">Bus</Badge>
        ) : (
          <Badge variant="neutral" size="sm">Self</Badge>
        )
      ),
    },
    {
      header: 'Status',
      cell: (student) => {
        const variant = student.status === 'active' ? 'success' : 'neutral';
        return <Badge variant={variant} size="sm" dot>{student.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (student) => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/students/${student.id}`)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
            title="View Full Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/students/id-cards?studentId=${student.id}`)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Print ID Card"
          >
            <CreditCard className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(student.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage student registrations, personal records, academic credentials, and identity cards.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/students/id-cards')}
            icon={<Printer className="w-4 h-4 text-slate-600" />}
          >
            Print ID Cards
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/students/promotion')}
            icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          >
            Student Promotion
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/students/add')}
            icon={<UserPlus className="w-4 h-4" />}
          >
            New Admission
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-600 font-medium">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-600 font-medium">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>

        <div className="ml-auto text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-900">{filteredStudents.length}</span> students
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        searchPlaceholder="Search by name, roll no, admission no, parent..."
        searchFields={['fullName', 'admissionNumber', 'rollNumber', 'fatherName', 'fatherPhone']}
        onRowClick={(student) => navigate(`/students/${student.id}`)}
        selectable
        exportFileName="Students_List"
      />

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Student Record"
        message="Are you sure you want to permanently delete this student record? This action will remove their profile and cannot be undone."
        confirmLabel="Delete Student"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

