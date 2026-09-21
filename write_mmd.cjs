const fs = require('fs');
const path = require('path');

const diagrams = {
  'high_level_use_case.mmd': `flowchart LR
    Candidate([Candidate])
    HR([HR / Recruiter])
    Interviewer([Interviewer])
    Manager([Hiring Manager])

    subgraph HireZone Platform
        Apply(Apply for Jobs)
        ViewStatus(Track Application Status)
        Screening(AI Resume Screening & Bias Guardrails)
        Pipeline(Manage Candidate Pipeline)
        ConductInterview(Conduct & Score Interviews)
        ViewAnalytics(View Recruitment Analytics)
    end

    Candidate --> Apply
    Candidate --> ViewStatus
    HR --> Pipeline
    HR --> Screening
    Interviewer --> ConductInterview
    Manager --> ViewAnalytics`,
  'feature1_use_case.mmd': `flowchart LR
    HR([HR User])
    System([System AI])

    subgraph AI Screening Module
        Upload(Upload Candidate Resumes)
        Extract(Extract PDF Data)
        Anonymize(Apply Bias Guardrails / Anonymize)
        Evaluate(AI Evaluation & Scoring)
        ViewResults(View Screening Results)
    end

    HR --> Upload
    HR --> ViewResults
    System --> Extract
    System --> Anonymize
    System --> Evaluate
    Upload -.-> Extract`,
  'feature1_activity.mmd': `stateDiagram-v2
    [*] --> UploadResume: HR Uploads Resume
    UploadResume --> ExtractPDF: System reads PDF content
    ExtractPDF --> ApplyGuardrails: Remove PII (Name, Gender, Age)
    ApplyGuardrails --> AIEvaluation: Send anonymized data to AI Service
    AIEvaluation --> GenerateScore: AI scores against Job Description
    GenerateScore --> SaveResults: Store in Database
    SaveResults --> NotifyHR: Trigger Notification
    NotifyHR --> [*]`,
  'feature1_sequence.mmd': `sequenceDiagram
    actor HR
    participant UI as Screening Portal
    participant PDFService as PDF Extractor
    participant AIService as AI Screening Service
    participant DB as Database
    
    HR->>UI: Upload Candidate Resume (PDF)
    UI->>PDFService: Extract text from PDF
    PDFService-->>UI: Raw Text Data
    UI->>AIService: Process & Anonymize (Bias Guardrails)
    AIService-->>UI: Anonymized Profile
    UI->>AIService: Evaluate against Job Description
    AIService-->>UI: Match Score & Insights
    UI->>DB: Save Screening Results
    DB-->>UI: Confirmation
    UI-->>HR: Display Results & Score`,
  'feature2_use_case.mmd': `flowchart LR
    Candidate([Candidate])

    subgraph Job Application Flow
        Browse(Browse Careers Page)
        ViewJob(View Job Details)
        FillForm(Fill Application Form)
        Submit(Submit Application)
        ReceiveEmail(Receive Confirmation Email)
    end

    Candidate --> Browse
    Candidate --> ViewJob
    Candidate --> FillForm
    Candidate --> Submit`,
  'feature2_activity.mmd': `stateDiagram-v2
    [*] --> BrowseJobs: Candidate visits Careers Page
    BrowseJobs --> SelectJob: Clicks on a Job
    SelectJob --> ViewDetails: Reads Job Description
    ViewDetails --> ApplyClick: Clicks Apply
    ApplyClick --> FillForm: Enters Details & Attaches Resume
    FillForm --> SubmitApp: Submits Form
    SubmitApp --> Validate: System validates input
    
    state Validate_Choice <<choice>>
    Validate --> Validate_Choice
    Validate_Choice --> FillForm: Invalid (Show Errors)
    Validate_Choice --> SaveDB: Valid
    
    SaveDB --> SendEmail: System sends confirmation email
    SendEmail --> [*]`,
  'feature2_sequence.mmd': `sequenceDiagram
    actor Candidate
    participant CareersPage as Careers Page
    participant AppForm as Job Application Form
    participant DB as Database
    participant Email as Email Service
    
    Candidate->>CareersPage: Browse open roles
    CareersPage-->>Candidate: Display Job Listings
    Candidate->>AppForm: Select role & Open Form
    Candidate->>AppForm: Enter details & Upload Resume
    Candidate->>AppForm: Click Submit
    AppForm->>DB: Save Application Data
    DB-->>AppForm: Success Response
    AppForm->>Email: Trigger Confirmation Email
    Email-->>Candidate: Email Sent
    AppForm-->>Candidate: Show Success Modal`,
  'feature3_use_case.mmd': `flowchart LR
    User([Authenticated User])
    System([Auth Context])

    subgraph Portal Routing
        Login(Login)
        CheckRole(Determine Role)
        RouteHR(Route to HR Pipeline)
        RouteCand(Route to Candidate Portal)
        RouteInt(Route to Interviewer Portal)
        RouteMgr(Route to Manager Analytics)
    end

    User --> Login
    Login --> CheckRole
    System --> CheckRole
    CheckRole --> RouteHR
    CheckRole --> RouteCand
    CheckRole --> RouteInt
    CheckRole --> RouteMgr`,
  'feature3_activity.mmd': `stateDiagram-v2
    [*] --> Login: User enters credentials
    Login --> Authenticate: Verify with Firebase Auth
    Authenticate --> FetchRole: Get user role from Firestore
    
    state Role_Choice <<choice>>
    FetchRole --> Role_Choice
    
    Role_Choice --> HRPortal: role == 'hr'
    Role_Choice --> CandidatePortal: role == 'candidate'
    Role_Choice --> InterviewerPortal: role == 'interviewer'
    Role_Choice --> ManagerPortal: role == 'manager'
    
    HRPortal --> [*]
    CandidatePortal --> [*]
    InterviewerPortal --> [*]
    ManagerPortal --> [*]`,
  'feature3_sequence.mmd': `sequenceDiagram
    actor User
    participant AuthUI as Login Page
    participant AuthCtx as AuthContext
    participant DB as Firestore
    participant Router as App Router
    
    User->>AuthUI: Enter Email & Password
    AuthUI->>AuthCtx: Authenticate User
    AuthCtx->>DB: Fetch User Document (for Role)
    DB-->>AuthCtx: Return User Data { role: 'hr' }
    AuthCtx-->>AuthUI: Login Successful
    AuthUI->>Router: Redirect based on role
    Router-->>User: Display HR Pipeline Portal`,
  'feature4_use_case.mmd': `flowchart LR
    User([User])
    System([System Events])

    subgraph Notifications
        Trigger(Trigger Notification)
        Display(Display Bell with Badge)
        Read(Mark as Read)
        ViewList(View Notifications Dropdown)
    end

    System --> Trigger
    Trigger --> Display
    User --> ViewList
    User --> Read`,
  'feature4_activity.mmd': `stateDiagram-v2
    [*] --> EventOccurs: E.g., New Application submitted
    EventOccurs --> CreateNotification: Save notification to DB
    CreateNotification --> UpdateUI: Increment unread badge counter
    UpdateUI --> UserClicksBell: User clicks notification bell
    UserClicksBell --> ShowDropdown: Display list of notifications
    ShowDropdown --> MarkAsRead: User clicks 'Mark all as read'
    MarkAsRead --> ClearBadge: Reset unread counter to 0
    ClearBadge --> [*]`,
  'feature4_sequence.mmd': `sequenceDiagram
    participant Event as System Event (e.g. New App)
    participant DB as Firestore
    participant Bell as NotificationBell UI
    actor User
    
    Event->>DB: Insert new notification record
    DB-->>Bell: Real-time listener triggers UI update
    Bell-->>User: Shows red badge with unread count
    User->>Bell: Clicks Bell Icon
    Bell-->>User: Renders dropdown with alerts
    User->>Bell: Clicks "Mark as Read"
    Bell->>DB: Update notifications status to 'read'
    DB-->>Bell: Acknowledge update
    Bell-->>User: Hide red badge`
};

const dir = path.join(__dirname, 'UML_Diagrams');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

for (const [filename, content] of Object.entries(diagrams)) {
    fs.writeFileSync(path.join(dir, filename), content);
}
console.log('Successfully wrote .mmd files to UML_Diagrams');
