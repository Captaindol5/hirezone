# HireZone — Complete Project Plan

> **Project Name:** HireZone
> **Type:** AI-Powered Recruitment & Hiring Management Platform
> **Tech Stack:** React + Vite, Firebase (Auth + Firestore), Tailwind CSS, AI Screening Service
> **Sprint:** Sprint 1 (Current)
> **Version:** 1.0.0

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Feature Catalogue](#3-feature-catalogue)
4. [User Personas](#4-user-personas)
5. [User Stories by Feature](#5-user-stories-by-feature)
6. [Project Plan (Template)](#6-project-plan-template)
7. [Risks & Mitigations](#7-risks--mitigations)
8. [Out of Scope (Sprint 1)](#8-out-of-scope-sprint-1)

---

## 1. Project Overview

HireZone is a **role-based, AI-augmented recruitment platform** designed to streamline every stage of the hiring lifecycle — from public job posting and candidate application, through AI resume screening, custom interview pipeline management, live interviewer scoring, and executive analytics reporting.

The platform enforces **role-based access control (RBAC)** so that each actor (HR Recruiter, Interviewer, Hiring Manager, Executive/Manager) sees only the views and actions appropriate to their responsibilities.

### Goals
| # | Goal |
|---|------|
| G1 | Reduce time-to-hire through workflow automation |
| G2 | Eliminate unconscious bias via AI guardrails during screening |
| G3 | Centralise candidate data across all hiring stages |
| G4 | Provide transparent, real-time progress to all stakeholders |
| G5 | Give executives data-driven hiring insights |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HireZone Platform                        │
│                                                                 │
│  Public Routes              │  Protected Portals (RBAC)         │
│  ─────────────              │  ────────────────────────         │
│  / Landing Page             │  /portal/hr   → HR Pipeline       │
│  /features                  │  /portal/interviewer              │
│  /careers                   │  /portal/analytics (Manager)      │
│  /apply/:jobId              │  /portal/ai-screening             │
│  /login                     │                                   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Firebase Auth  │    │  Cloud Firestore  │    │  AI Screening   │
│  (RBAC tokens)  │    │  (jobs, cands,    │    │  Service (PDF   │
│                 │    │   stages, notifs) │    │  parse + score) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### User Roles & Route Map

| Role | Route | Access Level |
|------|-------|-------------|
| `hr` / `hiring_manager` | `/portal/hr` | Full pipeline management, read/write |
| `interviewer` | `/portal/interviewer` | Score assigned candidates only |
| `manager` | `/portal/analytics` + `/portal/hr` (read-only) | View analytics + pipeline (read-only) |
| Public (no auth) | `/`, `/features`, `/careers`, `/apply/:jobId` | Browse & apply |

---

## 3. Feature Catalogue

### F1 — Authentication & Role-Based Portal Routing

**Summary:** Secure login via Firebase Authentication. Upon login, the system reads the user's Firestore profile to determine their role and redirects them to the correct portal automatically.

**Sub-features:**
- Email/password login via Firebase Auth
- Role detection from Firestore `users` collection
- Dynamic redirect: HR → `/portal/hr`, Interviewer → `/portal/interviewer`, Manager → `/portal/analytics`
- Protected routes using `ProtectedRoute` component that rejects unauthorised roles
- Auth context (React Context API) providing `currentUser`, `userRole`, `userName`, `userProfileId` globally
- Theme support (light/dark) via `ThemeContext`
- Loading states during auth initialisation
- Automatic session persistence (Firebase handles token refresh)

---

### F2 — AI-Powered Resume Screening & Bias Guardrails

**Summary:** HR users upload candidate PDF resumes. The system extracts text content, anonymises PII (name, gender, age) to remove unconscious bias, then sends the anonymised profile to an AI service that evaluates the candidate against the job description and produces a match score and insights.

**Sub-features:**
- PDF upload and text extraction
- PII anonymisation (bias guardrails) before AI evaluation
- AI scoring against a specific job description
- Match score and qualitative insights returned to HR
- Results saved to Firestore candidate record
- Dedicated `/portal/ai-screening` route accessible to `hr`, `hiring_manager`, `interviewer`

---

### F3 — Job Postings & Careers Page

**Summary:** A public-facing Careers page displays all live job postings fetched from Firestore. Any visitor can browse roles and click through to a detailed application form.

**Sub-features:**
- Live job listing page (`/careers`)
- Job detail view (title, department, description, expiry date)
- Job Application Form (`/apply/:jobId`):
  - Candidate personal details (name, email, phone)
  - Cover letter / statement field
  - Resume (CV) upload (URL or file)
  - Profile photo upload
  - Notes field
- Input validation before submission
- Application saved to Firestore under the correct job's `candidates` array
- Success confirmation modal shown to candidate after submission
- Job expiry date enforcement (expired jobs not shown)

---

### F4 — Custom Interview Pipeline Builder

**Summary:** HR users can create and configure hiring pipelines for each open position. Each pipeline consists of ordered stages (e.g., "Phone Screen", "Technical Round", "HR Interview"). An interviewer is assigned to each stage.

**Sub-features:**
- Create new job openings with: title, department, expiry date, passing threshold (%), custom interview questions
- Add / edit / delete pipeline stages per job
- Assign a specific interviewer to each stage
- Reorder stages
- Edit job metadata (title, department, expiry, threshold, questions) after creation
- Delete a job (with confirmation)
- View job details (read-only view for managers)
- Stages stored in Firestore as ordered sub-collections under each job

---

### F5 — Interactive Kanban Board & Stage-Gate Enforcement

**Summary:** A visual Kanban board shows all candidates for a selected job, grouped by their current pipeline stage. HR can drag-and-drop or use action buttons to advance candidates. Stage-gate enforcement prevents advancing a candidate until the assigned interviewer submits feedback.

**Sub-features:**
- Kanban columns generated dynamically from job pipeline stages
- Candidate cards showing name, photo, current stage, and status badges
- Advance candidate to next stage (blocked if interviewer feedback is pending — stage-gate)
- Fail a candidate (move to "Failed" terminal state)
- Hire a candidate (move to "Hired" terminal state, record `hiredAt` timestamp + offer notes + start date)
- View candidate full profile (CV URL, photo, notes, AI screening score, interview feedback)
- Candidate status directory (list view alternative to Kanban)
- Sidebar navigation to switch between jobs
- Collapsible sidebar (expand/collapse)

---

### F6 — Interviewer Feedback Portal & Scorecard Submission

**Summary:** Interviewers log in and see only the candidates assigned to their stage. They review the candidate's profile (including AI screening insights and CV link) and submit a structured scorecard (numeric score + qualitative feedback). Submission marks the candidate as "Ready" to advance.

**Sub-features:**
- Interviewer sees only their assigned candidates (filtered by `stage.interviewer === activeInterviewerId`)
- Candidate profile view: name, job title, stage label, photo, CV link, AI screening score
- Scorecard form: numeric score (0–100) + free-text feedback field
- Submit feedback writes to Firestore candidate record and sets status to `Ready`
- Once submitted, candidate disappears from interviewer's active queue
- Live real-time subscription to candidate profile (via Firestore listener)
- Bot / AI screening insights displayed alongside candidate profile
- Shield-check icon indicating bias-guardrail protected screening was used

---

### F7 — Real-Time Notifications

**Summary:** An in-app notification bell in the top navigation bar alerts all authenticated users to important hiring events in real time (new applications, screening completions, stage changes). Notifications are stored in Firestore and use real-time listeners to push updates instantly.

**Sub-features:**
- Notification bell icon with unread count badge
- Real-time Firestore listener for new notifications
- Dropdown panel listing all notifications with timestamps
- "Mark all as read" action resets badge counter
- Notification types: new application submitted, AI screening complete, candidate advanced, candidate hired/rejected
- Notifications scoped to the user's role (HR sees all; Interviewers see their assignments only)

---

### F8 — Executive Analytics & Candidate Comparison Matrix

**Summary:** The Manager Analytics Portal provides executive-level hiring KPIs and a visual stage funnel. Managers see aggregate data across all jobs and candidates to support data-driven hiring decisions.

**Sub-features:**
- **KPI Cards:**
  - Average Time to Hire (days, from `createdAt` to `hiredAt`)
  - Total Live Candidates (active, hired, rejected breakdown)
  - Offer Acceptance Rate (hired / (hired + failed) × 100%)
  - Hired This Month (current calendar month count)
  - Open Positions count
  - Top Performing Job (by hire rate)
- **Stage Funnel:** Bar chart showing candidate count per stage per job
- **Candidate Comparison Matrix:** Side-by-side comparison of candidates (AI score, interviewer score, stage reached)
- **Job Performance Table:** Per-job metrics (applicants, hired, rejected, fill rate)
- Real-time data via Firestore subscriptions (live, no page refresh needed)
- Read-only access to HR Pipeline board for context

---

## 4. User Personas

### Persona 1 — Priya Sharma · HR Recruiter

| Attribute | Detail |
|-----------|--------|
| **Role** | HR Recruiter / Talent Acquisition Specialist |
| **Age** | 29 |
| **Background** | 4 years in HR; manages 3–8 open roles simultaneously at a mid-sized tech company |
| **Tech Savviness** | Medium-High — comfortable with ATS tools, spreadsheets, email |
| **Primary Goal** | Fill open positions quickly with the right candidates while staying organised |
| **Pain Points** | Drowning in resume PDFs; manually tracking candidates in spreadsheets; unconscious bias concerns; no visibility into interview progress |
| **Motivations** | Faster time-to-fill, fair and structured process, less administrative overhead |
| **Quote** | *"I need to know where every candidate stands without chasing interviewers for updates."* |

---

### Persona 2 — Rahul Verma · Software Engineering Interviewer

| Attribute | Detail |
|-----------|--------|
| **Role** | Senior Software Engineer (part-time interviewer) |
| **Age** | 34 |
| **Background** | Full-time engineering role; interviews 2–3 candidates per week on behalf of HR |
| **Tech Savviness** | High — developer background |
| **Primary Goal** | Quickly review assigned candidates and submit structured feedback without friction |
| **Pain Points** | No centralised view of who he needs to interview; feedback submitted via email and lost; no access to AI screening context before interview |
| **Motivations** | Minimal disruption to his own work; clear, simple interface to submit feedback |
| **Quote** | *"Just show me who I need to interview today, let me score them, and let me get back to work."* |

---

### Persona 3 — Anjali Menon · Hiring Manager / VP Engineering

| Attribute | Detail |
|-----------|--------|
| **Role** | Hiring Manager & Department Head |
| **Age** | 42 |
| **Background** | Owns headcount decisions; involved in final-stage interviews only; monitors all hiring for her department |
| **Tech Savviness** | Medium — comfortable with dashboards and reports; not hands-on in ATS |
| **Primary Goal** | Ensure open roles are filled with quality candidates on schedule; track team growth |
| **Pain Points** | No real-time visibility into pipeline; relies on status meetings with HR; lacks data for headcount decisions |
| **Motivations** | Confident headcount planning, data-backed hiring decisions, less dependency on status updates |
| **Quote** | *"I shouldn't need a weekly meeting to know how many people are in the final round."* |

---

### Persona 4 — Karan Malhotra · Executive / C-Suite Manager

| Attribute | Detail |
|-----------|--------|
| **Role** | Chief People Officer / Director of Operations |
| **Age** | 50 |
| **Background** | Strategic oversight of all recruitment across multiple departments; presents hiring metrics to the board |
| **Tech Savviness** | Low-Medium — prefers dashboards and summaries over raw data |
| **Primary Goal** | Understand hiring health across the organisation; identify bottlenecks; justify hiring budgets |
| **Pain Points** | No consolidated view across departments; metrics compiled manually from multiple sources; late or inaccurate reporting |
| **Motivations** | Real-time executive dashboards, offer acceptance trends, cost-per-hire insights |
| **Quote** | *"I need one screen to tell me the health of our entire hiring pipeline."* |

---

### Persona 5 — Neha Iyer · Job Applicant / Candidate

| Attribute | Detail |
|-----------|--------|
| **Role** | Junior UX Designer (Job Seeker) |
| **Age** | 24 |
| **Background** | Recent graduate applying to multiple companies; no internal contact at target companies |
| **Tech Savviness** | Medium — comfortable with web forms; expects mobile-friendly experience |
| **Primary Goal** | Find and apply for relevant jobs easily; know that her application was received |
| **Pain Points** | Confusing application forms; no confirmation after applying; uncertainty about next steps |
| **Motivations** | Simple, transparent application process; clear feedback loop |
| **Quote** | *"I just want to know my application actually went through."* |

---

## 5. User Stories by Feature

### F1 — Authentication & Role-Based Portal Routing

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F1-01 | HR Recruiter (Priya) | Log in with my email and password | I can access the HR pipeline securely | 🔴 Must Have | Login with valid credentials redirects to `/portal/hr` within 3s |
| US-F1-02 | Interviewer (Rahul) | Be automatically redirected to my interviewer portal after login | I don't have to manually navigate | 🔴 Must Have | Role `interviewer` → `/portal/interviewer` on login |
| US-F1-03 | Manager (Anjali) | Be redirected to the analytics dashboard after login | I see the executive view immediately | 🔴 Must Have | Role `manager` → `/portal/analytics` on login |
| US-F1-04 | Any authenticated user | Be blocked from accessing portals not meant for my role | Unauthorised access is prevented | 🔴 Must Have | Accessing `/portal/hr` as `interviewer` redirects to login |
| US-F1-05 | Any user | See a loading indicator while authentication is being verified | The app doesn't flash blank screens | 🟡 Should Have | Loading spinner shown during Firebase auth check |
| US-F1-06 | Any user | Toggle between light and dark mode | I can work comfortably in either theme | 🟢 Nice to Have | Theme preference persisted in local storage |

---

### F2 — AI-Powered Resume Screening & Bias Guardrails

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F2-01 | HR Recruiter (Priya) | Upload a candidate's PDF resume to the AI screening tool | I can get an objective evaluation without reading the full CV | 🔴 Must Have | PDF uploads successfully; text extraction confirmed |
| US-F2-02 | HR Recruiter (Priya) | Have the AI hide the candidate's name, gender, and age before evaluation | Screening is based on skills, not identity | 🔴 Must Have | PII fields stripped before AI call; anonymised profile shown |
| US-F2-03 | HR Recruiter (Priya) | See an AI match score and written insights for each screened resume | I can quickly shortlist without bias | 🔴 Must Have | Score (0–100) and qualitative insights displayed in UI |
| US-F2-04 | HR Recruiter (Priya) | Have screening results saved to the candidate's record automatically | I can reference them during interview stages | 🔴 Must Have | Results persisted to Firestore; visible in candidate profile |
| US-F2-05 | Interviewer (Rahul) | View the AI screening insights for my assigned candidate before interviewing | I can tailor my questions to verified skill gaps | 🟡 Should Have | AI score and insights displayed in Interviewer Portal candidate card |
| US-F2-06 | HR Recruiter (Priya) | Receive a notification when AI screening is complete | I don't have to keep checking the portal | 🟡 Should Have | Notification triggered on screening completion |

---

### F3 — Job Postings & Careers Page

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F3-01 | Candidate (Neha) | Browse a list of all open job positions without logging in | I can explore opportunities freely | 🔴 Must Have | `/careers` loads all active (non-expired) jobs from Firestore |
| US-F3-02 | Candidate (Neha) | Click on a job to view its full description and requirements | I can decide if the role is right for me | 🔴 Must Have | Job detail view shows title, department, description, expiry |
| US-F3-03 | Candidate (Neha) | Fill in and submit a job application form | I can formally apply to a position | 🔴 Must Have | Form captures name, email, phone, cover letter, CV URL, photo, notes; submitted to Firestore |
| US-F3-04 | Candidate (Neha) | See a confirmation message after submitting my application | I know my application was received | 🔴 Must Have | Success modal displayed; candidate record created in correct job |
| US-F3-05 | Candidate (Neha) | See inline validation errors if I submit an incomplete form | I know what to fix before re-submitting | 🟡 Should Have | Required fields flagged; form not submitted until valid |
| US-F3-06 | HR Recruiter (Priya) | Create a new job posting with an expiry date | Expired postings are automatically hidden from candidates | 🔴 Must Have | Job with future `expiresAt` shown on Careers page; expired not shown |

---

### F4 — Custom Interview Pipeline Builder

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F4-01 | HR Recruiter (Priya) | Create a new job with custom pipeline stages | Every role has an interview process tailored to it | 🔴 Must Have | Job created in Firestore with `stages` array; appears in HR portal |
| US-F4-02 | HR Recruiter (Priya) | Add, edit, and delete stages in a pipeline after creation | I can adjust the process as the role evolves | 🔴 Must Have | Stage CRUD operations persist to Firestore; Kanban updates immediately |
| US-F4-03 | HR Recruiter (Priya) | Assign a specific interviewer to each stage | The right person evaluates each candidate at each round | 🔴 Must Have | Stage saved with `interviewer: interviewerId`; interviewer sees assignment |
| US-F4-04 | HR Recruiter (Priya) | Set a passing score threshold per job | Only candidates above the threshold are considered for advancement | 🟡 Should Have | `passingThreshold` field stored; used as advisory indicator in UI |
| US-F4-05 | HR Recruiter (Priya) | Edit job title, department, and expiry date | Job details remain accurate over time | 🔴 Must Have | Job metadata updates reflected in Careers page and HR portal |
| US-F4-06 | HR Recruiter (Priya) | Delete a job posting | Filled or cancelled positions are removed from the system | 🟡 Should Have | Delete confirmation modal; job removed from Firestore |
| US-F4-07 | Hiring Manager (Anjali) | View job pipeline details in read-only mode | I understand the hiring process without accidentally modifying it | 🔴 Must Have | Manager role shows same HR portal with all edit buttons disabled |

---

### F5 — Interactive Kanban Board & Stage-Gate Enforcement

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F5-01 | HR Recruiter (Priya) | See all candidates for a job displayed on a Kanban board by stage | I have a visual overview of the entire pipeline at a glance | 🔴 Must Have | Kanban columns match job stages; candidates appear in correct column |
| US-F5-02 | HR Recruiter (Priya) | Advance a candidate to the next stage when feedback is submitted | The pipeline moves forward only when ready | 🔴 Must Have | "Advance" action succeeds only when `candidate.status === 'Ready'`; blocked otherwise with tooltip |
| US-F5-03 | HR Recruiter (Priya) | Fail a candidate at any stage | I can remove unqualified candidates at any point | 🔴 Must Have | Candidate status set to `Failed`; moved to failed column or removed from active board |
| US-F5-04 | HR Recruiter (Priya) | Hire a candidate and record start date + offer notes | The hiring event is documented within the system | 🔴 Must Have | Offer modal captures start date and notes; `hiredAt` timestamp saved; status = `Hired` |
| US-F5-05 | HR Recruiter (Priya) | View a candidate's full profile (CV, photo, AI score, feedback history) | I have all information in one place | 🔴 Must Have | Candidate detail modal shows all fields including AI score and interviewer feedback |
| US-F5-06 | HR Recruiter (Priya) | Switch between Kanban view and list (directory) view | I can choose the layout that works best for my workflow | 🟡 Should Have | Tab toggle switches between `kanban` and `directory` views |
| US-F5-07 | Hiring Manager (Anjali) | View the Kanban board in read-only mode | I track candidates without risk of accidental edits | 🔴 Must Have | `readOnly` flag set for `manager` role; all mutation buttons hidden |

---

### F6 — Interviewer Feedback Portal & Scorecard Submission

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F6-01 | Interviewer (Rahul) | See only the candidates assigned to my interview stage | I'm not overwhelmed with the full candidate list | 🔴 Must Have | Filtered list shows only candidates where `stage.interviewer === activeInterviewerId` |
| US-F6-02 | Interviewer (Rahul) | View a candidate's CV link, photo, and AI screening insights before scoring | I can make an informed assessment | 🔴 Must Have | Candidate profile panel shows all fields; AI score badge visible |
| US-F6-03 | Interviewer (Rahul) | Submit a numeric score (0–100) and written feedback | My evaluation is recorded in a standardised format | 🔴 Must Have | Scorecard form validated; submission writes to Firestore `candidate.feedback` |
| US-F6-04 | Interviewer (Rahul) | Have a candidate disappear from my queue after I submit feedback | I know my work is done for that candidate | 🔴 Must Have | Submitted `candidateId` added to `submittedCandidateIds`; candidate hidden from queue |
| US-F6-05 | Interviewer (Rahul) | See a success confirmation after submitting a scorecard | I'm confident the feedback was saved | 🟡 Should Have | Success message displayed for 3 seconds after submission |
| US-F6-06 | HR Recruiter (Priya) | Be prevented from advancing a candidate until interviewer feedback is submitted | Stage-gate ensures completeness before progression | 🔴 Must Have | Advance blocked when `candidate.status !== 'Ready'` |

---

### F7 — Real-Time Notifications

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F7-01 | HR Recruiter (Priya) | See a notification badge on the bell icon when a new application arrives | I know immediately when someone applies | 🔴 Must Have | Unread badge count increments in real time without page refresh |
| US-F7-02 | HR Recruiter (Priya) | Click the notification bell to see a dropdown of all recent alerts | I can review what happened without navigating away | 🔴 Must Have | Dropdown renders list of notifications with type label and timestamp |
| US-F7-03 | Any authenticated user | Mark all notifications as read with one click | I can clear the badge counter once I've reviewed alerts | 🟡 Should Have | "Mark all as read" updates Firestore; badge resets to 0 |
| US-F7-04 | Interviewer (Rahul) | Receive a notification when I'm assigned a new candidate to interview | I'm informed of new assignments without checking daily | 🟡 Should Have | Notification created in Firestore when stage is assigned to interviewer |
| US-F7-05 | HR Recruiter (Priya) | Be notified when an interviewer submits candidate feedback | I know when a candidate is ready to advance | 🟡 Should Have | Notification created on feedback submission; HR badge increments |

---

### F8 — Executive Analytics & Candidate Comparison Matrix

| ID | As a… | I want to… | So that… | Priority | Acceptance Criteria |
|----|-------|-----------|----------|----------|---------------------|
| US-F8-01 | Executive (Karan) | See average time-to-hire as a KPI card | I can benchmark recruiting speed | 🔴 Must Have | `avgTimeToHire` computed from `hiredAt - createdAt`; displayed in days |
| US-F8-02 | Executive (Karan) | See total live candidates with a hired/active/rejected breakdown | I understand pipeline health at a glance | 🔴 Must Have | `allCandidates.length` plus sub-counts displayed on KPI cards |
| US-F8-03 | Executive (Karan) | See an offer acceptance rate percentage | I can identify hiring drop-off | 🔴 Must Have | `hired / (hired + failed) × 100%` computed and displayed |
| US-F8-04 | Executive (Karan) | See how many people were hired in the current month | I track month-on-month hiring velocity | 🔴 Must Have | Filter `hiredAt` to current calendar month and display count |
| US-F8-05 | Executive (Karan) | View a stage funnel chart across all jobs | I see where candidates are dropping out | 🔴 Must Have | Bar chart per stage + job; height proportional to candidate count |
| US-F8-06 | Hiring Manager (Anjali) | Compare candidates side-by-side on AI score and interviewer score | I can make objective final-round decisions | 🟡 Should Have | Comparison matrix table shows candidates, scores, and stage reached |
| US-F8-07 | Executive (Karan) | See total open positions and which role has the highest hire rate | I understand headcount demand | 🟡 Should Have | Open positions count card; top performing job calculated |

---

## 6. Project Plan (Template)

### 6.1 Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | HireZone |
| **Project Sponsor** | TBD (Organisation Leadership) |
| **Project Manager** | TBD |
| **Lead Developer** | TBD |
| **Start Date** | TBD |
| **Target Go-Live (Sprint 1)** | TBD |
| **Repository** | `Captaindol5/hirezone` |
| **Deployment Target** | Vercel (Frontend) + Firebase (Backend) |

---

### 6.2 Scope Statement

**In Scope (Sprint 1):**
- Authentication & Role-Based Portal Routing
- AI-Powered Resume Screening & Bias Guardrails
- Job Postings & Careers Page
- Custom Interview Pipeline Builder
- Interactive Kanban Board & Stage-Gate Enforcement
- Interviewer Feedback Portal & Scorecard Submission
- Real-Time Notifications
- Executive Analytics & Candidate Comparison Matrix

**Out of Scope (Sprint 1):**
- Candidate self-service portal (post-application tracking for candidates)
- Video interview integration
- Calendar/scheduling integration (e.g., Google Calendar)
- HRIS integrations (e.g., Workday, BambooHR)
- Mobile native app
- Advanced ML model training (uses third-party AI API)
- Bulk resume import / batch processing
- Multi-language (i18n) support

---

### 6.3 Work Breakdown Structure (WBS)

```
HireZone Sprint 1
│
├── 1. Project Foundation
│   ├── 1.1 Repository setup (Vite + React)
│   ├── 1.2 Firebase project provisioning (Auth + Firestore)
│   ├── 1.3 Firestore security rules
│   ├── 1.4 Vercel deployment config
│   └── 1.5 Design system & global CSS
│
├── 2. Authentication Module (F1)
│   ├── 2.1 Login page UI
│   ├── 2.2 Firebase Auth integration
│   ├── 2.3 AuthContext (role fetching)
│   ├── 2.4 ProtectedRoute component
│   └── 2.5 Role-based redirect logic
│
├── 3. Public Pages (F3)
│   ├── 3.1 Landing page
│   ├── 3.2 Features page
│   ├── 3.3 Careers page (job listing)
│   └── 3.4 Job application form
│
├── 4. HR Pipeline Portal (F4 + F5)
│   ├── 4.1 Sidebar + tab navigation
│   ├── 4.2 Job management (CRUD)
│   ├── 4.3 Stage management (CRUD + assignment)
│   ├── 4.4 Candidate intake (manual add)
│   ├── 4.5 Kanban board view
│   ├── 4.6 Candidate directory view
│   ├── 4.7 Advance / Fail / Hire actions
│   └── 4.8 Stage-gate enforcement
│
├── 5. AI Screening Module (F2)
│   ├── 5.1 PDF upload UI
│   ├── 5.2 AI service integration
│   ├── 5.3 Bias guardrail logic
│   └── 5.4 Results display & Firestore save
│
├── 6. Interviewer Portal (F6)
│   ├── 6.1 Assigned candidate filter
│   ├── 6.2 Candidate profile display
│   ├── 6.3 Scorecard form
│   └── 6.4 Feedback submission & queue update
│
├── 7. Notifications Module (F7)
│   ├── 7.1 NotificationBell component
│   ├── 7.2 Firestore notification listener
│   ├── 7.3 Mark as read action
│   └── 7.4 Notification creation triggers
│
├── 8. Analytics Portal (F8)
│   ├── 8.1 KPI card components
│   ├── 8.2 Stage funnel chart
│   ├── 8.3 Candidate comparison matrix
│   └── 8.4 Job performance table
│
└── 9. QA & Deployment
    ├── 9.1 Integration testing
    ├── 9.2 Firestore rules testing
    ├── 9.3 UAT with representative users
    └── 9.4 Production deployment (Vercel)
```

---

### 6.4 Sprint 1 Milestone Schedule

| Milestone | Description | Target |
|-----------|-------------|--------|
| M1 | Project foundation & Firebase provisioned | Week 1 |
| M2 | Auth + role routing complete | Week 1 |
| M3 | Public pages (Landing, Careers, Apply) live | Week 2 |
| M4 | HR Pipeline Portal — job & stage management | Week 3 |
| M5 | Kanban board + stage-gate enforcement | Week 3 |
| M6 | AI Screening Portal functional | Week 4 |
| M7 | Interviewer Portal + scorecard submission | Week 4 |
| M8 | Notifications module live | Week 5 |
| M9 | Analytics Portal + KPI cards + funnel | Week 5 |
| M10 | QA, UAT, production deployment | Week 6 |

---

### 6.5 Resource Plan

| Role | Responsibility | Count |
|------|---------------|-------|
| Project Manager | Planning, tracking, stakeholder comms | 1 |
| Frontend Developer | React components, UI, routing | 1–2 |
| Backend Developer | Firestore schema, security rules, AI integration | 1 |
| UI/UX Designer | Design system, wireframes, user testing | 1 |
| QA Engineer | Integration tests, UAT coordination | 1 |
| AI/ML Engineer | Resume screening service, bias guardrail logic | 1 |

---

### 6.6 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 + Vite | SPA framework & build tool |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Routing** | React Router v6 | Client-side routing |
| **Authentication** | Firebase Auth | Secure user login & session |
| **Database** | Cloud Firestore | NoSQL real-time database |
| **Real-time** | Firestore `onSnapshot` | Live data subscriptions |
| **AI Screening** | External AI API | Resume evaluation & scoring |
| **Deployment** | Vercel | Hosting + CDN |
| **Icons** | Lucide React | Icon library |
| **State Management** | React Context API | Global auth + theme state |

---

### 6.7 Firestore Data Model

```
/jobs/{jobId}
  ├── title: string
  ├── department: string
  ├── expiresAt: timestamp
  ├── passingThreshold: number (0–100)
  ├── questions: string[]
  ├── stages: Stage[]
  │     ├── id: string
  │     ├── name: string
  │     └── interviewer: interviewerId (ref to /interviewers)
  └── candidates: Candidate[]
        ├── id: string
        ├── name, email, phone: string
        ├── cvUrl, photoUrl: string
        ├── notes: string
        ├── stage: stageId
        ├── status: 'Active' | 'Ready' | 'Hired' | 'Failed'
        ├── aiScore: number
        ├── feedback: { score, feedback, submittedAt }
        ├── createdAt: timestamp
        └── hiredAt: timestamp

/interviewers/{interviewerId}
  ├── name: string
  └── email: string

/users/{userId}
  ├── name: string
  ├── email: string
  └── role: 'hr' | 'interviewer' | 'manager' | 'hiring_manager'

/notifications/{notifId}
  ├── userId: string
  ├── type: string
  ├── message: string
  ├── read: boolean
  └── createdAt: timestamp
```

---

### 6.8 Acceptance Criteria Summary

| Feature | Must-Have Stories | Should-Have Stories | Total Stories |
|---------|------------------|--------------------|--------------:|
| F1 — Auth & Routing | 4 | 1 | 6 |
| F2 — AI Screening | 4 | 2 | 6 |
| F3 — Careers & Apply | 5 | 1 | 6 |
| F4 — Pipeline Builder | 5 | 2 | 7 |
| F5 — Kanban & Stage-Gate | 5 | 2 | 7 |
| F6 — Interviewer Scorecard | 5 | 1 | 6 |
| F7 — Notifications | 2 | 3 | 5 |
| F8 — Analytics | 5 | 2 | 7 |
| **Total** | **35** | **14** | **50** |

---

### 6.9 Definition of Done

A feature is considered **Done** when:
- [ ] All Must-Have user stories for the feature pass acceptance criteria
- [ ] Firestore security rules validated (no unauthorised reads/writes)
- [ ] Component renders correctly in both light and dark theme
- [ ] No console errors in production build
- [ ] Responsive layout verified on desktop (min. 1280px)
- [ ] Code reviewed and merged to main branch
- [ ] Deployed to Vercel production environment

---

## 7. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|-----------|
| R1 | AI service API rate limits or downtime | Medium | High | Add retry logic; cache last results; graceful fallback UI |
| R2 | Firestore security rules misconfiguration | Medium | High | Dedicated rules test suite; staged rule rollout |
| R3 | Role-based access bypass | Low | Critical | `ProtectedRoute` enforced on every portal; server-side rules as last line |
| R4 | Candidate data privacy breach (PII) | Low | Critical | Bias guardrails anonymise before AI call; Firestore rules restrict access |
| R5 | PDF extraction failure on unusual resume formats | Medium | Medium | Error modal + manual data entry fallback |
| R6 | Scope creep extending Sprint 1 timeline | Medium | Medium | Strict out-of-scope list; backlog for Sprint 2 |
| R7 | Real-time listener cost (Firestore reads) | Low | Medium | Listener detach on unmount; paginate large collections |

---

## 8. Out of Scope (Sprint 1)

The following are explicitly **deferred to a future sprint**:

| Feature | Reason for Deferral |
|---------|---------------------|
| Candidate self-service portal | Requires separate auth flow & UI; deferred per Sprint 1 scope decision |
| Video interview integration | Third-party API dependency; scope risk |
| Calendar & scheduling | Complex integration; not core to MVP |
| HRIS integrations | Enterprise feature; post-MVP |
| Mobile native app | Separate platform; post-MVP |
| Multi-language support | Not required for initial users |
| Bulk resume import | Edge case for MVP users |
| Custom email templates | Basic confirmation email sufficient for MVP |

---

*Document Version: 1.0 | Last Updated: September 2026 | HireZone Sprint 1*
