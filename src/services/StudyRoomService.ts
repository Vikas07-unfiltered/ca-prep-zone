
import { supabase } from '@/integrations/supabase/client';

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
  voice_enabled?: boolean;
}

// Helper function to safely convert Json to string array
function jsonToStringArray(json: any): string[] {
  if (Array.isArray(json)) {
    return json.filter(item => typeof item === 'string');
  }
  return [];
}

// Helper function to convert database row to StudyRoom
function mapDbRowToStudyRoom(row: any): StudyRoom {
  return {
    ...row,
    participants: jsonToStringArray(row.participants)
  };
}

async function generateUniqueRoomCode(): Promise<number> {
  let code: number;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000);
    const { data } = await supabase.from('study_rooms').select('id').eq('room_code', code).single();
    exists = !!data;
  }
  return code!;
}

async function createDailyRoom(roomName: string): Promise<string | null> {
  try {
    console.log('Creating Daily.co room for:', roomName);
    const { data, error } = await supabase.functions.invoke('create-daily-room', {
      body: { roomName }
    });

    if (error) {
      console.error('Error creating Daily.co room:', error);
      throw new Error(`Daily.co room creation failed: ${error.message}`);
    }

    if (!data?.url) {
      console.error('No URL returned from Daily.co room creation');
      throw new Error('Daily.co room creation returned no URL');
    }

    console.log('Daily.co room created successfully:', data.url);
    return data.url;
  } catch (error) {
    console.error('Error calling create-daily-room function:', error);
    throw error;
  }
}

export const StudyRoomService = {
  async getAll(): Promise<StudyRoom[]> {
    const { data, error } = await supabase.from('study_rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ? data.map(mapDbRowToStudyRoom) : [];
  },

  async create(room: Omit<StudyRoom, 'id' | 'created_at' | 'room_code'>): Promise<StudyRoom> {
    const room_code = await generateUniqueRoomCode();
    
    // Create Daily.co room first - if this fails, don't create the study room
    let daily_room_url: string | null = null;
    try {
      daily_room_url = await createDailyRoom(`studyroom-${room_code}`);
      if (!daily_room_url) {
        throw new Error('Failed to create Daily.co room - no URL returned');
      }
    } catch (error: any) {
      console.error('Failed to create Daily.co room:', error);
      throw new Error(`Voice chat setup failed: ${error.message}`);
    }
    
    const { data, error } = await supabase.from('study_rooms')
      .insert({ 
        ...room, 
        room_code,
        daily_room_url,
        voice_enabled: true // Enable voice by default
      })
      .select()
      .single();
    if (error) throw error;
    return mapDbRowToStudyRoom(data);
  },

  async joinRoom(room_code: number, participant: string): Promise<void> {
    // Fetch the room and its participants
    const { data: roomData, error: roomError } = await supabase.from('study_rooms')
      .select('participants')
      .eq('room_code', room_code)
      .single();
    if (roomError) throw roomError;
    
    const participants = jsonToStringArray(roomData.participants);

    // Limit: Only 50 users can join one room
    if (participants.length >= 50 && !participants.includes(participant)) {
      throw new Error('This room already has 50 participants.');
    }

    // Limit: One user can join only 5 rooms
    const { count: userRoomCount, error: userRoomError } = await supabase.from('study_rooms')
      .select('id', { count: 'exact', head: true })
      .contains('participants', [participant]);
    if (userRoomError) throw userRoomError;
    if (userRoomCount >= 5 && !participants.includes(participant)) {
      throw new Error('You can only join up to 5 rooms.');
    }

    if (!participants.includes(participant)) {
      participants.push(participant);
      await supabase.from('study_rooms')
        .update({ participants })
        .eq('room_code', room_code);
    }
  },

  async getRoomByCode(room_code: number): Promise<StudyRoom | null> {
    const { data, error } = await supabase.from('study_rooms')
      .select('*')
      .eq('room_code', room_code)
      .single();
    if (error) return null;
    return data ? mapDbRowToStudyRoom(data) : null;
  },

  async deleteRoom(roomId: string): Promise<void> {
    const { error } = await supabase.from('study_rooms')
      .delete()
      .eq('id', roomId);
    if (error) throw error;
  },

  async updateRoom(roomId: string, updates: Partial<StudyRoom>): Promise<void> {
    const { error } = await supabase.from('study_rooms')
      .update(updates)
      .eq('id', roomId);
    if (error) throw error;
  },

  async toggleVoiceChat(roomId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase.from('study_rooms')
      .update({ voice_enabled: enabled })
      .eq('id', roomId);
    if (error) throw error;
  }
};
