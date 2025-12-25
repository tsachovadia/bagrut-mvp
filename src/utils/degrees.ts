import degreesRaw from '../assets/legacy/DATA/degrees.json';

// Enrich degrees with a random threshold for MVP demo
export interface Degree {
    degree_id: number;
    degree_name: string;
    threshold: number; // 500-750 range
}

export const degrees: Degree[] = degreesRaw.map((d: any) => ({
    ...d,
    threshold: 500 + Math.floor(Math.random() * 250) // Random threshold between 500 and 750
}));

export const getDegree = (id: number) => degrees.find(d => d.degree_id === id);
