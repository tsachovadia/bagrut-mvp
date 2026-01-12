# Bagrut Logic SSOT (Three-Way Sync)

> [!IMPORTANT]
> **Primary Researcher:** NotebookLM (Expert on official Ministry of Education documents).
> **Implementation:** `api/services/grade-extraction.ts` and `src/utils/calculator.ts`.
> **Single Source of Truth (Here):** This folder holds the canonical definitions.

## 🧠 Workflow with NotebookLM
We use NotebookLM as our "Expert Consultant". It holds the raw PDFs, circulars, and university guidelines.
When we need to clarify a rule (e.g., "How is the bonus calculated for 3-unit Math in the periphery?"), we:
1.  **Ask NotebookLM.**
2.  **Verify** the answer.
3.  **Update** the relevant file in this folder (e.g., `logic_specs.md`).
4.  **Refactor** the code to match this SSOT.

## 📂 Folder Structure

*   **`README.md`**: This file. Usage guide.
*   **`logic_specs.md`**: The technical rules for the Calculator and Normalizer. (Aliases, Bonuses, Weighting).
*   **`schema_v1.json`**: (Optional) Machine-readable version of the rules if needed for direct import.

## 🔄 Current Status
*   [x] **Subject Names**: Standardized in `logic_specs.md`.
*   [x] **Normalization**: "00" Heurisitc defined.
*   [ ] **University Specifics**: Need to verify Technion/TAU exact formulas with NotebookLM.
