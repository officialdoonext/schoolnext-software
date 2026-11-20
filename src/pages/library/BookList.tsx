import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, BookOpen, User, CheckCircle, AlertCircle } from 'lucide-react';
import { LibraryBook, Student } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatCurrency } from '@/utils/formatters';

export const BookList: React.FC = () => {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [issueSuccess, setIssueSuccess] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      const b = await dbService.getCollection<LibraryBook>('libraryBooks');
      const std = await dbService.getCollection<Student>('students');
      setBooks(b);
      setStudents(std);
      if (std.length > 0) setSelectedStudentId(std[0].id);
    };
    fetchBooks();
  }, []);

  const handleOpenIssue = (book: LibraryBook) => {
    if (book.availableQuantity <= 0) {
      alert('All copies of this book are currently issued!');
      return;
    }
    setSelectedBook(book);
    setIssueModalOpen(true);
    setIssueSuccess(false);
  };

  const handleConfirmIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedStudentId) return;

    // Decrement available quantity
    const updatedQty = selectedBook.availableQuantity - 1;
    await dbService.updateDocument<LibraryBook>('libraryBooks', selectedBook.id, {
      availableQuantity: updatedQty,
      status: updatedQty === 0 ? 'out_of_stock' : 'available',
    });

    setBooks(prev => prev.map(b => b.id === selectedBook.id ? { ...b, availableQuantity: updatedQty } : b));
    setIssueSuccess(true);
    setTimeout(() => {
      setIssueModalOpen(false);
      setIssueSuccess(false);
    }, 1200);
  };

  const columns: Column<LibraryBook>[] = [
    {
      header: 'Book ID',
      accessorKey: 'bookId',
      sortable: true,
      className: 'font-mono text-slate-900',
    },
    {
      header: 'Title & Author',
      sortable: true,
      cell: (b) => (
        <div>
          <p className="font-bold text-slate-900">{b.title}</p>
          <p className="text-[11px] text-slate-500">{b.author} • {b.publisher}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (b) => <Badge variant="neutral" size="sm">{b.category}</Badge>,
    },
    {
      header: 'Shelf Location',
      accessorKey: 'shelfNumber',
      className: 'font-mono text-xs text-slate-700',
    },
    {
      header: 'Copies Available',
      sortable: true,
      cell: (b) => (
        <span className={`font-mono font-bold ${b.availableQuantity > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          {b.availableQuantity} / {b.quantity}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (b) => (
        b.availableQuantity > 0 ? (
          <Badge variant="success" size="sm" dot>Available</Badge>
        ) : (
          <Badge variant="danger" size="sm" dot>Issued Out</Badge>
        )
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (b) => (
        <Button
          variant={b.availableQuantity > 0 ? 'primary' : 'secondary'}
          size="sm"
          disabled={b.availableQuantity <= 0}
          onClick={() => handleOpenIssue(b)}
        >
          Issue Book
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Catalog & Book Circulation</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage library holdings, ISBN indexing, student book issues, and return due date tracking.
          </p>
        </div>
      </div>

      <DataTable
        data={books}
        columns={columns}
        searchPlaceholder="Search catalog by title, author, ISBN..."
        searchFields={['title', 'author', 'isbn', 'bookId', 'category']}
        exportFileName="Library_Catalog"
      />

      {/* Issue Book Modal */}
      {selectedBook && (
        <Modal
          isOpen={issueModalOpen}
          onClose={() => setIssueModalOpen(false)}
          title={`Issue: ${selectedBook.title}`}
          subtitle={`Book ID: ${selectedBook.bookId} • Shelf: ${selectedBook.shelfNumber}`}
          maxWidth="md"
        >
          {issueSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-900 text-sm">Book Successfully Issued!</p>
              <p className="text-xs text-slate-500">Circulation record updated with 14 days return due date.</p>
            </div>
          ) : (
            <form onSubmit={handleConfirmIssue} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Borrower (Student) *</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} • Adm: {s.admissionNumber} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <p><span className="text-slate-400">Issue Date:</span> <strong className="text-slate-800">Today (19 Nov 2026)</strong></p>
                <p><span className="text-slate-400">Return Due:</span> <strong className="text-emerald-700">03 Dec 2026 (14 Days)</strong></p>
                <p><span className="text-slate-400">Overdue Fine:</span> <span className="text-slate-600">₹5 / day after due date</span></p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setIssueModalOpen(false)} type="button">Cancel</Button>
                <Button variant="primary" type="submit">Confirm & Issue</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

