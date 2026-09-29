import React, { useState } from 'react';
import { StudyVaultProvider, useStudyVault } from './context/StudyVaultContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { SearchModal } from './components/common/SearchModal';
import { SessionModal } from './components/calendar/SessionModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VaultPage } from './pages/VaultPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { ExamsPage } from './pages/ExamsPage';
import { ProgressPage } from './pages/ProgressPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

const MainApp: React.FC = () => {
  const { activePage } = useStudyVault();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on Landing Page, render full-bleed landing view
  if (activePage === 'landing') {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  // If on Login Page, render full-bleed auth view
  if (activePage === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Active view renderer for all academic workspace sections
  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'vault':
        return <VaultPage />;
      case 'subjects':
      case 'syllabus':
        return <SubjectsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'calendar':
      case 'schedule':
        return <CalendarPage />;
      case 'exams':
        return <ExamsPage />;
      case 'progress':
        return <ProgressPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen liquid-bg-atmosphere text-slate-100 flex relative overflow-x-hidden selection:bg-blue-600/30">
      {/* Layered Atmospheric Light Blooms */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-1/3 w-[650px] h-[650px] bg-violet-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Desktop & Mobile Responsive Floating Glass Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>

        {/* Mobile Navigation Floating Bottom Glass Bar */}
        <MobileNav />
      </div>

      {/* Global Command Palette (Ctrl + K), Session Modals & Toasts */}
      <SearchModal />
      <SessionModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StudyVaultProvider>
      <MainApp />
    </StudyVaultProvider>
  );
}
