import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Database } from '../types/supabase'; // Assuming types are generated, or we use 'any' for seed script flexibilty

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Or SERVICE_ROLE_KEY if needed for RLS bypass

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Starting Seed: Universities & Rules...');

    // 1. Seed Universities
    const universities = [
        { name: 'Technion', key: 'technion', calculator_type: 'technion_exact', website_url: 'https://admissions.technion.ac.il' },
        { name: 'Tel Aviv University', key: 'tau', calculator_type: 'linear_approx', website_url: 'https://go.tau.ac.il' },
        { name: 'Ben Gurion University', key: 'bgu', calculator_type: 'linear_approx', website_url: 'https://in.bgu.ac.il' },
        { name: 'Hebrew University', key: 'huji', calculator_type: 'linear_approx', website_url: 'https://info.huji.ac.il' },
        { name: 'Bar Ilan University', key: 'biu', calculator_type: 'linear_approx', website_url: 'https://www.biu.ac.il' },
        { name: 'University of Haifa', key: 'haifa', calculator_type: 'haifa_weighted', website_url: 'https://www.haifa.ac.il' },
        { name: 'Ariel University', key: 'ariel', calculator_type: 'linear_approx', website_url: 'https://www.ariel.ac.il' },
        { name: 'Open University', key: 'openu', calculator_type: 'afik_maavar', website_url: 'https://www.openu.ac.il' },
    ];

    for (const uni of universities) {
        const { data, error } = await supabase
            .from('universities')
            .upsert(uni, { onConflict: 'key' })
            .select()
            .single();

        if (error) console.error(`Error seeding ${uni.name}:`, error);
        else console.log(`✅ Seeded ${uni.name}`);

        // 2. Seed Programs (Example: Medicine & CS)
        if (data) {
            await seedPrograms(data.id, uni.key);
        }
    }

    // 3. Seed Exam Schedule
    await seedSchedules();

    console.log('🏁 Seed Complete.');
}

async function seedPrograms(uniId: string, uniKey: string) {
    // Define some representative programs with the "Hard Turth" logic we researched
    const programs = [];

    // Medicine (The "Complex Track")
    if (['technion', 'tau', 'huji', 'bgu', 'biu', 'ariel'].includes(uniKey)) {
        programs.push({
            university_id: uniId,
            name: 'Medicine (MD)',
            degree_type: 'M.D',
            duration_years: 7, // 6 + 1 internship
            is_direct_track: false,
            // Logic for Medicine Rules
            rules: {
                year: 2025,
                min_psychometric: 740, // The baseline we found
                min_sekem: uniKey === 'technion' ? 92.0 : 720, // 92 for Technion, ~720 for TAU psychometric heavy
                logic_config: {
                    requires_mor: true,
                    math_5u_mandatory: true
                }
            }
        });
    }

    // Computer Science (The standard High-Bar)
    programs.push({
        university_id: uniId,
        name: 'Computer Science',
        degree_type: 'B.Sc',
        duration_years: 3,
        is_direct_track: false,
        rules: {
            year: 2025,
            min_sekem: uniKey === 'technion' ? 90.0 : 700,
            logic_config: {}
        }
    });

    for (const prog of programs) {
        const { rules, ...progData } = prog;

        // Insert Program
        const { data: progRow, error } = await supabase
            .from('programs')
            .insert(progData)
            .select() // In real app use upsert with unique constraint on name+uni
            .single();

        if (error) {
            // mild error handling for duplicates in simple seed
            continue;
        }

        // Insert Rule
        if (progRow) {
            await supabase.from('admission_rules').insert({
                program_id: progRow.id,
                ...rules
            });
        }
    }
}

async function seedSchedules() {
    const schedules = [
        // Psychometric 2025
        { exam_type: 'psychometric', season: 'spring_2025', exam_date: '2025-04-09' },
        { exam_type: 'psychometric', season: 'summer_2025', exam_date: '2025-07-03' },
        { exam_type: 'psychometric', season: 'fall_2025', exam_date: '2025-09-02' },
        { exam_type: 'psychometric', season: 'winter_2025', exam_date: '2025-12-19' },

        // Bagrut Summer 2025 (Sample)
        { exam_type: 'bagrut', season: 'summer_2025', subject: 'Math 5u Q1', exam_date: '2025-05-12' },
        { exam_type: 'bagrut', season: 'summer_2025', subject: 'English G', exam_date: '2025-05-20' },
        { exam_type: 'bagrut', season: 'summer_2025', subject: 'Physics', exam_date: '2025-06-23' },

        // MOR
        { exam_type: 'mor', season: '2025', exam_date: '2025-06-15' } // Estimated
    ];

    const { error } = await supabase.from('exam_schedules').insert(schedules);
    if (error) console.error('Error seeding schedules:', error);
    else console.log('✅ Seeded Exam Schedules');
}

seed();
