import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables (since this is a script, import.meta.env won't work easily without specific setup, using dotenv for script)
dotenv.config();

// Replicate supabase client creation for Node environment
// Users might need to set these in .env locally for the script to run
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Note: User might use separate SERVICE_ROLE_KEY for admin scripts if RLS blocks, but instructed to use client for now.
// If RLS allows "authenticated" and we are script, we might need service role or sign in.
// Migration said "Allow all operations for authenticated users". 
// This script runs as "anon" usually unless we use service key.
// I will assume specific env var for script: SUPABASE_SERVICE_KEY or re-use ANON if policy is loose (created "true" for all authenticated).
// Actually, policy was "TO authenticated". Anon is NOT authenticated. 
// Use SERVICE_KEY for script if possible, or assume anon key works if policy changed to public (it wasn't).
// WAIT: The migration said `TO authenticated`. 
// For a script, we should use the SERVICE_KEY to bypass RLS or sign in.
// I'll grab VITE_SUPABASE_SERVICE_KEY if available, else ANON.
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY/VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to data.csv in root
const csvFilePath = path.resolve(__dirname, '../data.csv');

async function importLeads() {
    console.log(`Reading CSV from: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
        console.error('Error: data.csv not found in project root.');
        return;
    }

    const records = [];
    const parser = fs.createReadStream(csvFilePath).pipe(parse({
        columns: true,
        skip_empty_lines: true
    }));

    for await (const row of parser) {
        // Map fields
        // CSV Headers: 'User ID', 'Full Name', 'Q1', 'A1', 'Q3', 'A3' (from prompt)
        // Mappings:
        // 'User ID' -> facebook_user_id
        // 'Full Name' -> full_name
        // 'A1' -> age (assuming Q1 is age question)
        // 'A3' -> dilemma

        const lead = {
            facebook_user_id: row['User ID'] || row['UserLink'] || `manual_${Date.now()}_${Math.random()}`, // Fallback
            full_name: row['Full Name'],
            age: row['A1'],
            dilemma: row['A3'], // The crucial field
            profile_link: (row['User ID'] && row['User ID'].includes('http')) ? row['User ID'] : null,
            joined_group_at: row['Date Added'], // Mapping "Date Added" to joined_at
            city: row['Location'],
            target_degree: row['A2'], // Mapping A2 to intended degree
            status: 'new',
        };

        if (lead.facebook_user_id && lead.dilemma) {
            records.push(lead);
        }
    }

    console.log(`Parsed ${records.length} records. Uploading to Supabase...`);

    // Batch upsert? Or one by one for error handling? Upsert supports batch.
    const { data, error } = await supabase
        .from('leads')
        .upsert(records, { onConflict: 'facebook_user_id', ignoreDuplicates: false })
        .select();

    if (error) {
        console.error('Error uploading:', error);
    } else {
        console.log(`Success! Upserted ${data?.length || records.length} leads.`);
    }
}

importLeads().catch(console.error);
