import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  BookOpen, 
  CreditCard, 
  Bus, 
  FileText, 
  Edit3, 
  Printer, 
  ArrowLeft,
  CheckCircle,
  Inbox
} from 'lucide-react';
import { Student, FeePayment, FeeStructure, AttendanceRecord, MarksEntry, ExamType } from '@/types';
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
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [borrowedCount, setBorrowedCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'parents' | 'attendance' | 'fees' | 'exams' | 'transport'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [allStudents, allPayments, allStructures, allAttendance, allMarks, allExams, allBooks] = await Promise.all([
          dbService.getCollection<Student>('students'),
          dbService.getCollection<FeePayment>('payments'),
          dbService.getCollection<FeeStructure>('feeStructures'),
          dbService.getCollection<AttendanceRecord>('attendance'),
          dbService.getCollection<any>('marks'),
          dbService.getCollection<ExamType>('examTypes'),
          dbService.getCollection<any>('libraryBooks'),
        ]);

        let target = allStudents.find(s => s.id === studentId);
        if (!target && allStudents.length > 0) {
          target = allStudents[0];
        }
        setStudent(target || null);

        if (target) {
          setPayments(allPayments.filter(p => p.studentId === target!.id));
          setAttendance(allAttendance.filter(a => a.studentId === target!.id));
          setMarks(allMarks.filter((m: any) => m.studentId === target!.id));
          const borrowed = allBooks.filter((b: any) => b.borrowedBy === target!.id || b.issuedToStudentId === target!.id).length;
          setBorrowedCount(borrowed);
        }

        setFeeStructures(allStructures);
        setExamTypes(allExams);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [studentId]);

  if (loading || !student) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs">
        <p>Loading student profile record...</p>
      </div>
    );
  }

  // Dynamic computations
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  const targetStructure = feeStructures.find(f => f.classId === student.classId) || feeStructures[0];
  const totalFee = targetStructure ? Number(targetStructure.totalAmount) : 0;
  const dueAmount = Math.max(0, totalFee - totalPaid);

  const totalObtained = marks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
  const totalMax = marks.reduce((sum, m) => sum + (Number(m.maxMarks) || 100), 0);
  const aggregateScore = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;

  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half_day').length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'personal', label: 'Personal Info' },
    { key: 'parents', label: 'Parent Details' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'fees', label: 'Fees & Receipts' },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/students')}
        icon={<ArrowLeft className="w-3.5 h-3.5" />}
      >
        Back to Student Directory
      </Button>

      {/* Header Profile Card */}
      <div className="bg-white rounded border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded bg-[#4E2284] flex items-center justify-center font-medium text-2xl text-white shadow-sm">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium text-slate-900 tracking-tight">{student.fullName}</h1>
              <Badge variant={student.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
                {student.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Admission #{student.admissionNumber} • Roll #{student.rollNumber} • Class {student.className} ({student.sectionName || 'A'})
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span>DOB: {student.dob ? formatDate(student.dob) : 'Not specified'}</span>
              <span>•</span>
              <span className="capitalize">{student.gender}</span>
              <span>•</span>
              <span>Blood Group: {student.bloodGroup || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/fees/collection?studentId=${student.id}`)}
            icon={<CreditCard className="w-3.5 h-3.5 text-[#4E2284]" />}
          >
            Collect Fees
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Profile
          </Button>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#4E2284] text-[#4E2284] font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            <Card title="Academic Summary" subtitle="Live student progress from database">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-medium block">Attendance</span>
                  <p className="text-sm font-medium text-emerald-600 mt-1">
                    {attendancePct !== null ? `${attendancePct}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-medium block">GPA / Grade</span>
                  <p className="text-sm font-medium text-[#4E2284] mt-1">
                    {aggregateScore !== null ? `${aggregateScore}%` : 'Pending'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-medium block">Fee Status</span>
                  <p className={`text-sm font-medium mt-1 ${dueAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {dueAmount === 0 ? 'Clear (Paid)' : `Due: ${formatCurrency(dueAmount)}`}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 font-medium block">Library Books</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{borrowedCount} Issued</p>
                </div>
              </div>
            </Card>

            <Card title="Contact Details" subtitle="Primary parents communication lines">
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Father's Contact:</span>
                  <strong className="text-slate-800 font-mono font-medium">{student.fatherPhone}</strong> ({student.fatherName})
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Parent Email:</span>
                  <strong className="text-slate-800 font-medium">{student.fatherEmail || 'Not specified'}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Address:</span>
                  <strong className="text-slate-800 font-medium">{student.currentAddress || 'On file'}, {student.city || ''} ({student.pinCode || ''})</strong>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Upcoming School Examinations" subtitle="Official academic calendar">
              {examTypes.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <Inbox className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <span>No upcoming exams scheduled.</span>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {examTypes.slice(0, 3).map((ex) => (
                    <div key={ex.id} className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <p className="font-medium text-slate-900">{ex.name}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Evaluation Weightage: {ex.weightagePercent || 20}%</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'personal' && (
        <Card title="Personal & Demographic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div>
              <span className="text-slate-500">Date of Birth:</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{student.dob ? formatDate(student.dob) : 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-500">Blood Group:</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{student.bloodGroup || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-500">Nationality:</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{student.nationality || 'Indian'}</p>
            </div>
            <div>
              <span className="text-slate-500">Social Category:</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{student.category || 'General'}</p>
            </div>
            <div>
              <span className="text-slate-500">Mother Tongue:</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{student.motherTongue || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-500">Admission Date:</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{student.admissionDate ? formatDate(student.admissionDate) : 'On record'}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'parents' && (
        <Card title="Parent & Guardian Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-medium text-slate-900 text-sm">Father's Information</h4>
              <p><span className="text-slate-500">Name:</span> <strong className="text-slate-800 font-medium">{student.fatherName || '-'}</strong></p>
              <p><span className="text-slate-500">Phone:</span> <strong className="text-slate-800 font-mono font-medium">{student.fatherPhone || '-'}</strong></p>
              <p><span className="text-slate-500">Email:</span> <span className="text-slate-800">{student.fatherEmail || '-'}</span></p>
              <p><span className="text-slate-500">Occupation:</span> <span className="text-slate-800">{student.fatherOccupation || '-'}</span></p>
            </div>

            <div className="p-4 rounded bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-medium text-slate-900 text-sm">Mother's Information</h4>
              <p><span className="text-slate-500">Name:</span> <strong className="text-slate-800 font-medium">{student.motherName || '-'}</strong></p>
              <p><span className="text-slate-500">Phone:</span> <strong className="text-slate-800 font-mono font-medium">{student.motherPhone || '-'}</strong></p>
              <p><span className="text-slate-500">Occupation:</span> <span className="text-slate-800">{student.motherOccupation || '-'}</span></p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card title="Student Attendance Register" subtitle="Dynamic attendance session records">
          {attendance.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
              <span>No attendance records recorded for this student yet.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {attendance.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-900">{formatDate(att.date)}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{att.remarks || 'Regular session'}</p>
                  </div>
                  <Badge
                    variant={att.status === 'present' ? 'success' : att.status === 'absent' ? 'danger' : 'warning'}
                    size="sm"
                    dot
                  >
                    {att.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'fees' && (
        <Card title="Fee Payment History & Receipts" subtitle="All verified fee receipts from Firestore">
          <div className="divide-y divide-slate-100">
            {payments.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
                <span>No fee payments recorded for this student yet.</span>
              </div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-medium text-slate-900">{p.receiptNumber}</span>
                    <p className="text-slate-500 mt-0.5">{p.feeName} • {formatDate(p.paymentDate)}</p>
                    <span className="text-[10px] text-slate-400">Method: {p.paymentMethod} {p.transactionReference && `(${p.transactionReference})`}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(p.amountPaid)}</p>
                    <Badge variant="success" size="sm" dot>{p.status || 'Paid'}</Badge>
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
