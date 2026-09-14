import {
  IBackendAdapter,
  BackendSession,
  BackendSubjectProgress,
  BackendExam,
  BackendUserPreferences,
  BackendUserProfile,
  BackendTopic,
  AvailableStudyTime,
  NewSessionPayload,
  SessionUpdate,
  NewSubjectPayload,
  SchedulePlanPayload,
  RedistributionResult,
} from './backend.interface.js';

// ───────────────────────────────────────────────────────
// Helper: compute days remaining dynamically
// ───────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getDayOfWeek(dateStr: string): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date(dateStr).getDay()];
}

// ───────────────────────────────────────────────────────
// MockBackendAdapter — local grounded state for development
// ───────────────────────────────────────────────────────

export class MockBackendAdapter implements IBackendAdapter {
  private sessions: BackendSession[] = [
    {
      id: 'sess-today-1',
      subjectId: 'sub-ds',
      subjectName: 'Data Structures',
      topicName: 'Shortest Path (Dijkstra) & MST',
      date: todayStr(),
      startTime: '09:00',
      endTime: '09:45',
      durationMinutes: 45,
      dayOfWeek: getDayOfWeek(todayStr()),
      status: 'completed',
      isAdaptive: false,
    },
    {
      id: 'sess-today-2',
      subjectId: 'sub-db',
      subjectName: 'Database Systems',
      topicName: 'Normalization (1NF, 2NF, 3NF, BCNF)',
      date: todayStr(),
      startTime: '11:00',
      endTime: '11:45',
      durationMinutes: 45,
      dayOfWeek: getDayOfWeek(todayStr()),
      status: 'pending',
      isAdaptive: true,
      adaptiveReason: 'Rebalanced from yesterday',
    },
    {
      id: 'sess-today-3',
      subjectId: 'sub-cn',
      subjectName: 'Computer Networks',
      topicName: 'TCP 3-Way Handshake & Flow Control',
      date: todayStr(),
      startTime: '16:30',
      endTime: '17:15',
      durationMinutes: 45,
      dayOfWeek: getDayOfWeek(todayStr()),
      status: 'pending',
      isAdaptive: false,
    },
    {
      id: 'sess-tomorrow-1',
      subjectId: 'sub-os',
      subjectName: 'Operating Systems',
      topicName: 'Virtual Memory & Page Replacement',
      date: addDays(todayStr(), 1),
      startTime: '10:00',
      endTime: '10:50',
      durationMinutes: 50,
      dayOfWeek: getDayOfWeek(addDays(todayStr(), 1)),
      status: 'pending',
      isAdaptive: false,
    },
    {
      id: 'sess-tomorrow-2',
      subjectId: 'sub-db',
      subjectName: 'Database Systems',
      topicName: 'Transaction Management & ACID',
      date: addDays(todayStr(), 1),
      startTime: '14:00',
      endTime: '14:45',
      durationMinutes: 45,
      dayOfWeek: getDayOfWeek(addDays(todayStr(), 1)),
      status: 'pending',
      isAdaptive: false,
    },
    {
      id: 'sess-day3-1',
      subjectId: 'sub-ds',
      subjectName: 'Data Structures',
      topicName: 'Graph Representations (BFS/DFS)',
      date: addDays(todayStr(), 2),
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 60,
      dayOfWeek: getDayOfWeek(addDays(todayStr(), 2)),
      status: 'pending',
      isAdaptive: false,
    },
    {
      id: 'sess-day3-2',
      subjectId: 'sub-cn',
      subjectName: 'Computer Networks',
      topicName: 'DNS, HTTP/2 & TLS Handshake',
      date: addDays(todayStr(), 2),
      startTime: '14:00',
      endTime: '14:55',
      durationMinutes: 55,
      dayOfWeek: getDayOfWeek(addDays(todayStr(), 2)),
      status: 'pending',
      isAdaptive: false,
    },
  ];

