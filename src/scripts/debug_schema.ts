
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function debug() {
    console.log('Checking program_admission_requirements table structure...');
    const { data, error } = await supabase.from('program_admission_requirements').select('*').limit(1);

    if (error) {
        console.error('Error selecting from program_admission_requirements:', error);
    } else {
        console.log('Sample:', data);
        if (data && data.length > 0) {
            console.log('Keys:', Object.keys(data[0]));
        } else {
            console.log('Table empty, cannot infer keys purely from data.');
        }
    }
}

debug();
