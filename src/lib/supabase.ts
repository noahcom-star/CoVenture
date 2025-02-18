import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom fetch implementation with CORS handling
const customFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    const urlString = url.toString();
    
    const modifiedInit: RequestInit = {
      ...init,
      credentials: 'same-origin', // Changed from 'include' to 'same-origin'
      mode: 'cors',
      cache: 'no-cache' as RequestCache,
      headers: {
        ...init?.headers,
        'X-Client-Info': 'supabase-js/2.0.0',
      },
    };

    const response = await fetch(urlString, modifiedInit);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }
};

// Create Supabase client with updated configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.0.0',
    },
  },
}); 