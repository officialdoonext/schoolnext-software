import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Filter, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  Award, 
  Package, 
  Bus, 
  BookMarked 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

type ReportCategory = 
  | 'students'
  | 'fees'
  | 'attendance'
  | 'examinations'
  | 'staff'
  | 'transport'
  | 'library'
  | 'inventory';

export const ReportsCenter: React.FC = () => {
  const { school, academicYears } = useSchool();
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('fees');
  const [reportRows, setReportRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (activeCategory === 'fees') {
        const data = await dbService.getCollection<any>('payments');
        setReportRows(data);
      } else if (activeCategory === 'students') {
        const data = await dbService.getCollection<any>('students');
        setReportRows(data);
      } else if (activeCategory === 'staff') {
        const data = await dbService.getCollection<any>('staff');
        setReportRows(data);
      } else if (activeCategory === 'library') {
        const data = await dbService.getCollection<any>('libraryBooks');
        setReportRows(data);
      } else if (activeCategory === 'inventory') {
        const data = await dbService.getCollection<any>('inventory');
        setReportRows(data);
      } else if (activeCategory === 'transport') {
        const data = await dbService.getCollection<any>('routes');
        setReportRows(data);
      }
    };
    fetchReportData();
  }, [activeCategory]);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeCategory.toUpperCase());
    XLSX.writeFile(wb, `SchoolNext_${activeCategory}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const categories: { key: ReportCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'fees', label: 'Fee Collections & Dues', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'students', label: 'Student Admissions', icon: <Users className="w-4 h-4" /> },
    { key: 'staff', label: 'Staff & Faculty', icon: <Award className="w-4 h-4" /> },
    { key: 'library', label: 'Library Circulation', icon: <BookMarked className="w-4 h-4" /> },
    { key: 'inventory', label: 'Inventory & Assets', icon: <Package className="w-4 h-4" /> },
    { key: 'transport', label: 'Bus Routes & Commute', icon: <Bus className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Reporting Center</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Export comprehensive audit-ready school spreadsheets, financial statements, and academic summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Export to Excel (.xlsx)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="print:hidden flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === c.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.icon}
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Printable Report Data Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
              {school?.name || 'School Next International Academy'} — {activeCategory.toUpperCase()} REPORT
            </h3>
            <p className="text-xs text-slate-500">
              Generated on: {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} • Active Session 2026-2027
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            {reportRows.length} Total Records
          </span>
        </div>

        {/* Dynamic Table Preview */}
        <div className="overflow-x-auto">
          {reportRows.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No records found for this module.</p>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  {Object.keys(reportRows[0] || {})
                    .filter(k => !['id', 'schoolId', 'createdAt', 'updatedAt'].includes(k))
                    .slice(0, 6)
                    .map(key => (
                      <th key={key} className="p-3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                    {Object.entries(row)
                      .filter(([k]) => !['id', 'schoolId', 'createdAt', 'updatedAt'].includes(k))
                      .slice(0, 6)
                      .map(([k, val], cIdx) => (
                        <td key={cIdx} className="p-3">
                          {typeof val === 'number' && (k.toLowerCase().includes('fee') || k.toLowerCase().includes('salary') || k.toLowerCase().includes('amount'))
                            ? formatCurrency(val)
                            : String(val ?? '-')}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

