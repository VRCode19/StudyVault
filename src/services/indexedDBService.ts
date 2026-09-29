/**
 * IndexedDB Service — Manages PDF binary storage and study records.
 * PDF files are stored in IndexedDB (not localStorage) to handle large binaries.
 * Study records are also stored here for reliable cross-session persistence.
 */
import type { PDFDocument, ActualStudyRecord } from '../types/studyvault';

const DB_NAME = 'StudyVaultDB';
const DB_VERSION = 2;

const STORES = {
  PDF_FILES: 'pdf_files',       // binary blobs
  PDF_META: 'pdf_metadata',     // PDFDocument metadata
  STUDY_RECORDS: 'study_records', // ActualStudyRecord
} as const;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.PDF_FILES)) {
        db.createObjectStore(STORES.PDF_FILES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.PDF_META)) {
        const metaStore = db.createObjectStore(STORES.PDF_META, { keyPath: 'id' });
        metaStore.createIndex('subjectId', 'subjectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.STUDY_RECORDS)) {
        const recordStore = db.createObjectStore(STORES.STUDY_RECORDS, { keyPath: 'id' });
        recordStore.createIndex('subjectId', 'subjectId', { unique: false });
        recordStore.createIndex('date', 'date', { unique: false });
        recordStore.createIndex('pdfId', 'pdfId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
  });
}

// ─── PDF Binary Storage ───

export async function storePDFFile(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_FILES, 'readwrite');
    const store = tx.objectStore(STORES.PDF_FILES);
    store.put({ id, blob, storedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Failed to store PDF file'));
  });
}

export async function getPDFFile(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_FILES, 'readonly');
    const store = tx.objectStore(STORES.PDF_FILES);
    const request = store.get(id);
    request.onsuccess = () => {
      resolve(request.result?.blob || null);
    };
    request.onerror = () => reject(new Error('Failed to get PDF file'));
  });
}

export async function deletePDFFile(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_FILES, 'readwrite');
    const store = tx.objectStore(STORES.PDF_FILES);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Failed to delete PDF file'));
  });
}

// ─── PDF Metadata ───

export async function storePDFMeta(meta: PDFDocument): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_META, 'readwrite');
    const store = tx.objectStore(STORES.PDF_META);
    store.put(meta);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Failed to store PDF metadata'));
  });
}

export async function getPDFMeta(id: string): Promise<PDFDocument | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_META, 'readonly');
    const store = tx.objectStore(STORES.PDF_META);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error('Failed to get PDF metadata'));
  });
}

export async function getAllPDFMetaForSubject(subjectId: string): Promise<PDFDocument[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_META, 'readonly');
    const store = tx.objectStore(STORES.PDF_META);
    const index = store.index('subjectId');
    const request = index.getAll(subjectId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Failed to get PDFs for subject'));
  });
}

export async function getAllPDFMeta(): Promise<PDFDocument[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_META, 'readonly');
    const store = tx.objectStore(STORES.PDF_META);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Failed to get all PDF metadata'));
  });
}

export async function deletePDFMeta(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PDF_META, 'readwrite');
    const store = tx.objectStore(STORES.PDF_META);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Failed to delete PDF metadata'));
  });
}

export async function deleteAllPDFsForSubject(subjectId: string): Promise<number> {
  const metas = await getAllPDFMetaForSubject(subjectId);
  for (const meta of metas) {
    await deletePDFFile(meta.id);
    await deletePDFMeta(meta.id);
  }
  return metas.length;
}

export async function updatePDFMeta(id: string, updates: Partial<PDFDocument>): Promise<void> {
  const existing = await getPDFMeta(id);
  if (!existing) return;
  await storePDFMeta({ ...existing, ...updates, updatedAt: new Date().toISOString() });
}

// ─── Study Records ───

export async function addStudyRecord(record: ActualStudyRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDY_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.STUDY_RECORDS);
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Failed to store study record'));
  });
}

export async function getAllStudyRecords(): Promise<ActualStudyRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDY_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.STUDY_RECORDS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Failed to get study records'));
  });
}

export async function getStudyRecordsForDate(date: string): Promise<ActualStudyRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDY_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.STUDY_RECORDS);
    const index = store.index('date');
    const request = index.getAll(date);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Failed to get study records for date'));
  });
}

export async function getStudyRecordsForSubject(subjectId: string): Promise<ActualStudyRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDY_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.STUDY_RECORDS);
    const index = store.index('subjectId');
    const request = index.getAll(subjectId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Failed to get study records for subject'));
  });
}

export async function deleteStudyRecordsForSubject(subjectId: string): Promise<void> {
  const records = await getStudyRecordsForSubject(subjectId);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDY_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.STUDY_RECORDS);
    for (const record of records) {
      store.delete(record.id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Failed to delete study records'));
  });
}
