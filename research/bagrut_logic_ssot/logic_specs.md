# Bagrut Calculator Logic & Rules (Technical Specs)

> **Status:** Draft v1
> **Last Synced with NotebookLM:** [Date needed]

## 1. Master Subject Dictionary (Canonical IDs)
The code MUST use these IDs.

| Canonical ID | Canonical Name (Hebrew) | Known Aliases / OCR Text | Units | Semel (Heuristic) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bible` | **תנ"ך** | תנך, דינים, תושב"ע | 2 | Ends in 1281/200 | 70/30 Split |
| `literature` | **ספרות** | ספרות עברית, מחשבת ישראל | 2 | Ends in 8281/200 | 70/30 Split |
| `history` | **היסטוריה** | היסטוריה, תולדות עם ישראל | 2 | Ends in 22261/200 | 70/30 Split |
| `civics` | **אזרחות** | אזרחות | 2 | Ends in 34281/200 | 80/20 Split |
| `hebrew` | **הבעה עברית** | עברית, לשון, הבעה | 2 | Ends in 11281/200 | 70/30 Split |
| `english` | **אנגלית** | אנגלית | 3-5 | Ends in 00 | Modules A-G |
| `math` | **מתמטיקה** | מתמטיקה | 3-5 | Ends in 00 | Modules 801-807 |

## 2. Extraction & Normalization Rules

### The "Final Grade" Heuristic
1.  **Code Ends in "00":** If a row has a generic code (e.g., `035500`), it is the **Final Grade**. Use it explicitly.
2.  **Filter Modules:** If a Final Grade exists, **discard** component rows (`035581`, `035582`).
3.  **Missing Final?** If NO "00" row exists, calculate weighted average from components (see Table 3).

## 3. Bonus Logic (University Standard)

| Subject | Units | Bonus Points | Condition |
| :--- | :---: | :---: | :--- |
| **Math** | 5 | **30** | Grade > 60 |
| **Math** | 4 | **10** | Grade > 60 |
| **English** | 5 | **20** | Grade > 60 |
| **English** | 4 | **10** | Grade > 60 |
| **Science/Tech** | 5 | **20-25** | Physics, Chem, Bio, CS |
| **Humanities** | 5 | **20** | History, Lit, Bible (Enhanced) |

## 4. Optimization Algorithm
1.  **Enrich:** Add bonuses to raw grades.
2.  **Lock:** Keep all **Compulsory** assignments.
3.  **Sort:** Order **Electives** by `Adjusted Grade`.
4.  **Greedy Add:** Add elective ONLY if it increases the weighted average.
    *   *Constraint:* Must reach minimum units (usually 20). If < 20, force add best electives until satisfied.
