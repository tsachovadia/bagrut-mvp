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

// Paths - TAU
const DATA_DIR = path.join(process.cwd(), 'data/universities/tau');
const STRUCTURE_PATH = path.join(DATA_DIR, 'structure.json');
const RULES_PATH = path.join(DATA_DIR, 'rules.json');

// Interfaces
interface TAUStructure {
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

interface TAURules {
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

async function seedTAU() {
    console.log('🌵 Starting TAU Seed Script...');

    // 1. Read Data
    const structureRaw = fs.readFileSync(STRUCTURE_PATH, 'utf-8');
    const structure: TAUStructure = JSON.parse(structureRaw);

    const rulesRaw = fs.readFileSync(RULES_PATH, 'utf-8');
    const rules: TAURules = JSON.parse(rulesRaw);

    console.log(`📘 Loaded ${structure.university.name} with ${structure.university.faculties.length} faculties.`);

    // 2. Upsert University (Legacy)
    const { data: uniData, error: uniError } = await supabase
        .from('universities')
        .upsert({
            key: 'tau',
            name: structure.university.name,
            calculator_type: rules.admission_rules.calculator_type || 'tau_sekem',
            website_url: structure.university.website
        }, { onConflict: 'key' })
        .select()
        .single();

    if (uniError || !uniData) {
        console.error('❌ Error upserting university (legacy table):', uniError);
    } else {
        console.log(`✅ Upserted University (Legacy): ${uniData.name} (${uniData.id})`);
    }

    // 3. Get or Create Institution
    let instId: string;
    const { data: existingInst } = await supabase
        .from('institutions')
        .select('id')
        .eq('name', structure.university.name)
        .maybeSingle();

    if (existingInst) {
        instId = existingInst.id;
        console.log(`✅ Found Institution: ${structure.university.name} (${instId})`);
    } else {
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

        const { data: existingFac } = await supabase
            .from('faculties')
            .select('id')
            .eq('institution_id', instId)
            .eq('name', faculty.name)
            .maybeSingle();

        if (existingFac) {
            facultyId = existingFac.id;
        } else {
            const { data: newFac, error: insertFacError } = await supabase
                .from('faculties')
                .insert({
                    institution_id: instId,
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

                // Heuristics for TAU
                let degreeType = 'B.A';
                let duration = 3;

                // Engineering = B.Sc, 4 years
                if (faculty.name.includes('הנדסה')) {
                    degreeType = 'B.Sc';
                    duration = 4;
                }
                // Exact Sciences / Life Sciences = B.Sc, 3 years
                else if (faculty.name.includes('מדעים מדויקים') || faculty.name.includes('מדעי החיים')) {
                    degreeType = 'B.Sc';
                    duration = 3;
                }
                // Medicine = M.D, 7 years
                else if (programName.includes('רפואה') && !programName.includes('חירום') && !programName.includes('מערכות') && !programName.includes('מדעי')) {
                    degreeType = 'M.D';
                    duration = 7;
                }
                // Law = LL.B, 3.5 years
                else if (faculty.name.includes('משפטים')) {
                    degreeType = 'LL.B';
                    duration = 3.5;
                }

                const richDescription = `${dept.description} (חוג: ${dept.name})`;
                const progPayload: any = {
                    faculty_id: facultyId,
                    name: programName,
                    degree_type: degreeType,
                    duration_years: duration,
                    website_url: dept.pageUrl,
                    description: richDescription
                };

                // Upsert Logic (Select then Insert/Update)
                const { data: existingProg } = await supabase
                    .from('programs')
                    .select('id')
                    .eq('faculty_id', facultyId)
                    .eq('name', programName)
                    .maybeSingle();

                if (existingProg) {
                    const { error: updateError } = await supabase
                        .from('programs')
                        .update(progPayload)
                        .eq('id', existingProg.id);
                    if (updateError) console.error(`    ❌ Update failed ${programName}: ${updateError.message}`);
                } else {
                    const { error: insertProgError } = await supabase
                        .from('programs')
                        .insert(progPayload);
                    if (insertProgError) {
                        // Retry logic without description column if that's the issue (from BGU experience)
                        if (insertProgError.message.includes('description') || insertProgError.code === '42703') {
                            delete progPayload.description;
                            await supabase.from('programs').insert(progPayload);
                        } else {
                            console.error(`    ❌ Insert failed ${programName}: ${insertProgError.message}`);
                        }
                    }
                }
            }
        }
    }

    console.log('✅ TAU Data Ingestion Complete.');
}

seedTAU().catch(e => console.error(e));
