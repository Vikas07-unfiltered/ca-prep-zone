
import { supabase } from "@/integrations/supabase/client";

interface StudyRoom {
  id?: string;
  created_at?: string;
  created_by: string;
  name: string;
  description: string;
  ca_level: string;
  room_code?: number;
  participants: string[];
  daily_room_url?: string;
  voice_enabled?: boolean;
}

class StudyRoomServiceClass {
  private generateRoomCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private generateAgoraChannel(roomId: string): string {
    // Generate a clean channel name for Agora from room ID
    return `room_${roomId.replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  // Helper function to convert Json array to string array
  private convertParticipants(participants: any): string[] {
    if (!participants) return [];
    if (Array.isArray(participants)) {
      return participants.map(p => String(p));
    }
    return [];
  }

  async create(roomData: Omit<StudyRoom, 'id' | 'room_code' | 'created_at'>): Promise<StudyRoom> {
    const roomCode = this.generateRoomCode();
    
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .insert([
          {
            ...roomData,
            room_code: roomCode,
            voice_enabled: true,
            // Store Agora channel name instead of Daily.co URL
            daily_room_url: this.generateAgoraChannel(roomCode.toString())
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating study room:', error);
        throw new Error(error.message);
      }

      console.log('Study room created successfully:', data);
      return {
        ...data,
        participants: this.convertParticipants(data.participants)
      };
    } catch (error) {
      console.error('Error in StudyRoomService.create:', error);
      throw error;
    }
  }

  async getAll(): Promise<StudyRoom[]> {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching study rooms:', error);
        throw new Error(error.message);
      }

      return (data || []).map(room => ({
        ...room,
        participants: this.convertParticipants(room.participants)
      }));
    } catch (error: any) {
      console.error('Error in StudyRoomService.getAll:', error);
      throw error;
    }
  }

  async getRoomByCode(roomCode: number): Promise<StudyRoom | null> {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (error) {
        console.error('Error fetching study room by code:', error);
        return null;
      }

      return data ? {
        ...data,
        participants: this.convertParticipants(data.participants)
      } : null;
    } catch (error: any) {
      console.error('Error in StudyRoomService.getRoomByCode:', error);
      throw error;
    }
  }

  async joinRoom(roomCode: number, userId: string): Promise<void> {
    try {
      // Get the room
      const room = await this.getRoomByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if the user is already in the room
      if (room.participants.includes(userId)) {
        console.log('User already in the room');
        return;
      }

      // Add the user to the participants array
      const updatedParticipants = [...room.participants, userId];

      // Update the room in the database
      const { error } = await supabase
        .from('study_rooms')
        .update({ participants: updatedParticipants })
        .eq('room_code', roomCode);

      if (error) {
        console.error('Error joining study room:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error in StudyRoomService.joinRoom:', error);
      throw error;
    }
  }

  async leaveRoom(roomCode: number, userId: string): Promise<void> {
    try {
      // Get the room
      const room = await this.getRoomByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if the user is in the room
      if (!room.participants.includes(userId)) {
        console.log('User not in the room');
        return;
      }

      // Remove the user from the participants array
      const updatedParticipants = room.participants.filter(
        (participant) => participant !== userId
      );

      // Update the room in the database
      const { error } = await supabase
        .from('study_rooms')
        .update({ participants: updatedParticipants })
        .eq('room_code', roomCode);

      if (error) {
        console.error('Error leaving study room:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error in StudyRoomService.leaveRoom:', error);
      throw error;
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Error deleting study room:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error in StudyRoomService.deleteRoom:', error);
      throw error;
    }
  }

  async toggleVoiceChat(roomId: string, enabled: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_rooms')
        .update({ voice_enabled: enabled })
        .eq('id', roomId);
  
      if (error) {
        console.error('Error toggling voice chat:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error in StudyRoomService.toggleVoiceChat:', error);
      throw error;
    }
  }
}

export const StudyRoomService = new StudyRoomServiceClass();
export type { StudyRoom };
