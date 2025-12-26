import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY; // Try both

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestLead() {
    const lead = {
        full_name: 'צח עובדיה',
        facebook_user_id: 'test_tzach_' + Date.now(), // Unique ID
        dilemma: 'מתלבט אם ללמוד הנדסת חשמל או מדעי המחשב',
        email: 'ts23ov@gmail.com',
        joined_group_at: '2025-03-01T00:00:00.000Z',
        status: 'new',
        city: 'תל אביב', // Optional default
        target_degree: 'הנדסה/מחשבים'
    };

    const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select();

    if (error) {
        console.error('Error creating lead:', error);
    } else {
        console.log('Successfully created lead:', data);
    }
}

createTestLead();
