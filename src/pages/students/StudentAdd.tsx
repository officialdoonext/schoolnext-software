import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, CheckCircle } from 'lucide-react';
import { Student, SchoolClass, Section, TransportRoute } from '@/types';
import { dbService } from '@/services/dbService';
import { useSchool } from '@/context/SchoolContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const StudentAdd: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAcademicYear, refreshStats } = useSchool();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Personal Details
    admissionNumber: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    rollNumber: `${Math.floor(10 + Math.random() * 90)}`,
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dob: '2012-05-15',
    bloodGroup: 'B+',
    nationality: 'Indian',
    motherTongue: 'Hindi',
    category: 'General' as 'General' | 'OBC' | 'SC' | 'ST' | 'EWS',
    photoUrl: '',

    // Academic Details
    academicYearId: selectedAcademicYear?.id || 'ay_2026_2027',
    admissionDate: new Date().toISOString().split('T')[0],
    classId: '',
    sectionId: '',
    previousSchool: '',
    previousClass: '',
    tcNumber: '',

    // Parent Details
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianName: '',
    guardianPhone: '',
    relationship: 'Father',

    // Address
    currentAddress: '',
    permanentAddress: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    pinCode: '201301',

    // Medical & Transport
    medicalConditions: '',
    emergencyContact: '',
    transportRequired: false,
    transportRouteId: '',
    pickupPoint: '',
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const cls = await dbService.getCollection<SchoolClass>('classes');
      const sec = await dbService.getCollection<Section>('sections');
      const rts = await dbService.getCollection<TransportRoute>('routes');
      setClasses(cls);
      setSections(sec);
      setRoutes(rts);
      if (cls.length > 0) {
        setFormData(prev => ({
          ...prev,
          classId: cls[0].id,
          sectionId: sec.length > 0 ? sec[0].id : '',
        }));
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.fatherName || !formData.fatherPhone) {
      alert('Please fill in required fields: First Name, Last Name, Father Name, and Father Phone.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedClass = classes.find(c => c.id === formData.classId);
      const selectedSection = sections.find(s => s.id === formData.sectionId);
      const selectedRoute = routes.find(r => r.id === formData.transportRouteId);

      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();

      const newStudent: Omit<Student, 'id'> = {
        schoolId: 'school_next_main_01',
        academicYearId: formData.academicYearId,
        admissionNumber: formData.admissionNumber,
        rollNumber: formData.rollNumber,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        fullName,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        nationality: formData.nationality,
        motherTongue: formData.motherTongue,
        category: formData.category,
        photoUrl: formData.photoUrl || '/avatar-placeholder.png',

        classId: formData.classId,
        className: selectedClass?.name || 'Class 10',
        sectionId: formData.sectionId,
        sectionName: selectedSection?.name || 'A',
        admissionDate: formData.admissionDate,
        previousSchool: formData.previousSchool,
        previousClass: formData.previousClass,
        tcNumber: formData.tcNumber,

        fatherName: formData.fatherName,
        fatherPhone: formData.fatherPhone,
        fatherEmail: formData.fatherEmail,
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        motherPhone: formData.motherPhone,
        motherOccupation: formData.motherOccupation,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        relationship: formData.relationship,

        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pinCode: formData.pinCode,

        medicalConditions: formData.medicalConditions,
        emergencyContact: formData.emergencyContact || formData.fatherPhone,
        transportRequired: formData.transportRequired,
        transportRouteId: formData.transportRouteId,
        transportRouteName: selectedRoute?.routeName,
        pickupPoint: formData.pickupPoint,

        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbService.createDocument<Student>('students', newStudent);
      await refreshStats();
      setSuccess(true);
      setTimeout(() => {
        navigate('/students');
      }, 1000);
    } catch (err) {
      console.error('Failed to register student:', err);
      alert('Failed to register student. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/students')}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors max-h-[36px]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-medium text-slate-900 tracking-tight">Student Admission Registration</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Enter official student enrollment record and create student credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/students')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={submitting}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Admission
          </Button>
        </div>
      </div>

      {success && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="font-medium">Admission Successfully Registered!</span> Redirecting to directory...
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Academic & Admission Information */}
        <Card title="1. Academic & Admission Details" subtitle="Class placement and enrollment credentials">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Admission Number *</label>
              <input
                type="text"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleChange}
                required
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-slate-50 font-mono border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Admission Date *</label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                required
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Class *</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Section *</label>
              <select
                name="sectionId"
                value={formData.sectionId}
                onChange={handleChange}
                required
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Roll Number *</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                required
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Previous School</label>
              <input
                type="text"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleChange}
                placeholder="e.g. St. Xavier's School"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Previous Class</label>
              <input
                type="text"
                name="previousClass"
                value={formData.previousClass}
                onChange={handleChange}
                placeholder="e.g. Class 9"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Transfer Certificate (TC) No</label>
              <input
                type="text"
                name="tcNumber"
                value={formData.tcNumber}
                onChange={handleChange}
                placeholder="TC-2025-992"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Personal Student Information */}
        <Card title="2. Personal Student Details" subtitle="Identity, demographic and medical data">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="First name"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Surname"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 3: Parent & Guardian Details */}
        <Card title="3. Parent & Guardian Contact" subtitle="Family contact details for fee notifications">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Father's Name *</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                required
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Father's Phone *</label>
              <input
                type="tel"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleChange}
                required
                placeholder="+91 98765 43210"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284] font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Father's Email</label>
              <input
                type="email"
                name="fatherEmail"
                value={formData.fatherEmail}
                onChange={handleChange}
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Emergency Contact Number *</label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Secondary phone"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284] font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Address */}
        <Card title="4. Residential Address">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                required
                placeholder="House / Flat No, Street, Society"
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
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
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284]"
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
                className="w-full px-2.5 h-[36px] max-h-[36px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284] font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="secondary" onClick={() => navigate('/students')} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting} icon={<Save className="w-3.5 h-3.5" />}>
            Submit Student Admission
          </Button>
        </div>
      </form>
    </div>
  );
};
