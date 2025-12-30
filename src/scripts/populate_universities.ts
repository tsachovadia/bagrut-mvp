
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateDB() {
    console.log('Starting DB population...');

    // 1. Institutions
    const institutions = [
        {
            name: 'אוניברסיטת תל אביב',
            type: 'university',
            website_url: 'https://www.tau.ac.il',
            short_name: 'tau'
        },
        {
            name: 'הטכניון',
            type: 'university',
            website_url: 'https://www.technion.ac.il',
            short_name: 'technion'
        },
        {
            name: 'האוניברסיטה העברית',
            type: 'university',
            website_url: 'https://www.huji.ac.il',
            short_name: 'huji'
        },
        {
            name: 'אוניברסיטת בן גוריון',
            type: 'university',
            website_url: 'https://in.bgu.ac.il',
            short_name: 'bgu'
        }
    ];

    const instMap: Record<string, string> = {};

    for (const inst of institutions) {
        const { data: existing } = await supabase.from('institutions').select('id').eq('name', inst.name).single();
        let id = existing?.id;

        if (!id) {
            const { data, error } = await supabase.from('institutions').insert({
                name: inst.name,
                type: inst.type,
                website_url: inst.website_url
            }).select().single();

            if (error) {
                console.error(`Error inserting institution ${inst.name}:`, error);
                continue;
            }
            id = data.id;
        }

        instMap[inst.short_name] = id;
        console.log(`Institution ${inst.name} ID: ${id}`);
    }

    // 2. Programs Data defining Faculty per Program
    const programsData = [
        // === Tel Aviv University ===
        {
            inst_short: 'tau',
            faculty_name: 'מדעים מדויקים',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'תואר ראשון במדעי המחשב - חד חוגי',
            admission: {
                year: 2025,
                logic_rules: {
                    AND: [
                        { type: 'sekhem_general', operator: '>=', value: 730, label: 'ציון התאמה (סכם) 730' },
                        { type: 'psychometric_general', operator: '>=', value: 630, label: 'פסיכומטרי 630' },
                        {
                            OR: [
                                { type: 'bagrut_subject', subject: 'math', units: 5, operator: '>=', value: 80, label: 'מתמטיקה 5 יח״ל בציון 80' },
                                { type: 'bagrut_subject', subject: 'math', units: 4, operator: '>=', value: 85, label: 'מתמטיקה 4 יח״ל בציון 85' }
                            ]
                        }
                    ]
                }
            }
        },
        {
            inst_short: 'tau',
            faculty_name: 'מדעי החברה',
            name: 'פסיכולוגיה',
            degree_type: 'B.A',
            duration_years: 3,
            description: 'תואר ראשון בפסיכולוגיה - דו חוגי',
            admission: {
                year: 2025,
                logic_rules: {
                    OR: [
                        {
                            AND: [
                                { type: 'sekhem_general', operator: '>=', value: 650, label: 'ציון התאמה (סכם) 650' }
                            ],
                            label: 'קבלה על סמך סכם'
                        },
                        {
                            AND: [
                                { type: 'psychometric_general', operator: '>=', value: 730, label: 'פסיכומטרי 730' }
                            ],
                            label: 'קבלה על סמך פסיכומטרי בלבד'
                        }
                    ]
                }
            }
        },

        // === Technion ===
        {
            inst_short: 'technion',
            faculty_name: 'מדעי המחשב',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 4,
            description: 'הנדסת תוכנה / מדעי המחשב כללי',
            admission: {
                year: 2025,
                logic_rules: {
                    AND: [
                        { type: 'sekhem_technion', operator: '>=', value: 91, label: 'סכם טכניון 91' },
                        { type: 'psychometric_english', operator: '>=', value: 88, label: 'אנגלית 88 (פסיכומטרי/אמיר)' },
                        {
                            OR: [
                                { type: 'bagrut_subject', subject: 'math', units: 5, operator: '>=', value: 70, label: 'מתמטיקה 5 יח״ל בציון 70' },
                                { type: 'bagrut_subject', subject: 'math', units: 4, operator: '>=', value: 80, label: 'מתמטיקה 4 יח״ל בציון 80' }
                            ]
                        }
                    ]
                }
            }
        },

        // === Hebrew University ===
        {
            inst_short: 'huji',
            faculty_name: 'הנדסה ומדעי המחשב',
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'מדעי המחשב',
            admission: {
                year: 2025,
                logic_rules: {
                    AND: [
                        { type: 'sekhem_huji', operator: '>=', value: 74, label: 'סכם עברית 74' },
                        { type: 'psychometric_quant', operator: '>=', value: 130, label: 'כמותי 130' },
                        { type: 'bagrut_subject', subject: 'math', units: 5, operator: '>=', value: 90, label: 'מתמטיקה 5 יח״ל 90' },
                        { type: 'psychometric_english', operator: '>=', value: 85, label: 'אנגלית 85' }
                    ]
                }
            }
        },
        {
            inst_short: 'huji',
            faculty_name: 'מדעי החברה',
            name: 'פסיכולוגיה',
            degree_type: 'B.A',
            duration_years: 3,
            description: 'פסיכולוגיה',
            admission: {
                year: 2025,
                logic_rules: {
                    OR: [
                        { type: 'psychometric_general', operator: '>=', value: 740, label: 'קבלה ישירה פסיכומטרי 740' },
                        { type: 'bagrut_average', operator: '>=', value: 112.5, label: 'קבלה ישירה בגרות 112.5' }
                    ]
                }
            }
        },

        // === Ben Gurion ===
        {
            inst_short: 'bgu',
            faculty_name: 'מדעי הטבע', // CS is often here or dedicated
            name: 'מדעי המחשב',
            degree_type: 'B.Sc',
            duration_years: 3,
            description: 'מדעי המחשב',
            admission: {
                year: 2025,
                logic_rules: {
                    AND: [
                        { type: 'sekhem_engineering', operator: '>=', value: 760, label: 'סכם הנדסה/כמותי 760' },
                        { type: 'psychometric_general', operator: '>=', value: 660, label: 'פסיכומטרי 660' },
                        { type: 'psychometric_quant', operator: '>=', value: 135, label: 'כמותי 135' },
                        { type: 'psychometric_english', operator: '>=', value: 85, label: 'אנגלית 85' },
                        {
                            OR: [
                                { type: 'bagrut_subject', subject: 'math', units: 5, operator: '>=', value: 80, label: 'מתמטיקה 5 יח״ל 80' },
                                { type: 'bagrut_subject', subject: 'math', units: 4, operator: '>=', value: 90, label: 'מתמטיקה 4 יח״ל 90' }
                            ]
                        }
                    ]
                }
            }
        }
    ];

    for (const prog of programsData) {
        const instId = instMap[prog.inst_short];
        if (!instId) {
            console.warn(`Skipping program ${prog.name} - institution ${prog.inst_short} not found`);
            continue;
        }

        // Resolve Faculty
        let facultyId;
        // Check if faculty exists for THIS institution
        const { data: existingFac, error: findFacError } = await supabase.from('faculties')
            .select('id')
            .eq('name', prog.faculty_name)
            .eq('institution_id', instId)
            .maybeSingle();

        if (existingFac) {
            facultyId = existingFac.id;
        } else {
            const { data: newFac, error: facError } = await supabase.from('faculties')
                .insert({ name: prog.faculty_name, institution_id: instId })
                .select()
                .single();

            if (facError) {
                console.error(`Error creating faculty ${prog.faculty_name} for inst ${prog.inst_short}:`, facError);
                continue;
            }
            facultyId = newFac.id;
            console.log(`Created Faculty ${prog.faculty_name} for ${prog.inst_short} (${facultyId})`);
        }

        // Upsert Program
        let progId;
        const { data: existingProg } = await supabase.from('programs')
            .select('id')
            .eq('name', prog.name)
            .eq('faculty_id', facultyId)
            .eq('degree_type', prog.degree_type)
            .maybeSingle();

        if (existingProg) {
            progId = existingProg.id;
            console.log(`Program ${prog.name} at ${prog.inst_short} exists (${progId}), updating...`);
        } else {
            const { data, error } = await supabase.from('programs').insert({
                name: prog.name,
                faculty_id: facultyId,
                degree_type: prog.degree_type,
                duration_years: prog.duration_years,
                description: prog.description
            }).select().single();

            if (error) {
                console.error(`Error inserting program ${prog.name}:`, error);
                continue;
            }
            progId = data.id;
            console.log(`Created Program ${prog.name} at ${prog.inst_short} (${progId})`);
        }

        // Insert/Update Admission Requirement
        const tableRequirements = 'program_admission_requirements';

        const { data: existingReq } = await supabase.from(tableRequirements)
            .select('id')
            .eq('program_id', progId)
            .eq('year', prog.admission.year)
            .maybeSingle();

        if (existingReq) {
            const { error } = await supabase.from(tableRequirements)
                .update({
                    logic_rules: prog.admission.logic_rules,
                    status: 'published'
                })
                .eq('id', existingReq.id);
            if (error) console.error(`Error updating reqs for ${prog.name}:`, error);
            else console.log(`Updated requirements for ${prog.name}`);
        } else {
            const { error } = await supabase.from(tableRequirements).insert({
                program_id: progId,
                year: prog.admission.year,
                logic_rules: prog.admission.logic_rules,
                status: 'published'
            });
            if (error) console.error(`Error inserting reqs for ${prog.name}:`, error);
            else console.log(`Inserted requirements for ${prog.name}`);
        }
    }

    console.log('Database population complete!');
}

populateDB().catch(console.error);
