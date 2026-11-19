import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  Award, 
  BookOpen, 
  Bus, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Printer, 
  CheckCircle2, 
  XCircle,
  IndianRupee,
  Clock
} from 'lucide-react';
import { Student, FeePayment, AttendanceRecord, MarksEntry } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'parents' | 'attendance' | 'fees' | 'exams' | 'transport'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const std = await dbService.getDocument<Student>('students', studentId || '');
        if (std) {
          setStudent(std);
        } else {
          // Fallback to first student if not matched
          const list = await dbService.getCollection<Student>('students');
          setStudent(list[0] || null);
        }
        const payList = await dbService.getCollection<FeePayment>('payments');
        setPayments(payList.filter(p => p.studentId === studentId || p.studentName === student?.fullName));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [studentId]);

  if (loading || !student) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm">Loading student profile record...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'personal', label: 'Personal Info' },
    { key: 'parents', label: 'Parent Details' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'fees', label: 'Fees & Receipts' },
    { key: 'exams', label: 'Examinations' },
    { key: 'transport', label: 'Transport' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/students/id-cards?studentId=${student.id}`)}
            icon={<Printer className="w-4 h-4" />}
          >
            Generate ID Card
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/fees/collection?studentId=${student.id}`)}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Collect Fees
          </Button>
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-brand-700 text-white flex items-center justify-center font-bold text-3xl shadow-md border-2 border-white ring-4 ring-slate-100 shrink-0">
            {student.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{student.fullName}</h1>
              <Badge variant="success" size="sm" dot>Active Student</Badge>
              {student.transportRequired && <Badge variant="info" size="sm">Transport User</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
              <span>Adm No: <strong className="text-slate-800 font-mono">{student.admissionNumber}</strong></span>
              <span>•</span>
              <span>Class: <strong className="text-slate-800">{student.className} ({student.sectionName})</strong></span>
              <span>•</span>
              <span>Roll: <strong className="text-slate-800">#{student.rollNumber}</strong></span>
              <span>•</span>
              <span>Gender: <strong className="text-slate-800 capitalize">{student.gender}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendance Score</span>
            <p className="text-xl font-bold text-emerald-600">96.4%</p>
          </div>
          <span className="text-xs text-slate-400">AY 2026-2027</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card title="Academic Summary" subtitle="Current term performance snapshot">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">Class Rank</span>
                  <p className="text-base font-bold text-slate-900 mt-1">#4 in 10-A</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">GPA / Grade</span>
                  <p className="text-base font-bold text-brand-600 mt-1">A1 (92.5%)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">Fee Status</span>
                  <p className="text-base font-bold text-emerald-600 mt-1">Clear (No Dues)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">Library Books</span>
                  <p className="text-base font-bold text-slate-900 mt-1">1 Borrowed</p>
                </div>
              </div>
            </Card>

            <Card title="Quick Contact Info" subtitle="Parents primary communication lines">
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Father's Contact:</span>
                  <strong className="text-slate-800 font-mono">{student.fatherPhone}</strong> ({student.fatherName})
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Parent Email:</span>
                  <strong className="text-slate-800">{student.fatherEmail || 'Not provided'}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Address:</span>
                  <strong className="text-slate-800">{student.currentAddress}, {student.city} ({student.pinCode})</strong>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Upcoming Examinations">
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100">
                  <p className="font-semibold text-sky-900">Mathematics - Unit Test 1</p>
                  <p className="text-sky-700 mt-0.5">25 May 2026 • 09:30 AM to 11:00 AM</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="font-semibold text-slate-800">Science Lab Assessment</p>
                  <p className="text-slate-500 mt-0.5">28 May 2026 • Science Block</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'personal' && (
        <Card title="Personal & Demographic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400">Date of Birth:</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(student.dob)}</p>
            </div>
            <div>
              <span className="text-slate-400">Blood Group:</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.bloodGroup || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-400">Nationality:</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.nationality}</p>
            </div>
            <div>
              <span className="text-slate-400">Social Category:</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.category || 'General'}</p>
            </div>
            <div>
              <span className="text-slate-400">Mother Tongue:</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.motherTongue || 'Hindi'}</p>
            </div>
            <div>
              <span className="text-slate-400">Admission Date:</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(student.admissionDate)}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'parents' && (
        <Card title="Parent & Guardian Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Father's Information</h4>
              <p><span className="text-slate-400">Name:</span> <strong className="text-slate-800">{student.fatherName}</strong></p>
              <p><span className="text-slate-400">Phone:</span> <strong className="text-slate-800 font-mono">{student.fatherPhone}</strong></p>
              <p><span className="text-slate-400">Email:</span> <span className="text-slate-800">{student.fatherEmail || '-'}</span></p>
              <p><span className="text-slate-400">Occupation:</span> <span className="text-slate-800">{student.fatherOccupation || '-'}</span></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Mother's Information</h4>
              <p><span className="text-slate-400">Name:</span> <strong className="text-slate-800">{student.motherName}</strong></p>
              <p><span className="text-slate-400">Phone:</span> <strong className="text-slate-800 font-mono">{student.motherPhone || '-'}</strong></p>
              <p><span className="text-slate-400">Occupation:</span> <span className="text-slate-800">{student.motherOccupation || '-'}</span></p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'fees' && (
        <Card title="Fee Payment History & Receipts" subtitle="All fee payments and invoices recorded">
          <div className="divide-y divide-slate-100">
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No fee payments recorded for this student yet.</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="py-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{p.receiptNumber}</span>
                    <p className="text-slate-500 mt-0.5">{p.feeName} • {formatDate(p.paymentDate)}</p>
                    <span className="text-[10px] text-slate-400">Method: {p.paymentMethod} {p.transactionReference && `(${p.transactionReference})`}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900">{formatCurrency(p.amountPaid)}</p>
                    <Badge variant="success" size="sm" dot>Paid</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

