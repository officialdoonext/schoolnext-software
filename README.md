# School Next - Complete Enterprise School ERP & Management System

**School Next** is an enterprise-grade, production-ready School Management System (School ERP) built with **React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, and Google Firebase (Authentication, Cloud Firestore, Firebase Storage)**.

Designed with a scalable multi-school architecture, every school operates in complete tenant isolation under unique `schoolId` scopes.

---

## 🌟 Key Modules & Capabilities

### 1. Multi-Tenant Architecture & Firebase Security
- **Multi-School Scoping**: All operational collections reside isolated under `schools/{schoolId}/...`.
- **Firebase Authentication**: Email/Password authentication, session persistence, password reset, and role verification.
- **Production Firestore Security Rules (`firestore.rules`)**:
  - Enforces school-level isolation.
  - Granular role-based permissions (Super Admin, School Admin, Principal, Accountant, Teacher, Parent, Student, etc.).
  - Restricts parent access strictly to linked wards.
  - Restricts student access strictly to personal academic profiles.
  - Immutable audit logs and immutable payment transaction ledgers.
- **Storage Rules (`storage.rules`)**: File size limits, allowed MIME types, and school isolation for photos and documents.

### 2. User Roles & Permission Matrix (11 Roles Supported)
1. **Super Admin**: Multi-school tenant platform oversight.
2. **School Admin**: Full institutional operational controls and configurations.
3. **Principal**: Academic approvals, staff appraisals, disciplinary oversight.
4. **Vice Principal**: Timetable allocations, substitute assignments, schedule oversight.
5. **Accountant**: Fee structures, collections, receipt issuance, expense ledgers, staff payroll.
6. **Teacher**: Daily student attendance, homework assignment, marks entry, report remarks.
7. **Receptionist**: Admission enquiries, visitor tracking, bonafide & transfer certificates.
8. **Librarian**: Book catalog holdings, circulation checkout, return tracking, overdue fine calculation.
9. **Transport Manager**: Bus vehicle fitness certificates, routes, designated stops, driver rosters.
10. **Parent Portal**: Child attendance statistics, fee receipts, examination report cards, leave requests.
11. **Student Portal**: Personal class timetable, homework submissions, grade transcripts, study materials.

*⚡ Pro-Tip: Use the **Role Switcher** pill in the top navigation bar to test the ERP from all 11 roles with a single click!*

### 3. Dynamic Executive Dashboard
- **9 Real-Time Metric Cards**: Total Students, Total Staff, Present Today, Absent Today, Today's Collection (₹), Pending Dues (₹), Active Classes, New Admissions.
- **Interactive Recharts Analytics**:
  - Monthly Fee Collections vs. Targets (in Indian Rupees ₹ Lakhs).
  - Student Gender Demographics.
  - Weekly Student Attendance Percentage Line Chart.
  - Class-wise Strength Distribution.
- **Recent Counter Transactions & Campus Announcements**.

### 4. Comprehensive Student Management
- **Directory**: Advanced search, multi-field filtering by Class/Status, sorting, and Excel export.
- **Admission Registration Form**:
  - Auto-generated admission number (`ADM-2026-XXXX`).
  - Personal details, academic credentials, parent contact numbers, permanent address, medical details, and transport allocation.
- **Student Profile**: Tabbed overview (Academic History, Parent Info, Attendance, Fee History, Exam Performance, Transport).
- **Student Promotion Engine**: Transition students between academic years with historical record preservation.
- **Printable Identity Cards**: Complete with school logo, photo, admission number, roll number, blood group, emergency contact, barcode/QR, and principal seal.

### 5. Academic Management
- **Academic Years**: Session definitions, admission calendar windows, active session switcher.
- **Classes & Sections**: Multiple sections per class, room number allocations, maximum student capacities.
- **Curriculum Subjects**: Theory & practical assessment schemes, maximum marks, passing thresholds, assigned teachers.

### 6. Attendance Tracking & Parent Alerts
- **Student Attendance Register**: Roll-by-roll quick status toggles (`Present`, `Absent`, `Late`, `Leave`), "Mark All Present", remarks.
- **Duplicate Prevention**: Replaces existing records for the same class/date without duplicate entries.
- **Staff & Faculty Attendance**: Daily check-in logging.
- **Cumulative Reports**: Monthly attendance percentages with color-coded 75% CBSE threshold indicators.

### 7. Fees, Payments & Financial Accounting
- **Fee Structures**: Slabs across classes (Tuition, Transport, Examination, Laboratory).
- **Fee Collection Counter**:
  - Auto-generated receipt number (`RCP-2026-XXXX`).
  - Student selection with outstanding balance calculations.
  - Concession/discount and late fee fine calculations.
  - Payment modes: Cash, UPI (GPay/PhonePe/Paytm), Bank Transfer (NEFT/RTGS), POS Card, Cheque.
- **Printable Fee Receipts**: Official student/parent copy with school logo, invoice breakdown, cashier seal, and print preview.
- **Pending Dues & Defaulters**: Real-time list of outstanding balances with 1-click SMS/WhatsApp reminders.
- **School Expenses Ledger**: Operating expenses categorized across utilities, infrastructure, supplies, and maintenance.

