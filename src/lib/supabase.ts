import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only initialize if we have the credentials. 
// During build/prerender on Vercel, if these are missing, we provide dummy strings 
// to prevent the build from crashing, as the client won't actually be used during SSR for these static pages.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('Supabase credentials missing. Check your .env.local file.');
    }
}

