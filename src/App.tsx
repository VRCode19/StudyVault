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
import { DashboardPage } from './pages/DashboardPage';
import { SchedulePage } from './pages/SchedulePage';
import { SyllabusPage } from './pages/SyllabusPage';
import { ProgressPage } from './pages/ProgressPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';

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

  // Active view renderer
  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'syllabus':
        return <SyllabusPage />;
      case 'progress':
        return <ProgressPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex relative overflow-x-hidden selection:bg-blue-600/30">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 ambient-hero-mesh" />

      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>

        {/* Mobile Navigation Tab Bar */}
        <MobileNav />
      </div>

      {/* Global Modals & Toasts */}
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
