import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Session = {
  id: string;
  date: string;
  club: string;
  type: string;
  note: string;
  // New fields replacing sliders
  distance: string;   // 距离
  direction: string;  // 方向
  body_note: string;  // 身体备注
  // Legacy (kept for DB compat, set to 0)
  smoothness: number;
  contact: number;
  body: number;
  created_at: string;
};

export type Video = {
  id: string;
  date: string;
  club: string;
  type: string;
  url: string;
  filename: string;
  created_at: string;
};

export const CLUBS = [
  'Driver', '3W', '5W', 'Hybrid',
  '4i', '5i', '6i', '7i', '8i', '9i',
  'PW', 'SW', 'LW', 'Putter'
];

export const TRAINING_TYPES = [
  'Full Swing', 'Half Swing', 'Drill',
  'Short Game', 'Putting', 'Warm-up'
];
