import React, { useState, useEffect } from 'react';
import { School as SchoolIcon, Save, CheckCircle, RefreshCw } from 'lucide-react';
import { School } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const SchoolSettings: React.FC = () => {
  const { school, refreshStats } = useSchool();
  const [formData, setFormData] = useState<School>(school || {
    id: 'school_next_main_01',
    schoolCode: 'SN-DEL-001',
    name: 'School Next International Academy',
    tagline: 'Empowering Minds, Shaping Tomorrow',
    logoUrl: '/logo.svg',
    address: 'Plot 14, Institutional Area, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    pinCode: '201309',
    phone: '+91 98765 43210',
    email: 'admin@schoolnext.edu.in',
    website: 'https://schoolnext.edu.in',
    affiliationNumber: 'CBSE/AFF/2130894',
    principalName: 'Dr. Rajesh Sharma',
    registrationNumber: 'REG-UP-2015-8849',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (school) setFormData(school);
  }, [school]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dbService.updateDocument<School>('schools', formData.id, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      await refreshStats();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">School Profile & Institutional Settings</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure school identification, CBSE affiliation numbers, and letterhead communication details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" /> Profile Updated!
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="1. School General Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">School Full Legal Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">School Code *</label>
              <input
                type="text"
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tagline / Motto</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Principal's Full Name *</label>
              <input
                type="text"
                name="principalName"
                value={formData.principalName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </Card>

        <Card title="2. Affiliation & Registration Credentials">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">CBSE/State Board Affiliation Number *</label>
              <input
                type="text"
                name="affiliationNumber"
                value={formData.affiliationNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">School Society Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </Card>

        <Card title="3. Official Contact & Campus Location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Campus Street Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">PIN Code *</label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Official Telephone / Mobile *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Official Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Official Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

