// Re-exporting from legacy for easier imports
import { MANDATORY_SUBJECTS as LEGACY_MANDATORY, ELECTIVE_SUBJECTS as LEGACY_ELECTIVE, ALL_SUBJECTS as LEGACY_ALL, type BagrutSubject } from '../assets/legacy/LOGIC/bagrut-subjects';

// 1. Define New Subjects for specific sectors
const NEW_SUBJECTS: BagrutSubject[] = [
    { name: "תלמוד / תושב״ע", nameEnglish: "Talmud / Oral Torah", category: "religious", units: [3, 5], isMultiLevel: true, required: true, defaultUnits: 3 },
    { name: "מחשבת ישראל", nameEnglish: "Jewish Thought", category: "religious", units: [2, 5], isMultiLevel: true, required: true, defaultUnits: 2 },
    { name: "עברית לדוברי ערבית", nameEnglish: "Hebrew for Arabic Speakers", category: "language", units: [3, 4, 5], isMultiLevel: true, required: true, defaultUnits: 3 },
    { name: "ערבית לדוברי ערבית", nameEnglish: "Arabic for Arabic Speakers", category: "language", units: [3, 4, 5], isMultiLevel: true, required: true, defaultUnits: 3 },
    { name: "דת / מורשת (אסלאם/נצרות)", nameEnglish: "Religion / Heritage (Islam/Christianity)", category: "religious", units: [1], isMultiLevel: false, required: true, defaultUnits: 1 },
    { name: "מורשת דרוזית", nameEnglish: "Druze Heritage", category: "religious", units: [1], isMultiLevel: false, required: true, defaultUnits: 1 },
];

export const ALL_SUBJECTS = [...LEGACY_ALL, ...NEW_SUBJECTS];
export const ELECTIVE_SUBJECTS = LEGACY_ELECTIVE;

export { type BagrutSubject };

// 2. Define Sectors
export type Sector = 'mamlachti' | 'mamlachti_dati' | 'arab' | 'druze';

export const SECTOR_NAMES: Record<Sector, string> = {
    mamlachti: "ממלכתי (יהודי)",
    mamlachti_dati: "ממלכתי-דתי",
    arab: "ערבי",
    druze: "דרוזי"
};

// 3. Map Sectors to Mandatory Subjects
export const SECTOR_MANDATORY_SUBJECTS: Record<Sector, string[]> = {
    mamlachti: ["מתמטיקה", "אנגלית", "עברית - הבעה ולשון", "היסטוריה", "אזרחות", "תנ\"ך", "ספרות"],
    mamlachti_dati: ["מתמטיקה", "אנגלית", "עברית - הבעה ולשון", "היסטוריה", "אזרחות", "תנ\"ך", "תלמוד / תושב״ע", "מחשבת ישראל"],
    arab: ["מתמטיקה", "אנגלית", "עברית לדוברי ערבית", "ערבית לדוברי ערבית", "היסטוריה", "אזרחות", "דת / מורשת (אסלאם/נצרות)", "ספרות"],
    druze: ["מתמטיקה", "אנגלית", "עברית לדוברי ערבית", "ערבית לדוברי ערבית", "היסטוריה", "אזרחות", "מורשת דרוזית", "ספרות"]
};

// 4. Helpers
export const getSubjectByName = (name: string) => ALL_SUBJECTS.find((s: any) => s.name === name);

// Legacy export for backward compatibility if needed, but prefer using the sector map
export const MANDATORY_SUBJECTS = LEGACY_MANDATORY;

