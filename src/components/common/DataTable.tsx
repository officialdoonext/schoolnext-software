import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from './Button';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  selectable?: boolean;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  exportFileName?: string;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchFields = [],
  onRowClick,
  actions,
  selectable = false,
  onSelectedRowsChange,
  exportFileName = 'export',
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Filter based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchTerm, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field?: keyof T) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedData.map(item => item.id));
      setSelectedIds(allIds);
      onSelectedRowsChange?.(paginatedData);
    } else {
      setSelectedIds(new Set());
      onSelectedRowsChange?.([]);
    }
  };

  const handleSelectRow = (item: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.add(item.id);
    }
    setSelectedIds(newSelected);
    const selectedRows = data.filter(d => newSelected.has(d.id));
    onSelectedRowsChange?.(selectedRows);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = sortedData.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        if (col.accessorKey) {
          row[col.header] = item[col.accessorKey];
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${exportFileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Control Bar: Inputs and buttons max-height 36px */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72 max-h-[36px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 h-[36px] max-h-[36px] text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284] focus:border-transparent transition-all shadow-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Export Excel
          </Button>

          {actions}
        </div>
      </div>

      {/* Table Container: Max radius 6px */}
      <div className="bg-white border border-slate-200/90 rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-medium text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                {selectable && (
                  <th className="px-3 py-2.5 w-10 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-[#4E2284] focus:ring-[#4E2284]"
                      checked={paginatedData.length > 0 && paginatedData.every(i => selectedIds.has(i.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-3 py-2.5 ${col.sortable ? 'cursor-pointer select-none hover:text-[#4E2284]' : ''} ${col.className || ''}`}
                    onClick={() => col.sortable && handleSort(col.accessorKey)}
                  >
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <p className="font-medium text-slate-500 text-xs">{emptyMessage}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={`hover:bg-slate-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${selectedIds.has(row.id) ? 'bg-[#4E2284]/5' : ''}`}
                  >
                    {selectable && (
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-[#4E2284] focus:ring-[#4E2284]"
                          checked={selectedIds.has(row.id)}
                          onClick={(e) => handleSelectRow(row, e)}
                          onChange={() => {}}
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className={`px-3 py-2.5 ${col.className || ''}`}>
                        {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] ?? '-') : '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 h-[28px] max-h-[36px] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>of {sortedData.length} records</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed max-h-[36px]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed max-h-[36px]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
