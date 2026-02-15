# User Story & Data Collection Map

## מסע המשתמש - מבט-על

```mermaid
flowchart TD
    subgraph DISCOVERY["🔍 גילוי"]
        D1[פרסום / שיתוף חבר]
        D2[דיפ לינק מתוכנית]
        D3[חיפוש אורגני]
    end

    subgraph BOT["🤖 בוט טלגרם"]
        B1["/start → בחירת מגזר"]
        B2["CTA → 'חשב סיכויים באתר'"]
        B3["/rooms → הצטרפות לקהילה"]
        B4["/consent → הסכמה שיווקית"]
        B5["Drip Campaigns → נדנודים"]
    end

    subgraph WEB["🌐 אתר"]
        W1["וויזארד: ציונים + פסיכומטרי + העדפות"]
        W2["תוצאות: סיכויי קבלה"]
        W3["מעקב תוכניות"]
        W4["הסכמה + קהילה"]
    end

    subgraph LINK["🔗 קישור זהויות"]
        L1["קישור בוט ↔ אתר"]
        L2["Gap Analysis אוטומטי"]
        L3["Lead Routing + Temperature"]
    end

    subgraph ADMIN["👁️ ניהול (ShadowNet)"]
        A1["CRM: משתמשים, לידים"]
        A2["Metrics Dashboard: KPIs"]
        A3["Groups Manager: קהילה"]
        A4["Client Portal: שותפים"]
        A5["Signals: לידים חמים"]
    end

    D1 --> B1
    D2 --> B1
    D3 --> W1
    B1 --> B2
    B2 --> W1
    B1 --> B3
    B1 --> B4
    B5 -.->|אוטומטי| B2
    W1 --> W2
    W2 --> W3
    W3 --> W4
    W4 -.->|חזרה לבוט| B3
    B1 -.->|link token| L1
    W1 -.->|link token| L1
    L1 --> L2
    L2 --> L3
    L3 --> A1
    B1 --> A2
    W1 --> A2
    B3 --> A3
    L3 --> A4
    L3 --> A5
```

---

## מה אוספים, מאיפה, ואיפה רואים

### 1. בוט טלגרם → `bot_users`

```mermaid
flowchart LR
    subgraph COLLECT["📥 נקודות איסוף"]
        C1["/start → זיהוי ראשוני"]
        C2["בחירת מגזר"]
        C3["כל הודעה → message_count++"]
        C4["כל פקודה → commands_used[]"]
        C5["הצטרפות לחדר → rooms_joined[]"]
        C6["/consent → הסכמה"]
        C7["Deep Link → תוכנית מקור"]
        C8["Referral → הפניה"]
    end

    subgraph STORE["💾 bot_users"]
        S1["telegram_chat_id"]
        S2["first_name, username"]
        S3["sector"]
        S4["conversation_state + state_data"]
        S5["lead_score, lead_stage"]
        S6["message_count, commands_used"]
        S7["rooms_joined"]
        S8["consent_marketing"]
        S9["deep_link_program_id"]
        S10["referral_code, referred_by, referral_count"]
        S11["drip_stage, drip_last_sent_at"]
        S12["web_user_id → קישור לאתר"]
    end

    C1 --> S1 & S2
    C2 --> S3
    C3 --> S6
    C4 --> S6
    C5 --> S7
    C6 --> S8
    C7 --> S9
    C8 --> S10
```

| שדה | מתי נאסף | handler |
|-----|----------|---------|
| `telegram_chat_id`, `first_name`, `username` | הודעה ראשונה | `middleware.ts → resolveUser()` |
| `sector` | בחירת מגזר (callback) | `start.ts → handleSectorSelection()` |
| `lead_score` | כל פעולה משמעותית | `lead-scoring.ts → updateLeadScore()` |
| `conversation_state` | מעבר בין שלבים | `user-service.ts → updateBotUser()` |
| `web_user_id` | קישור חשבון | `start.ts → handleLinkToken()` |
| `consent_marketing` | `/consent` | `consent.ts → handleConsentCallback()` |
| `rooms_joined` | הצטרפות לקבוצה | `group-events.ts → handleNewMember()` |
| `referral_code` | יצירת משתמש | `middleware.ts → resolveUser()` |
| `drip_stage` | שליחת drip | `drip-campaigns.ts` |
| `commands_used` | כל פקודה | `middleware.ts → logMessage()` |

