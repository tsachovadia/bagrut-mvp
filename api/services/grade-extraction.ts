
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SubjectGrade {
    subject: string;
    grade: number;
    units: number;
    semel?: string; // Exam Code
    examDate?: string; // MM/YYYY
    originalText?: string;
}

export interface ExtractionResult {
    grades?: SubjectGrade[];
    rawText?: string;
    usedModel?: string;
    promptUsed?: string;
    error?: string;
}

// Model Configuration
const MODEL_NAME = "gemini-2.0-flash-001"; // Confirmed working model

export class GradeExtractionService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        if (!apiKey) {
            console.error("GradeExtractionService: Missing API Key");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
    }

    /**
     * PHASE 1: OCR - Extract Raw Text from Image
     * Returns the Markdown representation of the table.
     */
    async extractRawText(fileBase64: string): Promise<ExtractionResult> {
        try {
            console.log(`[GradeExtraction] Phase 1: Starting Raw Text Extraction with ${MODEL_NAME}...`);
            console.log(`[GradeExtraction] Input fileBase64 length: ${fileBase64.length}`);

            // Detect MIME type from the base64 header (e.g., data:image/jpeg;base64,...)
            let mimeType = "image/png"; // Default
            if (fileBase64.startsWith("data:")) {
                const matches = fileBase64.match(/^data:([^;]+);base64,/);
                if (matches && matches[1]) {
                    mimeType = matches[1];
                }
            }

            console.log(`[GradeExtraction] Detected MIME Type: ${mimeType}`);

            const imagePart = this.fileToGenerativePart(fileBase64, mimeType);
            console.log(`[GradeExtraction] Image part prepared.`);

            const prompt = `You are an expert OCR engine for Hebrew documents. 
            TASK: Transcribe the text from this Israeli Bagrut certificate EXACTLY as it appears. 
            
            GUIDELINES:
            1. Preserve the structure of the table using clear Markdown (rows/columns).
            2. Do NOT summarize or explain.
            3. Ensure "Exam Code" (שאלון/סמל), "Subject" (מקצוע), "Units" (יח״ל), "Grade" (ציון סופי), and "Date" (מועד) are transcribed 100% accurately.
            4. Hebrew text should be properly directed.
            
            OUTPUT:
            Return ONLY the raw markdown text.`;

            console.log(`[GradeExtraction] Sending request to Google Generative AI...`);
            const result = await this.model.generateContent([prompt, imagePart]);
            console.log(`[GradeExtraction] Received result from model.`);

            const response = await result.response;
            const text = response.text();

            console.log(`[GradeExtraction] Phase 1 Complete. Text extracted successfully. Length: ${text.length}`);
            return {
                rawText: text,
                usedModel: MODEL_NAME
            };

        } catch (error: any) {
            console.error("[GradeExtraction] Phase 1 Failed:", error);
            console.error("[GradeExtraction] Error Details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
            throw new Error(`OCR Extraction Failed: ${error.message}`);
        }
    }

    /**
     * PHASE 2: NORMALIZATION - Convert Raw Text to JSON
     * Maps the extracted text to our database schema.
     */
    async normalizeTextToJSON(rawText: string): Promise<ExtractionResult> {
        try {
            console.log(`[GradeExtraction] Phase 2: Starting JSON Normalization...`);
            const normalizationModel = this.genAI.getGenerativeModel({
                model: MODEL_NAME,
                generationConfig: { responseMimeType: "application/json" } // Force JSON
            });

            const prompt = `You are a data normalization expert. 
             TASK: Convert this Raw OCR Text of a Bagrut Certificate into a structured JSON.

             INPUT TEXT:
             ${rawText}

             REQUIRED JSON SCHEMA:
             [
               {
                 "subject": string, // Hebrew Name
                 "semel": string, // Exam Code (e.g., "035581") - Optional but preferred
                 "units": number, // Units (e.g., 5, 4, 3)
                 "grade": number, // Final Grade (ציון סופי) - numeric only
                 "examDate": string // format "MM/YYYY" or "YYYY"
               }
             ]

             CRITICAL RULES - READ CAREFULLY:
             1. **FILTER AGGRESSIVELY**: The input contains MANY rows. Most are distinct "Modules" (Shalonim). You must filter them out and keep ONLY the **FINAL SUBJECT GRADE**.
             2. **HEURISTICS FOR FINAL GRADE**:
                - Look for Exam Codes (Semel/שאלון) ending in **"00"** (e.g., 035500, 022200, 034200, 899300). These are usually the Final Grades.
                - If you see "Math 806" (035806) and "Math 807" (035807) AND "Math" (035500) -> OUTPUT ONLY 035500.
             3. **MANDATORY SUBJECTS (Find these even if code doesn't end in 00)**:
                - **Hebrew/Language (עברית/הבעה/לשון)**: Look for codes starting with 011 (e.g. 011100, 011107, 011108). Pick the one with the highest units or "Final" status.
                - **Literature (ספרות)**: Look for codes like 008100, 008...
             4. **IGNORE MODULES**: Do NOT output individual modules like 035806, 035807 unless no final grade row exists.
             5. **FINAL OUTPUT**: Return a clean list of ~10-15 subjects containing:
                - Bible (תנ״ך)
                - Literature (ספרות) - MANDATORY
                - Hebrew/Grammar (הבעה/עברית/לשון) - MANDATORY
                - History (היסטוריה)
                - Civics (אזרחות)
                - Math (מתמטיקה)
                - English (אנגלית)
                - Plus any Electives (Physics, CS, Chemistry, etc.)
             6. **Semel**: Extract the Exam Code (סמל שאלון).
             7. **Units**: Extract units (יח״ל).

             Return ONLY the valid JSON array.`;

            const result = await normalizationModel.generateContent(prompt);
            const response = await result.response;
            const jsonString = response.text();

            const parsedGrades = JSON.parse(jsonString);

            console.log(`[GradeExtraction] Phase 2 Complete. Items found: ${parsedGrades.length}`);
            return {
                grades: parsedGrades,
                rawText: rawText, // Pass through original text for reference
                usedModel: MODEL_NAME
            };

        } catch (error: any) {
            console.error("[GradeExtraction] Phase 2 Failed:", error);
            throw new Error(`JSON Normalization Failed: ${error.message}`);
        }
    }

    /**
     * ORCHESTRATOR: Runs Phase 1 -> Phase 2 (Legacy Support)
     */
    async extractGrades(fileBase64: string): Promise<ExtractionResult> {
        // Step 1: Get Text
        const textResult = await this.extractRawText(fileBase64);
        if (!textResult.rawText) throw new Error("No text extracted from document.");

        // Step 2: Normalize
        return this.normalizeTextToJSON(textResult.rawText);
    }

    // --- Helper ---
    private fileToGenerativePart(base64String: string, mimeType: string) {
        // Strip data:image/...;base64, if present
        const base64Content = base64String.split(",")[1] || base64String;
        return {
            inlineData: {
                data: base64Content,
                mimeType
            },
        };
    }
}
