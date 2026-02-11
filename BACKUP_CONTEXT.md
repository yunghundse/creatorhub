# CreatorHub Backup Context File
## Stand: 2026-02-11 | Version 4.0

## PROJEKT-ÜBERBLICK
CreatorHub ist ein SaaS Creator-Management-Dashboard (React 18 + Vite 7 + Firebase + Vercel).
4 Rollen: Manager, Model, Influencer, Cutter. Admin: yunghundse@gmail.com

## TECH STACK
- Frontend: React 18 + Vite 7
- Auth: Firebase Auth (Email/Password + Google, signInWithRedirect für Vercel/Mobile)
- Database: Firebase Firestore (real-time via onSnapshot)
- Hosting: Vercel mit SPA-Routing (vercel.json)
- Styling: Inline CSS + Glassmorphism Cream/Beige Theme

## FIREBASE CONFIG
```js
apiKey: "AIzaSyDMHZMVx3AYoL-Fy4u5CuIeHYbp4PvB9cw"
authDomain: "project-9fc351c3-e213-4686-b5d.firebaseapp.com"
projectId: "project-9fc351c3-e213-4686-b5d"
storageBucket: "project-9fc351c3-e213-4686-b5d.firebasestorage.app"
messagingSenderId: "459275533289"
appId: "1:459275533289:web:7a63efcacd0a41c07d6978"
```

## DATEISTRUKTUR
```
creatorhub/
├── src/
│   ├── App.jsx              # Router + ProtectedRoute + RoleGuard
│   ├── firebase.js          # Firebase init, auth, db, googleProvider exports
│   ├── index.css            # Global styles + animations
│   ├── main.jsx             # Entry point (BrowserRouter)
│   ├── components/
│   │   ├── Layout.jsx       # Role-based nav (bottom nav + sidebar), Team-Header
│   │   ├── Card.jsx         # Glassmorphism card component
│   │   ├── Button.jsx       # Primary/secondary/danger button
│   │   └── ProgressBar.jsx  # Progress bar component
│   └── pages/
│       ├── Home.jsx         # Dashboard mit Firestore-Daten (events, content, finances)
│       ├── Content.jsx      # Content-Pipeline (Editing→Review→Ready), Firestore CRUD
│       ├── Finance.jsx      # Finanzen (Plattform-Tracking, Brutto/Netto)
│       ├── CalendarPage.jsx # Kalender (Monatsansicht, Events CRUD)
│       ├── Chat.jsx         # Echtzeit-Chat (Firestore, chatRooms + messages)
│       ├── SettingsPage.jsx # Einstellungen (Sicherheit + Rechtliches)
│       ├── Admin.jsx        # Admin-Panel (User-Mgmt, Maintenance, Revenue)
│       ├── Login.jsx        # Login (signInWithPopup + signInWithRedirect fallback)
│       ├── Register.jsx     # 2-Step Registration (Rolle wählen → Account erstellen)
│       └── dashboard/
│           ├── CompanyPage.jsx    # Firma erstellen, Einladungscodes, Mitglieder
│           ├── CollabPage.jsx     # Aufgaben-Board (Influencer↔Cutter)
│           ├── TrendsPage.jsx     # AI Trend-Engine (TikTok/IG/YT/OF)
│           ├── AssetsPage.jsx     # Asset-Management (URL-basiert, Status-Workflow)
│           ├── AnalyticsPage.jsx  # Business-Analytics (Stats, Charts)
│           ├── RevenueSharePage.jsx    # NEU: Revenue-Split Manager↔Model
│           ├── ApprovalQueuePage.jsx   # NEU: Content-Approval (Model→Manager)
│           ├── AssetLibraryPage.jsx    # NEU: Branding-Assets (Intros/Outros)
│           ├── BrandDealsPage.jsx      # NEU: Brand-Deal CRM
│           └── AuditLogPage.jsx        # NEU: Login/Änderungs-Audit-Logs
├── vercel.json              # SPA rewrites + security headers
├── project_state.json       # Projekt-Status Tracking
├── package.json
└── vite.config.js
```

