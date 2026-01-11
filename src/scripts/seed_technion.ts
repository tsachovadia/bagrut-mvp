import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// 1. Setup Environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Paths
const DATA_DIR = path.resolve(__dirname, '../../data/universities/technion');
const STRUCTURE_PATH = path.join(DATA_DIR, 'structure.json');
const RULES_PATH = path.join(DATA_DIR, 'rules.json');

// Interface Defs (Mirroring JSON structure)
interface ProgramDef {
    name: string;
}

interface DepartmentDef {
    name: string;
    description: string;
    pageUrl: string;
    programs: string[];
}

interface FacultyDef {
    name: string;
    description: string;
    pageUrl?: string; // Optional at faculty level
    departments: DepartmentDef[];
    programs?: string[]; // Direct programs under faculty
}

interface TechnionStructure {
    university: {
        name: string;
        shortName: string;
        website: string;
        faculties: FacultyDef[];
    };
}

interface TechnionRules {
    universityKey: string;
    sekemAlgorithm: any;
    bagrutBonuses: any[];
}

async function seedTechnion() {
    console.log('🧪 Starting Technion Seed Script...');

    // 1. Read Data
    try {
        const structureRaw = fs.readFileSync(STRUCTURE_PATH, 'utf-8');
        const structure: TechnionStructure = JSON.parse(structureRaw);

        const rulesRaw = fs.readFileSync(RULES_PATH, 'utf-8');
        const rules: TechnionRules = JSON.parse(rulesRaw);

        console.log(`📖 Loaded data for: ${structure.university.name}`);

        // 2 & 3. Get or Create Institution
        let universityId: string;
        const { data: existingInst } = await supabase
            .from('institutions')
            .select('id')
            .eq('name', structure.university.name)
            .maybeSingle();

        if (existingInst) {
            universityId = existingInst.id;
            console.log(`✅ Found Institution: ${structure.university.name} (${universityId})`);
        } else {
            const { data: newInst, error: instError } = await supabase
                .from('institutions')
                .insert({
                    name: structure.university.name,
                    type: 'university',
                    website_url: structure.university.website,
                    logo_url: '/logos/technion.png'
                })
                .select()
                .single();

            if (instError) {
                console.error('❌ Critical Error creating institution:', instError);
                return;
            }
            universityId = newInst.id;
            console.log(`✅ Created Institution: ${newInst.name} (${universityId})`);
        }

        // 3. Insert Admissions Rules (Linked to University)
        // Check if exists
        const { data: existingRules } = await supabase
            .from('admission_rules')
            .select('id')
            .eq('institution_id', universityId)
            .single();

        if (existingRules) {
            await supabase
                .from('admission_rules')
                .update({
                    rules_json: rules
                })
                .eq('id', existingRules.id);
            console.log(`✅ Updated existing Admission Rules for Technion`);
        } else {
            await supabase
                .from('admission_rules')
                .insert({
                    institution_id: universityId,
                    rules_json: rules
                });
            console.log(`✅ Created new Admission Rules for Technion`);
        }

        // 4. Iterate Faculties
        for (const faculty of structure.university.faculties) {
            let facultyId;

            // Check if faculty exists
            const { data: existingFac } = await supabase
                .from('faculties')
                .select('id')
                .eq('institution_id', universityId)
                .eq('name', faculty.name)
                .maybeSingle();

            if (existingFac) {
                facultyId = existingFac.id;
            } else {
                // Insert new faculty
                const { data: newFac, error: facError } = await supabase
                    .from('faculties')
                    .insert({
                        institution_id: universityId,
                        name: faculty.name
                        // Note: 'description' column does not exist in faculties table
                    })
                    .select()
                    .single();

                if (facError) {
                    console.warn(`⚠️ Error creating faculty ${faculty.name}:`, facError.message);
                    continue;
                }
                facultyId = newFac.id;
            }
            console.log(`  🏛️ Faculty: ${faculty.name}`);

            // Helper to insert program
            const insertProgram = async (progName: string, url: string, desc: string) => {
                // Heuristics for Degree Type
                let degreeType = 'B.Sc'; // Technion is mostly B.Sc
                let duration = 4; // Most Engineering is 4

                if (progName.includes('רפואה') && !progName.includes('מדעי') && !progName.includes('ביו')) {
                    degreeType = 'M.D';
                    duration = 7;
                } else if (progName.includes('ארכיטקטורה')) {
                    degreeType = 'B.Arch';
                    duration = 5;
                } else if (progName.includes('ביולוגיה') || progName.includes('כימיה') || progName.includes('מתמטיקה')) {
                    // Pure sciences are often 3 years, but some at Technion are 3 or 4.
                    // Let's default to 3 for pure sciences unless usually stated otherwise.
                    // Actually Technion pure sciences are often 3 years.
                    if (!progName.includes('הנדסה') && !progName.includes('משולב')) {
                        duration = 3;
                        // Check if BA or BSc? Technion gives BSc for almost everything.
                    }
                } else if (progName.includes('אדריכלות נוף')) {
                    degreeType = 'B.L.A';
                    duration = 4;
                }

                // Upsert Logic (Select then Insert/Update)
                const { data: existingProg } = await supabase
                    .from('programs')
                    .select('id')
                    .eq('faculty_id', facultyId)
                    .eq('name', progName)
                    .maybeSingle();

                const progPayload: any = {
                    faculty_id: facultyId,
                    name: progName,
                    degree_type: degreeType,
                    duration_years: duration,
                    website_url: url,
                    description: desc
                };

                if (existingProg) {
                    const { error: updateError } = await supabase
                        .from('programs')
                        .update(progPayload)
                        .eq('id', existingProg.id);
                    if (updateError) {
                        // Fallback if description fails (though we removed it from faculty, program has it?)
                        // BGU script had a retry. Let's keep it simple first.
                        if (updateError.message.includes('description') || updateError.code === '42703') {
                            delete progPayload.description;
                            await supabase.from('programs').update(progPayload).eq('id', existingProg.id);
                        } else {
                            console.error(`    ❌ Update failed ${progName}: ${updateError.message}`);
                        }
                    } else {
                        console.log(`    🎓 Updated Program: ${progName}`);
                    }
                } else {
                    const { error: insertProgError } = await supabase
                        .from('programs')
                        .insert(progPayload);
                    if (insertProgError) {
                        if (insertProgError.message.includes('description') || insertProgError.code === '42703') {
                            delete progPayload.description;
                            const retry = await supabase.from('programs').insert(progPayload);
                            if (retry.error) console.error(`    ❌ Insert failed ${progName} (retry): ${retry.error.message}`);
                            else console.log(`    🎓 Inserted Program (no desc): ${progName}`);
                        } else {
                            console.error(`    ❌ Insert failed ${progName}: ${insertProgError.message}`);
                        }
                    } else {
                        console.log(`    🎓 Inserted Program: ${progName} (${degreeType}, ${duration}y)`);
                    }
                }
            };

            // 5. Iterate Departments (if any)
            if (faculty.departments && faculty.departments.length > 0) {
                for (const dept of faculty.departments) {
                    for (const programName of dept.programs) {
                        const richDescription = `${dept.description} (מחלקה: ${dept.name})`;
                        await insertProgram(programName, dept.pageUrl, richDescription);
                    }
                }
            }

            // 6. Iterate Direct Programs (if any)
            if (faculty.programs && faculty.programs.length > 0) {
                for (const programName of faculty.programs) {
                    const url = faculty.pageUrl || structure.university.website;
                    await insertProgram(programName, url, faculty.description);
                }
            }
        }

        console.log('✅ Technion Data Ingestion Complete.');

    } catch (err) {
        console.error('❌ Script failed:', err);
        process.exit(1);
    }
}

seedTechnion();
