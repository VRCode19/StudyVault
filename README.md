<div align="center">

# ⚡ Studyvault

### AI-Powered Adaptive Study Operating System

**Studyvault turns your static syllabus into an intelligent, adaptive study timetable that automatically recalculates around your life, missed sessions, and exam deadlines.**

[![React](https://img.shields.io/badge/React-19-61dafb.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](LICENSE)

[Live Features](#key-features) • [Design Language](#visual-design-system) • [Architecture](#application-architecture) • [Getting Started](#getting-started) • [Directory Structure](#project-structure)

---

</div>

## Overview

Traditional study schedules fail because they are rigid: missing one morning session causes a cascade of delays that ruins the entire plan.

**Studyvault** is built on an adaptive scheduling philosophy:
- **Zero Static Timetables**: Sessions are treated as flexible cognitive allocations anchored to non-negotiable exam deadlines.
- **Autonomous Redistribution**: When a session is missed, delayed, or finished early, Studyvault recalculates your schedule across open study buffer slots so you never cram.
- **Cognitive Load Balancing**: Syllabus modules are weighted by difficulty (Easy, Medium, Hard) and matched to your peak daily focus hours.

> [!NOTE]
> This is a **frontend-only** production-grade SaaS architecture. All AI assistant conversations, syllabus parsing workflows, calendar reorganizations, and progress analytics run on local state with persistent browser `localStorage`. No external backend or database setup is required.

---

## Key Features

### 1. 🌌 Neo-Tactile / Glassmorphism UI
- Near-black charcoal canvas (`#07080b`) with multi-layered frosted glass surfaces (`backdrop-filter: blur(16px–24px)`).
- Layered depth with subtle light-translucent borders (`rgba(255, 255, 255, 0.08)`), inner specular reflections, and soft drop shadows.
- Electric Blue (`#2563eb`, `#3b82f6`) action accents with subtle Cyan (`#06b6d4`, `#22d3ee`) glow indicators for autonomous engine states.
- Tactile buttons featuring physical hover elevations, smooth transitions, and realistic active press states.

### 2. 🚀 Product Landing Page
- High-converting hero section with badge, typography, and clear calls-to-action (**"Build my study plan"** & **"See how it works"**).
- **Floating 3D Glass Dashboard Preview**: An interactive glass product showcase featuring live focus sessions, an SVG progress ring, exam countdowns, mini calendar blocks, and a proactive AI strategist preview.

### 3. 📊 Central Dashboard
- **Top Stats Cards**:
  - **Today's Study**: `3h 20m` with goal progress indicator.
  - **Weekly Progress**: `68%` (+14% vs. previous rolling week).
  - **Topics Mastered**: `24 / 36` across 4 core CS courses.
  - **Exam Runway**: `18 days` countdown to End Semester Examination.
- **Today's Focus Plan**:
  - Tactile session rows with subject badges, duration, and completion checkboxes.
  - Toggling completion triggers celebratory particle confetti, recalculates daily minutes, and advances syllabus coverage.
  - Quick action to split sessions or reschedule.
- **Adaptive Engine Showcase**:
  - Real-time comparison flow demonstrating how yesterday's missed 1h Database Systems session was redistributed into two 30m slots across today and tomorrow.
  - Interactive **"Simulate Missed Session"** trigger to test the redistribution algorithm.

### 4. 📅 Adaptive Study Calendar (`My Schedule`)
- Multi-column Mon–Sun grid with color-coded subject blocks (*Data Structures*, *Database Systems*, *Computer Networks*, *Operating Systems*).
- **Week & Month Toggle**: Switch between daily study blocks and higher-level milestone views.
- **Subject Filtering**: Quick filter pills to isolate specific courses.
- **Interactive Session Modal**: Inspect topics, toggle completion status, move to another day, or split 1-hour sessions into two 30-minute digestible blocks.

### 5. 🤖 Studyvault AI Assistant
- Live copilot with suggested prompt chips:
  - *"I'm too tired to study today. Push my tasks."*
  - *"Plan tomorrow"*
  - *"What should I study next?"*
  - *"Show my progress"*
- **Embedded Schedule Action Cards**: When sessions are pushed, the AI displays an interactive **"Updated Schedule"** card showing exact session shifts with **Apply Changes** and **Undo** buttons that directly update the app timetable.

### 6. 📑 Autonomous Syllabus Parser
- Drag-and-drop file upload zone (PDF, TXT, DOCX), text paste modal, or one-click sample CS curriculum loader.
- **Simulated 5-Step Animated Parsing Pipeline**:
  1. *Reading syllabus document...*
  2. *Identifying core subjects & modules...*
  3. *Breaking modules into structured topics...*
  4. *Estimating cognitive load & study time...*
  5. *Synthesizing adaptive schedule...*
- Expandable subject cards with cognitive minute estimates and difficulty badges.

### 7. 📈 Progress & Retention Analytics
- High-precision circular SVG gauge glowing at **68%** syllabus completion.
- Weekly study hours vertical bar chart comparing daily performance against your 3.5h target with interactive hover tooltips.
- 7-day study consistency streak counter and upcoming examination deadlines table.

### 8. ⚙️ Preferences & Global Tools
- Daily study capacity slider (1h–8h).
- Preferred focus windows: Morning, Afternoon, Evening, Night Owl.
- Rhythm styles: Pomodoro (25/5), Deep Work (50/10), Standard (30/5).
- Glass intensity controls (Subtle, Balanced, Tactile Ultra) and one-click demo data reset.
- Global **`⌘K` / `Ctrl+K`** search modal and floating glass toast notification center.

---

## Visual Design System

| Element | Specification |
| :--- | :--- |
| **Page Background** | Near-black charcoal (`#07080b` / `#0b0d13`) with subtle ambient radial gradients |
| **Glass Containers** | `background: rgba(14, 18, 26, 0.65)`, `backdrop-filter: blur(18px)`, `border: 1px solid rgba(255, 255, 255, 0.08)` |
| **Primary Action** | Electric Blue (`#2563eb`, `#3b82f6`) with `box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35)` |
| **AI / Glowing State**| Cyan (`#06b6d4`, `#22d3ee`) with soft ambient lighting |
| **Typography** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [Inter](https://fonts.google.com/specimen/Inter) |
| **Tactile Buttons** | Rounded corners (`16px`), inner top highlight (`inset 0 1px 0 rgba(255,255,255,0.14)`), depressed active scale (`0.97`) |
| **Context Badges** | `Adaptive`, `AI Optimized`, `Deadline Protected`, `Rescheduled`, `On Track` |

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript 6.0](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) with PostCSS & Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations & Effects**: `canvas-confetti`, custom CSS keyframe glows, and Tailwind transitions
- **State Management**: React Context API with persistent `localStorage` serialization

---

## Project Structure

```
StudyVault/
├── index.html                 # HTML5 entry with Plus Jakarta Sans & SEO meta tags
├── tailwind.config.js         # Custom neo-tactile glassmorphism color & shadow tokens
├── tsconfig.json              # TypeScript root configuration
├── package.json               # Project dependencies and build scripts
├── public/
│   └── favicon.svg            # Geometric shield Studyvault SVG favicon
└── src/
    ├── types/
    │   └── studyvault.ts      # Domain models (Subjects, Topics, Sessions, Exams, AI Chat)
    ├── mock/
    │   └── demoData.ts        # Realistic student data (Alex, 4 CS courses, 36 topics)
    ├── context/
    │   └── StudyVaultContext.tsx # Central state, scheduling engine & localStorage sync
    ├── components/
    │   ├── common/
    │   │   ├── GlassCard.tsx  # Polymorphic frosted glass surface container
    │   │   ├── Button.tsx     # Tactile button with electric blue & glass variants
    │   │   ├── Badge.tsx      # Contextual status badges with glowing dots
    │   │   ├── Modal.tsx      # Frosted glass modal with backdrop blur
    │   │   ├── Toast.tsx      # Floating glass toast notification alerts
    │   │   └── SearchModal.tsx# Global Cmd+K quick navigation search palette
    │   ├── layout/
    │   │   ├── Sidebar.tsx    # Floating glass sidebar with streak & user profile
    │   │   ├── Topbar.tsx     # Header with greeting, notification center, and quick AI trigger
    │   │   └── MobileNav.tsx  # Responsive bottom navigation bar for mobile
    │   ├── dashboard/
    │   │   ├── StatCard.tsx   # Top 4 tactile metrics cards
    │   │   ├── TodayPlan.tsx  # Interactive session rows with completion toggles
    │   │   └── AdaptiveEngine.tsx # Visual schedule redistribution comparison flow
    │   ├── calendar/
    │   │   ├── StudyCalendar.tsx # Multi-day timetable with week/month & subject filters
    │   │   └── SessionModal.tsx  # Detailed session inspection & reschedule modal
    │   ├── assistant/
    │   │   ├── AIChat.tsx     # Conversational copilot with suggested chips
    │   │   └── ChatMessage.tsx# Message bubble with interactive schedule diff action cards
    │   ├── syllabus/
    │   │   ├── SyllabusUploader.tsx # Drag-and-drop & animated 5-step parsing pipeline
    │   │   └── SubjectCard.tsx      # Extracted course modules and topic accordion
    │   └── progress/
    │       ├── ProgressRing.tsx   # SVG animated electric progress gauge
    │       ├── SubjectProgress.tsx# Subject-level progress bars
    │       └── WeeklyChart.tsx    # Tactile study hours vertical bar chart
    ├── pages/
    │   ├── LandingPage.tsx    # High-converting landing page with 3D product mockup
    │   ├── DashboardPage.tsx  # Central study command center
    │   ├── SchedulePage.tsx   # Full adaptive timetable
    │   ├── SyllabusPage.tsx   # Syllabus management and parser
    │   ├── ProgressPage.tsx   # Analytics, velocity, and retention metrics
    │   ├── AssistantPage.tsx  # Full-screen AI study strategist
    │   └── SettingsPage.tsx   # Study rhythm preferences and demo data controls
    ├── App.tsx                # Application shell and view router
    ├── main.tsx               # React root mounting
    └── index.css              # Glassmorphic utilities, custom scrollbars, and tactile effects
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0 or newer recommended)
- `npm` or `pnpm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/StudyVault.git
   cd StudyVault
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready assets will be compiled into the `dist/` folder.

5. **Preview production bundle locally**:
   ```bash
   npm run preview
   ```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>K</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open global quick search palette |
| <kbd>Esc</kbd> | Dismiss any open modal or search window |

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for students who want structure without rigidity.</sub>
</div>
