// Re-exporting from legacy for easier imports
import { MANDATORY_SUBJECTS, ELECTIVE_SUBJECTS, ALL_SUBJECTS } from '../assets/legacy/LOGIC/bagrut-subjects';
export type { BagrutSubject } from '../assets/legacy/LOGIC/bagrut-subjects';

export { MANDATORY_SUBJECTS, ELECTIVE_SUBJECTS, ALL_SUBJECTS };

export const getSubjectByName = (name: string) => ALL_SUBJECTS.find((s: any) => s.name === name);
