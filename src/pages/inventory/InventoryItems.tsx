import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { InventoryItem } from '@/types';
import { dbService } from '@/services/dbService';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const InventoryItems: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    itemName: 'Microscopes (Olympus Binocular)',
    itemCode: 'ITM-MIC-04',
    category: 'Lab Supplies',
    quantity: 12,
    unit: 'units',
    minThreshold: 3,
    purchasePrice: 14500,
    supplierName: 'Scientific Instruments India',
    purchaseDate: '2026-04-10',
    warranty: '2 Years Manufacturer',
  });

  useEffect(() => {
    const fetchItems = async () => {
      const data = await dbService.getCollection<InventoryItem>('inventory');
      setItems(data);
    };
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = await dbService.createDocument<InventoryItem>('inventory', {
      ...formData,
      schoolId: 'school_next_main_01',
      status: formData.quantity <= formData.minThreshold ? 'low_stock' : 'in_stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setItems(prev => [newItem, ...prev]);
    setModalOpen(false);
  };

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Item Code',
      accessorKey: 'itemCode',
      sortable: true,
      className: 'font-mono text-slate-900',
    },
    {
      header: 'Item Name',
      accessorKey: 'itemName',
      sortable: true,
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-900">{item.itemName}</p>
          <p className="text-[11px] text-slate-400">Supplier: {item.supplierName}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (item) => <Badge variant="neutral" size="sm">{item.category}</Badge>,
    },
    {
      header: 'Stock Quantity',
      accessorKey: 'quantity',
      sortable: true,
      cell: (item) => (
        <span className="font-mono font-bold text-slate-900">
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      header: 'Unit Cost',
      accessorKey: 'purchasePrice',
      sortable: true,
      cell: (item) => <span className="font-mono text-slate-700">{formatCurrency(item.purchasePrice)}</span>,
    },
    {
      header: 'Status',
      cell: (item) => {
        const isLow = item.quantity <= item.minThreshold;
        return isLow ? (
          <Badge variant="warning" size="sm" dot>Low Stock</Badge>
        ) : (
          <Badge variant="success" size="sm" dot>In Stock</Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">School Asset & Inventory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Track school equipment, science lab apparatus, stationery, sports kits, and purchase warranty records.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Stock Item
        </Button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search inventory by name, code, supplier..."
        searchFields={['itemName', 'itemCode', 'category', 'supplierName']}
        exportFileName="Inventory_Register"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Inventory Item" maxWidth="md">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Item Name *</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={e => setFormData({ ...formData, itemName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Item Code *</label>
              <input
                type="text"
                value={formData.itemCode}
                onChange={e => setFormData({ ...formData, itemCode: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="Electronics">Electronics</option>
                <option value="Stationery">Stationery</option>
                <option value="Sports">Sports</option>
                <option value="Lab Supplies">Lab Supplies</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Min Threshold</label>
              <input
                type="number"
                value={formData.minThreshold}
                onChange={e => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Purchase Price (₹) *</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Supplier Name</label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save Stock Item</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

