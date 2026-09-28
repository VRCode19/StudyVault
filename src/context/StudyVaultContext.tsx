import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ActivePage,
  Subject,
  StudySession,
  AdaptiveNotification,
  ChatMessage,
  ExamDeadline,
  UserStats,
  StudySettings,
  DayOfWeek,
  ChatAttachment,
  User,
  TaskItem,
  VaultResource,
} from '../types/studyvault';
import { aiService } from '../services/aiService';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'adaptive' | 'warning';
}

export interface RegisterUserData {
  name: string;
  email: string;
  password?: string;
  major?: string;
  semester?: string;
  targetDailyHours?: number;
}

interface StudyVaultContextType {
  // Auth state & actions
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterUserData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  subjects: Subject[];
  sessions: StudySession[];
  tasks: TaskItem[];
  vaultResources: VaultResource[];
  activeNoteId: string | null;
  notifications: AdaptiveNotification[];
  chatMessages: ChatMessage[];
  stats: UserStats;
  exams: ExamDeadline[];
  settings: StudySettings;
  themeMode: 'dark' | 'light';
  toasts: ToastItem[];
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  selectedSession: StudySession | null;
  setSelectedSession: (session: StudySession | null) => void;
  isAiThinking: boolean;
  conversationId: string;

  // Actions
  toggleSessionComplete: (sessionId: string) => void;
  rescheduleSession: (sessionId: string, newDay: DayOfWeek, newTime: string, reason?: string) => void;
  splitSession: (sessionId: string) => void;
  simulateMissedSession: () => void;
  sendChatMessage: (text: string, files?: File[]) => Promise<void>;
  applyChatActionCard: (messageId: string) => void;
  confirmExtraction: (messageId: string) => void;
  updateSettings: (newSettings: Partial<StudySettings>) => void;
  toggleTheme: () => void;
  clearUserData: () => void;
  resetDemoData: () => void; // alias for clearUserData
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  deleteSubject: (subjectId: string) => void;
  addExam: (exam: Omit<ExamDeadline, 'id'>) => void;
  deleteExam: (examId: string) => void;
  addSession: (session: Omit<StudySession, 'id'>) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addResource: (resource: Omit<VaultResource, 'id'>) => void;
  updateResource: (id: string, updates: Partial<VaultResource>) => void;
  deleteResource: (id: string) => void;
  setActiveNoteId: (id: string | null) => void;
  showToast: (title: string, message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  isParsingSyllabus: boolean;
  parsingStep: number;
  runSyllabusParser: (fileOrText?: File | File[] | string) => Promise<void>;
  generateTimetableFromSyllabus: (options?: {
    preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
    dailyHours?: number;
    excludeWeekends?: boolean;
  }) => void;
}

const DEFAULT_SETTINGS: StudySettings = {
  dailyStudyCapacityHours: 4,
  preferredTimeOfDay: 'evening',
  breakDuration: 'deep_50',
  difficultyPreference: 'high_yield_first',
  weekendAvailability: true,
  studyReminders: true,
  scheduleChangesAlert: true,
  examCountdownAlert: true,
  glassIntensity: 'balanced',
  accentTheme: 'electric',
  reducedMotion: false,
};

const createDefaultStats = (studentName: string = 'Student', targetHours: number = 4): UserStats => ({
  studentName,
  todayStudyMinutes: 0,
  todayTargetMinutes: Math.round(targetHours * 60),
  weeklyProgressPercentage: 0,
  totalTopics: 0,
  completedTopics: 0,
  examCountdownDays: 0,
  streakDays: 0,
  weeklyStudyHours: [
    { day: 'MON', hours: 0, target: targetHours },
    { day: 'TUE', hours: 0, target: targetHours },
    { day: 'WED', hours: 0, target: targetHours },
    { day: 'THU', hours: 0, target: targetHours },
    { day: 'FRI', hours: 0, target: targetHours },
    { day: 'SAT', hours: 0, target: targetHours },
    { day: 'SUN', hours: 0, target: targetHours },
  ],
});

const createDefaultChat = (studentName: string): ChatMessage[] => [
  {
    id: 'msg-welcome-0',
    sender: 'assistant',
    text: `Hello ${studentName}! I am StudyVault AI, your personal academic strategist.\n\nTo build your personalized study schedule and arrange every module into your calendar:\n\n👉 **How many subjects are you studying this semester?** (e.g., 3, 4, 5...)\n\nOnce you let me know, we'll go through them step-by-step: Subject 1 syllabus, then Subject 2, etc., and map each module into a balanced timetable!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    accentColor: '#2563eb',
    glowColor: 'rgba(37,99,235,0.4)',
    totalTopics: 18,
    completedTopics: 12,
    totalMinutes: 720,
    completedMinutes: 480,
    progressPercentage: 68,
    examDate: '2026-10-18',
    topics: [
      { id: 'top-1', subjectId: 'sub-dsa', name: 'Arrays & Dynamic Arrays', module: 'Module 1', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
      { id: 'top-2', subjectId: 'sub-dsa', name: 'Singly and Doubly Linked Lists', module: 'Module 1', estimatedMinutes: 60, difficulty: 'medium', status: 'completed' },
      { id: 'top-3', subjectId: 'sub-dsa', name: 'Red-Black Trees & AVL Trees', module: 'Module 2', estimatedMinutes: 90, difficulty: 'hard', status: 'in-progress' },
      { id: 'top-4', subjectId: 'sub-dsa', name: 'Dijkstra & Prim Graph Algorithms', module: 'Module 3', estimatedMinutes: 75, difficulty: 'hard', status: 'pending' },
    ],
  },
  {
    id: 'sub-dbms',
    name: 'Database Management Systems',
    code: 'CS304',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.4)',
    totalTopics: 14,
    completedTopics: 10,
    totalMinutes: 560,
    completedMinutes: 410,
    progressPercentage: 74,
    examDate: '2026-10-14',
    topics: [
      { id: 'top-5', subjectId: 'sub-dbms', name: 'ER Diagrams & Relational Model', module: 'Module 1', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
      { id: 'top-6', subjectId: 'sub-dbms', name: 'Normalization (1NF to BCNF)', module: 'Module 2', estimatedMinutes: 60, difficulty: 'medium', status: 'completed' },
      { id: 'top-7', subjectId: 'sub-dbms', name: 'ACID Properties & Transactions', module: 'Module 3', estimatedMinutes: 60, difficulty: 'medium', status: 'pending' },
    ],
  },
  {
    id: 'sub-ai',
    name: 'Artificial Intelligence',
    code: 'CS410',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.4)',
    totalTopics: 16,
    completedTopics: 11,
    totalMinutes: 640,
    completedMinutes: 460,
    progressPercentage: 72,
    examDate: '2026-10-24',
    topics: [
      { id: 'top-8', subjectId: 'sub-ai', name: 'A* Search & Heuristics', module: 'Module 1', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
      { id: 'top-9', subjectId: 'sub-ai', name: 'Neural Networks & Backprop', module: 'Module 2', estimatedMinutes: 90, difficulty: 'hard', status: 'in-progress' },
      { id: 'top-10', subjectId: 'sub-ai', name: 'Transformer Attention Mechanisms', module: 'Module 3', estimatedMinutes: 80, difficulty: 'hard', status: 'pending' },
    ],
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    code: 'CS302',
    accentColor: '#14b8a6',
    glowColor: 'rgba(20,184,166,0.4)',
    totalTopics: 15,
    completedTopics: 8,
    totalMinutes: 600,
    completedMinutes: 320,
    progressPercentage: 54,
    examDate: '2026-10-28',
    topics: [
      { id: 'top-11', subjectId: 'sub-os', name: 'Process Scheduling Algorithms', module: 'Module 1', estimatedMinutes: 45, difficulty: 'easy', status: 'completed' },
      { id: 'top-12', subjectId: 'sub-os', name: 'Deadlock Detection & Bankers Algorithm', module: 'Module 2', estimatedMinutes: 60, difficulty: 'medium', status: 'pending' },
    ],
  },
  {
    id: 'sub-math',
    name: 'Discrete Mathematics',
    code: 'MA201',
    accentColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.4)',
    totalTopics: 12,
    completedTopics: 9,
    totalMinutes: 480,
    completedMinutes: 360,
    progressPercentage: 75,
    examDate: '2026-11-04',
    topics: [
      { id: 'top-13', subjectId: 'sub-math', name: 'Graph Theory & Eulerian Paths', module: 'Module 1', estimatedMinutes: 50, difficulty: 'medium', status: 'completed' },
      { id: 'top-14', subjectId: 'sub-math', name: 'Recurrence Relations & Generating Functions', module: 'Module 2', estimatedMinutes: 60, difficulty: 'hard', status: 'pending' },
    ],
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'DBMS Assignment: Normalization to BCNF',
    subject: 'Database Management Systems',
    subjectColor: '#8b5cf6',
    dueDate: 'Due tomorrow, 11:59 PM',
    priority: 'high',
    completed: false,
    tags: ['Assignment', 'SQL', 'BCNF'],
    notes: 'Solve problem set 3 on 3NF vs BCNF dependency preservation.',
  },
  {
    id: 'task-2',
    title: 'Implement Red-Black Tree Rotation in C++',
    subject: 'Data Structures & Algorithms',
    subjectColor: '#2563eb',
    dueDate: 'Oct 14, 5:00 PM',
    priority: 'urgent',
    completed: false,
    tags: ['Lab', 'C++', 'Trees'],
    notes: 'Test insertion balance cases 1 through 3.',
  },
  {
    id: 'task-3',
    title: 'Read AI Chapter 4: Convolutional Neural Networks',
    subject: 'Artificial Intelligence',
    subjectColor: '#06b6d4',
    dueDate: 'Oct 16, 2:00 PM',
    priority: 'medium',
    completed: false,
    tags: ['Reading', 'Deep Learning'],
    notes: 'Focus on pooling layers and receptive fields.',
  },
  {
    id: 'task-4',
    title: 'Operating Systems Mutex Lock Simulation',
    subject: 'Operating Systems',
    subjectColor: '#14b8a6',
    dueDate: 'Oct 18, 10:00 AM',
    priority: 'medium',
    completed: true,
    tags: ['Lab', 'Threads'],
    notes: 'Completed and verified with valgrind.',
  },
  {
    id: 'task-5',
    title: 'Discrete Math Practice Quiz 2',
    subject: 'Discrete Mathematics',
    subjectColor: '#f97316',
    dueDate: 'Oct 20, 6:00 PM',
    priority: 'low',
    completed: false,
    tags: ['Quiz', 'Combinatorics'],
    notes: 'Review pigeonhole principle and inclusion-exclusion.',
  },
];

const DEFAULT_VAULT_RESOURCES: VaultResource[] = [
  {
    id: 'res-1',
    title: 'Data Structures & Algorithms: Master Cheatsheet',
    subject: 'Data Structures & Algorithms',
    type: 'note',
    size: '18 KB',
    updatedAt: '2 hours ago',
    bookmarked: true,
    tags: ['Trees', 'Big-O', 'Graphs', 'Dynamic Programming'],
    content: `# Data Structures & Algorithms: Master Cheatsheet

## 1. Asymptotic Complexity Overview
- **Arrays**: Access $O(1)$, Search $O(N)$, Insertion/Deletion $O(N)$
- **Linked Lists**: Access $O(N)$, Search $O(N)$, Insertion at head $O(1)$
- **Binary Search Tree (Balanced)**: Search $O(\\log N)$, Insert $O(\\log N)$, Delete $O(\\log N)$
- **Hash Table**: Average $O(1)$ lookup and insertion; Worst case $O(N)$

## 2. Red-Black Tree Balancing Invariants
1. Every node is either red or black.
2. The root is always black.
3. Every leaf (NIL) is black.
4. If a node is red, both of its children are black (no two consecutive red nodes on any path).
5. For each node, all simple paths from the node to descendant leaves contain the same number of black nodes.

\`\`\`cpp
// Left Rotation snippet
void leftRotate(Node*& root, Node*& x) {
    Node* y = x->right;
    x->right = y->left;
    if (y->left != nullptr)
        y->left->parent = x;
    y->parent = x->parent;
    if (x->parent == nullptr)
        root = y;
    else if (x == x->parent->left)
        x->parent->left = y;
    else
        x->parent->right = y;
    y->left = x;
    x->parent = y;
}
\`\`\`

## 3. High-Yield Interview Patterns
- **Two Pointers**: Used in sorted arrays, container with most water, palindrome checks.
- **Sliding Window**: Substring with at most $K$ distinct characters, maximum subarray sum of length $K$.
- **Fast & Slow Pointers**: Floyd's Cycle Detection in linked lists.`,
  },
  {
    id: 'res-2',
    title: 'Database Normalization (1NF to BCNF) Guide',
    subject: 'Database Management Systems',
    type: 'pdf',
    size: '2.4 MB',
    updatedAt: 'Yesterday',
    bookmarked: true,
    tags: ['DBMS', 'Relational', 'SQL'],
    content: `# Database Normalization Guide
### 1NF: Atomic values only.
### 2NF: 1NF + No partial dependencies on candidate keys.
### 3NF: 2NF + No transitive dependencies ($X \\to Y$ where $X$ is not superkey).
### BCNF: For every non-trivial FD $X \\to Y$, $X$ must be a superkey.`,
  },
  {
    id: 'res-3',
    title: 'Neural Networks & Gradient Descent Breakdown',
    subject: 'Artificial Intelligence',
    type: 'note',
    size: '14 KB',
    updatedAt: '3 days ago',
    bookmarked: false,
    tags: ['AI', 'Backprop', 'Loss Functions'],
    content: `# Neural Networks & Backpropagation
- **Forward Pass**: Compute activations layer by layer: $z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$, $a^{[l]} = g(z^{[l]})$.
- **Cost Function**: Binary Cross Entropy or Categorical Cross Entropy.
- **Backward Pass**: Apply Chain Rule to compute $\\frac{\\partial \\mathcal{L}}{\\partial W}$ and $\\frac{\\partial \\mathcal{L}}{\\partial b}$.`,
  },
  {
    id: 'res-4',
    title: 'Process Scheduling & Deadlocks Lecture Slides',
    subject: 'Operating Systems',
    type: 'doc',
    size: '4.8 MB',
    updatedAt: '5 days ago',
    bookmarked: false,
    tags: ['OS', 'Deadlocks', 'Scheduling'],
  },
  {
    id: 'res-5',
    title: 'Discrete Mathematics: Graph Theory Problem Set',
    subject: 'Discrete Mathematics',
    type: 'pdf',
    size: '1.2 MB',
    updatedAt: 'Last week',
    bookmarked: true,
    tags: ['Graphs', 'Trees', 'Eulerian Paths'],
  },
];

const DEFAULT_EXAMS: ExamDeadline[] = [
  {
    id: 'exam-dbms',
    title: 'Database Management Systems',
    subtitle: 'Mid-Term Exam • Hall B',
    date: '2026-10-14',
    daysRemaining: 16,
    subjects: ['Database Management Systems'],
    readinessPercentage: 74,
  },
  {
    id: 'exam-dsa',
    title: 'Data Structures & Algorithms',
    subtitle: 'Comprehensive Mid-Term • Auditorium 1',
    date: '2026-10-18',
    daysRemaining: 20,
    subjects: ['Data Structures & Algorithms'],
    readinessPercentage: 68,
  },
  {
    id: 'exam-ai',
    title: 'Artificial Intelligence',
    subtitle: 'Theory & Practical Evaluation',
    date: '2026-10-24',
    daysRemaining: 26,
    subjects: ['Artificial Intelligence'],
    readinessPercentage: 72,
  },
];

const StudyVaultContext = createContext<StudyVaultContextType | undefined>(undefined);

export const StudyVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('studyvault_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const savedUser = localStorage.getItem('studyvault_current_user');
    return savedUser ? 'dashboard' : 'landing';
  });

  const getUserStorageKey = useCallback(
    (key: string) => {
      return currentUser ? `studyvault_user_${currentUser.id}_${key}` : `studyvault_guest_${key}`;
    },
    [currentUser]
  );

  // Initialize data for current user
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_subjects` : 'studyvault_guest_subjects';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_sessions` : 'studyvault_guest_sessions';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_tasks` : 'studyvault_guest_tasks';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [vaultResources, setVaultResources] = useState<VaultResource[]>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_vault_resources` : 'studyvault_guest_vault_resources';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : DEFAULT_VAULT_RESOURCES;
    } catch {
      return DEFAULT_VAULT_RESOURCES;
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>('res-1');

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('studyvault_theme_mode');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('studyvault_theme_mode', next);
      return next;
    });
  };

  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [themeMode]);

  const [notifications, setNotifications] = useState<AdaptiveNotification[]>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_notifications` : 'studyvault_guest_notifications';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_chat` : 'studyvault_guest_chat';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : createDefaultChat(user?.name || 'Student');
    } catch {
      return createDefaultChat('Student');
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_stats` : 'studyvault_guest_stats';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : createDefaultStats(user?.name || 'Student', user?.targetDailyHours || 4);
    } catch {
      return createDefaultStats('Student', 4);
    }
  });

  const [exams, setExams] = useState<ExamDeadline[]>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_exams` : 'studyvault_guest_exams';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : DEFAULT_EXAMS;
    } catch {
      return DEFAULT_EXAMS;
    }
  });

  const [settings, setSettings] = useState<StudySettings>(() => {
    try {
      const savedUser = localStorage.getItem('studyvault_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const key = user ? `studyvault_user_${user.id}_settings` : 'studyvault_guest_settings';
      const saved = localStorage.getItem(key);
      return saved
        ? JSON.parse(saved)
        : { ...DEFAULT_SETTINGS, dailyStudyCapacityHours: user?.targetDailyHours || 4 };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [conversationId] = useState<string>(() => {
    const saved = sessionStorage.getItem('studyvault_conv_id');
    if (saved) return saved;
    const newId = 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem('studyvault_conv_id', newId);
    return newId;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Parsing animation state
  const [isParsingSyllabus, setIsParsingSyllabus] = useState<boolean>(false);
  const [parsingStep, setParsingStep] = useState<number>(0);

  // Save to scoped localStorage
  useEffect(() => {
    localStorage.setItem(getUserStorageKey('subjects'), JSON.stringify(subjects));
  }, [subjects, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('sessions'), JSON.stringify(sessions));
  }, [sessions, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('notifications'), JSON.stringify(notifications));
  }, [notifications, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('chat'), JSON.stringify(chatMessages));
  }, [chatMessages, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('stats'), JSON.stringify(stats));
  }, [stats, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('exams'), JSON.stringify(exams));
  }, [exams, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('settings'), JSON.stringify(settings));
  }, [settings, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('tasks'), JSON.stringify(tasks));
  }, [tasks, getUserStorageKey]);

  useEffect(() => {
    localStorage.setItem(getUserStorageKey('vault_resources'), JSON.stringify(vaultResources));
  }, [vaultResources, getUserStorageKey]);

  // Dynamically update stats when subjects or exams change
  useEffect(() => {
    const totalTopics = subjects.reduce((sum, s) => sum + (s.totalTopics || 0), 0);
    const completedTopics = subjects.reduce((sum, s) => sum + (s.completedTopics || 0), 0);
    const weeklyProgressPercentage =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    let examCountdownDays = 0;
    if (exams.length > 0) {
      const days = exams.map((e) => e.daysRemaining).filter((d) => d > 0);
      if (days.length > 0) {
        examCountdownDays = Math.min(...days);
      }
    }

    setStats((prev) => ({
      ...prev,
      studentName: currentUser?.name || prev.studentName || 'Student',
      totalTopics,
      completedTopics,
      weeklyProgressPercentage,
      examCountdownDays,
      todayTargetMinutes: Math.round((settings.dailyStudyCapacityHours || 4) * 60),
    }));
  }, [subjects, exams, currentUser?.name, settings.dailyStudyCapacityHours]);

  const showToast = (title: string, message: string, type: ToastItem['type'] = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to load user-specific datasets
  const loadUserData = (user: User) => {
    try {
      const subKey = `studyvault_user_${user.id}_subjects`;
      const sessKey = `studyvault_user_${user.id}_sessions`;
      const notifKey = `studyvault_user_${user.id}_notifications`;
      const chatKey = `studyvault_user_${user.id}_chat`;
      const statsKey = `studyvault_user_${user.id}_stats`;
      const examKey = `studyvault_user_${user.id}_exams`;
      const setKey = `studyvault_user_${user.id}_settings`;

      const savedSubs = localStorage.getItem(subKey);
      const savedSess = localStorage.getItem(sessKey);
      const savedNotifs = localStorage.getItem(notifKey);
      const savedChat = localStorage.getItem(chatKey);
      const savedStats = localStorage.getItem(statsKey);
      const savedExams = localStorage.getItem(examKey);
      const savedSettings = localStorage.getItem(setKey);

      setSubjects(savedSubs ? JSON.parse(savedSubs) : []);
      setSessions(savedSess ? JSON.parse(savedSess) : []);
      setNotifications(savedNotifs ? JSON.parse(savedNotifs) : []);
      setChatMessages(savedChat ? JSON.parse(savedChat) : createDefaultChat(user.name));
      setStats(
        savedStats
          ? JSON.parse(savedStats)
          : createDefaultStats(user.name, user.targetDailyHours || 4)
      );
      setExams(savedExams ? JSON.parse(savedExams) : []);
      setSettings(
        savedSettings
          ? JSON.parse(savedSettings)
          : { ...DEFAULT_SETTINGS, dailyStudyCapacityHours: user.targetDailyHours || 4 }
      );
    } catch (err) {
      console.error('[StudyVault] Error loading user data:', err);
    }
  };

  // Auth: Register new user
  const register = async (data: RegisterUserData): Promise<{ success: boolean; message?: string }> => {
    try {
      const rawUsers = localStorage.getItem('studyvault_users');
      const users: User[] = rawUsers ? JSON.parse(rawUsers) : [];

      const normalizedEmail = data.email.trim().toLowerCase();
      const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (existing) {
        return { success: false, message: 'An account with this email already exists. Please sign in.' };
      }

      const newUser: User = {
        id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: data.name.trim(),
        email: normalizedEmail,
        password: data.password || '',
        major: data.major?.trim() || 'General Studies',
        semester: data.semester?.trim() || 'Semester 1',
        targetDailyHours: data.targetDailyHours || 4,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('studyvault_users', JSON.stringify(users));
      localStorage.setItem('studyvault_current_user', JSON.stringify(newUser));

      setCurrentUser(newUser);

      // Initialize clean, empty state for the new user (no mock data!)
      setSubjects([]);
      setSessions([]);
      setExams([]);
      setNotifications([]);
      setChatMessages(createDefaultChat(newUser.name));
      setStats(createDefaultStats(newUser.name, newUser.targetDailyHours));
      setSettings({ ...DEFAULT_SETTINGS, dailyStudyCapacityHours: newUser.targetDailyHours });

      showToast('Welcome to StudyVault!', `Account created for ${newUser.name}.`, 'success');
      setActivePage('dashboard');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to create account.' };
    }
  };

  // Auth: Login existing user
  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const rawUsers = localStorage.getItem('studyvault_users');
      const users: User[] = rawUsers ? JSON.parse(rawUsers) : [];

      const normalizedEmail = email.trim().toLowerCase();
      const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!found) {
        return { success: false, message: 'No account found with this email. Please create a new account.' };
      }

      if (found.password && password && found.password !== password) {
        return { success: false, message: 'Incorrect password. Please verify your credentials.' };
      }

      localStorage.setItem('studyvault_current_user', JSON.stringify(found));
      setCurrentUser(found);
      loadUserData(found);

      showToast('Signed In', `Welcome back, ${found.name}!`, 'success');
      setActivePage('dashboard');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Login failed.' };
    }
  };

  // Auth: Logout
  const logout = () => {
    localStorage.removeItem('studyvault_current_user');
    setCurrentUser(null);
    setSubjects([]);
    setSessions([]);
    setExams([]);
    setNotifications([]);
    setChatMessages(createDefaultChat('Student'));
    setStats(createDefaultStats('Student', 4));
    showToast('Signed Out', 'You have been safely signed out.', 'info');
    setActivePage('login');
  };

  // Manual CRUD helpers
  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setSubjects((prev) => [...prev, newSubject]);
    showToast('Subject Added', `Added ${newSubject.name} (${newSubject.code}) to your vault.`, 'success');
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setSessions((prev) => prev.filter((s) => s.subjectId !== subjectId));
    showToast('Subject Removed', 'Subject and connected sessions removed.', 'info');
  };

  const addExam = (examData: Omit<ExamDeadline, 'id'>) => {
    const newExam: ExamDeadline = {
      ...examData,
      id: 'exam-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setExams((prev) => [...prev, newExam]);
    showToast('Exam Deadline Added', `Added ${newExam.title} to your protection runway.`, 'adaptive');
  };

  const deleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
    showToast('Exam Removed', 'Exam milestone removed.', 'info');
  };

  const addSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setSessions((prev) => [...prev, newSession]);
    showToast('Session Added', `Scheduled ${newSession.topicName} on ${newSession.dayOfWeek}.`, 'success');
  };

  const clearUserData = () => {
    if (currentUser) {
      localStorage.removeItem(`studyvault_user_${currentUser.id}_subjects`);
      localStorage.removeItem(`studyvault_user_${currentUser.id}_sessions`);
      localStorage.removeItem(`studyvault_user_${currentUser.id}_notifications`);
      localStorage.removeItem(`studyvault_user_${currentUser.id}_chat`);
      localStorage.removeItem(`studyvault_user_${currentUser.id}_stats`);
      localStorage.removeItem(`studyvault_user_${currentUser.id}_exams`);
      localStorage.removeItem(`studyvault_user_${currentUser.id}_settings`);
    } else {
      localStorage.removeItem('studyvault_guest_subjects');
      localStorage.removeItem('studyvault_guest_sessions');
      localStorage.removeItem('studyvault_guest_notifications');
      localStorage.removeItem('studyvault_guest_chat');
      localStorage.removeItem('studyvault_guest_stats');
      localStorage.removeItem('studyvault_guest_exams');
      localStorage.removeItem('studyvault_guest_settings');
    }

    setSubjects([]);
    setSessions([]);
    setExams([]);
    setNotifications([]);
    setChatMessages(createDefaultChat(currentUser?.name || 'Student'));
    setStats(createDefaultStats(currentUser?.name || 'Student', currentUser?.targetDailyHours || 4));
    setSettings(DEFAULT_SETTINGS);

    showToast('Data Cleared', 'All course syllabuses, sessions, and milestones have been cleared.', 'info');
  };

  const toggleSessionComplete = (sessionId: string) => {
    let wasCompleted = false;
    let targetSubjectId = '';

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextStatus = s.status === 'completed' ? 'pending' : 'completed';
          wasCompleted = nextStatus === 'completed';
          targetSubjectId = s.subjectId;
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );

    if (wasCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3b82f6', '#06b6d4', '#60a5fa', '#93c5fd'],
          disableForReducedMotion: true,
        });
      } catch {
        // Confetti fallback
      }

      showToast('Session Completed!', 'Great job maintaining your focus momentum.', 'success');

      setStats((prev) => ({
        ...prev,
        completedTopics: Math.min(prev.totalTopics, prev.completedTopics + 1),
        todayStudyMinutes: prev.todayStudyMinutes + 45,
        weeklyProgressPercentage:
          prev.totalTopics > 0
            ? Math.min(100, Math.round(((prev.completedTopics + 1) / prev.totalTopics) * 100))
            : 100,
      }));

      if (targetSubjectId) {
        setSubjects((prev) =>
          prev.map((sub) => {
            if (sub.id === targetSubjectId) {
              const newCompleted = Math.min(sub.totalTopics, sub.completedTopics + 1);
              return {
                ...sub,
                completedTopics: newCompleted,
                progressPercentage: sub.totalTopics > 0 ? Math.round((newCompleted / sub.totalTopics) * 100) : 100,
              };
            }
            return sub;
          })
        );
      }
    } else {
      showToast('Session Reopened', 'Session marked as pending.', 'info');
      setStats((prev) => ({
        ...prev,
        completedTopics: Math.max(0, prev.completedTopics - 1),
        todayStudyMinutes: Math.max(0, prev.todayStudyMinutes - 45),
      }));
    }
  };

  const rescheduleSession = (sessionId: string, newDay: DayOfWeek, newTime: string, reason?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            dayOfWeek: newDay,
            startTime: newTime,
            isAdaptive: true,
            adaptiveReason: reason || 'Manually rescheduled with adaptive protection',
            status: 'rescheduled',
          };
        }
        return s;
      })
    );

    showToast('Schedule Adapted', `Session moved to ${newDay} at ${newTime}.`, 'adaptive');
  };

  const splitSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    const halfDuration = Math.round(target.durationMinutes / 2);
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);

    const part1: StudySession = {
      ...target,
      id: target.id + '-part1',
      topicName: `${target.topicName} (Part 1)`,
      durationMinutes: halfDuration,
      isAdaptive: true,
      adaptiveReason: 'Split session into two digestible blocks',
    };

    const part2: StudySession = {
      ...target,
      id: target.id + '-part2',
      topicName: `${target.topicName} (Part 2)`,
      startTime: '16:00',
      endTime: '16:30',
      durationMinutes: halfDuration,
      dayOfWeek: target.dayOfWeek === 'FRI' ? 'SAT' : target.dayOfWeek,
      isAdaptive: true,
      adaptiveReason: 'Split session part 2 shifted to next available slot',
    };

    setSessions([...updatedSessions, part1, part2]);
    showToast('Session Split', `Split into 2x ${halfDuration}m adaptive blocks.`, 'adaptive');
  };

  const simulateMissedSession = () => {
    const subjectName = subjects[0]?.name || 'Study Block';
    showToast(
      'Autonomous Rebalancing',
      `Redistributed missed session across today (30m) & tomorrow (30m) to preserve exam deadline.`,
      'adaptive'
    );

    const newNotif: AdaptiveNotification = {
      id: 'notif-' + Date.now(),
      title: 'Schedule Automatically Adapted',
      message: `Missed session for ${subjectName} was rebalanced into 2 high-yield micro-sessions. Exam buffer maintained.`,
      time: 'Just now',
      type: 'reschedule',
      read: false,
      details: {
        original: `${subjectName} — 1h (Yesterday)`,
        updated: `Today 17:30 (30m) + Tomorrow 13:30 (30m)`,
      },
    };

    setNotifications((prev) => [newNotif, ...prev]);

    if (sessions.length > 0) {
      setSessions((prev) =>
        prev.map((s, idx) => {
          if (idx === 0) {
            return {
              ...s,
              isAdaptive: true,
              adaptiveReason: 'Autonomous rebalance: split into 2x 30m slots',
              durationMinutes: 30,
            };
          }
          return s;
        })
      );
    }
  };

  const sendChatMessage = async (text: string, files?: File[]) => {
    const attachments: ChatAttachment[] =
      files?.map((f) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        size: f.size,
        type: f.type.startsWith('image/')
          ? ('image' as const)
          : f.type === 'application/pdf'
          ? ('pdf' as const)
          : ('text' as const),
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
      })) || [];

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      const response = await aiService.askAssistant(text, [...chatMessages, userMsg], {
        files,
        conversationId,
      });

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: response.actionCard,
        extractionPreview: response.extractionData,
        toolsUsed: response.toolsUsed,
      };

      setChatMessages((prev) => [...prev, aiMsg]);

      if (response.actionCard) {
        showToast('Schedule Adapted', 'Proposed schedule shifts ready for review.', 'adaptive');
      } else if (response.extractionData) {
        showToast('Document Analyzed', 'Extracted academic structure ready to confirm.', 'success');
      }
    } catch (err: any) {
      console.warn('[AIChat] AI service call failed:', err);
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: `I encountered an issue contacting the AI strategist service (${err?.message || 'Connection error'}). Ensure the AI server is running on port 5001 with your API key configured.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      showToast('AI Service Notice', 'Could not reach server on port 5001.', 'warning');
    } finally {
      setIsAiThinking(false);
    }
  };

  const confirmExtraction = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const extraction =
            msg.extractionPreview ||
            (msg.actionCard?.type === 'extraction-preview' ? msg.actionCard.extraction : null);

          if (!extraction) return msg;

          if (extraction.syllabus && extraction.syllabus.subjects.length > 0) {
            const domainSubjects = aiService.mapExtractedSubjectsToDomain(
              extraction.syllabus.subjects as any
            );
            setSubjects((prevSubs) => [...prevSubs, ...domainSubjects]);
            showToast(
              'Curriculum Ingested',
              `Added ${domainSubjects.length} subject(s) with modules to your StudyVault.`,
              'success'
            );
          }

          if (extraction.examTimetable && extraction.examTimetable.exams.length > 0) {
            const newExams: ExamDeadline[] = extraction.examTimetable.exams.map((ex, idx) => ({
              id: `exam-ai-${Date.now()}-${idx}`,
              title: ex.subject,
              subtitle: ex.code || 'Final Examination',
              date: ex.date,
              daysRemaining: Math.max(
                1,
                Math.ceil((new Date(ex.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) || 14
              ),
              subjects: [ex.subject],
              readinessPercentage: 0,
            }));
            setExams((prevExams) => [...prevExams, ...newExams]);
            showToast(
              'Exam Deadlines Synced',
              `Added ${newExams.length} exam milestone(s) to your preparation countdown.`,
              'adaptive'
            );
          }

          if (extraction.timetable && extraction.timetable.weeklySchedule.length > 0) {
            const newTimetableSessions: StudySession[] = [];
            extraction.timetable.weeklySchedule.forEach((daySchedule) => {
              const dayStr = (daySchedule.day.toUpperCase().slice(0, 3) as DayOfWeek) || 'MON';
              daySchedule.slots.forEach((slot, slotIdx) => {
                const times = slot.timeSlot.split('-');
                const startTime = times[0]?.trim() || '10:00';
                const endTime = times[1]?.trim() || '11:00';
                newTimetableSessions.push({
                  id: `sess-tt-${Date.now()}-${slotIdx}-${Math.random().toString(36).substring(2, 6)}`,
                  subjectId: `sub-tt-${slot.subject}`,
                  subjectName: slot.subject,
                  subjectColor: '#06b6d4',
                  topicId: `top-tt-${slotIdx}`,
                  topicName: slot.room ? `${slot.subject} (${slot.room})` : slot.subject,
                  startTime,
                  endTime,
                  durationMinutes: 60,
                  date: new Date().toISOString().split('T')[0],
                  dayOfWeek: dayStr,
                  status: 'pending',
                  isAdaptive: true,
                  adaptiveReason: 'Grounded from uploaded class timetable',
                });
              });
            });
            if (newTimetableSessions.length > 0) {
              setSessions((prev) => [...prev, ...newTimetableSessions]);
            }
            showToast(
              'Timetable Grounded',
              `Weekly schedule synchronized with ${newTimetableSessions.length} lecture and study slots.`,
              'adaptive'
            );
          }

          if (extraction.studySessions && extraction.studySessions.length > 0) {
            const newSessions: StudySession[] = extraction.studySessions.map((sess, idx) => ({
              id: sess.id || `sess-ai-extract-${Date.now()}-${idx}`,
              subjectId: 'sub-extract',
              subjectName: sess.subjectName,
              subjectColor: '#3b82f6',
              topicId: `top-extract-${idx}`,
              topicName: sess.topicName,
              startTime: sess.startTime,
              endTime: sess.endTime,
              durationMinutes: sess.durationMinutes,
              date: new Date().toISOString().split('T')[0],
              dayOfWeek: sess.dayOfWeek,
              status: 'pending',
              isAdaptive: true,
              adaptiveReason: sess.adaptiveReason || 'Extracted from course curriculum',
            }));
            setSessions((prev) => [...prev, ...newSessions]);
            showToast(
              'Study Sessions Added',
              `Scheduled ${newSessions.length} syllabus sessions in your calendar.`,
              'success'
            );
          }

          const updatedCard =
            msg.actionCard?.type === 'extraction-preview'
              ? { ...msg.actionCard, applied: true }
              : msg.actionCard;

          return {
            ...msg,
            extractionPreview: msg.extractionPreview
              ? { ...msg.extractionPreview, confirmed: true }
              : undefined,
            actionCard: updatedCard,
          };
        }
        return msg;
      })
    );
  };

  const applyChatActionCard = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId && m.actionCard) {
          if (m.actionCard.type === 'schedule-proposal') {
            const nextApplied = !m.actionCard.applied;
            if (nextApplied && m.actionCard.sessions.length > 0) {
              const newSessions: StudySession[] = m.actionCard.sessions.map((sess, idx) => ({
                id: `sess-prop-${Date.now()}-${idx}`,
                subjectId: 'sub-prop',
                subjectName: sess.subject,
                subjectColor: '#06b6d4',
                topicId: `top-prop-${idx}`,
                topicName: sess.topic,
                startTime: sess.time.split(' ')[0] || '10:00',
                endTime: '11:00',
                durationMinutes: sess.duration || 60,
                date: new Date().toISOString().split('T')[0],
                dayOfWeek: (sess.day.toUpperCase().slice(0, 3) as DayOfWeek) || 'MON',
                status: 'pending',
                isAdaptive: true,
                adaptiveReason: 'Generated by StudyVault AI Onboarding Engine',
              }));
              setSessions((prev) => [...prev, ...newSessions]);
              showToast(
                'Schedule Locked In',
                `Scheduled ${newSessions.length} sessions for your academic plan.`,
                'success'
              );
            }
            return {
              ...m,
              actionCard: {
                ...m.actionCard,
                applied: nextApplied,
              },
            };
          }

          if (m.actionCard.type === 'extraction-preview') {
            confirmExtraction(messageId);
            return m;
          }

          if (m.actionCard.type === 'schedule-update') {
            const nextApplied = !m.actionCard.applied;
            showToast(
              nextApplied ? 'Changes Confirmed' : 'Changes Reverted',
              nextApplied ? 'Your adaptive schedule has been locked in.' : 'Restored previous timetable.',
              'info'
            );

            if (nextApplied && m.actionCard.shifts.length > 0) {
              setSessions((prevSessions) =>
                prevSessions.map((s) => {
                  const matchingShift = (m.actionCard as any).shifts.find(
                    (shift: any) =>
                      shift.sessionId === s.id ||
                      s.subjectName.toLowerCase().includes(shift.subject.toLowerCase())
                  );
                  if (matchingShift) {
                    const toParts = matchingShift.to.split(' ');
                    const day =
                      toParts[0] === 'Sat' ? 'SAT' : toParts[0] === 'Sun' ? 'SUN' : s.dayOfWeek;
                    const time = toParts[1] || s.startTime;
                    return {
                      ...s,
                      dayOfWeek: day as DayOfWeek,
                      startTime: time,
                      isAdaptive: true,
                      adaptiveReason: 'Applied via AI Action Proposal',
                      status: 'rescheduled' as const,
                    };
                  }
                  return s;
                })
              );
            }

            return {
              ...m,
              actionCard: {
                ...m.actionCard,
                applied: nextApplied,
              },
            };
          }
        }
        return m;
      })
    );
  };

  const updateSettings = (newSettings: Partial<StudySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Preferences Saved', 'Your study configuration has been updated.', 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All alerts cleared.', 'info');
  };

  const runSyllabusParser = async (fileOrText?: File | File[] | string) => {
    setIsParsingSyllabus(true);
    setParsingStep(1);

    const stepInterval = setInterval(() => {
      setParsingStep((curr) => (curr < 4 ? curr + 1 : curr));
    }, 1000);

    try {
      if (fileOrText) {
        const result = await aiService.analyzeSyllabus(fileOrText);
        clearInterval(stepInterval);
        setParsingStep(5);

        if (result.status === 'unreadable') {
          showToast(
            'Unreadable Document',
            result.rejectionReason || 'The document does not contain discernible syllabus topics.',
            'warning'
          );
          setIsParsingSyllabus(false);
          return;
        }

        if (result.subjects && result.subjects.length > 0) {
          const domainSubjects = aiService.mapExtractedSubjectsToDomain(result.subjects);
          setSubjects((prev) => [...prev, ...domainSubjects]);

          // Synthesize / extract study timetable sessions
          let generatedSessions: StudySession[] = [];
          if (result.studySessions && result.studySessions.length > 0) {
            generatedSessions = result.studySessions.map((sess, idx) => {
              const matchedSub = domainSubjects.find(
                (s) => s.name.toLowerCase() === sess.subjectName.toLowerCase()
              ) || domainSubjects[0];
              return {
                id: sess.id || `sess-ai-${Date.now()}-${idx}`,
                subjectId: matchedSub?.id || 'sub-ai',
                subjectName: sess.subjectName,
                subjectColor: matchedSub?.accentColor || '#3b82f6',
                topicId: `top-ai-${idx}`,
                topicName: sess.topicName,
                startTime: sess.startTime,
                endTime: sess.endTime,
                durationMinutes: sess.durationMinutes,
                date: new Date().toISOString().split('T')[0],
                dayOfWeek: sess.dayOfWeek,
                status: 'pending',
                isAdaptive: true,
                adaptiveReason: sess.adaptiveReason || 'Scheduled based on syllabus module priority',
              };
            });
          } else {
            // Client-side synthesis fallback
            generatedSessions = aiService.generateScheduleFromSubjects(domainSubjects, {
              dailyHours: settings.dailyStudyCapacityHours,
              preferredTimeOfDay: settings.preferredTimeOfDay as any,
              excludeWeekends: !settings.weekendAvailability,
            });
          }

          if (generatedSessions.length > 0) {
            setSessions((prev) => [...prev, ...generatedSessions]);
          }

          // Register any extracted exam dates from the syllabus
          const newExams: ExamDeadline[] = [];
          domainSubjects.forEach((sub, idx) => {
            if (sub.examDate) {
              newExams.push({
                id: `exam-syl-${Date.now()}-${idx}`,
                title: `${sub.name} Final Exam`,
                subtitle: sub.code || 'Course Assessment',
                date: sub.examDate,
                daysRemaining: Math.max(
                  1,
                  Math.ceil((new Date(sub.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) || 14
                ),
                subjects: [sub.name],
                readinessPercentage: 0,
              });
            }
          });
          if (newExams.length > 0) {
            setExams((prev) => [...prev, ...newExams]);
          }

          showToast(
            'Syllabus & Timetable Generated!',
            `Extracted ${domainSubjects.length} course(s) and scheduled ${generatedSessions.length} adaptive study sessions across your week.`,
            'success'
          );
          setActivePage('schedule');
        } else {
          showToast('Analysis Complete', 'No subjects were extracted.', 'info');
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        clearInterval(stepInterval);
        setParsingStep(5);
        showToast('Notice', 'No syllabus file provided to analyze.', 'info');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('[SyllabusParser] Analysis failed:', err);
      showToast('Parser Notice', `Could not complete AI extraction: ${err?.message || 'Server error'}.`, 'warning');
      setActivePage('syllabus');
    } finally {
      setIsParsingSyllabus(false);
    }
  };

  const generateTimetableFromSyllabus = (options?: {
    preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
    dailyHours?: number;
    excludeWeekends?: boolean;
  }) => {
    if (subjects.length === 0) {
      showToast('No Courses Found', 'Please upload or add at least one course syllabus first.', 'warning');
      return;
    }

    const newSessions = aiService.generateScheduleFromSubjects(subjects, {
      dailyHours: options?.dailyHours ?? settings.dailyStudyCapacityHours,
      preferredTimeOfDay: (options?.preferredTimeOfDay ?? settings.preferredTimeOfDay) as any,
      excludeWeekends: options?.excludeWeekends ?? !settings.weekendAvailability,
    });

    if (newSessions.length === 0) {
      showToast('Notice', 'No topics found in active syllabi to schedule.', 'info');
      return;
    }

    setSessions((prev) => {
      const completed = prev.filter((s) => s.status === 'completed');
      return [...completed, ...newSessions];
    });

    showToast(
      'Timetable Synchronized!',
      `Generated ${newSessions.length} adaptive study sessions tailored to your syllabus modules.`,
      'adaptive'
    );
    setActivePage('schedule');
  };

  const addTask = (task: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...task,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Task Created', `"${newTask.title}" added to your tasks.`, 'success');
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const completed = !t.completed;
          if (completed) {
            confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
          }
          return { ...t, completed };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task Removed', 'Task deleted.', 'info');
  };

  const addResource = (resource: Omit<VaultResource, 'id'>) => {
    const newRes: VaultResource = {
      ...resource,
      id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setVaultResources((prev) => [newRes, ...prev]);
    showToast('Resource Added', `Saved "${newRes.title}" to Vault.`, 'success');
  };

  const updateResource = (id: string, updates: Partial<VaultResource>) => {
    setVaultResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: 'Just now' } : r))
    );
    showToast('Vault Updated', 'Document changes saved.', 'success');
  };

  const deleteResource = (id: string) => {
    setVaultResources((prev) => prev.filter((r) => r.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
    showToast('Resource Deleted', 'Removed from Vault.', 'info');
  };

  return (
    <StudyVaultContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        register,
        logout,
        activePage,
        setActivePage,
        subjects,
        sessions,
        tasks,
        vaultResources,
        activeNoteId,
        setActiveNoteId,
        notifications,
        chatMessages,
        stats,
        exams,
        settings,
        themeMode,
        toggleTheme,
        toasts,
        isSearchOpen,
        setIsSearchOpen,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        selectedSession,
        setSelectedSession,
        isAiThinking,
        conversationId,
        toggleSessionComplete,
        rescheduleSession,
        splitSession,
        simulateMissedSession,
        sendChatMessage,
        applyChatActionCard,
        confirmExtraction,
        updateSettings,
        clearUserData,
        resetDemoData: clearUserData,
        addSubject,
        deleteSubject,
        addExam,
        deleteExam,
        addSession,
        addTask,
        toggleTask,
        deleteTask,
        addResource,
        updateResource,
        deleteResource,
        showToast,
        removeToast,
        markNotificationRead,
        clearAllNotifications,
        isParsingSyllabus,
        parsingStep,
        runSyllabusParser,
        generateTimetableFromSyllabus,
      }}
    >
      {children}
    </StudyVaultContext.Provider>
  );
};

export const useStudyVault = () => {
  const context = useContext(StudyVaultContext);
  if (!context) {
    throw new Error('useStudyVault must be used within a StudyVaultProvider');
  }
  return context;
};
