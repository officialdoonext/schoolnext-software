import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/config/firebase';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchRole: (role: UserRole) => void;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve') => boolean;
}

const DEFAULT_USERS_BY_ROLE: Record<UserRole, UserProfile> = {
  super_admin: {
    uid: 'usr_super_admin',
    email: 'superadmin@schoolnext.com',
    displayName: 'Rajesh Singhania (Super Admin)',
    role: 'super_admin',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  school_admin: {
    uid: 'usr_school_admin',
    email: 'admin@schoolnext.edu.in',
    displayName: 'Anand Kumar (School Admin)',
    role: 'school_admin',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  principal: {
    uid: 'usr_principal',
    email: 'principal@schoolnext.edu.in',
    displayName: 'Dr. Rajesh Sharma (Principal)',
    role: 'principal',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  vice_principal: {
    uid: 'usr_vp',
    email: 'vp@schoolnext.edu.in',
    displayName: 'Meenakshi Sundaram (Vice Principal)',
    role: 'vice_principal',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  accountant: {
    uid: 'usr_accountant',
    email: 'accountant@schoolnext.edu.in',
    displayName: 'Ramesh Gupta (Chief Accountant)',
    role: 'accountant',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  teacher: {
    uid: 'usr_teacher',
    email: 'teacher@schoolnext.edu.in',
    displayName: 'Priya Sharma (Senior Teacher)',
    role: 'teacher',
    schoolId: 'school_next_main_01',
    status: 'active',
    staffProfileId: 'staff_2',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  receptionist: {
    uid: 'usr_receptionist',
    email: 'reception@schoolnext.edu.in',
    displayName: 'Kavita Chawla (Front Desk)',
    role: 'receptionist',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  librarian: {
    uid: 'usr_librarian',
    email: 'librarian@schoolnext.edu.in',
    displayName: 'Sunita Rao (Head Librarian)',
    role: 'librarian',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  transport_manager: {
    uid: 'usr_transport',
    email: 'transport@schoolnext.edu.in',
    displayName: 'Devendra Yadav (Transport Officer)',
    role: 'transport_manager',
    schoolId: 'school_next_main_01',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  parent: {
    uid: 'usr_parent',
    email: 'parent@gmail.com',
    displayName: 'Virendra Singh (Parent)',
    role: 'parent',
    schoolId: 'school_next_main_01',
    linkedStudentIds: ['std_1001'],
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  student: {
    uid: 'usr_student',
    email: 'aarav.singh@student.schoolnext.edu.in',
    displayName: 'Aarav Kumar Singh (Class 10-A)',
    role: 'student',
    schoolId: 'school_next_main_01',
    studentProfileId: 'std_1001',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('school_next_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_USERS_BY_ROLE['school_admin'];
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Map user profile
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || 'admin@schoolnext.edu.in',
          displayName: user.displayName || 'Administrator',
          role: 'school_admin',
          schoolId: 'school_next_main_01',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCurrentUser(profile);
        localStorage.setItem('school_next_active_user', JSON.stringify(profile));
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Match demo user role based on email or default to school admin
        let matchedRole: UserRole = 'school_admin';
        if (email.includes('super')) matchedRole = 'super_admin';
        else if (email.includes('teacher')) matchedRole = 'teacher';
        else if (email.includes('principal')) matchedRole = 'principal';
        else if (email.includes('accountant')) matchedRole = 'accountant';
        else if (email.includes('parent')) matchedRole = 'parent';
        else if (email.includes('student')) matchedRole = 'student';
        else if (email.includes('transport')) matchedRole = 'transport_manager';
        else if (email.includes('library') || email.includes('librarian')) matchedRole = 'librarian';
        else if (email.includes('reception')) matchedRole = 'receptionist';

        const user = DEFAULT_USERS_BY_ROLE[matchedRole];
        setCurrentUser(user);
        localStorage.setItem('school_next_active_user', JSON.stringify(user));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
    localStorage.removeItem('school_next_active_user');
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`Password reset email simulated for ${email}`);
    }
  };

  const switchRole = (role: UserRole) => {
    const user = DEFAULT_USERS_BY_ROLE[role];
    setCurrentUser(user);
    localStorage.setItem('school_next_active_user', JSON.stringify(user));
  };

  // Permission checking helper
  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve'): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    
    // Super Admin and School Admin have full permissions across all modules
    if (role === 'super_admin' || role === 'school_admin') return true;

    // Principal has all view, approve, export and most edit permissions
    if (role === 'principal') return true;

    // Specific role maps
    switch (role) {
      case 'accountant':
        return ['fees', 'payroll', 'expenses', 'reports', 'dashboard'].includes(module);
      case 'teacher':
        return ['attendance', 'examinations', 'homework', 'timetable', 'students', 'dashboard'].includes(module);
      case 'librarian':
        return ['library', 'dashboard'].includes(module);
      case 'transport_manager':
        return ['transport', 'dashboard'].includes(module);
      case 'receptionist':
        return ['front_office', 'enquiries', 'visitors', 'students', 'dashboard'].includes(module);
      case 'parent':
        return ['parent_portal', 'dashboard'].includes(module);
      case 'student':
        return ['student_portal', 'dashboard'].includes(module);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      loading,
      login,
      logout,
      resetPassword,
      switchRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

