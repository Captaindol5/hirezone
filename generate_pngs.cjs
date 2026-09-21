const https = require('https');
const fs = require('fs');
const path = require('path');

const diagrams = {
  'high_level_use_case': "flowchart LR\n    Candidate([Candidate])\n    HR([HR / Recruiter])\n    Interviewer([Interviewer])\n    Manager([Hiring Manager])\n\n    subgraph HireZone Platform\n        Apply(Apply for Jobs)\n        Auth(Login and Role Routing)\n        Screening(AI Resume Screening)\n        Pipeline(Custom Pipelines)\n        Kanban(Interactive Kanban Board)\n        Feedback(Feedback Portal)\n        Notifications(Real-time Notifications)\n        Analytics(Executive Analytics)\n    end\n\n    Candidate --> Apply\n    HR --> Auth\n    Interviewer --> Auth\n    Manager --> Auth\n    HR --> Pipeline\n    HR --> Kanban\n    HR --> Screening\n    Interviewer --> Feedback\n    Manager --> Analytics",

  'auth_use_case': "flowchart LR\n    User([User]) --> Login(Login)\n    Login --> Verify(Verify Firebase Auth)\n    Verify --> FetchRole(Fetch Role from Firestore)\n    FetchRole --> HR(HR Portal)\n    FetchRole --> Interviewer(Interviewer Portal)\n    FetchRole --> Manager(Manager Portal)",

  'auth_activity': "stateDiagram-v2\n    [*] --> Login\n    Login --> Authenticate\n    Authenticate --> FetchRole\n    FetchRole --> RoutePortal\n    RoutePortal --> [*]",

  'auth_sequence': "sequenceDiagram\n    actor User\n    participant App\n    participant Firebase\n    participant Firestore\n    User->>App: Enter Credentials\n    App->>Firebase: Authenticate\n    Firebase-->>App: Auth Token\n    App->>Firestore: Get User Role\n    Firestore-->>App: Role Data\n    App->>User: Route to Portal",

  'ai_screening_use_case': "flowchart LR\n    HR([HR User]) --> Upload(Upload Resume PDF)\n    HR --> ViewResults(View Screening Results)\n    System([AI System]) --> Extract(Extract PDF Text)\n    System --> Anonymize(Apply Bias Guardrails)\n    System --> Evaluate(AI Evaluation and Scoring)\n    Upload -.-> Extract",

  'ai_screening_activity': "stateDiagram-v2\n    [*] --> UploadResume\n    UploadResume --> ExtractText\n    ExtractText --> ApplyGuardrails\n    ApplyGuardrails --> AIEvaluation\n    AIEvaluation --> GenerateScore\n    GenerateScore --> SaveResults\n    SaveResults --> [*]",

  'ai_screening_sequence': "sequenceDiagram\n    actor HR\n    participant UI as Screening Portal\n    participant PDF as PDF Extractor\n    participant AI as AI Service\n    participant DB as Database\n    HR->>UI: Upload Resume PDF\n    UI->>PDF: Extract Text\n    PDF-->>UI: Raw Text\n    UI->>AI: Anonymize and Evaluate\n    AI-->>UI: Score and Insights\n    UI->>DB: Save Results\n    UI-->>HR: Display Results",

  'careers_use_case': "flowchart LR\n    Candidate([Candidate]) --> Browse(Browse Careers Page)\n    Candidate --> ViewJob(View Job Details)\n    Candidate --> Apply(Submit Application)\n    HR([HR]) --> ViewApps(View Applications in Pipeline)",

  'careers_activity': "stateDiagram-v2\n    [*] --> CareersPage\n    CareersPage --> ViewJob\n    ViewJob --> FillForm\n    FillForm --> Validate\n    state Validate <<choice>>\n    Validate --> FillForm : Invalid\n    Validate --> SaveDB : Valid\n    SaveDB --> SendEmail\n    SendEmail --> [*]",

  'careers_sequence': "sequenceDiagram\n    actor Candidate\n    participant Portal as Careers Page\n    participant DB as Database\n    participant Email as Email Service\n    Candidate->>Portal: Browse Jobs\n    Portal-->>Candidate: Job Listings\n    Candidate->>Portal: Submit Application\n    Portal->>DB: Save Application\n    DB-->>Portal: Success\n    Portal->>Email: Send Confirmation\n    Email-->>Candidate: Confirmation Email",

  'notifications_use_case': "flowchart LR\n    System([System Events]) --> Trigger(Trigger Notification)\n    Trigger --> SaveDB(Save to Database)\n    SaveDB --> ShowBadge(Show Bell Badge)\n    User([User]) --> ViewList(View Notifications)\n    User --> MarkRead(Mark as Read)",

  'notifications_activity': "stateDiagram-v2\n    [*] --> EventOccurs\n    EventOccurs --> SaveNotification\n    SaveNotification --> UpdateBadge\n    UpdateBadge --> UserClicksBell\n    UserClicksBell --> ShowDropdown\n    ShowDropdown --> MarkAsRead\n    MarkAsRead --> ClearBadge\n    ClearBadge --> [*]",

  'notifications_sequence': "sequenceDiagram\n    participant Event as System Event\n    participant DB as Firestore\n    participant Bell as Notification Bell\n    actor User\n    Event->>DB: Insert Notification\n    DB-->>Bell: Real-time Update\n    Bell-->>User: Show Badge\n    User->>Bell: Click Bell\n    Bell-->>User: Show Dropdown\n    User->>Bell: Mark as Read\n    Bell->>DB: Update Status",

  'pipelines_use_case': "flowchart LR\n    HR([HR]) --> Create(Create Pipeline)\n    HR --> EditStages(Define Stages)\n    HR --> AssignJob(Assign to Job Position)\n    System([System]) --> ApplyPipeline(Apply to Candidates)",

  'pipelines_activity': "stateDiagram-v2\n    [*] --> NewPipeline\n    NewPipeline --> NamePipeline\n    NamePipeline --> AddStages\n    AddStages --> ConfigureStage\n    ConfigureStage --> SavePipeline\n    SavePipeline --> [*]",

  'pipelines_sequence': "sequenceDiagram\n    actor HR\n    participant UI as Pipeline Config\n    participant DB as Database\n    HR->>UI: Create New Pipeline\n    HR->>UI: Define Stages\n    HR->>UI: Save Configuration\n    UI->>DB: Save Pipeline\n    DB-->>UI: Confirmed\n    UI-->>HR: Pipeline Active",

  'kanban_use_case': "flowchart LR\n    HR([HR]) --> ViewBoard(View Kanban Board)\n    HR --> MoveCard(Move Candidate Card)\n    HR --> ViewProfile(View Candidate Profile)\n    System([System]) --> Enforce(Enforce Stage Gates)",

  'kanban_activity': "stateDiagram-v2\n    [*] --> LoadBoard\n    LoadBoard --> DisplayCards\n    DisplayCards --> DragCard\n    DragCard --> CheckGate\n    state CheckGate <<choice>>\n    CheckGate --> UpdateStage : Gate Passed\n    CheckGate --> BlockMove : Gate Failed\n    UpdateStage --> [*]\n    BlockMove --> DisplayCards",

  'kanban_sequence': "sequenceDiagram\n    actor HR\n    participant UI as Kanban Board\n    participant DB as Database\n    HR->>UI: Drag Candidate to Stage\n    UI->>DB: Check Stage Gate Rules\n    DB-->>UI: Gate Status\n    UI->>DB: Update Candidate Stage\n    DB-->>UI: Board Synced\n    UI-->>HR: Updated Board",

  'feedback_use_case': "flowchart LR\n    Interviewer([Interviewer]) --> ViewCandidate(View Candidate Profile)\n    Interviewer --> FillScorecard(Fill Scorecard)\n    Interviewer --> Submit(Submit Feedback)\n    HR([HR]) --> ViewFeedback(View Feedback Reports)",

  'feedback_activity': "stateDiagram-v2\n    [*] --> SelectCandidate\n    SelectCandidate --> OpenScorecard\n    OpenScorecard --> RateCategories\n    RateCategories --> WriteComments\n    WriteComments --> Submit\n    Submit --> NotifyHR\n    NotifyHR --> [*]",

  'feedback_sequence': "sequenceDiagram\n    actor Interviewer\n    participant UI as Feedback Portal\n    participant DB as Database\n    participant HR as HR Portal\n    Interviewer->>UI: Open Candidate Scorecard\n    UI->>DB: Load Candidate Data\n    DB-->>UI: Profile Info\n    Interviewer->>UI: Fill and Submit Scorecard\n    UI->>DB: Save Feedback\n    DB-->>HR: Notify HR of Feedback",

  'analytics_use_case': "flowchart LR\n    Manager([Manager]) --> Dashboard(View Analytics Dashboard)\n    Manager --> Compare(Candidate Comparison Matrix)\n    Manager --> Pipeline(Pipeline Performance Metrics)\n    System([System]) --> Aggregate(Aggregate Hiring Data)",

  'analytics_activity': "stateDiagram-v2\n    [*] --> OpenDashboard\n    OpenDashboard --> LoadData\n    LoadData --> RenderCharts\n    RenderCharts --> ShowMatrix\n    ShowMatrix --> FilterData\n    FilterData --> RenderCharts",

  'analytics_sequence': "sequenceDiagram\n    actor Manager\n    participant UI as Analytics Portal\n    participant DB as Database\n    Manager->>UI: Open Analytics\n    UI->>DB: Aggregate Hiring Data\n    DB-->>UI: Stats and Metrics\n    UI-->>Manager: Charts and Matrix\n    Manager->>UI: Filter by Role or Date\n    UI->>DB: Re-query\n    DB-->>UI: Filtered Results\n    UI-->>Manager: Updated View"
};

