# StudyVault

StudyVault is an AI-powered study scheduling application that transforms static syllabuses into living, adaptable study timetables. Built for Android, it replaces rigid manual calendars with a dynamic system that actively recalculates and redistributes study tasks based on real-time progress and upcoming exam deadlines. 

The user experience is driven by a conversational AI assistant, allowing users to manage their academic workload entirely through natural language.

## Core Features

*   **Automated Syllabus Ingestion:** Upload static timetables or raw module text to automatically generate milestones, topic weights, and exam deadlines.
*   **Dynamic Constraint Rescheduling:** Missed a day? The backend scheduling engine instantly recalculates the entire timetable, smoothly redistributing the remaining workload across available buffer days without overwhelming the user.
*   **Conversational AI Manager:** Update progress or delay tasks naturally via chat (e.g., "I'm sick today, push my schedule to tomorrow"). The LLM executes backend database updates to adjust the calendar.
*   **Real-Time Calendar Sync:** A visual dashboard that reflects the current, optimized state of the study plan, syncing instantly with the AI chat interface.