import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle2,
  Circle,
  Trash2,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { TaskItem } from '../types/studyvault';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassModal } from '../components/common/GlassModal';
import { GlassInput } from '../components/common/GlassInput';

type TaskView = 'today' | 'upcoming' | 'completed';

export const TasksPage: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, subjects } = useStudyVault();

  const [activeView, setActiveView] = useState<TaskView>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.name || 'Database Management Systems');
  const [dueDate, setDueDate] = useState('Tomorrow, 11:59 PM');
  const [priority, setPriority] = useState<TaskItem['priority']>('high');
  const [tagsInput, setTagsInput] = useState('Assignment, Due');
  const [notes, setNotes] = useState('');

  // Filtering based on active view
  const filteredTasks = tasks.filter((t) => {
    if (activeView === 'completed') return t.completed;
    if (t.completed) return false;

    if (activeView === 'today') {
      return (
        t.dueDate.toLowerCase().includes('today') ||
        t.dueDate.toLowerCase().includes('tomorrow') ||
        t.priority === 'urgent'
      );
    }
    // upcoming
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const urgentCount = tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedSubject = subjects.find((s) => s.name === subject);

    addTask({
      title: title.trim(),
      subject,
      subjectColor: matchedSubject?.accentColor || '#8b5cf6',
      dueDate,
      priority,
      completed: false,
      tags: tagsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const getPriorityBadgeVariant = (p: TaskItem['priority']) => {
    switch (p) {
      case 'urgent':
        return 'rose' as const;
      case 'high':
        return 'orange' as const;
      case 'medium':
        return 'blue' as const;
      case 'low':
        return 'teal' as const;
    }
  };

  return (
    <div className="space-y-7 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tasks & Deliverables
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-400/30">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track assignments, lab exercises, and deadline milestones.
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create Task
        </GlassButton>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard level={2} rounded="md" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Action Items</span>
            <div className="text-2xl font-black text-white">{pendingCount} Active</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard level={2} rounded="md" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">High / Urgent Priority</span>
            <div className="text-2xl font-black text-orange-400">{urgentCount} Tasks</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard level={2} rounded="md" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Completed This Week</span>
            <div className="text-2xl font-black text-emerald-400">{completedCount} Completed</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </GlassCard>
      </div>

      {/* View Switcher Pill Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-chip liquid-panel max-w-md border border-white/15">
        <button
          onClick={() => setActiveView('today')}
          className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeView === 'today'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-glow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveView('upcoming')}
          className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeView === 'upcoming'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-glow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveView('completed')}
          className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeView === 'completed'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-glow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-panel liquid-glass-1 border border-white/10 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No tasks in this view</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeView === 'completed'
                ? 'Finish tasks from the Today or Upcoming tabs to see them listed here.'
                : 'All clear! Add a new task to stay ahead of upcoming assignment deadlines.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <GlassCard
              key={task.id}
              level={2}
              rounded="md"
              className={`p-4 sm:p-5 border transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.completed
                  ? 'border-white/5 opacity-60 bg-white/[0.02]'
                  : 'hover:border-white/20 hover:-translate-y-0.5 shadow-liquid-sm'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Tactile Completion Circle */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
                  )}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${task.subjectColor || '#8b5cf6'}20`,
                        color: task.subjectColor || '#8b5cf6',
                        border: `1px solid ${task.subjectColor || '#8b5cf6'}40`,
                      }}
                    >
                      {task.subject}
                    </span>
                    <GlassBadge variant={getPriorityBadgeVariant(task.priority)} size="xs">
                      {task.priority}
                    </GlassBadge>
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-bold text-white transition-colors ${
                      task.completed ? 'line-through text-slate-400' : 'group-hover:text-cyan-200'
                    }`}
                  >
                    {task.title}
                  </h4>

                  {task.notes && (
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {task.notes}
                    </p>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {task.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Due Date & Delete Action */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {task.dueDate}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Academic Task"
        subtitle="Add a new assignment, lab work, or revision task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Task Title</label>
            <GlassInput
              placeholder="e.g. Implement Red-Black Tree Rotation in C++"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Course / Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full liquid-input py-2 px-3 text-sm text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} className="bg-navy-950 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full liquid-input py-2 px-3 text-sm text-white"
              >
                <option value="urgent" className="bg-navy-950 text-white">Urgent</option>
                <option value="high" className="bg-navy-950 text-white">High</option>
                <option value="medium" className="bg-navy-950 text-white">Medium</option>
                <option value="low" className="bg-navy-950 text-white">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Due Date</label>
              <GlassInput
                placeholder="e.g. Due tomorrow, 11:59 PM"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tags (comma-separated)</label>
              <GlassInput
                placeholder="e.g. Assignment, SQL, Lab"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Notes & Requirements</label>
            <textarea
              rows={3}
              placeholder="Additional details, rubric notes, or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full liquid-input p-3 text-sm text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton type="button" variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Save Task
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