const dir = path.join(__dirname, 'UML_Diagrams');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

// Clear existing files
fs.readdirSync(dir).forEach(function(file) {
  fs.unlinkSync(path.join(dir, file));
});
console.log('Cleared old files.');

function downloadImage(name, code) {
  return new Promise(function(resolve, reject) {
    var state = { code: code, mermaid: { theme: 'default' } };
    var base64Str = Buffer.from(JSON.stringify(state)).toString('base64');
    var url = 'https://mermaid.ink/img/' + base64Str;
    var filePath = path.join(dir, name + '.png');
    var file = fs.createWriteStream(filePath);
    https.get(url, function(response) {
      if (response.statusCode !== 200) {
        reject(new Error('Status Code ' + response.statusCode));
        return;
      }
      response.pipe(file);
      file.on('finish', function() {
        file.close();
        resolve(filePath);
      });
    }).on('error', function(err) {
      fs.unlink(filePath, function() {});
      reject(err);
    });
  });
}

async function main() {
  var count = 0;
  var total = Object.keys(diagrams).length;
  console.log('Downloading ' + total + ' PNG diagrams...');
  for (var entry of Object.entries(diagrams)) {
    var name = entry[0];
    var code = entry[1];
    try {
      await downloadImage(name, code);
      console.log('OK ' + name + '.png');
      count++;
    } catch (err) {
      console.error('FAIL ' + name + '.png: ' + err.message);
    }
  }
  console.log('\nDone! ' + count + ' / ' + total + ' PNGs saved.');
}

main();