## FIRESTORE COLLECTIONS
```
users:          uid, email, displayName, photoURL, approved, blocked, role, companyId, createdAt, lastLogin
events:         userId, title, date, time, type, notes, createdAt
content:        userId, title, type, status, progress, deadline, earnings, notes, createdAt
finances:       userId, platform, brutto, netto, month, note, createdAt
chatRooms:      participants[], lastMessage, lastMessageTime, createdAt
chatRooms/{id}/messages: senderId, senderName, text, timestamp
settings/maintenance:    enabled, message, updatedAt
companies:      name, description, ownerId, ownerEmail, inviteCode, abo, createdAt
tasks:          title, description, priority, status, deadline, createdBy, assignedTo, companyId, createdAt
assets:         title, url, type, notes, status, uploadedBy, companyId, createdAt

### NEUE COLLECTIONS (v4.0):
revenueSplits:  companyId, modelId, modelName, platform, brutto, splitPercent, modelShare, managerShare, month, createdBy, createdAt
approvals:      companyId, uploadedBy, uploaderName, title, description, fileUrl, type, status(pending/approved/rejected), feedback, reviewedBy, createdAt, reviewedAt
assetLibrary:   companyId, title, category(intro/outro/sound/font/overlay), url, uploadedBy, createdAt
brandDeals:     companyId, brand, contact, value, deadline, platform, status(negotiation/confirmed/posted/paid), postUrl, notes, createdBy, createdAt
auditLogs:      companyId, userId, userName, action, target, details, timestamp
deadlines:      companyId, title, platform, dueDate, assignedTo, status, createdBy, createdAt
```

## ROLLEN-SYSTEM
```
Manager:    Firma, Models, Analytics, Trends, Assets, Content, Finanzen, Kalender, Chat, Revenue-Split, Approval-Queue, Brand-Deals, Audit-Logs
Model:      Schedule, Assets, Content, Chat, Finanzen, Approval-Upload
Influencer: Collab, Trends, Assets, Content, Finanzen, Kalender, Chat, Asset-Library, Deadlines
Cutter:     Collab(Aufträge), Assets, Content, Kalender, Chat, Asset-Library
Admin:      Alles + Admin-Panel + Maintenance
```

## ABO MODELL
- Free: 1 Teammitglied
- Pro: 5 Teammitglieder
- Business: 10 Teammitglieder

## DESIGN SYSTEM
Cream/Beige Glassmorphism Theme:
- Background: linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)
- Cards: rgba(255,253,247,0.7), backdrop-filter blur(12px), border 1px solid rgba(232,223,211,0.5)
- Primary: #FF6B9D (rosa), Secondary: #F5C563 (gold), Success: #6BC9A0 (grün), Info: #7EB5E6 (blau)
- Text: #2A2420 (dunkel), #5C5349 (mittel), #7A6F62 (label), #A89B8C (placeholder)
- Border: #E8DFD3
- Role Colors: admin=#FF6B9D, manager=#F5C563, model=#FF6B9D, influencer=#7EB5E6, cutter=#6BC9A0

## KEY PATTERNS (für neue Pages)
```jsx
// Standard Page Structure:
import React, { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const NewPage = ({ userData }) => {
  const [data, setData] = useState([])
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'collectionName'), where('companyId', '==', userData?.companyId))
    const unsub = onSnapshot(q, snap => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [user, userData])

  // ... rest of component
}
```

## STYLE TEMPLATES
```js
const inputStyle = {
  width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
  border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
  fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const statCard = {
  textAlign: 'center', padding: '16px',
  background: 'rgba(255,253,247,0.7)',
  borderRadius: '16px', border: '1px solid rgba(232,223,211,0.5)',
}

const badge = (color) => ({
  fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: '600',
  background: `${color}15`, color: color,
})
```

## IMPLEMENTIERTE FEATURES (v3.0 DONE)
1. Auth (Login/Register) mit 2-Step Rollenauswahl + signInWithRedirect
2. Admin-Panel (User-Management, Maintenance Mode)
3. Kalender (Firestore CRUD, Monatsansicht)
4. Chat (Echtzeit, User-zu-User + Admin)
5. Content-Pipeline (Editing→Review→Ready)
6. Finanzen (Plattform-Tracking, Brutto/Netto)
7. Home Dashboard (Echtzeit-Daten)
8. Sicherheit (Passwort ändern, Account löschen)
9. Rechtliches (Impressum/AGB/Datenschutz)
10. Vercel SPA + Security Headers
11. Rollenbasierte Navigation (Layout.jsx)
12. RoleGuard Routenschutz
13. Firmensystem (Erstellen, Einladungscodes, Mitglieder)
14. Collab-Board (Influencer→Cutter Tasks)
15. Trend-Engine (Plattform-Tabs, AI-Vorschläge)
16. Assets-Management (URL-Upload, Status-Workflow)
17. Analytics Dashboard (Stats + Charts)

