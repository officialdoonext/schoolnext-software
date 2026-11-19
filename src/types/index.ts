// TypeScript Type Definitions for School Next ERP

export type UserRole = 
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'vice_principal'
  | 'accountant'
  | 'teacher'
  | 'receptionist'
  | 'librarian'
  | 'transport_manager'
  | 'parent'
  | 'student';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';

export interface UserPermission {
  module: string;
  actions: PermissionAction[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId: string;
  phoneNumber?: string;
  photoURL?: string;
  status: 'active' | 'inactive' | 'suspended';
  linkedStudentIds?: string[]; // For parents
  studentProfileId?: string; // For students
  staffProfileId?: string; // For staff
  permissions?: UserPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  schoolCode: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  phone: string;
  email: string;
  website?: string;
  affiliationNumber?: string;
  principalName?: string;
  registrationNumber?: string;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g., "2026-2027"
  startDate: string;
  endDate: string;
  admissionStartDate?: string;
  admissionEndDate?: string;
  isCurrent: boolean;
  status: 'active' | 'completed' | 'upcoming';
  createdAt: string;
  updatedAt: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string; // e.g., "Class 10"
  code: string; // e.g., "CLS-10"
  classTeacherId?: string;
  classTeacherName?: string;
  maxStudents: number;
  status: 'active' | 'inactive';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  schoolId: string;
  classId: string;
  className?: string;
  name: string; // e.g., "A", "B"
  roomNumber?: string;
  capacity: number;
  classTeacherId?: string;
  classTeacherName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  classId: string;
  className?: string;
  name: string; // e.g., "Mathematics"
  code: string; // e.g., "MATH-10"
  type: 'theory' | 'practical' | 'both';
  maxMarks: number;
  passingMarks: number;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  academicYearId: string;
  admissionNumber: string;
  rollNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  bloodGroup?: string;
  nationality: string;
  motherTongue?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  photoUrl?: string;
  
  // Academic
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  admissionDate: string;
  previousSchool?: string;
  previousClass?: string;
  tcNumber?: string;
  
  // Parents
  fatherName: string;
  fatherPhone: string;
  fatherEmail?: string;
  fatherOccupation?: string;
  motherName: string;
  motherPhone?: string;
  motherEmail?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianPhone?: string;
  relationship?: string;
  
  // Address
  currentAddress: string;
  permanentAddress?: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  
  // Medical & Transport
  medicalConditions?: string;
  emergencyContact: string;
  transportRequired: boolean;
  transportRouteId?: string;
  transportRouteName?: string;
  transportVehicleNumber?: string;
  pickupPoint?: string;
  
  // Status
  status: 'active' | 'inactive' | 'transferred' | 'alumni';
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  schoolId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  mobile: string;
  email: string;
  profilePhoto?: string;
  address: string;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationName: string;
  qualification: string;
  experienceYears: number;
  joiningDate: string;
  employmentType: 'full_time' | 'part_time' | 'contract';
  basicSalary: number;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branch: string;
  };
  emergencyContact: string;
  status: 'active' | 'inactive' | 'resigned';
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAttendanceRecord {
  id: string;
  schoolId: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  userType: 'student' | 'staff';
  leaveType: 'Casual' | 'Medical' | 'Maternity' | 'Duty' | 'Other';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeCategory {
  id: string;
  schoolId: string;
  name: string; // e.g. "Tuition Fee", "Transport Fee"
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  academicYearId: string;
  academicYearName: string;
  classId: string;
  className: string;
  feeName: string;
  feeCategoryId: string;
  feeCategoryName: string;
  totalAmount: number;
  paymentFrequency: 'one_time' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  dueDate: string;
  lateFee: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  id: string;
  receiptNumber: string;
  schoolId: string;
  academicYearId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  feeStructureId: string;
  feeName: string;
  totalFee: number;
  previousBalance: number;
  discount: number;
  lateFee: number;
  amountPaid: number;
  remainingBalance: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque';
  transactionReference?: string;
  collectedBy: string;
  remarks?: string;
  status: 'completed' | 'reversed';
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  schoolId: string;
  title: string;
  category: 'Infrastructure' | 'Salaries' | 'Utilities' | 'Sports' | 'Lab Supplies' | 'Transport' | 'Stationery' | 'Other';
  amount: number;
  date: string;
  paymentMethod: string;
  paidTo: string;
  receiptUrl?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamType {
  id: string;
  schoolId: string;
  name: string; // e.g., "Unit Test 1", "Quarterly", "Half-Yearly", "Annual Final"
  description?: string;
  weightagePercent?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ExamSchedule {
  id: string;
  schoolId: string;
  academicYearId: string;
  examTypeId: string;
  examTypeName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passingMarks: number;
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarksEntry {
  id: string;
  schoolId: string;
  examScheduleId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  isAbsent: boolean;
  remarks?: string;
  enteredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeScale {
  id: string;
  schoolId: string;
  gradeName: string; // "A+", "A", "B", etc.
  minPercentage: number;
  maxPercentage: number;
  gradePoints: number;
  remarks: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Homework {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  assignedTeacherId: string;
  assignedTeacherName: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  attachmentUrl?: string;
  maxMarks?: number;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkSubmission {
  id: string;
  schoolId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  submissionDate: string;
  content: string;
  attachmentUrl?: string;
  obtainedMarks?: number;
  feedback?: string;
  status: 'submitted' | 'evaluated' | 'late';
  evaluatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  targetAudience: 'all' | 'teachers' | 'students' | 'parents' | 'class_specific';
  classId?: string;
  className?: string;
  sectionId?: string;
  publishDate: string;
  expiryDate?: string;
  attachmentUrl?: string;
  authorName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  schoolId: string;
  userId: string;
  title: string;
  message: string;
  type: 'fee' | 'attendance' | 'exam' | 'homework' | 'announcement' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  schoolId: string;
  vehicleNumber: string;
  vehicleType: 'Bus' | 'Van' | 'Minibus';
  seatingCapacity: number;
  driverName: string;
  driverMobile: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry: string;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TransportRoute {
  id: string;
  schoolId: string;
  routeName: string;
  routeCode: string;
  startingPoint: string;
  endingPoint: string;
  stops: {
    stopName: string;
    pickupTime: string;
    dropTime: string;
    order: number;
  }[];
  monthlyFee: number;
  vehicleId?: string;
  vehicleNumber?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface LibraryBook {
  id: string;
  schoolId: string;
  bookId: string; // e.g. "BK-0012"
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  edition?: string;
  quantity: number;
  availableQuantity: number;
  shelfNumber: string;
  purchaseDate?: string;
  price: number;
  status: 'available' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface LibraryTransaction {
  id: string;
  schoolId: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  borrowerType: 'student' | 'staff';
  borrowerId: string;
  borrowerName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'issued' | 'returned' | 'overdue';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  schoolId: string;
  itemName: string;
  itemCode: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string; // pcs, boxes, sets, kg
  minThreshold: number;
  purchasePrice: number;
  supplierName: string;
  purchaseDate: string;
  warranty?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionEnquiry {
  id: string;
  schoolId: string;
  enquiryNumber: string;
  studentName: string;
  parentName: string;
  phone: string;
  email?: string;
  interestedClass: string;
  previousSchool?: string;
  enquiryDate: string;
  followUpDate?: string;
  assignedStaffName?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'visited' | 'admitted' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface VisitorLog {
  id: string;
  schoolId: string;
  visitorName: string;
  mobile: string;
  purpose: string;
  personToMeet: string;
  checkIn: string;
  checkOut?: string;
  badgeNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  schoolId: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  departmentName: string;
  salaryMonth: string; // e.g. "November 2026"
  basicSalary: number;
  hra: number;
  allowances: number;
  bonus: number;
  deductions: {
    pf: number;
    esi: number;
    advanceDeduction: number;
    tax: number;
    other: number;
  };
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paymentDate?: string;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash';
  paymentStatus: 'pending' | 'paid';
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  recordId?: string;
  details: string;
  timestamp: string;
}