### 8. Examination Management & CBSE Report Cards
- **Exam Schedule**: Unit Tests, Half-Yearly, and Annual Board prep schedules.
- **Marks Entry Sheet**: Clamped numeric inputs, auto-computed CBSE grades (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`, `D`, `E`), absent toggles.
- **Official Report Card Generator**: Printable CBSE-format performance card with school affiliation details, subject-wise marks table, aggregate percentage, class rank, teacher remarks, and principal seal.

### 9. Staff & Automated Payroll
- **Staff Directory**: Employee ID, designation, department, qualification, basic salary, emergency contacts.
- **Automated Payroll Engine**: Basic salary, House Rent Allowance (20% HRA), Special Allowances (10%), Provident Fund (12% PF), ESI, TDS Income Tax deductions, and Net Take-Home calculations.
- **Printable Salary Slip**: Official employee monthly payslip.

### 10. Timetable & Homework
- **Weekly Class Timetable**: Monday to Saturday matrix, 8 periods with time slots, snack break, teacher allocations, room numbers.
- **Homework & Assignments**: Classroom tasks, submission tracking, deadline reminders.

### 11. Fleet Transport, Library & Inventory
- **Bus Transport**: Fleet vehicles, road fitness certificates, routes with pickup/drop timetables and monthly bus fees.
- **Library Circulation**: Catalog holdings with ISBN, shelf numbers, checkout to students, return logging, overdue fines.
- **Asset Inventory**: Lab apparatus, sports equipment, stationery reams, low-stock alerts.

### 12. Front Office & Certificates
- **Admission Enquiries**: Inquiries log, prospective class, follow-up dates, staff assignments.
- **Printable Certificates**:
  - Bonafide Certificate
  - Transfer Certificate (TC)
  - Character & Conduct Certificate
  - Study Certificate

### 13. System Audit Logs & Compliance
- **Immutable Audit Trail**: Logs user ID, role, action, target module, record ID, and exact timestamp.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite 5 |
| **Styling & Design** | Tailwind CSS 3, Custom Navy Theme, Inter Font |
| **Icons & UI** | Lucide React |
| **Routing** | React Router DOM v6 |
| **Analytics Charts** | Recharts (Responsive Bar, Line, Pie charts) |
| **Data Export** | SheetJS (XLSX for Excel), jsPDF & jsPDF-AutoTable (PDF) |
| **Backend & Cloud** | Firebase Auth, Cloud Firestore, Firebase Storage, FCM |
| **Dates & Locale** | date-fns, Indian Rupee (`₹`), Asia/Kolkata (`en-IN`) |

---

## 🚀 Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Firebase project keys:
```env
VITE_FIREBASE_API_KEY=AIzaSyYourActualFirebaseApiKey
VITE_FIREBASE_AUTH_DOMAIN=your-school-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-school-project
VITE_FIREBASE_STORAGE_BUCKET=your-school-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_DEFAULT_SCHOOL_ID=school_next_main_01
```

> **Note on Zero-Config Demo Mode**: School Next includes an intelligent local reactive store initialized with rich demo data (Delhi Public School / School Next Model Academy, Class 1-10, students, teachers, fees, timetable, library books). You can explore, create, edit, print, and export immediately without waiting for Firebase credentials!

### 2. Development Server
Run Vite in development mode:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Production Build
Verify TypeScript compilation and generate optimized vendor bundles:
```bash
npm run build
```
Production assets are generated in `dist/`.

### 4. Deploying to Firebase
Deploy Firestore rules, Storage rules, and Hosting:
```bash
firebase login
firebase deploy
```

---

## 📋 Directory Structure

```
schoolnext-software/
├── public/                 # Static assets & SVG logo
├── src/
│   ├── components/
│   │   ├── common/         # Button, Badge, Card, StatCard, DataTable, Modal, ConfirmDialog
│   │   └── layout/         # Sidebar, TopNavbar, DashboardLayout
│   ├── config/             # Firebase App, Auth, Firestore, Storage initialization
│   ├── context/            # AuthContext (11 roles), SchoolContext (session stats)
│   ├── pages/
│   │   ├── auth/           # Login, ForgotPassword
│   │   ├── dashboard/      # Executive analytics dashboard
│   │   ├── students/       # Directory, Admission, Profile, Promotion, ID Cards
│   │   ├── academics/      # Academic Years, Classes, Sections, Subjects
│   │   ├── attendance/     # Student Attendance, Staff Attendance, Reports
│   │   ├── fees/           # Collections, Structures, Defaulters, Receipts
│   │   ├── examinations/   # Marks Entry, CBSE Report Cards
│   │   ├── staff/          # Faculty Directory, Monthly Payroll
│   │   ├── timetable/      # Weekly Class Matrix
│   │   ├── homework/       # Assignments & Study Materials
│   │   ├── transport/      # Routes, Stops, Fleet
│   │   ├── library/        # Books Catalog, Issue/Return
│   │   ├── inventory/      # Asset Items, Stock Control
│   │   ├── frontOffice/    # Enquiries, Certificates (TC/Bonafide)
│   │   ├── portals/        # Dedicated Parent, Teacher, and Student Portals
│   │   ├── reports/        # Enterprise Reporting Center
│   │   └── settings/       # School Profile, Roles & Permissions, Audit Logs
│   ├── services/           # dbService (CRUD + offline cache), mockSeedData
│   ├── types/              # TypeScript types for all 25+ Firestore entities
│   ├── utils/              # formatCurrency (₹), formatDate (DD-MM-YYYY)
│   ├── App.tsx             # React Router routing configuration
│   └── main.tsx            # Application entrypoint
├── firebase.json           # Firebase CLI deploy specification
├── firestore.rules         # Multi-tenant security rules
├── storage.rules           # Cloud Storage security rules
├── firestore.indexes.json  # Composite Firestore indexes
└── package.json            # Project manifest & dependencies
```

---

## 🔒 Security Best Practices
- Passwords are never stored in Firestore.
- Payments and financial receipts are write-only with immutable ledgers.
- Parent accounts can strictly only view records linked to their specific ward IDs.
- Students can only view their own timetable, homework, and report cards.
- Multi-school isolation prevents cross-tenant data leakage.

---

*Built with passion for modern educational institutions.*
#   s c h o o l n e x t - s o f t w a r e  
 