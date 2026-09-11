import React from 'react';
import { BookOpen, Sparkles, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { SyllabusUploader } from '../components/syllabus/SyllabusUploader';
import { SubjectCard } from '../components/syllabus/SubjectCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SyllabusPage: React.FC = () => {
  const { subjects, setActivePage, showToast } = useStudyVault();

  const handleCreatePlan = () => {
    showToast(
      'Study Plan Generated',
      'Your adaptive calendar has been synchronized with all extracted course modules.',
      'adaptive'
    );
    setActivePage('schedule');
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

        <Button
          variant="primary"
          size="sm"
          onClick={handleCreatePlan}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
          className="shadow-blue-glow font-semibold"
        >
          Generate Adaptive Schedule
        </Button>
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
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
};
