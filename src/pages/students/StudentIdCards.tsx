import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, Filter, QrCode } from 'lucide-react';
import { Student } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Button } from '@/components/common/Button';

export const StudentIdCards: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlStudentId = searchParams.get('studentId');
  const { school } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(urlStudentId || 'all');

  useEffect(() => {
    const fetchStudents = async () => {
      const list = await dbService.getCollection<Student>('students');
      setStudents(list);
    };
    fetchStudents();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const displayedStudents = selectedStudentId === 'all'
    ? students
    : students.filter(s => s.id === selectedStudentId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Control Bar - hidden during print */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Identity Cards</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate and print official school student ID cards</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Students ({students.length})</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.className}-{s.sectionName})
              </option>
            ))}
          </select>

          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print ID Cards
          </Button>
        </div>
      </div>

      {/* ID Cards Printable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {displayedStudents.map((std) => (
          <div
            key={std.id}
            className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-md flex flex-col text-slate-900 print:shadow-none print:border-slate-400 print:break-inside-avoid"
            style={{ width: '100%', maxWidth: '340px', minHeight: '480px' }}
          >
            {/* ID Card Header */}
            <div className="bg-slate-950 text-white p-4 text-center relative border-b-2 border-sky-400">
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  SN
                </div>
                <h3 className="font-extrabold text-sm uppercase tracking-wide leading-tight text-white">
                  {school?.name || 'School Next Academy'}
                </h3>
              </div>
              <p className="text-[10px] text-sky-300 mt-0.5 tracking-wider uppercase font-medium">
                Student Identity Card (2026-2027)
              </p>
            </div>

            {/* Photo & Name Section */}
            <div className="p-4 text-center flex-1 flex flex-col items-center">
              <div className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-bold text-3xl text-slate-700 shadow-inner my-1">
                {std.firstName.charAt(0)}
              </div>

              <h4 className="font-extrabold text-slate-900 text-base mt-2">{std.fullName}</h4>
              <p className="text-xs font-bold text-brand-600 font-mono tracking-wide">
                CLASS: {std.className} - {std.sectionName}
              </p>

              {/* Data Rows */}
              <div className="w-full text-left text-[11px] space-y-1.5 mt-4 pt-3 border-t border-slate-100 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Admission No:</span>
                  <span className="font-mono font-bold text-slate-900">{std.admissionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Roll Number:</span>
                  <span className="font-bold text-slate-900">#{std.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Blood Group:</span>
                  <span className="font-bold text-rose-600">{std.bloodGroup || 'B+'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Parent Contact:</span>
                  <span className="font-mono font-semibold text-slate-900">{std.fatherPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Transport Route:</span>
                  <span className="font-medium text-slate-900 truncate max-w-[150px]">
                    {std.transportRouteName || 'Self Commute'}
                  </span>
                </div>
              </div>

              {/* Barcode / QR & Signature */}
              <div className="w-full mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <QrCode className="w-8 h-8 text-slate-800" />
                  <div className="text-[9px] text-left leading-tight">
                    <span className="font-mono font-bold text-slate-800">{std.admissionNumber}</span>
                    <span className="block text-slate-400">Scan to Verify</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-700 italic block">Dr. Rajesh Sharma</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 border-t border-slate-300 pt-0.5 block">
                    Principal Seal
                  </span>
                </div>
              </div>
            </div>

            {/* ID Card Footer */}
            <div className="bg-slate-50 text-[9px] text-slate-400 text-center py-1.5 border-t border-slate-100">
              Valid Till: 31st March 2027 • Phone: {school?.phone || '+91 98765 43210'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

