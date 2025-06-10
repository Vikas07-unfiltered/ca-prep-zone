import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

export type PomodoroSessionInsert = {
  user_id: string;
  subject: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  room_id?: string | null;
};

export async function logPomodoroSession({
  user_id,
  subject,
  start_time,
  end_time,
  room_id = null,
}: PomodoroSessionInsert) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert([
      {
        user_id,
        subject,
        start_time,
        end_time,
        room_id,
      }
    ])
    .select();

  if (error) {
    console.error('Error logging Pomodoro session:', error);
    throw error;
  }
  return data;
}