## NEUE FEATURES (v4.0 — IMPLEMENTIERT)
### Manager & Model Team:
1. ✅ RevenueSharePage — Revenue-Split-Tracker (Manager trägt ein, System berechnet Split)
2. ✅ ApprovalQueuePage — Content-Approval (Model lädt hoch → Manager gibt frei/lehnt ab)

### Influencer & Cutter Team:
3. ✅ AssetLibraryPage — Branding-Assets (Intros, Outros, Sounds, Fonts, Overlays)
4. ✅ DeadlinesPage — Countdown-Widget mit Plattform-Tags und Überfällig-Warnung

### Übergreifend:
5. ✅ Team-Header — "Rolle | Firmenname | Plan" im Header
6. ✅ Layout.jsx Nav erweitert — Neue Pages in Role-based Navigation

### Business:
7. ✅ BrandDealsPage — Brand-Deal CRM (Verhandlung→Bestätigt→Gepostet→Bezahlt)

### Security:
8. ✅ AuditLogPage — Timeline aller Team-Aktionen mit Filter

## NOCH AUSSTEHEND
- Stripe Payment (Free/Pro/Business Checkout)
- Firebase Storage Upload (echte Datei-Uploads)
- Viral-Predictor (Score 1-100)
- Auto-Repurposing (YT→TikTok/IG)
- Timestamp-Feedback (Video-Kommentare)
- Tax-Ready Export
- Model Invite Join (Code eingeben)

## ANLEITUNG FÜR CLAUDE BEI ABSTURZ
1. Lies diese Datei zuerst
2. Lies project_state.json für den aktuellen Status
3. Schaue welche Features noch ✅ fehlen (ohne Häkchen)
4. Arbeite die Features der Reihe nach ab
5. Nutze die STYLE TEMPLATES und KEY PATTERNS oben
6. Jede neue Page muss in App.jsx als Route + in Layout.jsx als Nav-Item eingetragen werden
7. Aktualisiere project_state.json nach jeder Implementierung
8. Führe `npm run build` nach jeder größeren Änderung aus
9. Kopiere fertige Dateien nach /sessions/festive-sharp-ramanujan/mnt/outputs/creatorhub/

## ROUTES (aktuell)
```jsx
// App.jsx Routes:
<Route path="/" element={<Home />} />
<Route path="/content" element={<Content />} />
<Route path="/finanzen" element={<Finance />} />
<Route path="/kalender" element={<CalendarPage />} />
<Route path="/chat" element={<Chat />} />
<Route path="/einstellungen" element={<SettingsPage />} />
<Route path="/admin" element={<Admin />} />
<Route path="/dashboard/company" element={<CompanyPage />} />           // manager
<Route path="/dashboard/models" element={<CompanyPage />} />            // manager
<Route path="/dashboard/collab" element={<CollabPage />} />             // influencer, cutter
<Route path="/dashboard/trends" element={<TrendsPage />} />             // manager, influencer
<Route path="/dashboard/assets" element={<AssetsPage />} />             // all
<Route path="/dashboard/analytics" element={<AnalyticsPage />} />       // manager
<Route path="/dashboard/schedule" element={<CalendarPage />} />         // model

// NEUE ROUTES (v4.0):
<Route path="/dashboard/revenue" element={<RevenueSharePage />} />      // manager
<Route path="/dashboard/approvals" element={<ApprovalQueuePage />} />   // manager, model
<Route path="/dashboard/asset-library" element={<AssetLibraryPage />} />// influencer, cutter
<Route path="/dashboard/brand-deals" element={<BrandDealsPage />} />    // manager
<Route path="/dashboard/audit-log" element={<AuditLogPage />} />        // manager, admin
<Route path="/dashboard/deadlines" element={<DeadlinesPage />} />       // influencer, cutter
```
