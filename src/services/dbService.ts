import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';
import * as SeedData from './mockSeedData';

// Storage keys for reactive fallback storage
const STORAGE_PREFIX = 'school_next_db_';

class DatabaseService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = isFirebaseConfigured;
    this.initializeLocalStorage();
  }

  // Initialize browser storage with initial data if empty
  private initializeLocalStorage() {
    if (typeof window === 'undefined') return;

    const collections = [
      { key: 'schools', data: [SeedData.INITIAL_SCHOOL] },
      { key: 'academicYears', data: SeedData.INITIAL_ACADEMIC_YEARS },
      { key: 'classes', data: SeedData.INITIAL_CLASSES },
      { key: 'sections', data: SeedData.INITIAL_SECTIONS },
      { key: 'subjects', data: SeedData.INITIAL_SUBJECTS },
      { key: 'students', data: SeedData.INITIAL_STUDENTS },
      { key: 'staff', data: SeedData.INITIAL_STAFF },
      { key: 'feeCategories', data: SeedData.INITIAL_FEE_CATEGORIES },
      { key: 'feeStructures', data: SeedData.INITIAL_FEE_STRUCTURES },
      { key: 'payments', data: SeedData.INITIAL_PAYMENTS },
      { key: 'examTypes', data: SeedData.INITIAL_EXAM_TYPES },
      { key: 'gradeScales', data: SeedData.INITIAL_GRADE_SCALES },
      { key: 'announcements', data: SeedData.INITIAL_ANNOUNCEMENTS },
      { key: 'libraryBooks', data: SeedData.INITIAL_LIBRARY_BOOKS },
      { key: 'vehicles', data: SeedData.INITIAL_VEHICLES },
      { key: 'routes', data: SeedData.INITIAL_ROUTES },
      { key: 'inventory', data: SeedData.INITIAL_INVENTORY },
      { key: 'enquiries', data: SeedData.INITIAL_ENQUIRIES },
      { key: 'visitors', data: SeedData.INITIAL_VISITORS },
      { key: 'attendance', data: [] },
      { key: 'homework', data: [] },
      { key: 'payroll', data: [] },
      { key: 'expenses', data: [] },
      { key: 'auditLogs', data: [] },
      { key: 'leaveRequests', data: [] },
    ];

    collections.forEach(({ key, data }) => {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      if (!localStorage.getItem(fullKey)) {
        localStorage.setItem(fullKey, JSON.stringify(data));
      }
    });
  }

  // Helper to read local data
  private getLocalCollection<T>(collectionName: string): T[] {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${collectionName}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Helper to write local data
  private setLocalCollection<T>(collectionName: string, items: T[]): void {
    localStorage.setItem(`${STORAGE_PREFIX}${collectionName}`, JSON.stringify(items));
    // Trigger custom event for reactive tab updates
    window.dispatchEvent(new CustomEvent('school_next_db_change', { detail: { collection: collectionName } }));
  }

  // --- Core CRUD Operations ---

  // Get all documents from collection
  async getCollection<T>(collectionName: string, schoolId: string = 'school_next_main_01'): Promise<T[]> {
    if (this.isConfigured) {
      try {
        const colRef = collection(db, 'schools', schoolId, collectionName);
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
      } catch (err) {
        console.warn(`Firestore read fallback for ${collectionName}:`, err);
      }
    }
    
    // Fallback to local storage store
    const local = this.getLocalCollection<T>(collectionName);
    return local;
  }

  // Get single document by ID
  async getDocument<T>(collectionName: string, docId: string, schoolId: string = 'school_next_main_01'): Promise<T | null> {
    if (this.isConfigured) {
      try {
        const docRef = doc(db, 'schools', schoolId, collectionName, docId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as unknown as T;
        }
      } catch (err) {
        console.warn(`Firestore getDoc fallback for ${collectionName}/${docId}:`, err);
      }
    }

    const items = this.getLocalCollection<any>(collectionName);
    return (items.find((item: any) => item.id === docId) as T) || null;
  }

  // Create new document
  async createDocument<T extends Record<string, any>>(collectionName: string, data: Omit<T, 'id'>, schoolId: string = 'school_next_main_01'): Promise<T> {
    const timestamp = new Date().toISOString();
    const id = `${collectionName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newDoc = {
      id,
      schoolId,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as unknown as T;

    if (this.isConfigured) {
      try {
        const colRef = collection(db, 'schools', schoolId, collectionName);
        await addDoc(colRef, {
          ...data,
          schoolId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn(`Firestore addDoc fallback for ${collectionName}:`, err);
      }
    }

    // Always update local cache for instant UI feedback
    const items = this.getLocalCollection<any>(collectionName);
    items.unshift(newDoc);
    this.setLocalCollection(collectionName, items);

    // Write audit log
    this.logAudit(schoolId, 'CREATE', collectionName, id, `Created record in ${collectionName}`);

    return newDoc;
  }

  // Update existing document
  async updateDocument<T extends Record<string, any>>(collectionName: string, docId: string, updates: Partial<T>, schoolId: string = 'school_next_main_01'): Promise<boolean> {
    const timestamp = new Date().toISOString();

    if (this.isConfigured) {
      try {
        const docRef = doc(db, 'schools', schoolId, collectionName, docId);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn(`Firestore updateDoc fallback for ${collectionName}/${docId}:`, err);
      }
    }

    const items = this.getLocalCollection<any>(collectionName);
    const index = items.findIndex((item: any) => item.id === docId);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: timestamp };
      this.setLocalCollection(collectionName, items);
      this.logAudit(schoolId, 'UPDATE', collectionName, docId, `Updated fields in ${collectionName}`);
      return true;
    }
    return false;
  }

  // Delete document
  async deleteDocument(collectionName: string, docId: string, schoolId: string = 'school_next_main_01'): Promise<boolean> {
    if (this.isConfigured) {
      try {
        const docRef = doc(db, 'schools', schoolId, collectionName, docId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn(`Firestore deleteDoc fallback for ${collectionName}/${docId}:`, err);
      }
    }

    const items = this.getLocalCollection<any>(collectionName);
    const filtered = items.filter((item: any) => item.id !== docId);
    this.setLocalCollection(collectionName, filtered);
    this.logAudit(schoolId, 'DELETE', collectionName, docId, `Deleted record from ${collectionName}`);
    return true;
  }

  // Write audit log entry
  private async logAudit(schoolId: string, action: string, module: string, recordId: string, details: string) {
    const logItem = {
      id: `log_${Date.now()}`,
      schoolId,
      userId: 'admin_current',
      userName: 'Administrator',
      userRole: 'school_admin',
      action,
      module,
      recordId,
      details,
      timestamp: new Date().toISOString(),
    };
    const currentLogs = this.getLocalCollection<any>('auditLogs');
    currentLogs.unshift(logItem);
    // keep up to 200 logs locally
    this.setLocalCollection('auditLogs', currentLogs.slice(0, 200));
  }

  // Reset entire database to fresh sample seed data
  resetDatabase() {
    localStorage.clear();
    this.initializeLocalStorage();
    window.location.reload();
  }
}

export const dbService = new DatabaseService();
export default dbService;

