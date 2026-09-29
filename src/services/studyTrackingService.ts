/**
 * Centralized Study Tracking Service
 * Single source of truth for all study statistics.
 * Calendar, Profile, Subjects, and Streaks ALL derive from the same ActualStudyRecord data.
 */
import type { ActualStudyRecord, StudyStatistics, DayStudyData } from '../types/studyvault';
import { getAllStudyRecords, addStudyRecord as idbAddRecord } from './indexedDBService';

const STREAK_THRESHOLD_SECONDS = 15 * 60; // 15 minutes minimum for a study day

// ─── Core data access ───

export async function addStudyRecord(record: ActualStudyRecord): Promise<void> {
  await idbAddRecord(record);
}

export async function getStudyRecords(): Promise<ActualStudyRecord[]> {
  return getAllStudyRecords();
}

// ─── Date Helpers ───

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday start
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  return weekStart.toISOString().split('T')[0];
}

function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

// ─── Derived statistics (single source of truth) ───

export async function computeStudyStatistics(): Promise<StudyStatistics> {
  const records = await getStudyRecords();
  const today = getToday();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const totalStudyTimeSeconds = records.reduce((sum, r) => sum + r.durationSeconds, 0);

  const todayRecords = records.filter(r => r.date === today);
  const todayStudyTimeSeconds = todayRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

  const weekRecords = records.filter(r => r.date >= weekStart);
  const thisWeekStudyTimeSeconds = weekRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

  const monthRecords = records.filter(r => r.date >= monthStart);
  const thisMonthStudyTimeSeconds = monthRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

  // Unique study days
  const studyDayMap = new Map<string, number>();
  for (const r of records) {
    studyDayMap.set(r.date, (studyDayMap.get(r.date) || 0) + r.durationSeconds);
  }
  const qualifiedDays = Array.from(studyDayMap.entries())
    .filter(([, secs]) => secs >= STREAK_THRESHOLD_SECONDS)
    .map(([date]) => date)
    .sort();

  const totalStudyDays = qualifiedDays.length;
  const averageDailyStudySeconds = totalStudyDays > 0
    ? Math.round(totalStudyTimeSeconds / totalStudyDays)
    : 0;

  const averageSessionDurationSeconds = records.length > 0
    ? Math.round(totalStudyTimeSeconds / records.length)
    : 0;

  // Streaks
  const { currentStreak, longestStreak } = computeStreaks(qualifiedDays);

  // Unique subjects and PDFs
  const subjectsStudied = new Set(records.map(r => r.subjectId)).size;
  const pdfsRead = new Set(records.filter(r => r.pdfId).map(r => r.pdfId)).size;

  return {
    totalStudyTimeSeconds,
    todayStudyTimeSeconds,
    thisWeekStudyTimeSeconds,
    thisMonthStudyTimeSeconds,
    averageDailyStudySeconds,
    averageSessionDurationSeconds,
    currentStreak,
    longestStreak,
    totalStudyDays,
    subjectsStudied,
    pdfsRead,
  };
}

function computeStreaks(sortedDays: string[]): { currentStreak: number; longestStreak: number } {
  if (sortedDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestStreak = 1;
  let currentRunning = 1;
  let currentStreak = 0;

  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRunning++;
    } else {
      currentRunning = 1;
    }
    longestStreak = Math.max(longestStreak, currentRunning);
  }

  // Current streak: must include today or yesterday
  const lastDay = sortedDays[sortedDays.length - 1];
  if (lastDay === today || lastDay === yesterdayStr) {
    currentStreak = 1;
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const prev = new Date(sortedDays[i]);
      const curr = new Date(sortedDays[i + 1]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

// ─── Calendar integration: compute remaining time per subject for a date ───

export async function getCompletedStudyForDate(date: string): Promise<Map<string, number>> {
  const records = await getStudyRecords();
  const dateRecords = records.filter(r => r.date === date);
  const map = new Map<string, number>();

  for (const r of dateRecords) {
    const current = map.get(r.subjectId) || 0;
    map.set(r.subjectId, current + Math.round(r.durationSeconds / 60));
  }

  return map;
}

// ─── Study heatmap data ───

export async function getStudyHeatmapData(days: number = 90): Promise<DayStudyData[]> {
  const records = await getStudyRecords();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  const dayMap = new Map<string, { totalSeconds: number; sessions: number; subjects: Set<string> }>();

  for (const r of records) {
    if (r.date < startStr) continue;
    const existing = dayMap.get(r.date) || { totalSeconds: 0, sessions: 0, subjects: new Set<string>() };
    existing.totalSeconds += r.durationSeconds;
    existing.sessions++;
    existing.subjects.add(r.subjectName);
    dayMap.set(r.date, existing);
  }

  const result: DayStudyData[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const data = dayMap.get(dateStr);
    result.push({
      date: dateStr,
      totalSeconds: data?.totalSeconds || 0,
      sessions: data?.sessions || 0,
      subjects: data ? Array.from(data.subjects) : [],
    });
  }

  return result;
}

// ─── Subject-specific study stats ───

export async function getSubjectStudyStats(subjectId: string): Promise<{
  totalSeconds: number;
  todaySeconds: number;
  weekSeconds: number;
  sessionCount: number;
}> {
  const records = await getStudyRecords();
  const subjectRecords = records.filter(r => r.subjectId === subjectId);
  const today = getToday();
  const weekStart = getWeekStart();

  return {
    totalSeconds: subjectRecords.reduce((sum, r) => sum + r.durationSeconds, 0),
    todaySeconds: subjectRecords.filter(r => r.date === today).reduce((sum, r) => sum + r.durationSeconds, 0),
    weekSeconds: subjectRecords.filter(r => r.date >= weekStart).reduce((sum, r) => sum + r.durationSeconds, 0),
    sessionCount: subjectRecords.length,
  };
}

// ─── Format helpers ───

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatDurationMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
