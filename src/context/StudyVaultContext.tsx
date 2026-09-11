import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types/studyvault';
import {
  INITIAL_STATS,
  INITIAL_EXAMS,
  INITIAL_SUBJECTS,
  INITIAL_SESSIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SETTINGS,
} from '../mock/demoData';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'adaptive' | 'warning';
}

interface StudyVaultContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  subjects: Subject[];
  sessions: StudySession[];
  notifications: AdaptiveNotification[];
  chatMessages: ChatMessage[];
  stats: UserStats;
  exams: ExamDeadline[];
  settings: StudySettings;
  toasts: ToastItem[];
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  selectedSession: StudySession | null;
  setSelectedSession: (session: StudySession | null) => void;
  
  // Actions
  toggleSessionComplete: (sessionId: string) => void;
  rescheduleSession: (sessionId: string, newDay: DayOfWeek, newTime: string, reason?: string) => void;
  splitSession: (sessionId: string) => void;
  simulateMissedSession: () => void;
  sendChatMessage: (text: string) => void;
  applyChatActionCard: (messageId: string) => void;
  updateSettings: (newSettings: Partial<StudySettings>) => void;
  resetDemoData: () => void;
  showToast: (title: string, message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  isParsingSyllabus: boolean;
  parsingStep: number;
  runSyllabusParser: () => Promise<void>;
}

const StudyVaultContext = createContext<StudyVaultContextType | undefined>(undefined);

