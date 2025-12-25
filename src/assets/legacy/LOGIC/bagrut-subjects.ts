export interface BagrutSubject {
  name: string;
  nameEnglish: string;
  category: string;
  units: number[];
  isMultiLevel: boolean;
  required: boolean;
  defaultUnits?: number;
  bonusEligible?: boolean;
}

export const MANDATORY_SUBJECTS: BagrutSubject[] = [
  {
    name: "עברית - הבעה ולשון",
    nameEnglish: "Hebrew Language and Expression", 
    category: "language",
    units: [2],
    isMultiLevel: false,
    required: true,
    defaultUnits: 2
  },
  {
    name: "אנגלית",
    nameEnglish: "English",
    category: "language", 
    units: [3, 4, 5, 7, 10],
    isMultiLevel: true,
    required: true,
    defaultUnits: 5
  },
  {
    name: "מתמטיקה",
    nameEnglish: "Mathematics",
    category: "stem",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: true,
    defaultUnits: 5
  },
  {
    name: "היסטוריה",
    nameEnglish: "History",
    category: "humanities",
    units: [2, 5],
    isMultiLevel: true,
    required: true,
    defaultUnits: 2
  },
  {
    name: "אזרחות",
    nameEnglish: "Civics",
    category: "social",
    units: [2, 5],
    isMultiLevel: true,
    required: true,
    defaultUnits: 2
  },
  {
    name: "תנ\"ך",
    nameEnglish: "Bible/Tanakh",
    category: "religious",
    units: [2, 3],
    isMultiLevel: true,
    required: true,
    defaultUnits: 2
  },
  {
    name: "ספרות",
    nameEnglish: "Literature",
    category: "humanities",
    units: [2],
    isMultiLevel: false,
    required: true,
    defaultUnits: 2
  }
];

export const ELECTIVE_SUBJECTS: BagrutSubject[] = [
  // STEM subjects
  {
    name: "פיסיקה",
    nameEnglish: "Physics",
    category: "stem",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 5,
    bonusEligible: true
  },
  {
    name: "כימיה", 
    nameEnglish: "Chemistry",
    category: "stem",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 5,
    bonusEligible: true
  },
  {
    name: "ביולוגיה",
    nameEnglish: "Biology",
    category: "stem",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 5,
    bonusEligible: true
  },
  {
    name: "מדעי המחשב",
    nameEnglish: "Computer Science",
    category: "stem",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 5,
    bonusEligible: true
  },
  // Humanities
  {
    name: "גיאוגרפיה",
    nameEnglish: "Geography",
    category: "humanities",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  },
  {
    name: "מדעי החברה",
    nameEnglish: "Social Sciences",
    category: "humanities",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: true
  },
  {
    name: "פילוסופיה",
    nameEnglish: "Philosophy",
    category: "humanities",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  },
  // Arts
  {
    name: "אמנות",
    nameEnglish: "Art",
    category: "arts",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  },
  {
    name: "מוסיקה",
    nameEnglish: "Music",
    category: "arts",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  },
  {
    name: "תיאטרון",
    nameEnglish: "Theater",
    category: "arts",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  },
  {
    name: "קולנוע",
    nameEnglish: "Cinema",
    category: "arts",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  },
  // Business
  {
    name: "ניהול עסקי",
    nameEnglish: "Business Management",
    category: "business",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: true
  },
  {
    name: "כלכלה",
    nameEnglish: "Economics",
    category: "business",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: true
  },
  // Languages
  {
    name: "ערבית",
    nameEnglish: "Arabic",
    category: "languages",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  },
  {
    name: "צרפתית",
    nameEnglish: "French",
    category: "languages",
    units: [3, 4, 5],
    isMultiLevel: true,
    required: false,
    defaultUnits: 3,
    bonusEligible: false
  }
];

export const ALL_SUBJECTS = [...MANDATORY_SUBJECTS, ...ELECTIVE_SUBJECTS];

export const getSubjectByName = (name: string): BagrutSubject | undefined => {
  return ALL_SUBJECTS.find(subject => subject.name === name);
};

export const getSubjectUnits = (name: string): number[] => {
  const subject = getSubjectByName(name);
  return subject?.units || [3, 4, 5];
};

export const getDefaultUnits = (name: string): number => {
  const subject = getSubjectByName(name);
  return subject?.defaultUnits || 3;
};