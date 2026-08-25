# Firebase setup guide for HireZone

This project is ready to be connected to a Firebase project for real authentication and Firestore-backed hiring workflows.

## 1. Create or open your Firebase project

1. Go to https://console.firebase.google.com/
2. Create a new project or select an existing one.
3. Enable these Firebase services:
   - Authentication
   - Firestore Database

## 2. Add a web app

1. In the Firebase console, click the web icon `</>`.
2. Register the app with a name such as `HireZone Web`.
3. Copy the configuration object.
4. Replace the values in `src/firebase/config.js` with your project config.

Example:

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 3. Enable Authentication providers

In Firebase Authentication, enable:
- Email/password

For production, you can also add Google Sign-In later if desired.

## 4. Create the Firestore collections

Create the following collections:

### users
Each document should use the Firebase Auth UID as the document ID.

Example document:

```json
{
  "email": "candidate@hirezone.com",
  "role": "candidate",
  "name": "Sarah Connor",
  "createdAt": "2026-08-14T00:00:00.000Z"
}
```

Valid roles:
- candidate
- hr
- hiring_manager
- interviewer
- manager

### jobs
Each job document should include:

```json
{
  "title": "Senior Frontend Engineer",
  "location": "Remote · US / EU",
  "type": "Frontend",
  "status": "Open",
  "stages": [
    { "id": "initial-screening", "name": "Initial Screening", "interviewerId": "screening-lead" },
    { "id": "technical-test", "name": "Technical Test", "interviewerId": "technical-lead" }
  ],
  "createdAt": "2026-08-14T00:00:00.000Z"
}
```

### candidates
Each candidate document stores the current stage and evaluation state:

```json
{
  "jobId": "job-frontend",
  "name": "Alex Mercer",
  "stage": "technical-test",
  "score": 0,
  "feedback": "",
  "status": "Pending",
  "hasSubmittedFeedback": false,
  "assignedInterviewerId": "technical-lead"
}
```

## 5. Role-based access model

Use the `users/{uid}.role` field to control access.

Suggested mapping:
- Candidate portal → `candidate`
- HR portal → `hr` or `hiring_manager`
- Interviewer portal → `interviewer`
- Manager portal → `manager`

You can also conditionally allow managers to view the HR dashboard in read-only mode by checking both roles in the route guard.

## 6. Rules for Firestore security

Example rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function hasRole(role) {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    match /users/{uid} {
      allow read, write: if isSignedIn() && uid == request.auth.uid;
    }

    match /jobs/{jobId} {
      allow read: if isSignedIn();
      allow write: if hasRole('hr') || hasRole('hiring_manager');
    }

    match /candidates/{candidateId} {
      allow read: if isSignedIn();
      allow write: if hasRole('hr') || hasRole('hiring_manager') || hasRole('interviewer');
    }
  }
}
```

## 7. Demo data and local development

The current app includes demo data in `src/data/mockData.js` so you can build and test the UI immediately without a live Firebase connection. This is useful for design and workflow validation.

When ready to fully connect, move the same structure into Firestore and replace the localStorage logic with Firestore reads/writes.

## 8. Recommended next steps

1. Create Firebase Auth users for:
   - candidate@hirezone.com
   - hr@hirezone.com
   - hiringmanager@hirezone.com
   - interviewer@hirezone.com
   - manager@hirezone.com
2. Create matching user documents in Firestore.
3. Seed job and candidate records.
4. Assign stage-specific interviewer IDs.
5. Test login and role-based access end to end.

## 9. Important note

The app is currently built as a polished demo system with local state, but it is structured so it can be migrated to real Firebase with minimal changes once the project configuration is completed.
