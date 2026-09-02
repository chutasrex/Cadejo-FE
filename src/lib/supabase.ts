import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbmanrsfdjnrzcezpgax.supabase.co';
const supabaseAnonKey = 'sb_publishable_Cq3ZlDcN017EV45cJn5yTw_LYP2xhKq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});