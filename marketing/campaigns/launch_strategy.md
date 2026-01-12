# Campaign Strategy: "Launch MVP" 🚀

## 1. Overview
**Budget:** 30 NIS/day
**Objective:** User Acquisition (Optimize for "Complete Registration" or "Lead")
**Platform:** Instagram (via Meta Ads Manager)

## 2. The User Journey (Funnel Map)
We need to track the user across these specific "Events".

| Step | User Action | System Event (Pixel) | Key Success Metric |
| :--- | :--- | :--- | :--- |
| **1. Ad Impression** | Sees ad in Stories/Feed | `Impact` | CTR (Click Through Rate) |
| **2. Landing** | Clicks link -> Lands on Home Page | `PageView` | Landing Page View % |
| **3. Engagement** | Starts using the Calculator | `ViewContent` (or Custom: `Start_Calculation`) | Time on Page |
| **4. Sign Up** | Clicks "Show Results" -> Google Login | `InitiateCheckout` | Auth Click Rate |
| **5. Conversion** | Successful Login -> Sees Dashboard | `CompleteRegistration` / `Lead` | **CAC (Cost Per Result)** |
| **6. Advocacy** | Shares result to IG Story | `Share` (Custom) | Viral Coefficient |

## 3. Technical Implementation Plan
### A. Meta Pixel Setup
- [ ] Create Pixel in Meta Business Manager.
- [ ] Install Pixel Base Code in `index.html` (Head).
- [ ] Implement React Tracking Events:
    - `PageView` on route change.
    - `CompleteRegistration` on successful Supabase Auth.
    - `CustomEvent` for "Calculation_Started".

### B. Data & Privacy (TOS)
- [ ] Ensure "Terms of Service" & "Privacy Policy" links are visible on the login modal.
- [ ] Clarify what data we save:
    - Email/Name (from Google).
    - Bagrut Grades (for the calculator).
    - Target Degrees (preferences).

## 4. Landing Experience Optimization
**Goal:** Reduce friction between Ad and Action.
*   **Message Match:** If Ad says "Check your chances for CS", the Landing Page should immediately show the calculator, not a generic "Welcome".
*   **Mobile First:** Ensure the calculator keyboard covers don't break the UI.
*   **Trust Signals:** Add "Join 50k community" text near the login button.

## 5. Ad Creative Brief (The 3 Ads)
*Need to match the 3 angles.*
1.  **Ad 1 (Pain):** "Still calculating manually?" (Video of messy excel vs App). -> Direct to Calculator.
2.  **Ad 2 (Social):** "See where your friends are studying." -> Direct to Community/Main.
3.  **Ad 3 (FOMO/Value):** "50k Students are already optimizing their bonuses." -> Direct to Main.