---

### 2. אתר → `user_profiles` + `localStorage`

```mermaid
flowchart LR
    subgraph COLLECT["📥 נקודות איסוף"]
        C1["וויזארד: ציונים בגרות"]
        C2["וויזארד: פסיכומטרי"]
        C3["וויזארד: העדפות תחום + מוסד"]
        C4["וויזארד: הסכמה"]
        C5["מעקב תוכניות"]
        C6["דיווח באג"]
    end

    subgraph LOCAL["📱 localStorage"]
        L1["bagrut_plus_data"]
        L2["mitlabtim_consent"]
    end

    subgraph DB["💾 user_profiles"]
        D1["bagrut_grades (JSONB)"]
        D2["psycho_score_total/quant/eng"]
        D3["major_subjects[], institution_pref[]"]
        D4["consent_marketing, consent_partners"]
        D5["tracked_programs[]"]
        D6["bagrut_avg_raw"]
    end

    subgraph OTHER["💾 טבלאות נוספות"]
        O1["bug_reports"]
        O2["soft_leads"]
    end

    C1 --> L1 --> D1
    C2 --> L1 --> D2
    C3 --> L1 --> D3
    C4 --> L2 --> D4
    C5 --> L1 --> D5
    C6 --> O1
```

| שדה | מתי נאסף | קובץ |
|-----|----------|------|
| `bagrut_grades` | מילוי ציונים | `BagrutForm.tsx` → `saveUserData()` |
| `psycho_score_*` | מילוי פסיכומטרי | `PsychometricForm.tsx` → `saveUserData()` |
| `major_subjects`, `institution_pref` | וויזארד העדפות | `StepPreferences.tsx` |
| `tracked_programs` | לחיצת "מעקב" | `TrackedDegreesContext.tsx` |
| `consent_*` | שלב הסכמה | `CommunityStep.tsx` → `consent.ts` |
| `saved_simulations` | שמירת סימולציה | Dashboard `PlaygroundPanel.tsx` |

**זרימת שמירה:** Input → `App.tsx state` → `localStorage` (מיידי) → `saveUserData()` (debounce 1s) → Supabase `user_profiles`

---

### 3. קישור זהויות → `profile_links`

```mermaid
flowchart TD
    subgraph SOURCES["מקורות זהות"]
        S1["🌐 Web: user_profiles.id"]
        S2["🤖 Bot: bot_users.id"]
        S3["📋 Soft Lead: soft_leads.id"]
    end

    subgraph LINK["🔗 profile_links"]
        L1["canonical_id → user_profiles.id"]
        L2["source_type: web | telegram | soft_lead"]
        L3["source_id: UUID"]
        L4["confidence: 0.5-1.0"]
    end

    subgraph UNIFIED["📊 unified_profiles VIEW"]
        U1["display_name, email, phone"]
        U2["telegram_chat_id, telegram_username"]
        U3["bagrut_grades, psycho_scores"]
        U4["lead_score (MAX), temperature"]
        U5["journey_stage, routing_tags"]
        U6["rooms_joined, commands_used"]
        U7["is_linked: boolean"]
        U8["first_seen, last_updated"]
    end

    S1 --> L1
    S2 --> L1
    S3 --> L1
    L1 --> UNIFIED
```

**מתי קורה קישור:**
- **ידני**: משתמש לוחץ "חבר חשבון" בבוט → מקבל link token → פותח באתר
- **אוטומטי**: `autoLinkSoftLead()` — התאמה לפי טלפון/אימייל

---

### 4. ניתוח אוטומטי → `user_profiles`

