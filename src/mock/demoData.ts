import { Subject, StudySession, AdaptiveNotification, ChatMessage, ExamDeadline, UserStats, StudySettings } from '../types/studyvault';

export const INITIAL_STATS: UserStats = {
  studentName: 'Alex',
  todayStudyMinutes: 200, // 3h 20m
  todayTargetMinutes: 240, // 4h
  weeklyProgressPercentage: 68,
  totalTopics: 36,
  completedTopics: 24,
  examCountdownDays: 18,
  streakDays: 7,
  weeklyStudyHours: [
    { day: 'MON', hours: 3.5, target: 3.5 },
    { day: 'TUE', hours: 2.8, target: 3.5 },
    { day: 'WED', hours: 4.0, target: 3.5 },
    { day: 'THU', hours: 3.2, target: 3.5 },
    { day: 'FRI', hours: 2.5, target: 3.5 },
    { day: 'SAT', hours: 4.5, target: 4.0 },
    { day: 'SUN', hours: 3.0, target: 3.0 },
  ],
};

export const INITIAL_EXAMS: ExamDeadline[] = [
  {
    id: 'exam-1',
    title: 'End Semester Examination',
    subtitle: 'Final Comprehensive Assessment',
    date: '2026-09-29',
    daysRemaining: 18,
    subjects: ['Data Structures', 'Database Systems', 'Computer Networks', 'Operating Systems'],
    readinessPercentage: 68,
  },
  {
    id: 'exam-2',
    title: 'Data Structures Lab Exam',
    subtitle: 'Hands-on Implementation & Algorithms',
    date: '2026-09-17',
    daysRemaining: 6,
    subjects: ['Data Structures'],
    readinessPercentage: 82,
  },
  {
    id: 'exam-3',
    title: 'Database Normalization Quiz',
    subtitle: 'Module 3 & 4 Mini Evaluation',
    date: '2026-09-22',
    daysRemaining: 11,
    subjects: ['Database Systems'],
    readinessPercentage: 61,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-ds',
    name: 'Data Structures',
    code: 'CS201',
    accentColor: '#3b82f6', // blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    totalTopics: 8,
    completedTopics: 7,
    totalMinutes: 390, // 6h 30m
    completedMinutes: 320,
    progressPercentage: 82,
    examDate: '2026-09-17',
    topics: [
      { id: 'top-ds-1', subjectId: 'sub-ds', name: 'Arrays & Dynamic Vectors', module: 'Module 1: Foundations', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
      { id: 'top-ds-2', subjectId: 'sub-ds', name: 'Singly & Doubly Linked Lists', module: 'Module 1: Foundations', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
      { id: 'top-ds-3', subjectId: 'sub-ds', name: 'Stacks & Queues Applications', module: 'Module 2: Linear Structures', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
      { id: 'top-ds-4', subjectId: 'sub-ds', name: 'Binary Trees & Traversals', module: 'Module 3: Non-Linear Structures', estimatedMinutes: 60, difficulty: 'medium', status: 'completed' },
      { id: 'top-ds-5', subjectId: 'sub-ds', name: 'Binary Search Trees & AVL Rotations', module: 'Module 3: Non-Linear Structures', estimatedMinutes: 60, difficulty: 'hard', status: 'completed' },
      { id: 'top-ds-6', subjectId: 'sub-ds', name: 'Min/Max Heaps & Priority Queues', module: 'Module 4: Advanced Heaps', estimatedMinutes: 45, difficulty: 'medium', status: 'completed' },
      { id: 'top-ds-7', subjectId: 'sub-ds', name: 'Graph Representations (BFS / DFS)', module: 'Module 5: Graphs', estimatedMinutes: 55, difficulty: 'hard', status: 'completed' },
      { id: 'top-ds-8', subjectId: 'sub-ds', name: 'Shortest Path (Dijkstra) & MST', module: 'Module 5: Graphs', estimatedMinutes: 60, difficulty: 'hard', status: 'pending' },
    ],
  },
  {
    id: 'sub-db',
    name: 'Database Systems',
    code: 'CS204',
    accentColor: '#06b6d4', // cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
    totalTopics: 7,
    completedTopics: 4,
    totalMinutes: 320, // 5h 20m
    completedMinutes: 195,
    progressPercentage: 61,
    examDate: '2026-09-22',
    topics: [
      { id: 'top-db-1', subjectId: 'sub-db', name: 'Relational Model & Algebra', module: 'Module 1: Foundations', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
      { id: 'top-db-2', subjectId: 'sub-db', name: 'Advanced SQL & Subqueries', module: 'Module 2: SQL Mastery', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
      { id: 'top-db-3', subjectId: 'sub-db', name: 'Entity-Relationship (ER) Modeling', module: 'Module 2: Schema Design', estimatedMinutes: 40, difficulty: 'easy', status: 'completed' },
      { id: 'top-db-4', subjectId: 'sub-db', name: 'Normalization (1NF, 2NF, 3NF, BCNF)', module: 'Module 3: Normal Forms', estimatedMinutes: 60, difficulty: 'hard', status: 'in-progress' },
      { id: 'top-db-5', subjectId: 'sub-db', name: 'Transaction Management & ACID', module: 'Module 4: Concurrency', estimatedMinutes: 45, difficulty: 'medium', status: 'pending' },
      { id: 'top-db-6', subjectId: 'sub-db', name: 'Locking Protocols & Deadlock Prevention', module: 'Module 4: Concurrency', estimatedMinutes: 40, difficulty: 'hard', status: 'pending' },
      { id: 'top-db-7', subjectId: 'sub-db', name: 'B+ Tree Indexing & Query Tuning', module: 'Module 5: Physical Storage', estimatedMinutes: 50, difficulty: 'hard', status: 'pending' },
    ],
  },
  {
    id: 'sub-cn',
    name: 'Computer Networks',
    code: 'CS302',
    accentColor: '#38bdf8', // sky/cyan
    glowColor: 'rgba(56, 189, 248, 0.4)',
    totalTopics: 9,
    completedTopics: 7,
    totalMinutes: 430, // 7h 10m
    completedMinutes: 315,
    progressPercentage: 73,
    examDate: '2026-09-25',
    topics: [
      { id: 'top-cn-1', subjectId: 'sub-cn', name: 'OSI 7-Layer vs TCP/IP Architecture', module: 'Module 1: Architecture', estimatedMinutes: 40, difficulty: 'easy', status: 'completed' },
      { id: 'top-cn-2', subjectId: 'sub-cn', name: 'Data Link Framing & Flow Control', module: 'Module 2: Data Link Layer', estimatedMinutes: 45, difficulty: 'medium', status: 'completed' },
      { id: 'top-cn-3', subjectId: 'sub-cn', name: 'Error Detection: CRC & Checksums', module: 'Module 2: Data Link Layer', estimatedMinutes: 40, difficulty: 'medium', status: 'completed' },
      { id: 'top-cn-4', subjectId: 'sub-cn', name: 'IPv4 Addressing, Subnetting & CIDR', module: 'Module 3: Network Layer', estimatedMinutes: 55, difficulty: 'hard', status: 'completed' },
      { id: 'top-cn-5', subjectId: 'sub-cn', name: 'Routing Protocols: OSPF & BGP Basics', module: 'Module 3: Network Layer', estimatedMinutes: 50, difficulty: 'hard', status: 'completed' },
      { id: 'top-cn-6', subjectId: 'sub-cn', name: 'TCP 3-Way Handshake & Flow Control', module: 'Module 4: Transport Layer', estimatedMinutes: 45, difficulty: 'medium', status: 'in-progress' },
      { id: 'top-cn-7', subjectId: 'sub-cn', name: 'TCP Congestion Control (AIMD & Tahoe)', module: 'Module 4: Transport Layer', estimatedMinutes: 45, difficulty: 'hard', status: 'completed' },
      { id: 'top-cn-8', subjectId: 'sub-cn', name: 'DNS, HTTP/2 & HTTPS TLS Handshake', module: 'Module 5: Application Layer', estimatedMinutes: 55, difficulty: 'medium', status: 'pending' },
      { id: 'top-cn-9', subjectId: 'sub-cn', name: 'Network Security: Firewalls & NAT', module: 'Module 5: Application Layer', estimatedMinutes: 45, difficulty: 'medium', status: 'pending' },
    ],
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    code: 'CS206',
    accentColor: '#818cf8', // indigo
    glowColor: 'rgba(129, 140, 248, 0.4)',
    totalTopics: 6,
    completedTopics: 3,
    totalMinutes: 285, // 4h 45m
    completedMinutes: 135,
    progressPercentage: 48,
    examDate: '2026-09-29',
    topics: [
      { id: 'top-os-1', subjectId: 'sub-os', name: 'Processes, Threads & PCB States', module: 'Module 1: Process Management', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
      { id: 'top-os-2', subjectId: 'sub-os', name: 'CPU Scheduling Algorithms', module: 'Module 1: Process Management', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
      { id: 'top-os-3', subjectId: 'sub-os', name: 'Process Synchronization & Semaphores', module: 'Module 2: Synchronization', estimatedMinutes: 55, difficulty: 'hard', status: 'completed' },
      { id: 'top-os-4', subjectId: 'sub-os', name: 'Virtual Memory & Page Replacement', module: 'Module 3: Memory Management', estimatedMinutes: 50, difficulty: 'hard', status: 'pending' },
      { id: 'top-os-5', subjectId: 'sub-os', name: 'File Systems & Inode Structures', module: 'Module 4: Storage', estimatedMinutes: 40, difficulty: 'medium', status: 'pending' },
      { id: 'top-os-6', subjectId: 'sub-os', name: 'Deadlock Detection & Banker Algorithm', module: 'Module 2: Synchronization', estimatedMinutes: 45, difficulty: 'hard', status: 'pending' },
    ],
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  // Today's Study Plan (Current Day: FRI)
  {
    id: 'sess-today-1',
    subjectId: 'sub-ds',
    subjectName: 'Data Structures',
    subjectColor: '#3b82f6',
    topicId: 'top-ds-4',
    topicName: 'Binary Trees & Traversals',
    startTime: '09:00',
    endTime: '09:45',
    durationMinutes: 45,
    date: '2026-09-11',
    dayOfWeek: 'FRI',
    status: 'completed',
    isAdaptive: false,
    notes: 'Covered in-order, pre-order, post-order iterative algorithms.',
  },
  {
    id: 'sess-today-2',
    subjectId: 'sub-db',
    subjectName: 'Database Systems',
    subjectColor: '#06b6d4',
    topicId: 'top-db-4',
    topicName: 'Normalization (1NF, 2NF, 3NF, BCNF)',
    startTime: '11:00',
    endTime: '12:00',
    durationMinutes: 60,
    date: '2026-09-11',
    dayOfWeek: 'FRI',
    status: 'in-progress',
    isAdaptive: true,
    adaptiveReason: 'Split into two 30m segments after yesterday delay',
    originalSlot: 'Yesterday 14:00 (1hr)',
    notes: 'Focus on candidate keys and loss-less join decomposition.',
  },
  {
    id: 'sess-today-3',
    subjectId: 'sub-cn',
    subjectName: 'Computer Networks',
    subjectColor: '#38bdf8',
    topicId: 'top-cn-6',
    topicName: 'TCP 3-Way Handshake & Flow Control',
    startTime: '16:30',
    endTime: '17:15',
    durationMinutes: 45,
    date: '2026-09-11',
    dayOfWeek: 'FRI',
    status: 'pending',
    isAdaptive: false,
    notes: 'Review SYN, SYN-ACK, ACK sequence numbers & sliding window.',
  },
  {
    id: 'sess-today-4',
    subjectId: 'sub-os',
    subjectName: 'Operating Systems',
    subjectColor: '#818cf8',
    topicId: 'top-os-4',
    topicName: 'Virtual Memory & Page Replacement',
    startTime: '19:00',
    endTime: '19:50',
    durationMinutes: 50,
    date: '2026-09-11',
    dayOfWeek: 'FRI',
    status: 'pending',
    isAdaptive: true,
    adaptiveReason: 'AI scheduled to optimize memory retention before weekend review',
    notes: 'FIFO vs LRU vs Optimal replacement algorithm problems.',
  },

  // Weekly Calendar sessions (MON-SUN)
  {
    id: 'sess-mon-1',
    subjectId: 'sub-ds',
    subjectName: 'Data Structures',
    subjectColor: '#3b82f6',
    topicId: 'top-ds-1',
    topicName: 'Arrays & Dynamic Vectors',
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    date: '2026-09-07',
    dayOfWeek: 'MON',
    status: 'completed',
    isAdaptive: false,
  },
  {
    id: 'sess-mon-2',
    subjectId: 'sub-cn',
    subjectName: 'Computer Networks',
    subjectColor: '#38bdf8',
    topicId: 'top-cn-1',
    topicName: 'OSI 7-Layer Architecture',
    startTime: '14:00',
    endTime: '15:15',
    durationMinutes: 75,
    date: '2026-09-07',
    dayOfWeek: 'MON',
    status: 'completed',
    isAdaptive: false,
  },
  {
    id: 'sess-tue-1',
    subjectId: 'sub-db',
    subjectName: 'Database Systems',
    subjectColor: '#06b6d4',
    topicId: 'top-db-2',
    topicName: 'Advanced SQL Queries',
    startTime: '10:30',
    endTime: '11:45',
    durationMinutes: 75,
    date: '2026-09-08',
    dayOfWeek: 'TUE',
    status: 'completed',
    isAdaptive: false,
  },
  {
    id: 'sess-tue-2',
    subjectId: 'sub-os',
    subjectName: 'Operating Systems',
    subjectColor: '#818cf8',
    topicId: 'top-os-2',
    topicName: 'CPU Scheduling Algorithms',
    startTime: '16:00',
    endTime: '17:00',
    durationMinutes: 60,
    date: '2026-09-08',
    dayOfWeek: 'TUE',
    status: 'completed',
    isAdaptive: false,
  },
  {
    id: 'sess-wed-1',
    subjectId: 'sub-ds',
    subjectName: 'Data Structures',
    subjectColor: '#3b82f6',
    topicId: 'top-ds-3',
    topicName: 'Stacks & Queues',
    startTime: '09:30',
    endTime: '10:30',
    durationMinutes: 60,
    date: '2026-09-09',
    dayOfWeek: 'WED',
    status: 'completed',
    isAdaptive: false,
  },
  {
    id: 'sess-wed-2',
    subjectId: 'sub-cn',
    subjectName: 'Computer Networks',
    subjectColor: '#38bdf8',
    topicId: 'top-cn-4',
    topicName: 'IPv4 Subnetting & CIDR',
    startTime: '14:30',
    endTime: '15:45',
    durationMinutes: 75,
    date: '2026-09-09',
    dayOfWeek: 'WED',
    status: 'completed',
    isAdaptive: false,
  },
  {
    id: 'sess-thu-1',
    subjectId: 'sub-db',
    subjectName: 'Database Systems',
    subjectColor: '#06b6d4',
    topicId: 'top-db-4',
    topicName: 'Normalization',
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    date: '2026-09-10',
    dayOfWeek: 'THU',
    status: 'missed',
    isAdaptive: false,
    notes: 'Missed due to travel delay. Studyvault automatically redistributed.',
  },
  {
    id: 'sess-thu-2',
    subjectId: 'sub-os',
    subjectName: 'Operating Systems',
    subjectColor: '#818cf8',
    topicId: 'top-os-3',
    topicName: 'Semaphores & Locks',
    startTime: '16:30',
    endTime: '17:30',
    durationMinutes: 60,
    date: '2026-09-10',
    dayOfWeek: 'THU',
    status: 'completed',
    isAdaptive: false,
  },
  {
    id: 'sess-sat-1',
    subjectId: 'sub-ds',
    subjectName: 'Data Structures',
    subjectColor: '#3b82f6',
    topicId: 'top-ds-7',
    topicName: 'Graph Representations (BFS/DFS)',
    startTime: '10:00',
    endTime: '11:15',
    durationMinutes: 75,
    date: '2026-09-12',
    dayOfWeek: 'SAT',
    status: 'pending',
    isAdaptive: false,
  },
  {
    id: 'sess-sat-2',
    subjectId: 'sub-db',
    subjectName: 'Database Systems',
    subjectColor: '#06b6d4',
    topicId: 'top-db-4',
    topicName: 'Normalization Part 2 (BCNF)',
    startTime: '13:30',
    endTime: '14:00',
    durationMinutes: 30,
    date: '2026-09-12',
    dayOfWeek: 'SAT',
    status: 'pending',
    isAdaptive: true,
    adaptiveReason: 'Part 2 of redistributed missed session from Thursday',
  },
  {
    id: 'sess-sun-1',
    subjectId: 'sub-cn',
    subjectName: 'Computer Networks',
    subjectColor: '#38bdf8',
    topicId: 'top-cn-7',
    topicName: 'TCP Congestion Control',
    startTime: '11:00',
    endTime: '12:00',
    durationMinutes: 60,
    date: '2026-09-13',
    dayOfWeek: 'SUN',
    status: 'pending',
    isAdaptive: false,
  },
  {
    id: 'sess-sun-2',
    subjectId: 'sub-os',
    subjectName: 'Operating Systems',
    subjectColor: '#818cf8',
    topicId: 'top-os-6',
    topicName: 'Deadlock Detection & Bankers Algorithm',
    startTime: '16:00',
    endTime: '17:00',
    durationMinutes: 60,
    date: '2026-09-13',
    dayOfWeek: 'SUN',
    status: 'pending',
    isAdaptive: false,
  }
];

export const INITIAL_NOTIFICATIONS: AdaptiveNotification[] = [
  {
    id: 'notif-1',
    title: 'Adaptive Schedule Redistribution',
    message: 'Missed Thursday Database Systems session (1h) redistributed into two 30m blocks (Today 11:30 & Tomorrow 13:30). Exam deadline protected.',
    time: '12m ago',
    type: 'reschedule',
    read: false,
    actionRequired: true,
    details: {
      original: 'Database Systems — 1h (Thu)',
      updated: 'Today — 30m + Tomorrow — 30m',
    },
  },
  {
    id: 'notif-2',
    title: 'Exam Deadline Protected',
    message: 'Data Structures Lab Exam is in 6 days. Optimal retention window achieved: 82% syllabus coverage.',
    time: '2h ago',
    type: 'protection',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Daily Streak Milestone',
    message: 'You have maintained a 7-day consistent study streak! Velocity is 14% higher than last week.',
    time: 'Yesterday',
    type: 'completion',
    read: true,
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: "Hello Alex! I'm Studyvault AI, your adaptive study strategist. I monitor your syllabus progress and dynamically rebalance your timetable around missed sessions and exam deadlines. How can I help today?",
    timestamp: '09:00 AM',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: "I'm too tired to study today. Push my tasks.",
    timestamp: '09:12 AM',
  },
  {
    id: 'msg-3',
    sender: 'assistant',
    text: "No problem. I've redistributed today's unfinished sessions across your available study slots while keeping your exam deadline protected. Here is the recalculated plan:",
    timestamp: '09:12 AM',
    actionCard: {
      type: 'schedule-update',
      title: 'Updated Schedule — Zero Deadline Impact',
      originalSummary: '2 sessions postponed (Database Systems & Computer Networks)',
      updatedSummary: 'Redistributed across Saturday (14:00) and Sunday morning slots',
      shifts: [
        { subject: 'Database Systems (Normalization)', from: 'Today 11:00', to: 'Sat 14:00', duration: '45m' },
        { subject: 'Computer Networks (TCP Handshake)', from: 'Today 16:30', to: 'Sun 10:30', duration: '45m' },
      ],
      deadlineProtected: true,
      applied: true,
    },
  },
];

export const INITIAL_SETTINGS: StudySettings = {
  dailyStudyCapacityHours: 4,
  preferredTimeOfDay: 'morning',
  breakDuration: 'pomodoro_25',
  difficultyPreference: 'balanced',
  weekendAvailability: true,
  studyReminders: true,
  scheduleChangesAlert: true,
  examCountdownAlert: true,
  glassIntensity: 'balanced',
  accentTheme: 'electric',
  reducedMotion: false,
};

export const SAMPLE_SYLLABUS_TEXT = `Computer Science Core Curriculum 2026
Course: Bachelor of Science in Computer Science

Module 1: Advanced Data Structures (CS201)
- Arrays, Dynamic Amortization & Vectors
- Singly & Doubly Linked Lists
- Stacks & Queues Applications
- Binary Trees & Depth-First Traversals
- Binary Search Trees & AVL Balancing
- Min/Max Binary Heaps & Priority Queues
- Graph Representations (BFS & DFS)
- Shortest Path (Dijkstra) & Minimum Spanning Trees

Module 2: Database Management Systems (CS204)
- Relational Data Model & Relational Algebra
- Complex SQL Queries & Aggregations
- ER Modeling & Schema Transformation
- Normalization (1NF, 2NF, 3NF, BCNF)
- Transaction Processing & ACID Properties
- Concurrency Control & Two-Phase Locking
- B+ Tree Indexing & Query Cost Optimization

Module 3: Computer Networks (CS302)
- OSI 7-Layer Reference Model vs TCP/IP
- Data Link Layer: Framing, CRC & Flow Control
- IPv4/IPv6 Addressing, Subnetting & CIDR Notation
- Intra-domain & Inter-domain Routing (OSPF & BGP)
- TCP Flow Control, Congestion Control (AIMD)
- Application Layer: DNS Resolution & HTTP/3

Module 4: Operating Systems (CS206)
- Process Lifecycle, Threads & Context Switching
- CPU Scheduling (FCFS, Round-Robin, Multi-Level)
- Inter-Process Communication & Semaphores
- Virtual Memory, Paging & Page Replacement (LRU)
- File System Layout & Inode Allocation
- Deadlock Prevention, Avoidance & Banker's Algorithm
`;
