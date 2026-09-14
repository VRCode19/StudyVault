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
  ChatAttachment,
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

import { aiService } from '../services/aiService';

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
  resetDemoData: () => void;
  showToast: (title: string, message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  isParsingSyllabus: boolean;
  parsingStep: number;
  runSyllabusParser: (fileOrText?: File | File[] | string) => Promise<void>;
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

  const [exams, setExams] = useState<ExamDeadline[]>(() => {
    const saved = localStorage.getItem('studyvault_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });
  
  const [settings, setSettings] = useState<StudySettings>(() => {
    const saved = localStorage.getItem('studyvault_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
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
      console.warn('[AIChat] AI service call failed, providing informative fallback:', err);
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: `I encountered an issue contacting the AI strategist service (${err?.message || 'Connection error'}). Ensure the AI server is running on port 5001 with your OPENROUTER_API_KEY configured.`,
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

          // If extraction contains syllabus data with subjects
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

          // If extraction contains exam timetable data
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
              readinessPercentage: 45,
            }));
            setExams((prevExams) => [...prevExams, ...newExams]);
            showToast(
              'Exam Deadlines Synced',
              `Added ${newExams.length} exam milestone(s) to your preparation countdown.`,
              'adaptive'
            );
          }

          // If extraction contains timetable data
          if (extraction.timetable && extraction.timetable.weeklySchedule.length > 0) {
            showToast(
              'Timetable Grounded',
              'Weekly classes locked in. AI has adapted study sessions around your lecture hours.',
              'adaptive'
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
          // Handle schedule-proposal card
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

          // Handle extraction-preview card delegation
          if (m.actionCard.type === 'extraction-preview') {
            confirmExtraction(messageId);
            return m;
          }

          // Handle standard schedule-update card
          if (m.actionCard.type === 'schedule-update') {
            const nextApplied = !m.actionCard.applied;
            showToast(
              nextApplied ? 'Changes Confirmed' : 'Changes Reverted',
              nextApplied
                ? 'Your adaptive schedule has been locked in.'
                : 'Restored previous timetable.',
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

  const resetDemoData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setSessions(INITIAL_SESSIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setStats(INITIAL_STATS);
    setSettings(INITIAL_SETTINGS);
    setExams(INITIAL_EXAMS);
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
          setSubjects(domainSubjects);
          showToast(
            'Syllabus Ingested!',
            `${result.subjects.length} course(s) extracted into your study vault.`,
            'success'
          );
          setActivePage('syllabus');
        } else {
          showToast('Analysis Complete', 'No subjects were extracted.', 'info');
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3500));
        clearInterval(stepInterval);
        setParsingStep(5);
        showToast('Syllabus Ingested!', 'Sample curriculum loaded into your study vault.', 'success');
        setActivePage('syllabus');
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