```mermaid
flowchart LR
    subgraph TRIGGER["🎯 טריגרים"]
        T1["קישור חשבון"]
        T2["שינוי ציונים"]
        T3["מעקב תוכנית חדשה"]
    end

    subgraph COMPUTE["⚙️ חישובים"]
        C1["Gap Analysis\nפער בין הפרופיל לדרישות"]
        C2["Lead Routing\nתיוג וניתוב"]
        C3["Lead Scoring\nניקוד מעורבות"]
    end

    subgraph RESULT["💾 user_profiles"]
        R1["gap_analysis (JSONB)\nstatus: admitted/close/far\ndeficit per program"]
        R2["lead_routing_tags[]\nuniversity_registration\npsychometric_prep\nbagrut_improvement"]
        R3["temperature: cold/warm/hot\njourney_stage: anonymous→deciding"]
    end

    T1 & T2 & T3 --> C1 --> R1
    T1 & T2 & T3 --> C2 --> R2
    C3 --> R3
```

---

### 5. Lead Scoring — ניקוד מעורבות

```mermaid
flowchart TD
    subgraph ACTIONS["פעולות המשתמש"]
        A1["started_bot → +5"]
        A2["selected_sector → +5"]
        A3["visited_web_app → +10"]
        A4["deep_link_from_program → +10"]
        A5["tracked_program → +10"]
        A6["joined_room → +15"]
        A7["linked_account → +20"]
        A8["used_referral → +10"]
        A9["daily_active → +2"]
    end

    subgraph STAGES["שלבי ליד"]
        S1["0-10: new"]
        S2["11-25: engaged"]
        S3["26-40: grade_entered"]
        S4["41-60: simulated"]
        S5["61+: high_intent 🔥"]
    end

    A1 & A2 --> S1
    A3 & A4 & A5 --> S2 & S3
    A6 & A7 --> S4
    A8 & A9 -.-> S5
```

---

### 6. היכן האדמין רואה הכל

```mermaid
flowchart TD
    subgraph PAGES["📊 עמודי ShadowNet"]
        P1["CRM\n/admin/crm"]
        P2["Metrics Dashboard\n/admin/dashboard"]
        P3["Groups Manager\n/admin/groups"]
        P4["Signals Feed\n/admin/shadow/signals"]
        P5["Client Portal\n/client-portal"]
    end

    subgraph DATA["מקורות מידע"]
        D1["user_profiles"]
        D2["bot_users"]
        D3["soft_leads"]
        D4["bug_reports"]
        D5["bot_messages_log"]
        D6["bot_groups"]
        D7["unified_profiles VIEW"]
        D8["profile_links"]
    end

    D1 --> P1
    D3 --> P1
    D4 --> P1
    D7 --> P2
    D5 --> P2
    D6 --> P3
    D2 --> P4
    D7 --> P5
    D8 --> P5
```

