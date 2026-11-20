import React, { useState, useEffect } from 'react';
import { Award, Printer, Download, FileText } from 'lucide-react';
import { Student } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatDate } from '@/utils/formatters';

export const Certificates: React.FC = () => {
  const { school } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [certificateType, setCertificateType] = useState<'bonafide' | 'transfer' | 'character' | 'study'>('bonafide');

  useEffect(() => {
    const fetchStudents = async () => {
      const list = await dbService.getCollection<Student>('students');
      setStudents(list);
      if (list.length > 0) setSelectedStudentId(list[0].id);
    };
    fetchStudents();
  }, []);

  const student = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-6 w-full">
      {/* Controls */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Certificate Generation Station</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate official school certificates with digital verification</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={certificateType}
            onChange={e => setCertificateType(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium"
          >
            <option value="bonafide">Bonafide Certificate</option>
            <option value="transfer">Transfer Certificate (TC)</option>
            <option value="character">Character & Conduct Certificate</option>
            <option value="study">Study Certificate</option>
          </select>

          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.className})
              </option>
            ))}
          </select>

          <Button variant="primary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
            Print Certificate
          </Button>
        </div>
      </div>

      {/* Printable Certificate Template */}
      {student && (
        <div className="bg-white rounded-2xl border-4 border-double border-slate-400 p-10 shadow-lg text-slate-900 print:shadow-none print:border-slate-500 print:p-8">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wide text-slate-900">
              {school?.name || 'School Next International Academy'}
            </h2>
            <p className="text-xs text-slate-600">{school?.address}, {school?.city} ({school?.pinCode})</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Affiliation No: {school?.affiliationNumber} • Registration: {school?.registrationNumber}
            </p>
            <div className="mt-4">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-1.5 rounded-full uppercase tracking-widest">
                {certificateType === 'bonafide' && 'Bonafide Certificate'}
                {certificateType === 'transfer' && 'Transfer Certificate (TC)'}
                {certificateType === 'character' && 'Character & Conduct Certificate'}
                {certificateType === 'study' && 'Certificate of Study'}
              </span>
            </div>
          </div>

          {/* Certificate Body Text */}
          <div className="py-8 space-y-6 text-sm leading-relaxed text-slate-800 font-serif">
            <p className="text-right text-xs font-sans text-slate-500">
              Certificate Ref: <strong>SN/CERT/2026/0882</strong> • Date: <strong>19-11-2026</strong>
            </p>

            <p className="indent-8">
              This is to certify that <strong>Master/Miss {student.fullName}</strong>, 
              son/daughter of <strong>Mr. {student.fatherName}</strong> and <strong>Mrs. {student.motherName}</strong>, 
              bearing Admission Number <strong className="font-mono">{student.admissionNumber}</strong> and Roll Number <strong>#{student.rollNumber}</strong>, 
              is a bonafide student of this institution studying in <strong>{student.className} (Section {student.sectionName})</strong> during the academic academic year <strong>2026-2027</strong>.
            </p>

            <p className="indent-8">
              As per our school admission records, the student's recorded Date of Birth is <strong>{formatDate(student.dob)}</strong>. 
              During their tenure in this school, their moral character, discipline, and general conduct have been found to be <strong>EXEMPLARY</strong>.
            </p>

            {certificateType === 'transfer' && (
              <p className="indent-8">
                All school dues and library clearances have been settled up to the current term. 
                The student is leaving the institution on parental transfer request and is permitted admission into any recognized school.
              </p>
            )}

            <p className="indent-8">
              We wish the student every success in all future academic pursuits.
            </p>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-16 text-xs text-slate-700">
            <div className="text-center">
              <span className="font-mono italic text-slate-500 block mb-1">Administrative Office</span>
              <p className="border-t border-slate-500 pt-1 font-bold">Checked By (Clerk)</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-slate-300 mx-auto mb-2 flex items-center justify-center text-[9px] uppercase tracking-wider text-slate-400 font-sans">
                Official Seal
              </div>
              <span className="font-mono font-bold block mb-1">Dr. Rajesh Sharma</span>
              <p className="border-t border-slate-500 pt-1 font-bold">Principal / Head of Institution</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

