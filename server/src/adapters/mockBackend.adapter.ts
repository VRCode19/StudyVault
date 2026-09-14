import {
  IBackendAdapter,
  BackendSession,
  BackendSubjectProgress,
  BackendExam,
  BackendUserPreferences,
} from './backend.interface.js';

export class MockBackendAdapter implements IBackendAdapter {
  private sessions: BackendSession[] = [
    {
      id: 'sess-today-1',
      subjectId: 'sub-ds',
      subjectName: 'Data Structures',
      topicName: 'Shortest Path (Dijkstra) & MST',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '09:45',
      durationMinutes: 45,
      status: 'completed',
      isAdaptive: false,
    },
    {
      id: 'sess-today-2',
      subjectId: 'sub-db',
      subjectName: 'Database Systems',
      topicName: 'Normalization (1NF, 2NF, 3NF, BCNF)',
      date: new Date().toISOString().split('T')[0],
      startTime: '11:00',
      endTime: '11:45',
      durationMinutes: 45,
      status: 'pending',
      isAdaptive: true,
      adaptiveReason: 'Rebalanced from yesterday',
    },
    {
      id: 'sess-today-3',
      subjectId: 'sub-cn',
      subjectName: 'Computer Networks',
      topicName: 'TCP 3-Way Handshake & Flow Control',
      date: new Date().toISOString().split('T')[0],
      startTime: '16:30',
      endTime: '17:15',
      durationMinutes: 45,
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
      daysRemaining: 17,
      readinessPercentage: 68,
      subjectNames: ['Data Structures', 'Database Systems', 'Computer Networks', 'Operating Systems'],
    },
    {
      id: 'exam-2',
      title: 'Data Structures Lab Exam',
      subtitle: 'Hands-on Implementation & Algorithms',
      date: '2026-09-17',
      daysRemaining: 5,
      readinessPercentage: 82,
      subjectNames: ['Data Structures'],
    },
    {
      id: 'exam-3',
      title: 'Database Normalization Quiz',
      subtitle: 'Module 3 & 4 Mini Evaluation',
      date: '2026-09-22',
      daysRemaining: 10,
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

  async fetchUserSchedule(
    dateOrRange: { start: string; end?: string }
  ): Promise<BackendSession[]> {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = dateOrRange.start === 'today' ? today : dateOrRange.start;
    
    // In mock mode, if requested date is today or matching, return today's sessions
    return this.sessions.filter(
      (s) => s.date === targetDate || dateOrRange.start === 'today'
    );
  }

  async fetchSubjectProgress(subjectId?: string): Promise<BackendSubjectProgress[]> {
    if (subjectId) {
      return this.subjects.filter((s) => s.subjectId === subjectId);
    }
    return this.subjects;
  }

  async fetchExamDeadlines(): Promise<BackendExam[]> {
    return this.exams;
  }

  async fetchUserPreferences(): Promise<BackendUserPreferences> {
    return this.preferences;
  }
}
