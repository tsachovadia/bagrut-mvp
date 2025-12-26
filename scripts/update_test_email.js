import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTestLeadEmail() {
    const allowedEmail = 'tsach.ovadia@post.runi.ac.il';
    const targetName = 'צח עובדיה';

    console.log(`Updating email for ${targetName} to ${allowedEmail}...`);

    const { data, error } = await supabase
        .from('leads')
        .update({ email: allowedEmail })
        .eq('full_name', targetName) // Assuming full_name is unique enough for this test user
        .select();

    if (error) {
        console.error('Error updating lead:', error);
    } else {
        console.log('Successfully updated lead:', data);
    }
}

updateTestLeadEmail();
