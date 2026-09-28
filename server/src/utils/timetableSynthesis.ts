import { StudySessionExtraction, SyllabusTimetable } from '../schemas/vision.schema.js';

export interface TimetableSynthesisOptions {
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  dailyHours?: number;
  excludeWeekends?: boolean;
}

/**
 * Synthesizes an optimal, adaptive weekly study timetable from syllabus subjects and topics.
 * Balances cognitive load: harder topics in high-energy morning windows, spaced repetition across the week.
 */
export function synthesizeStudySessionsFromSubjects(
  subjects: any[],
  options: TimetableSynthesisOptions = {}
): { studySessions: StudySessionExtraction[]; timetable: SyllabusTimetable } {
  const days: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'> = options.excludeWeekends
    ? ['MON', 'TUE', 'WED', 'THU', 'FRI']
    : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const timeSlots = [
    { start: '09:00', end: '09:50', duration: 50, period: 'morning', label: 'Morning Deep Work' },
    { start: '10:30', end: '11:15', duration: 45, period: 'morning', label: 'Morning Review' },
    { start: '14:00', end: '14:50', duration: 50, period: 'afternoon', label: 'Afternoon Analysis' },
    { start: '15:30', end: '16:15', duration: 45, period: 'afternoon', label: 'Applied Practice' },
    { start: '17:30', end: '18:15', duration: 45, period: 'evening', label: 'Twilight Consolidation' },
    { start: '19:30', end: '20:15', duration: 45, period: 'evening', label: 'Evening Recall' },
  ];

  // Reorder timeSlots based on student's preferred time of day
  if (options.preferredTimeOfDay === 'afternoon') {
    timeSlots.sort((a, b) => (a.period === 'afternoon' ? -1 : b.period === 'afternoon' ? 1 : 0));
  } else if (options.preferredTimeOfDay === 'evening') {
    timeSlots.sort((a, b) => (a.period === 'evening' ? -1 : b.period === 'evening' ? 1 : 0));
  }

  // 1. Flatten all topics from subjects and nested modules
  const allTopics: Array<{
    subjectName: string;
    subjectCode?: string;
    topicName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedMinutes: number;
    moduleName?: string;
  }> = [];

  for (const sub of subjects) {
    const subName = sub.name || 'Core Curriculum';
    const subCode = sub.code || 'COURSE';

    if (Array.isArray(sub.topics) && sub.topics.length > 0) {
      for (const t of sub.topics) {
        allTopics.push({
          subjectName: subName,
          subjectCode: subCode,
          topicName: typeof t === 'string' ? t : t.name,
          difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty) ? t.difficulty : 'medium',
          estimatedMinutes: typeof t.estimatedMinutes === 'number' ? t.estimatedMinutes : 45,
          moduleName: t.module,
        });
      }
    }

    if (Array.isArray(sub.modules) && sub.modules.length > 0) {
      for (const m of sub.modules) {
        const modTitle = m.name || m.title || `Module ${m.number || ''}`.trim();
        if (Array.isArray(m.topics)) {
          for (const t of m.topics) {
            allTopics.push({
              subjectName: subName,
              subjectCode: subCode,
              topicName: typeof t === 'string' ? t : t.name,
              difficulty: typeof t === 'object' && ['easy', 'medium', 'hard'].includes(t.difficulty) ? t.difficulty : 'medium',
              estimatedMinutes: typeof t === 'object' && typeof t.estimatedMinutes === 'number' ? t.estimatedMinutes : 45,
              moduleName: modTitle,
            });
          }
        }
      }
    }
  }

  if (allTopics.length === 0) {
    return {
      studySessions: [],
      timetable: { weeklySchedule: [] },
    };
  }

  // 2. Prioritize: Place 'hard' topics first in prime morning slots, then 'medium', then 'easy'
  const hardTopics = allTopics.filter((t) => t.difficulty === 'hard');
  const mediumTopics = allTopics.filter((t) => t.difficulty === 'medium');
  const easyTopics = allTopics.filter((t) => t.difficulty === 'easy');
  const orderedTopics = [...hardTopics, ...mediumTopics, ...easyTopics];

  const studySessions: StudySessionExtraction[] = [];
  const weeklyMap: Record<string, Array<{ day: string; timeSlot: string; subject: string; room?: string; type?: string }>> = {};

  days.forEach((day) => {
    weeklyMap[day] = [];
  });

  let topicIndex = 0;
  const maxSessionsPerDay = options.dailyHours ? Math.max(1, Math.min(4, Math.round(options.dailyHours))) : 3;

  // Cycle through the days to distribute sessions
  for (let round = 0; round < maxSessionsPerDay && topicIndex < orderedTopics.length; round++) {
    for (const day of days) {
      if (topicIndex >= orderedTopics.length) break;

      const slot = timeSlots[round % timeSlots.length];
      const topic = orderedTopics[topicIndex++];

      const session: StudySessionExtraction = {
        id: `sess-ai-${Date.now()}-${day}-${topicIndex}`,
        dayOfWeek: day,
        startTime: slot.start,
        endTime: slot.end,
        durationMinutes: topic.estimatedMinutes || slot.duration,
        subjectName: topic.subjectName,
        topicName: topic.topicName,
        difficulty: topic.difficulty,
        adaptiveReason: `${
          topic.difficulty === 'hard'
            ? 'High cognitive complexity module'
            : topic.difficulty === 'easy'
            ? 'Review and consolidation'
            : 'Core curriculum advancement'
        } allocated to ${slot.label} (${slot.start} - ${slot.end})`,
      };

      studySessions.push(session);

      weeklyMap[day].push({
        day,
        timeSlot: `${slot.start} - ${slot.end}`,
        subject: `${topic.subjectName}: ${topic.topicName}`,
        type: topic.difficulty,
      });
    }
  }

  const timetable: SyllabusTimetable = {
    weeklySchedule: days.map((day) => ({
      day,
      slots: weeklyMap[day] || [],
    })),
  };

  return { studySessions, timetable };
}
