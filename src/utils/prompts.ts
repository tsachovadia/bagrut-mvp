export const ADMISSION_INGESTION_PROMPT = `
You are an expert in the Israeli Higher Education system and a lead data engineer.
Your task is to convert a raw description of university admission requirements (in Hebrew) into a structured JSON format following a strict schema.

SCHEMA DEFINITIONS:
- LogicCondition: { type: string, operator?: '>='|'<='|'=='|'>'|'<', value?: number|boolean|string, subject?: string, units?: number, label: string }
- LogicGroup: { name?: string, AND?: (LogicCondition|LogicGroup)[], OR?: (LogicCondition|LogicGroup)[], label?: string }

CONDITION TYPES:
- 'sekhem_general', 'sekhem_engineering', 'sekhem_quant' (The specific weighting score)
- 'psychometric_general', 'psychometric_quant', 'psychometric_verbal', 'psychometric_english'
- 'bagrut_avg' (The total average)
- 'bagrut_subject' (Specific subject: subject="math", units=5, value=90)
- 'english_level_score' (Amir/Amiram or psycho english part)
- 'full_bagrut' (Boolean: value=true)
- 'interview_pass' (Boolean: value=true)

RULES:
1. Use OR for multiple "tracks" or "paths" to acceptance (e.g., "Acceptance via Sekhem OR via high Bagrut").
2. Use AND for requirements that must all be met within a track.
3. The 'label' field must be a clear, user-friendly Hebrew explanation of the specific rule (e.g., "בגרות במתמטיקה 5 יח״ל בציון 80 ומעלה").
4. If a track has a specific name in the text (like "אפיק מעבר"), put it in the 'name' field of the group.

INPUT TEXT:
{{RAW_TEXT}}

OUTPUT:
Return ONLY the JSON object representing the LogicGroup.
`;