  private subjects: BackendSubjectProgress[] = [
    {
      subjectId: 'sub-ds',
      subjectName: 'Data Structures',
      code: 'CS201',
      totalTopics: 8,
      completedTopics: 7,
      progressPercentage: 82,
      topics: [
        { id: 'top-ds-1', name: 'Arrays & Dynamic Vectors', module: 'Module 1', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
        { id: 'top-ds-2', name: 'Singly & Doubly Linked Lists', module: 'Module 1', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
        { id: 'top-ds-3', name: 'Stacks & Queues Applications', module: 'Module 2', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
        { id: 'top-ds-4', name: 'Binary Trees & Traversals', module: 'Module 3', estimatedMinutes: 60, difficulty: 'medium', status: 'completed' },
        { id: 'top-ds-5', name: 'BST & AVL Rotations', module: 'Module 3', estimatedMinutes: 60, difficulty: 'hard', status: 'completed' },
        { id: 'top-ds-6', name: 'Min/Max Heaps & Priority Queues', module: 'Module 4', estimatedMinutes: 45, difficulty: 'medium', status: 'completed' },
        { id: 'top-ds-7', name: 'Graph Representations (BFS/DFS)', module: 'Module 5', estimatedMinutes: 55, difficulty: 'hard', status: 'completed' },
        { id: 'top-ds-8', name: 'Shortest Path (Dijkstra) & MST', module: 'Module 5', estimatedMinutes: 60, difficulty: 'hard', status: 'pending' },
      ],
    },
    {
      subjectId: 'sub-db',
      subjectName: 'Database Systems',
      code: 'CS204',
      totalTopics: 7,
      completedTopics: 4,
      progressPercentage: 61,
      topics: [
        { id: 'top-db-1', name: 'Relational Model & Algebra', module: 'Module 1', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
        { id: 'top-db-2', name: 'Advanced SQL & Subqueries', module: 'Module 2', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
        { id: 'top-db-3', name: 'Entity-Relationship (ER) Modeling', module: 'Module 2', estimatedMinutes: 40, difficulty: 'easy', status: 'completed' },
        { id: 'top-db-4', name: 'Normalization (1NF, 2NF, 3NF, BCNF)', module: 'Module 3', estimatedMinutes: 60, difficulty: 'hard', status: 'in-progress' },
        { id: 'top-db-5', name: 'Transaction Management & ACID', module: 'Module 4', estimatedMinutes: 45, difficulty: 'medium', status: 'pending' },
        { id: 'top-db-6', name: 'Locking Protocols & Deadlocks', module: 'Module 4', estimatedMinutes: 40, difficulty: 'hard', status: 'pending' },
        { id: 'top-db-7', name: 'B+ Tree Indexing & Query Tuning', module: 'Module 5', estimatedMinutes: 50, difficulty: 'hard', status: 'pending' },
      ],
    },
    {
      subjectId: 'sub-cn',
      subjectName: 'Computer Networks',
      code: 'CS302',
      totalTopics: 9,
      completedTopics: 7,
      progressPercentage: 73,
      topics: [
        { id: 'top-cn-1', name: 'OSI 7-Layer vs TCP/IP Architecture', module: 'Module 1', estimatedMinutes: 40, difficulty: 'easy', status: 'completed' },
        { id: 'top-cn-2', name: 'Data Link Framing & Flow Control', module: 'Module 2', estimatedMinutes: 45, difficulty: 'medium', status: 'completed' },
        { id: 'top-cn-3', name: 'Error Detection: CRC & Checksums', module: 'Module 2', estimatedMinutes: 40, difficulty: 'medium', status: 'completed' },
        { id: 'top-cn-4', name: 'IPv4 Addressing, Subnetting & CIDR', module: 'Module 3', estimatedMinutes: 55, difficulty: 'hard', status: 'completed' },
        { id: 'top-cn-5', name: 'Routing Protocols: OSPF & BGP', module: 'Module 3', estimatedMinutes: 50, difficulty: 'hard', status: 'completed' },
        { id: 'top-cn-6', name: 'TCP 3-Way Handshake & Flow Control', module: 'Module 4', estimatedMinutes: 45, difficulty: 'medium', status: 'in-progress' },
        { id: 'top-cn-7', name: 'TCP Congestion Control (AIMD)', module: 'Module 4', estimatedMinutes: 45, difficulty: 'hard', status: 'completed' },
        { id: 'top-cn-8', name: 'DNS, HTTP/2 & TLS Handshake', module: 'Module 5', estimatedMinutes: 55, difficulty: 'medium', status: 'pending' },
        { id: 'top-cn-9', name: 'Network Security: Firewalls & NAT', module: 'Module 5', estimatedMinutes: 45, difficulty: 'medium', status: 'pending' },
      ],
    },
    {
      subjectId: 'sub-os',
      subjectName: 'Operating Systems',
      code: 'CS206',
      totalTopics: 6,
      completedTopics: 3,
      progressPercentage: 48,
      topics: [
        { id: 'top-os-1', name: 'Processes, Threads & PCB States', module: 'Module 1', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
        { id: 'top-os-2', name: 'CPU Scheduling Algorithms', module: 'Module 1', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
        { id: 'top-os-3', name: 'Process Synchronization & Semaphores', module: 'Module 2', estimatedMinutes: 55, difficulty: 'hard', status: 'completed' },
        { id: 'top-os-4', name: 'Virtual Memory & Page Replacement', module: 'Module 3', estimatedMinutes: 50, difficulty: 'hard', status: 'pending' },
        { id: 'top-os-5', name: 'File Systems & Inode Structures', module: 'Module 4', estimatedMinutes: 40, difficulty: 'medium', status: 'pending' },
        { id: 'top-os-6', name: 'Deadlock Detection & Banker Algorithm', module: 'Module 2', estimatedMinutes: 45, difficulty: 'hard', status: 'pending' },
      ],
    },
  ];

  private exams: BackendExam[] = [
    {
      id: 'exam-1',
      title: 'End Semester Examination',
      subtitle: 'Final Comprehensive Assessment',
      date: '2026-09-29',
      daysRemaining: daysUntil('2026-09-29'),
      readinessPercentage: 68,
      subjectNames: ['Data Structures', 'Database Systems', 'Computer Networks', 'Operating Systems'],
    },
    {
      id: 'exam-2',
      title: 'Data Structures Lab Exam',
      subtitle: 'Hands-on Implementation & Algorithms',
      date: '2026-09-17',
      daysRemaining: daysUntil('2026-09-17'),
      readinessPercentage: 82,
      subjectNames: ['Data Structures'],
    },
    {
      id: 'exam-3',
      title: 'Database Normalization Quiz',
      subtitle: 'Module 3 & 4 Mini Evaluation',
      date: '2026-09-22',
      daysRemaining: daysUntil('2026-09-22'),
      readinessPercentage: 61,
      subjectNames: ['Database Systems'],
    },
  ];

  private preferences: BackendUserPreferences = {
    dailyStudyCapacityHours: 4,
    preferredTimeOfDay: 'morning',
    breakDuration: 'pomodoro_25',
    weekendAvailability: true,
  };

  private nextId = 1000;
  private generateId(prefix: string): string {
    return `${prefix}-${++this.nextId}`;
  }

  // ─── Read Operations ───

  async fetchUserSchedule(
    dateOrRange: { start: string; end?: string }
  ): Promise<BackendSession[]> {
    const today = todayStr();
    const startDate = dateOrRange.start === 'today' ? today : dateOrRange.start;
    const endDate = dateOrRange.end || startDate;

    return this.sessions.filter((s) => {
      return s.date >= startDate && s.date <= endDate;
    });
  }

  async fetchTodaySchedule(): Promise<BackendSession[]> {
    const today = todayStr();
    return this.sessions.filter((s) => s.date === today);
  }

  async fetchWeekSchedule(): Promise<BackendSession[]> {
    const today = todayStr();
    const weekEnd = addDays(today, 7);
    return this.sessions.filter((s) => s.date >= today && s.date <= weekEnd);
  }

  async fetchSubjectProgress(subjectId?: string): Promise<BackendSubjectProgress[]> {
    if (subjectId) {
      return this.subjects.filter((s) => s.subjectId === subjectId);
    }
    return this.subjects;
  }

  async fetchExamDeadlines(): Promise<BackendExam[]> {
    // Recompute daysRemaining dynamically
    return this.exams.map((e) => ({
      ...e,
      daysRemaining: daysUntil(e.date),
    }));
  }

  async fetchUserPreferences(): Promise<BackendUserPreferences> {
    return this.preferences;
  }

  async fetchUserProfile(): Promise<BackendUserProfile> {
    const totalTopics = this.subjects.reduce((acc, s) => acc + s.totalTopics, 0);
    const completedTopics = this.subjects.reduce((acc, s) => acc + s.completedTopics, 0);
    return {
      studentName: 'Alex',
      preferences: this.preferences,
      enrolledSubjects: this.subjects.length,
      totalTopics,
      completedTopics,
      streakDays: 7,
    };
  }

  async fetchRemainingTopics(subjectId?: string): Promise<BackendTopic[]> {
    let allTopics: BackendTopic[] = [];
    const filteredSubjects = subjectId
      ? this.subjects.filter((s) => s.subjectId === subjectId)
      : this.subjects;

    for (const sub of filteredSubjects) {
      const remaining = sub.topics
        .filter((t) => t.status !== 'completed')
        .map((t) => ({ ...t, subjectId: sub.subjectId, subjectName: sub.subjectName }));
      allTopics = allTopics.concat(remaining);
    }
    return allTopics;
  }

  async fetchAvailableStudyTime(date?: string): Promise<AvailableStudyTime> {
    const targetDate = date === 'today' || !date ? todayStr() : date;
    const dailyCapacityMinutes = this.preferences.dailyStudyCapacityHours * 60;
    const scheduledSessions = this.sessions.filter((s) => s.date === targetDate);
    const usedMinutes = scheduledSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const remainingMinutes = Math.max(0, dailyCapacityMinutes - usedMinutes);

    // Generate available slots based on preference
    const slots = [];
    if (remainingMinutes > 0) {
      const timeMap: Record<string, { start: string; end: string }> = {
        morning: { start: '08:00', end: '12:00' },
        afternoon: { start: '13:00', end: '17:00' },
        evening: { start: '17:00', end: '21:00' },
        night: { start: '20:00', end: '23:00' },
      };
      const preferred = timeMap[this.preferences.preferredTimeOfDay] || timeMap.morning;
      slots.push({
        date: targetDate,
        startTime: preferred.start,
        endTime: preferred.end,
        availableMinutes: remainingMinutes,
      });
    }

    return {
      date: targetDate,
      totalAvailableMinutes: dailyCapacityMinutes,
      usedMinutes,
      remainingMinutes,
      slots,
    };
  }

  // ─── Write/Action Operations ───

  async createStudySession(session: NewSessionPayload): Promise<BackendSession> {
    const newSession: BackendSession = {
      id: this.generateId('sess'),
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      topicName: session.topicName,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime || this.computeEndTime(session.startTime, session.durationMinutes),
      durationMinutes: session.durationMinutes,
      dayOfWeek: getDayOfWeek(session.date),
      status: 'pending',
      isAdaptive: session.isAdaptive ?? true,
      adaptiveReason: session.adaptiveReason,
    };
    this.sessions.push(newSession);
    return newSession;
  }

  async updateStudySession(sessionId: string, updates: SessionUpdate): Promise<BackendSession> {
    const idx = this.sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error(`Session ${sessionId} not found`);

    const session = this.sessions[idx];
    if (updates.date) session.date = updates.date;
    if (updates.startTime) session.startTime = updates.startTime;
    if (updates.endTime) session.endTime = updates.endTime;
    if (updates.durationMinutes) session.durationMinutes = updates.durationMinutes;
    if (updates.adaptiveReason) {
      session.adaptiveReason = updates.adaptiveReason;
      session.isAdaptive = true;
    }
    this.sessions[idx] = session;
    return session;
  }

  async completeStudySession(sessionId: string): Promise<BackendSession> {
    const idx = this.sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error(`Session ${sessionId} not found`);

    this.sessions[idx].status = 'completed';
    return this.sessions[idx];
  }

  async markSessionMissed(sessionId: string): Promise<RedistributionResult> {
    const idx = this.sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error(`Session ${sessionId} not found`);

    const missedSession = this.sessions[idx];
    missedSession.status = 'missed';

    // Simulate redistribution: split into 2 smaller sessions over next 2 days
    const halfDuration = Math.ceil(missedSession.durationMinutes / 2);
    const redistributed: BackendSession[] = [];

    for (let i = 1; i <= 2; i++) {
      const newDate = addDays(todayStr(), i);
      const newSession: BackendSession = {
        id: this.generateId('sess-redis'),
        subjectId: missedSession.subjectId,
        subjectName: missedSession.subjectName,
        topicName: `${missedSession.topicName} (Part ${i})`,
        date: newDate,
        startTime: i === 1 ? '17:00' : '13:30',
        endTime: this.computeEndTime(i === 1 ? '17:00' : '13:30', halfDuration),
        durationMinutes: halfDuration,
        dayOfWeek: getDayOfWeek(newDate),
        status: 'pending',
        isAdaptive: true,
        adaptiveReason: `Redistributed from missed session on ${missedSession.date}`,
      };
      this.sessions.push(newSession);
      redistributed.push(newSession);
    }

    return {
      redistributedSessions: redistributed,
      message: `Missed session "${missedSession.topicName}" has been split into ${redistributed.length} smaller sessions across the next ${redistributed.length} days. Exam deadlines remain protected.`,
    };
  }

  async rescheduleSession(
    sessionId: string,
    newDate: string,
    newTime: string
  ): Promise<BackendSession> {
    const idx = this.sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error(`Session ${sessionId} not found`);

    const session = this.sessions[idx];
    session.date = newDate;
    session.startTime = newTime;
    session.endTime = this.computeEndTime(newTime, session.durationMinutes);
    session.dayOfWeek = getDayOfWeek(newDate);
    session.status = 'rescheduled';
    session.isAdaptive = true;
    session.adaptiveReason = `Rescheduled by AI assistant`;
    this.sessions[idx] = session;
    return session;
  }

  async createSubject(subject: NewSubjectPayload): Promise<{ subjectId: string; topicCount: number }> {
    const subjectId = this.generateId('sub');
    let topicCount = 0;
    const allTopics: BackendTopic[] = [];

    for (const mod of subject.modules) {
      for (const topic of mod.topics) {
        const topicId = this.generateId('top');
        allTopics.push({
          id: topicId,
          name: topic.name,
          module: `Module ${mod.number}: ${mod.title}`,
          estimatedMinutes: topic.estimatedMinutes || 45,
          difficulty: topic.difficulty || 'medium',
          status: 'pending',
          subjectId,
          subjectName: subject.name,
        });
        topicCount++;
      }
    }

    this.subjects.push({
      subjectId,
      subjectName: subject.name,
      code: subject.code,
      totalTopics: topicCount,
      completedTopics: 0,
      progressPercentage: 0,
      topics: allTopics,
    });

    return { subjectId, topicCount };
  }

  async createModule(
    subjectIdOrName: string,
    module: {
      number: number;
      title: string;
      topics: {
        name: string;
        estimatedMinutes?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
        notes?: string;
      }[];
    }
  ): Promise<{ moduleId: string; topicCount: number }> {
    const sub = this.subjects.find(
      (s) =>
        s.subjectId === subjectIdOrName ||
        s.subjectName.toLowerCase() === subjectIdOrName.toLowerCase()
    );

    const moduleId = this.generateId('mod');
    const newTopics = module.topics.map((t, idx) => ({
      id: this.generateId(`top-${module.number}-${idx}`),
      name: t.name,
      module: `Module ${module.number}: ${module.title}`,
      estimatedMinutes: t.estimatedMinutes || 45,
      difficulty: t.difficulty || 'medium',
      status: 'pending' as const,
      notes: t.notes,
    }));

    if (sub) {
      sub.topics.push(...newTopics);
      sub.totalTopics += newTopics.length;
    }

    return {
      moduleId,
      topicCount: newTopics.length,
    };
  }

  async createSchedule(plan: SchedulePlanPayload): Promise<{ sessions: BackendSession[]; message: string }> {
    // Get all remaining topics across requested subjects (or all if none specified)
    const subjectIds = plan.subjects.map((s) => s.subjectId);
    const targetSubjects = subjectIds.length > 0
      ? this.subjects.filter((s) => subjectIds.includes(s.subjectId))
      : this.subjects;

    const remainingTopics: { subjectId: string; subjectName: string; topic: BackendTopic }[] = [];
    for (const sub of targetSubjects) {
      for (const topic of sub.topics) {
        if (topic.status !== 'completed') {
          remainingTopics.push({ subjectId: sub.subjectId, subjectName: sub.subjectName, topic });
        }
      }
    }

    // Generate sessions day by day
    const newSessions: BackendSession[] = [];
    let currentDate = plan.startDate;
    let topicIdx = 0;
    const excludeDays = (plan.excludeDays || []).map((d) => d.toLowerCase());
    const dailyMinutes = plan.dailyCapacityMinutes || 180;

    const timeMap: Record<string, string> = {
      morning: '09:00',
      afternoon: '14:00',
      evening: '17:00',
      night: '20:00',
    };
    let baseTime = timeMap[plan.preferredTimeOfDay] || '09:00';

    while (topicIdx < remainingTopics.length && currentDate <= plan.endDate) {
      const dayName = new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (excludeDays.includes(dayName)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      let dayMinutesUsed = 0;
      let sessionHour = parseInt(baseTime.split(':')[0], 10);

      while (topicIdx < remainingTopics.length && dayMinutesUsed + 30 <= dailyMinutes) {
        const { subjectId, subjectName, topic } = remainingTopics[topicIdx];
        const duration = Math.min(topic.estimatedMinutes, dailyMinutes - dayMinutesUsed);
        if (duration < 15) break;

        const startTime = `${String(sessionHour).padStart(2, '0')}:00`;
        const sess: BackendSession = {
          id: this.generateId('sess-sched'),
          subjectId,
          subjectName,
          topicName: topic.name,
          date: currentDate,
          startTime,
          endTime: this.computeEndTime(startTime, duration),
          durationMinutes: duration,
          dayOfWeek: getDayOfWeek(currentDate),
          status: 'pending',
          isAdaptive: true,
          adaptiveReason: 'AI-generated study schedule',
        };

        this.sessions.push(sess);
        newSessions.push(sess);
        dayMinutesUsed += duration + 15; // 15m break between sessions
        sessionHour = Math.min(23, sessionHour + Math.ceil((duration + 15) / 60));
        topicIdx++;
      }

      currentDate = addDays(currentDate, 1);
    }

    return {
      sessions: newSessions,
      message: `Created ${newSessions.length} study sessions covering ${topicIdx} topics from ${plan.startDate} to ${currentDate}. Exam deadlines have been respected.`,
    };
  }

  // ─── Utility ───

  private computeEndTime(startTime: string, durationMinutes: number): string {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }
}
