import React, { useState } from 'react';
import { BookOpen, Sparkles, Plus, ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { SyllabusUploader } from '../components/syllabus/SyllabusUploader';
import { SubjectCard } from '../components/syllabus/SubjectCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Topic } from '../types/studyvault';

export const SyllabusPage: React.FC = () => {
  const {
    subjects,
    setActivePage,
    showToast,
    addSubject,
    generateTimetableFromSyllabus,
    sessions,
    settings,
  } = useStudyVault();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [customHours, setCustomHours] = useState(settings?.dailyStudyCapacityHours || 4);
  const [customPeriod, setCustomPeriod] = useState<'morning' | 'afternoon' | 'evening'>(
    settings?.preferredTimeOfDay === 'afternoon' || settings?.preferredTimeOfDay === 'evening'
      ? settings.preferredTimeOfDay
      : 'morning'
  );
  const [customExcludeWeekends, setCustomExcludeWeekends] = useState(!settings?.weekendAvailability);

  // Form state for manual subject
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subColor, setSubColor] = useState('#3b82f6');
  const [topicsText, setTopicsText] = useState('');

  const colorPresets = [
    { label: 'Blue', hex: '#3b82f6' },
    { label: 'Cyan', hex: '#06b6d4' },
    { label: 'Indigo', hex: '#6366f1' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Rose', hex: '#f43f5e' },
  ];

  const handleCreatePlan = () => {
    if (subjects.length === 0) {
      showToast('No Courses Found', 'Please add or parse at least one course syllabus first.', 'warning');
      return;
    }
    generateTimetableFromSyllabus({
      dailyHours: customHours,
      preferredTimeOfDay: customPeriod,
      excludeWeekends: customExcludeWeekends,
    });
  };

  const handleManualSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    // Parse topics from text (newline or comma separated)
    const topicLines = topicsText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const generatedTopics: Topic[] = (topicLines.length > 0 ? topicLines : ['Introduction & Foundations']).map(
      (name, idx) => ({
        id: `top-manual-${Date.now()}-${idx}`,
        subjectId: '',
        name,
        module: `Module ${Math.floor(idx / 3) + 1}`,
        estimatedMinutes: 50,
        difficulty: (idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard') as any,
        status: 'pending' as const,
      })
    );

    const totalMinutes = generatedTopics.length * 50;

    addSubject({
      name: subName.trim(),
      code: subCode.trim().toUpperCase() || 'COURSE',
      accentColor: subColor,
      glowColor: `${subColor}40`,
      totalTopics: generatedTopics.length,
      completedTopics: 0,
      totalMinutes,
      completedMinutes: 0,
      progressPercentage: 0,
      topics: generatedTopics,
    });

    setSubName('');
    setSubCode('');
    setTopicsText('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Syllabus Management
            </h1>
            <Badge variant="ai-optimized" size="sm">
              Semantic Parser
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Convert university course documents, timetables, and lecture plans into structured adaptive modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Subject Manually
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
          >
            Customize Timetable
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCreatePlan}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="shadow-blue-glow font-semibold"
          >
            Generate Adaptive Timetable
          </Button>
        </div>
      </div>

      {/* Syllabus Uploader Box */}
      <SyllabusUploader />

      {/* Extracted Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Active Course Syllabuses ({subjects.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any subject to expand topics, modules, and estimated cognitive time allocations.
              {sessions.length > 0 && (
                <span className="text-cyan-400 font-medium ml-2">
                  • {sessions.length} study sessions scheduled in calendar
                </span>
              )}
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Course Syllabuses Added Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Upload your course outlines, PDF syllabus, or lecture slides above, or manually create a course with topics.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Subject Manually
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Course Subject Manually"
        subtitle="Define a course and its key syllabus modules without uploading a file"
        maxWidth="lg"
      >
        <form onSubmit={handleManualSubjectSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Course Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Systems"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS401"
                value={subCode}
                onChange={(e) => setSubCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 text-white text-sm uppercase font-mono border border-white/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color Preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Accent Color</label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSubColor(c.hex)}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    subColor === c.hex ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-dark-950' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Topics input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Topics / Syllabus Units</label>
              <span className="text-[11px] text-slate-500">One topic per line</span>
            </div>
            <textarea
              rows={5}
              placeholder="e.g.&#10;Consensus & Paxos&#10;Replication & Fault Tolerance&#10;Distributed Hash Tables&#10;Clock Synchronization"
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              className="w-full p-3 rounded-xl bg-dark-900 text-white text-xs font-mono border border-white/10 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Plus className="w-4 h-4" />}>
              Add Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customize Timetable Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Customize Timetable Synthesis"
        subtitle="Configure how the AI distributes syllabus topics across your weekly calendar"
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Daily Study Capacity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Daily Target Study Hours: <span className="text-cyan-400 font-mono font-bold">{customHours}h / day</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setCustomHours(hrs)}
                  className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    customHours === hrs
                      ? 'bg-blue-600/30 border-blue-500 text-cyan-300 shadow-blue-glow/30'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Study Time of Day */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Peak Energy Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'morning', label: 'Morning (09:00)' },
                { id: 'afternoon', label: 'Afternoon (14:00)' },
                { id: 'evening', label: 'Evening (17:30)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCustomPeriod(p.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-medium transition-all border text-center ${
                    customPeriod === p.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weekend Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div>
              <p className="text-xs font-semibold text-slate-200">Include Weekends</p>
              <p className="text-[11px] text-slate-400">Schedule review and buffer sessions on Saturday & Sunday</p>
            </div>
            <input
              type="checkbox"
              checked={!customExcludeWeekends}
              onChange={(e) => setCustomExcludeWeekends(!e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-dark-900 border-white/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsScheduleModalOpen(false);
                handleCreatePlan();
              }}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Generate Timetable Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