export const StudyVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('studyvault_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('studyvault_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [notifications, setNotifications] = useState<AdaptiveNotification[]>(() => {
    const saved = localStorage.getItem('studyvault_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('studyvault_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('studyvault_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [exams] = useState<ExamDeadline[]>(INITIAL_EXAMS);
  
  const [settings, setSettings] = useState<StudySettings>(() => {
    const saved = localStorage.getItem('studyvault_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  // Parsing animation state
  const [isParsingSyllabus, setIsParsingSyllabus] = useState<boolean>(false);
  const [parsingStep, setParsingStep] = useState<number>(0);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('studyvault_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('studyvault_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('studyvault_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('studyvault_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('studyvault_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('studyvault_settings', JSON.stringify(settings));
  }, [settings]);

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

      // Update stats and subject coverage
      setStats((prev) => ({
        ...prev,
        completedTopics: Math.min(prev.totalTopics, prev.completedTopics + 1),
        todayStudyMinutes: prev.todayStudyMinutes + 45,
        weeklyProgressPercentage: Math.min(100, prev.weeklyProgressPercentage + 2),
      }));

      if (targetSubjectId) {
        setSubjects((prev) =>
          prev.map((sub) => {
            if (sub.id === targetSubjectId) {
              const newCompleted = Math.min(sub.totalTopics, sub.completedTopics + 1);
              return {
                ...sub,
                completedTopics: newCompleted,
                progressPercentage: Math.round((newCompleted / sub.totalTopics) * 100),
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
    // Find or simulate missed session
    const missedTitle = 'Database Systems (Normalization)';
    showToast(
      'Autonomous Rebalancing',
      `Redistributed missed session across today (30m) & tomorrow (30m) to preserve exam deadline.`,
      'adaptive'
    );

    const newNotif: AdaptiveNotification = {
      id: 'notif-' + Date.now(),
      title: 'Schedule Automatically Adapted',
      message: `Missed session for ${missedTitle} was rebalanced into 2 high-yield micro-sessions. Exam buffer maintained.`,
      time: 'Just now',
      type: 'reschedule',
      read: false,
      details: {
        original: `${missedTitle} — 1h (Yesterday)`,
        updated: `Today 17:30 (30m) + Tomorrow 13:30 (30m)`,
      },
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Update session state
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === 'sess-today-2') {
          return {
            ...s,
            isAdaptive: true,
            adaptiveReason: 'Autonomous rebalance: split into 2x 30m slots',
            startTime: '17:30',
            endTime: '18:00',
            durationMinutes: 30,
          };
        }
        return s;
      })
    );
  };

  const sendChatMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Simulate smart AI response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = "I've analyzed your current study schedule, pace, and upcoming exam deadlines.";
      let actionCard = undefined;

      if (lower.includes('tired') || lower.includes('push') || lower.includes('postpone') || lower.includes('delay')) {
        replyText = "No problem! Rest is critical for long-term memory encoding. I've redistributed today's remaining sessions across your Saturday and Sunday buffer slots without compromising your End Semester exam deadline.";
        actionCard = {
          type: 'schedule-update' as const,
          title: 'Adaptive Redistribution — Exam Deadline Safe',
          originalSummary: '2 pending sessions postponed from today',
          updatedSummary: 'Moved to Saturday (14:00) & Sunday (10:30)',
          shifts: [
            { subject: 'Database Systems (Normalization)', from: 'Today 11:00', to: 'Sat 14:00', duration: '45m' },
            { subject: 'Computer Networks (TCP Handshake)', from: 'Today 16:30', to: 'Sun 10:30', duration: '45m' },
          ],
          deadlineProtected: true,
          applied: true,
        };

        // Also update the session list
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === 'sess-today-2') {
              return { ...s, dayOfWeek: 'SAT', startTime: '14:00', endTime: '14:45', isAdaptive: true, adaptiveReason: 'Pushed via AI Assistant' };
            }
            if (s.id === 'sess-today-3') {
              return { ...s, dayOfWeek: 'SUN', startTime: '10:30', endTime: '11:15', isAdaptive: true, adaptiveReason: 'Pushed via AI Assistant' };
            }
            return s;
          })
        );
        showToast('Schedule Adapted', 'Postponed sessions safely redistributed.', 'adaptive');
      } else if (lower.includes('plan tomorrow') || lower.includes('tomorrow')) {
        replyText = "Here is your recommended itinerary for tomorrow (Saturday). You have 2 focus sessions scheduled: Data Structures Graph representations (75 min) and Database Normalization follow-up (30 min). Total planned time: 1h 45m.";
      } else if (lower.includes('progress') || lower.includes('how am i doing') || lower.includes('status')) {
        replyText = "You're at 68% total syllabus completion across all 4 subjects. Data Structures is your strongest subject (82%), while Operating Systems needs attention (48%). At your current velocity of 1.4 topics/day, you will complete the syllabus 3 days before your first exam!";
      } else if (lower.includes('what should i study') || lower.includes('recommend') || lower.includes('next')) {
        replyText = "I recommend focusing on 'Operating Systems: Virtual Memory & Page Replacement'. It has a high exam yield (15% weighting) and you currently have a 5-day gap since the last OS revision.";
      } else if (lower.includes('exam') || lower.includes('deadline')) {
        replyText = "Your earliest deadline is the Data Structures Lab Exam in 6 days (Sep 17), followed by Database Normalization Quiz in 11 days (Sep 22), and the Comprehensive End Semester Exam in 18 days (Sep 29). All 3 deadlines are currently in 'Protected' status.";
      } else {
        replyText = `Understood. Studyvault's scheduling engine will adjust your daily pace to accommodate "${text}". Let me know if you want me to re-weight your subjects or allocate extra deep-work blocks!`;
      }

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    }, 850);
  };

  const applyChatActionCard = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId && m.actionCard) {
          const nextApplied = !m.actionCard.applied;
          showToast(
            nextApplied ? 'Changes Confirmed' : 'Changes Reverted',
            nextApplied ? 'Your adaptive schedule has been locked in.' : 'Restored previous timetable.',
            'info'
          );
          return {
            ...m,
            actionCard: {
              ...m.actionCard,
              applied: nextApplied,
            },
          };
        }
        return m;
      })
    );
  };

  const updateSettings = (newSettings: Partial<StudySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Preferences Saved', 'Your study configuration has been updated.', 'success');
  };

  const resetDemoData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setSessions(INITIAL_SESSIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setStats(INITIAL_STATS);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
    showToast('Demo Reset', 'Default student profile and timetable restored.', 'info');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All alerts cleared.', 'info');
  };

  const runSyllabusParser = async () => {
    setIsParsingSyllabus(true);
    setParsingStep(1);

    const steps = [
      { step: 1, delay: 900 },  // "Reading syllabus..."
      { step: 2, delay: 1000 }, // "Identifying subjects..."
      { step: 3, delay: 1100 }, // "Breaking modules into topics..."
      { step: 4, delay: 1000 }, // "Estimating study time..."
      { step: 5, delay: 900 },  // "Building your schedule..."
    ];

    for (const item of steps) {
      await new Promise((resolve) => setTimeout(resolve, item.delay));
      setParsingStep(item.step + 1);
    }

    setIsParsingSyllabus(false);
    showToast('Syllabus Ingested!', '4 subjects & 36 topics extracted into an adaptive schedule.', 'success');
    setActivePage('syllabus');
  };

  return (
    <StudyVaultContext.Provider
      value={{
        activePage,
        setActivePage,
        subjects,
        sessions,
        notifications,
        chatMessages,
        stats,
        exams,
        settings,
        toasts,
        isSearchOpen,
        setIsSearchOpen,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        selectedSession,
        setSelectedSession,
        toggleSessionComplete,
        rescheduleSession,
        splitSession,
        simulateMissedSession,
        sendChatMessage,
        applyChatActionCard,
        updateSettings,
        resetDemoData,
        showToast,
        removeToast,
        markNotificationRead,
        clearAllNotifications,
        isParsingSyllabus,
        parsingStep,
        runSyllabusParser,
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
