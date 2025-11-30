import { createClient } from '@supabase/supabase-js';

// --- PASTE YOUR SUPABASE KEYS HERE ---
const supabaseUrl = 'https://ugyrijxbauhmcdskcvfr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneXJpanhiYXVobWNkc2tjdmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjg1NDMsImV4cCI6MjA3OTk0NDU0M30.nqWNu45OasnjDU4pZPJlXOAo5m3gECr9SVmrwdMo64M';
// -------------------------------------

export const supabase = createClient(supabaseUrl, supabaseKey);