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
> Studyvault features a modern decoupled architecture: a React 19 + Vite Neo-Tactile frontend paired with a dedicated **server-side AI engine** powered by **OpenRouter**. The AI runs multi-turn tool-grounded conversations, multimodal vision analysis (timetables, exams, syllabi), and adaptive schedule recalculation. The AI service runs both as a local Express server and as **Vercel Serverless Functions**.

---

## 🧠 Intelligent AI Architecture & OpenRouter Engine

Studyvault transforms study planning from static calendars into an active, adaptive AI study manager. All AI operations run strictly server-side with zero prompt exposure or client-side key leakage.

### 1. Provider & Multimodal Models
- **AI Provider**: [OpenRouter](https://openrouter.ai/)
- **Chat & Strategist Model**: Configured via `OPENROUTER_CHAT_MODEL` (default: `google/gemini-2.5-flash` or any OpenRouter model like `anthropic/claude-3.5-sonnet`)
- **Multimodal Vision Model**: Configured via `OPENROUTER_VISION_MODEL` (default: `google/gemini-2.5-flash` with native vision capabilities)
- **Zero Hallucination Grounding**: The AI is forbidden from guessing schedules, exams, or topic completion. It reads directly from grounded backend tools before answering.

### 2. Vision Analysis Engine
Students can upload pictures of documents directly into the chat or syllabus uploader:
- **Automatic Document Detection**: Classifies uploaded images into `timetable`, `exam_timetable`, `syllabus`, or `module_details`.
- **Class Timetable Extraction**: Extracts days, lecture time blocks, course names, and classrooms into structured schemas.
- **Exam Datesheet Extraction**: Detects exam dates, session timings, and paper codes to anchor deadlines.
- **Academic Syllabus & Module Breakdown**: Structures courses into modules and discrete topics with difficulty ratings and estimated study times.
- **Multi-File & Drag-and-Drop**: Upload multiple module screenshots or pages simultaneously.
- **Confidence Scoring**: Returns confidence metrics (`high`, `medium`, `low`) and highlights ambiguities for student review.

### 3. 18 Grounded AI Function-Calling Tools
The AI agent interacts with your academic state exclusively through 18 verified tools:

| Category | Tool | Description |
| :--- | :--- | :--- |
| **Schedule Read** | `get_user_schedule` | Fetch scheduled sessions for a date range |
| | `get_today_schedule` | Fetch today's study sessions and urgent tasks |
| | `get_week_schedule` | Full weekly timetable view |
| | `get_available_study_time` | Capacity minus scheduled lecture/study slots |
| **Progress Read** | `get_user_profile` | Student name, streak, total and completed topics |
| | `get_subject_progress` | Real enrolled courses, topics mastered, percentages |
| | `get_exam_deadlines` | Confirmed upcoming exam dates and countdown days |
| | `get_remaining_topics` | Pending topics requiring study allocation |
| | `get_study_preferences` | Daily capacity, preferred focus windows, rhythm |
| **Actions & Schedule** | `create_study_session` | Add a verified session to the timetable |
| | `update_study_session` | Modify session time, date, or duration |
| | `complete_study_session` | Mark session done and advance progress |
| | `mark_session_missed` | Trigger autonomous redistribution across open buffers |
| | `reschedule_session` | Shift session to another verified slot |
| | `create_subject` | Register a new subject from extracted syllabus |
| | `create_module` | Register an individual module under a subject |
| | `create_schedule` | Generate full academic timetable plan |
| | `propose_schedule_shifts` | Propose interactive Action Card for user confirmation |

### 4. Interactive Action Cards & Proposals
When the student asks to adjust study sessions or reports fatigue, the AI generates interactive action cards:
- **Schedule Update Cards**: Shows previous slots, adapted slots, and safety verification with one-click **Apply** or **Undo** triggers.
- **Extraction Preview Cards**: Displays extracted timetables or exam dates with **Confirm & Apply** buttons.
- **Schedule Proposal Cards**: Full multi-session plan preview for onboarding confirmation.
- **Onboarding Progress Cards**: Dynamic checklist tracking setup milestones.

### 5. Decoupled Backend Adapter Pattern
The AI service connects to the backend through a clean `IBackendAdapter` interface:
- **`MockBackendAdapter`** (Default): Self-contained local state simulating a real backend with realistic sessions, subjects, and exams. Perfect for immediate development and testing without spinning up databases.
- **`HttpBackendAdapter`**: Ready for your backend developer. Forwards all tool calls to real REST endpoints with bearer token passthrough. Switching modes is as simple as setting `BACKEND_MODE=http`.

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
- `npm` (comes with Node.js)
- An [OpenRouter API Key](https://openrouter.ai/keys) for live AI capabilities

### Installation & Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/StudyVault.git
   cd StudyVault
   ```

2. **Install root & server dependencies**:
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Configure Environment Variables**:
   Create `server/.env` (or copy from `server/.env.example`):
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env`:
   ```env
   # Required for live OpenRouter AI operations
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Dedicated Models (configurable independently)
   OPENROUTER_CHAT_MODEL=google/gemini-2.5-flash
   OPENROUTER_VISION_MODEL=google/gemini-2.5-flash

   # Service Configuration
   PORT=5001
   CORS_ORIGIN=http://localhost:5173

   # Backend Integration: 'mock' for local grounded state, 'http' for real backend
   BACKEND_MODE=mock
   ```

### Running Locally

1. **Start the AI Service** (terminal 1):
   ```bash
   npm run dev:server
   ```
   Runs the Express AI service with hot reload on [http://localhost:5001](http://localhost:5001).

2. **Start the Frontend** (terminal 2):
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running the AI Test Suite

Verify all 18 tools, vision extraction schemas, and conversation state management:
```bash
npm run test:ai
```

### Vercel Deployment

Studyvault is configured for zero-friction Vercel deployment with both the frontend SPA and serverless AI functions:

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Project Settings → Environment Variables**, add:
   - `OPENROUTER_API_KEY`: Your OpenRouter secret key.
   - `OPENROUTER_CHAT_MODEL`: `google/gemini-2.5-flash` (or preferred model).
   - `OPENROUTER_VISION_MODEL`: `google/gemini-2.5-flash`.
   - `BACKEND_MODE`: `mock` (or `http` once your backend is ready).
4. Deploy! Vercel will automatically build the Vite frontend (`npm run build`) and route all `/api/ai/*` endpoints to the serverless functions under `api/ai/`.

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