| עמוד | מה רואים | API |
|------|----------|-----|
| **CRM** (`/admin/crm`) | טבלת משתמשים, ציונים, ממוצע בגרות, פסיכומטרי, פעילות אחרונה. לידים מהירים (soft_leads). דיווחי באגים. | ישיר מ-Supabase |
| **Metrics** (`/admin/dashboard`) | סה"כ משתמשים, בוט, לידים. משתמשים חדשים/פעילים. הודעות בוט. לידים חמים. ממוצע lead score. גרפי timeseries. | `/api/metrics/*` |
| **Groups** (`/admin/groups`) | קבוצות/topics פעילים. מספר חברים. שליחת תוכן (bait). יצירת topics. | `/api/telegram-rooms` |
| **Signals** (`/admin/shadow/signals`) | לידים חמים (score ≥ 60). שלב מסע. פעילות אחרונה. | ישיר מ-Supabase |
| **Client Portal** (`/client-portal`) | Social proof (סה"כ משתמשים, חישובים השבוע). סגמנטים לפי journey_stage. | `/api/metrics/client-view` |

---

## טבלת סיכום: Data × Source × Storage × Admin

| סוג מידע | נקודת איסוף | `localStorage` | `user_profiles` | `bot_users` | טבלה אחרת | עמוד אדמין |
|-----------|-------------|----------------|------------------|-------------|------------|-------------|
| **ציונים בגרות** | וויזארד / טופס | `bagrut_plus_data` | `bagrut_grades` | — | — | CRM |
| **פסיכומטרי** | וויזארד / טופס | `bagrut_plus_data` | `psycho_score_*` | — | — | CRM |
| **מגזר** | בוט / וויזארד | `bagrut_plus_data` | — | `sector` | — | CRM |
| **העדפות לימוד** | וויזארד | `bagrut_plus_data` | `major_subjects`, `institution_pref` | — | — | — |
| **תוכניות במעקב** | אתר / בוט | `bagrut_plus_data` | `tracked_programs` | `tracked_programs` | — | — |
| **הסכמה** | בוט / אתר | `mitlabtim_consent` | `consent_*` | `consent_*` | — | — |
| **Lead Score** | פעולות בוט | — | `lead_score` | `lead_score` | — | Signals |
| **טמפרטורה** | חישוב אוטומטי | — | `temperature` | — | — | Signals |
| **שלב מסע** | חישוב אוטומטי | — | `journey_stage` | — | — | Metrics |
| **Gap Analysis** | חישוב אוטומטי | — | `gap_analysis` | — | — | — |
| **Routing Tags** | חישוב אוטומטי | — | `lead_routing_tags` | — | — | — |
| **הודעות בוט** | כל הודעה | — | — | — | `bot_messages_log` | Metrics |
| **חדרים/קהילה** | הצטרפות | — | — | `rooms_joined` | `bot_groups` | Groups |
| **הפניות (Referral)** | שיתוף | — | — | `referral_*` | — | — |
| **Drip Stage** | Cron אוטומטי | — | — | `drip_stage` | — | — |
| **לידים מהירים** | טופס באתר | `lead_captured` | — | — | `soft_leads` | CRM |
| **דיווחי באגים** | וידג'ט | — | — | — | `bug_reports` | CRM |
| **קישור זהויות** | קישור ידני/אוטו | — | — | `web_user_id` | `profile_links` | — |

---

## Drip Campaigns — אוטומציית מעורבות

```mermaid
flowchart TD
    subgraph STAGES["שלבי Drip"]
        S1["welcome\nאחרי 2 שעות"]
        S2["nudge_web\nאחרי 24 שעות\n'חשב סיכויים באתר'"]
        S3["nudge_rooms\nאחרי 72 שעות\n'הצטרף לקהילה'"]
        S4["share\nאחרי 5 ימים\n'שתף עם חברים'"]
        S5["re_engage\nאחרי 14 ימים\n'בדוק שינויים'"]
    end

    subgraph CONDITIONS["תנאי שליחה"]
        C1["אין web_user_id?"]
        C2["rooms_joined ריק?"]
        C3["referral_count = 0?"]
        C4["לא פעיל 7+ ימים?"]
    end

    S1 --> S2
    C1 -->|כן| S2
    S2 --> S3
    C2 -->|כן| S3
    S3 --> S4
    C3 -->|כן| S4
    S4 --> S5
    C4 -->|כן| S5
```

---

## Consent Flow — זרימת הסכמה

```mermaid
flowchart LR
    subgraph TIERS["שכבות הסכמה"]
        T1["Basic\nשמירת נתונים"]
        T2["Community\nתקשורת שיווקית"]
        T3["Full\nשיתוף עם שותפים"]
    end

    subgraph WEB_FLOW["🌐 אתר"]
        W1["CommunityStep\nבוויזארד"]
        W2["consent.ts\ngrantBasicConsent()"]
        W3["upgradeToCommunityCommunications()"]
        W4["upgradeToFullConsent()"]
    end

    subgraph BOT_FLOW["🤖 בוט"]
        B1["/consent"]
        B2["callback: consent:enable"]
        B3["callback: consent:disable"]
    end

    W1 --> W2 --> T1
    W1 --> W3 --> T2
    W1 --> W4 --> T3
    B1 --> B2 --> T2
    B1 --> B3
```
