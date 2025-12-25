import { createClient } from '@supabase/supabase-js';
import type { Lead } from '../types/supabase';

// Helper to check environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export type { Lead };
