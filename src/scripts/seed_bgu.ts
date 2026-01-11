import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use Service Role Key to bypass RLS policies during seeding
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Paths to JSON data - using process.cwd() assuming script run from project root
const DATA_DIR = path.join(process.cwd(), 'data/universities/bgu');
const STRUCTURE_PATH = path.join(DATA_DIR, 'structure.json');
const RULES_PATH = path.join(DATA_DIR, 'rules.json');

// Interface for Structure JSON
interface BGUStructure {
    university: {
        name: string;
        shortName: string;
        website: string;
        faculties: Faculty[];
    };
}

interface Faculty {
    name: string;
    description: string;
    departments: Department[];
}

interface Department {
    name: string;
    description: string;
    pageUrl: string;
    programs: string[];
}

// Interface for Rules JSON
interface BGURules {
    university: string;
    admission_rules: {
        calculator_type: string;
        sekem_formula: {
            approx_formula: string;
            description: string;
        };
        bonuses: {
            [key: string]: any;
        };
    }
}

async function seedBGU() {
    console.log('🌵 Starting BGU Seed Script...');

    // 1. Read Data
    const structureRaw = fs.readFileSync(STRUCTURE_PATH, 'utf-8');
    const structure: BGUStructure = JSON.parse(structureRaw);

    const rulesRaw = fs.readFileSync(RULES_PATH, 'utf-8');
    const rules: BGURules = JSON.parse(rulesRaw);

    console.log(`📘 Loaded ${structure.university.name} with ${structure.university.faculties.length} faculties.`);

    // 2. Upsert University (Legacy / Config compatibility)
    // We still update this table as it might store calculator config or other legacy fields
    const { data: uniData, error: uniError } = await supabase
        .from('universities')
        .upsert({
            key: 'bgu',
            name: structure.university.name,
            calculator_type: rules.admission_rules.calculator_type || 'linear_approx',
            website_url: structure.university.website
        }, { onConflict: 'key' })
        .select()
        .single();

    if (uniError || !uniData) {
        console.error('❌ Error upserting university (legacy table):', uniError);
        // We continue because the hierarchy relies on 'institutions' now
    } else {
        console.log(`✅ Upserted University (Legacy): ${uniData.name} (${uniData.id})`);
    }

    // 3. Get or Create Institution (Source of Truth for Hierarchy)
    let instId: string;

    // First try to find existing institution by name
    const { data: existingInst, error: findInstError } = await supabase
        .from('institutions')
        .select('id')
        .eq('name', structure.university.name)
        .maybeSingle();

    if (existingInst) {
        instId = existingInst.id;
        console.log(`✅ Found Institution: ${structure.university.name} (${instId})`);
    } else {
        // Insert new institution
        const { data: newInst, error: instError } = await supabase
            .from('institutions')
            .insert({
                name: structure.university.name,
                type: 'university',
                website_url: structure.university.website
            })
            .select()
            .single();

        if (instError) {
            console.error('❌ Critical Error creating institution:', instError);
            return;
        }
        instId = newInst.id;
        console.log(`✅ Created Institution: ${newInst.name} (${instId})`);
    }

    // 4. Iterate Faculites
    for (const faculty of structure.university.faculties) {
        let facultyId;

        // SELECT first to check existence (skipping unreliable upsert without constraint)
        const { data: existingFac, error: findFacError } = await supabase
            .from('faculties')
            .select('id')
            .eq('institution_id', instId) // Use Institution ID
            .eq('name', faculty.name)
            .maybeSingle();

        if (existingFac) {
            facultyId = existingFac.id;
        } else {
            // INSERT
            const { data: newFac, error: insertFacError } = await supabase
                .from('faculties')
                .insert({
                    institution_id: instId, // Use Institution ID
                    name: faculty.name,
                })
                .select()
                .single();

            if (insertFacError) {
                console.error(`❌ Failed to create faculty ${faculty.name}:`, insertFacError.message);
                continue;
            }
            facultyId = newFac.id;
        }

        console.log(`  🏛️  Faculty: ${faculty.name}`);

        // 5. Iterate Departments -> Programs
        for (const dept of faculty.departments) {
            for (const programName of dept.programs) {

                // Heuristics
                let degreeType = 'B.A';
                let duration = 3;
                if (programName.includes('הנדס') || faculty.name.includes('הנדסה') || faculty.name.includes('טבע')) {
                    degreeType = 'B.Sc';
                    duration = 4;
                }
                if (programName.includes('רפואה') && !programName.includes('חרום') && !programName.includes('מערכות')) {
                    degreeType = 'M.D';
                    duration = 7;
                }

                const richDescription = `${dept.description} (מחלקה: ${dept.name})`;
                const progPayload: any = {
                    faculty_id: facultyId,
                    name: programName,
                    degree_type: degreeType,
                    duration_years: duration,
                    website_url: dept.pageUrl,
                    description: richDescription
                };

                // SELECT first
                const { data: existingProg } = await supabase
                    .from('programs')
                    .select('id')
                    .eq('faculty_id', facultyId)
                    .eq('name', programName)
                    .maybeSingle();

                if (existingProg) {
                    // Update
                    const { error: updateError } = await supabase
                        .from('programs')
                        .update(progPayload)
                        .eq('id', existingProg.id);

                    if (updateError) {
                        if (updateError.message.includes('description') || updateError.code === '42703') { // Undefined column
                            delete progPayload.description;
                            await supabase.from('programs').update(progPayload).eq('id', existingProg.id);
                        } else {
                            console.error(`    ❌ Failed to update program ${programName}: ${updateError.message}`);
                        }
                    }
                } else {
                    // Insert
                    const { error: insertProgError } = await supabase
                        .from('programs')
                        .insert(progPayload);

                    if (insertProgError) {
                        if (insertProgError.message.includes('description') || insertProgError.code === '42703') {
                            delete progPayload.description;
                            const retry = await supabase.from('programs').insert(progPayload);
                            if (retry.error) console.error(`    ❌ Failed program ${programName}: ${retry.error.message}`);
                        } else {
                            console.error(`    ❌ Failed program ${programName}: ${insertProgError.message}`);
                        }
                    }
                }
            }
        }
    }

    console.log('✅ BGU Data Ingestion Complete.');
    if (rules.admission_rules.bonuses) {
        console.log('ℹ️  Bonus Rules Loaded:', Object.keys(rules.admission_rules.bonuses).join(', '));
    }
}

seedBGU().catch(e => console.error(e));
