import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyCounts() {
    console.log('🔍 Verifying Ingestion Counts...');

    // 1. Institutions
    const { data: insts, error: instError } = await supabase
        .from('institutions')
        .select('id, name')
        .order('name');

    if (instError) {
        console.error('❌ Error fetching institutions:', instError);
        return;
    }

    console.log(`\n🏛️ Total Institutions: ${insts?.length}`);
    insts?.forEach(i => console.log(`  - ${i.name}`));

    // 2. Faculties
    const { count: facCount, error: facError } = await supabase
        .from('faculties')
        .select('*', { count: 'exact', head: true });

    if (facError) console.error('❌ Error counting faculties:', facError);
    else console.log(`\n🏢 Total Faculties: ${facCount}`);

    // 3. Programs
    const { count: progCount, error: progError } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true });

    if (progError) console.error('❌ Error counting programs:', progError);
    else console.log(`\n🎓 Total Programs: ${progCount}`);

    // 4. Programs per Institution
    console.log('\n📊 Programs per Institution:');
    for (const inst of insts || []) {
        // Get faculties for this institution
        const { data: faculties } = await supabase
            .from('faculties')
            .select('id')
            .eq('institution_id', inst.id);

        if (faculties && faculties.length > 0) {
            const facIds = faculties.map(f => f.id);
            const { count } = await supabase
                .from('programs')
                .select('*', { count: 'exact', head: true })
                .in('faculty_id', facIds);
            console.log(`  - ${inst.name}: ${count} programs`);
        } else {
            console.log(`  - ${inst.name}: 0 programs (No faculties?)`);
        }
    }
}

verifyCounts();
