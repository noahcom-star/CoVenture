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
  db: {
    schema: 'public'
  }
});

// Initialize realtime client
const REALTIME_DEFAULTS = {
  RECONNECT_INTERVAL: 1000,
  MAX_RECONNECT_ATTEMPTS: 10,
};

let reconnectAttempts = 0;

// Connect to realtime
supabase.realtime.connect();

// Handle connection state
supabase.realtime.onConnectionStateChange((event) => {
  console.log('Realtime connection state:', event.current);
  
  if (event.current === 'disconnected') {
    console.log('Realtime disconnected, attempting to reconnect...');
    if (reconnectAttempts < REALTIME_DEFAULTS.MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        console.log('Attempting to reconnect realtime client...');
        supabase.realtime.connect();
        reconnectAttempts++;
      }, REALTIME_DEFAULTS.RECONNECT_INTERVAL);
    }
  } else if (event.current === 'connected') {
    console.log('Realtime connected');
    reconnectAttempts = 0;
  }
}); 