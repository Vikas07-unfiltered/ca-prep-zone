import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const supabaseUrl = 'https://iylyzckrakrpoddamwml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHl6Y2tyYWtycG9kZGFtd21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTcxNjgsImV4cCI6MjA2MzA5MzE2OH0.jy8IwzHGQ8HpRNrIyAbBPH6oi8oyGcvY43ig0G016Nk';
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export interface StudyRoom {
  id?: string;
  name: string;
  description?: string;
  ca_level: string;
  created_by?: string;
  participants?: string[];
  created_at?: string;
  room_code?: number;
  daily_room_url?: string;
}

async function generateUniqueRoomCode(): Promise<number> {
  let code: number;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000);
    const { data } = await (supabaseClient as any).from('study_rooms').select('id').eq('room_code', code).single();
    exists = !!data;
  }
  return code!;
}


export const StudyRoomService = {
  async getAll(): Promise<StudyRoom[]> {
    const { data, error } = await (supabaseClient as any).from('study_rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(room: Omit<StudyRoom, 'id' | 'created_at' | 'room_code' | 'daily_room_url'>): Promise<StudyRoom> {
    const room_code = await generateUniqueRoomCode();
    const { data, error } = await (supabaseClient as any).from('study_rooms')
      .insert({ ...room, room_code })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async joinRoom(room_code: number, participant: string): Promise<void> {
    // Fetch the room and its participants
    const { data: roomData, error: roomError } = await (supabaseClient as any).from('study_rooms')
      .select('participants')
      .eq('room_code', room_code)
      .single();
    if (roomError) throw roomError;
    const participants = roomData.participants || [];

    // Limit: Only 50 users can join one room
    if (participants.length >= 50 && !participants.includes(participant)) {
      throw new Error('This room already has 50 participants.');
    }

    // Limit: One user can join only 5 rooms
    const { count: userRoomCount, error: userRoomError } = await (supabaseClient as any).from('study_rooms')
      .select('id', { count: 'exact', head: true })
      .contains('participants', [participant]);
    if (userRoomError) throw userRoomError;
    if (userRoomCount >= 5 && !participants.includes(participant)) {
      throw new Error('You can only join up to 5 rooms.');
    }

    if (!participants.includes(participant)) {
      participants.push(participant);
      await (supabaseClient as any).from('study_rooms')
        .update({ participants })
        .eq('room_code', room_code);
    }
  },

  async getRoomByCode(room_code: number): Promise<StudyRoom | null> {
    const { data, error } = await (supabaseClient as any).from('study_rooms')
      .select('*')
      .eq('room_code', room_code)
      .single();
    if (error) return null;
    return data;
  },

  async deleteRoom(roomId: string): Promise<void> {
    const { error } = await (supabaseClient as any).from('study_rooms')
      .delete()
      .eq('id', roomId);
    if (error) throw error;
  },

  async updateRoom(roomId: string, updates: Partial<StudyRoom>): Promise<void> {
    const { error } = await (supabaseClient as any).from('study_rooms')
      .update(updates)
      .eq('id', roomId);
    if (error) throw error;
  }
}; 