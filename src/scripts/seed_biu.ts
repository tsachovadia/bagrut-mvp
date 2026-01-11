import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// 1. Setup Environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Paths
const DATA_DIR = path.resolve(__dirname, '../../data/universities/biu');
const STRUCTURE_PATH = path.join(DATA_DIR, 'structure.json');
const RULES_PATH = path.join(DATA_DIR, 'rules.json');

// Interface Defs
interface DepartmentDef {
    name: string;
    description: string;
    pageUrl: string;
    programs: string[];
}

interface FacultyDef {
    name: string;
    description: string;
    pageUrl?: string;
    departments: DepartmentDef[];
    programs?: string[];
}

interface BIUStructure {
    university: {
        name: string;
        shortName: string;
        website: string;
        faculties: FacultyDef[];
    };
}

interface BIURules {
    universityKey: string;
    sekemAlgorithm: any;
    bagrutBonuses: any[];
}

async function seedBIU() {
    console.log('🕍 Starting BIU Seed Script...');

    try {
        const structureRaw = fs.readFileSync(STRUCTURE_PATH, 'utf-8');
        const structure: BIUStructure = JSON.parse(structureRaw);

        const rulesRaw = fs.readFileSync(RULES_PATH, 'utf-8');
        const rules: BIURules = JSON.parse(rulesRaw);

        console.log(`📖 Loaded data for: ${structure.university.name}`);

        // 2 & 3. Get or Create Institution (Robust Pattern)
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
                    logo_url: '/logos/biu.png'
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

        // 3. Upsert Admission Rules
        const { data: existingRules } = await supabase
            .from('admission_rules')
            .select('id')
            .eq('institution_id', universityId)
            .single();

        if (existingRules) {
            await supabase
                .from('admission_rules')
                .update({ rules_json: rules })
                .eq('id', existingRules.id);
            console.log(`✅ Updated existing Admission Rules for BIU`);
        } else {
            await supabase
                .from('admission_rules')
                .insert({
                    institution_id: universityId,
                    rules_json: rules
                });
            console.log(`✅ Created new Admission Rules for BIU`);
        }

        // 4. Iterate Faculties
        for (const faculty of structure.university.faculties) {
            let facultyId;

            const { data: existingFac } = await supabase
                .from('faculties')
                .select('id')
                .eq('institution_id', universityId)
                .eq('name', faculty.name)
                .maybeSingle();

            if (existingFac) {
                facultyId = existingFac.id;
            } else {
                const { data: newFac, error: facError } = await supabase
                    .from('faculties')
                    .insert({
                        institution_id: universityId,
                        name: faculty.name
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

            const insertProgram = async (progName: string, url: string, desc: string) => {
                let degreeType = 'B.A';
                let duration = 3;

                // Heuristics for BIU
                if (progName.includes('הנדסת') || progName.includes('מדעי המחשב')) {
                    degreeType = 'B.Sc';
                    duration = 4;
                    if (progName.includes('מדעי המחשב')) duration = 3;
                } else if (progName.includes('משפטים')) {
                    degreeType = 'LL.B';
                    duration = 3.5;
                } else if (faculty.name.includes('טבע') || faculty.name.includes('החיים')) {
                    degreeType = 'B.Sc';
                    duration = 3;
                }

                // Robust Program Upsert (Check -> Insert/Update)
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
                    // Update
                    const { error: updateError } = await supabase
                        .from('programs')
                        .update(progPayload)
                        .eq('id', existingProg.id);
                    if (updateError) {
                        // Fallback for missing columns like description if schema drift
                        if (updateError.message.includes('description')) {
                            delete progPayload.description;
                            await supabase.from('programs').update(progPayload).eq('id', existingProg.id);
                        } else {
                            console.error(`    ❌ Update failed ${progName}:`, updateError.message);
                        }
                    }
                } else {
                    // Insert
                    const { error: insertProgError } = await supabase
                        .from('programs')
                        .insert(progPayload);
                    if (insertProgError) {
                        if (insertProgError.message.includes('description')) {
                            delete progPayload.description;
                            await supabase.from('programs').insert(progPayload);
                            console.log(`    🎓 Inserted Program (no desc): ${progName}`);
                        } else {
                            console.error(`    ❌ Insert failed ${progName}:`, insertProgError.message);
                        }
                    } else {
                        console.log(`    🎓 Inserted Program: ${progName} (${degreeType}, ${duration}y)`);
                    }
                }
            };

            // Iterate Departments
            if (faculty.departments && faculty.departments.length > 0) {
                for (const dept of faculty.departments) {
                    for (const programName of dept.programs) {
                        const richDescription = `${dept.description} (חוג: ${dept.name})`;
                        await insertProgram(programName, dept.pageUrl, richDescription);
                    }
                }
            }

            // Iterate Direct Programs
            if (faculty.programs && faculty.programs.length > 0) {
                for (const programName of faculty.programs) {
                    const url = faculty.pageUrl || structure.university.website;
                    await insertProgram(programName, url, faculty.description);
                }
            }
        }

        console.log('✅ BIU Data Ingestion Complete.');

    } catch (err) {
        console.error('❌ Script failed:', err);
        process.exit(1);
    }
}

seedBIU();
