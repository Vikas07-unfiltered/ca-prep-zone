
import { supabase } from "@/integrations/supabase/client";

export interface StudySession {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  subject: string;
  date: Date;
  duration: number;
  created_at?: string;
  updated_at?: string;
}

// Helper function to format dates for Supabase
const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

// Helper function to parse dates from Supabase
const parseDateFromSupabase = (dateStr: string): Date => {
  return new Date(dateStr);
};

export const StudySessionService = {
  async getStudySessions(userId: string): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching study sessions:', error);
      throw error;
    }
    
    // Convert dates from strings to Date objects
    return data?.map(session => ({
      ...session,
      date: parseDateFromSupabase(session.date)
    })) || [];
  },
  
  async createStudySession(session: Omit<StudySession, 'id' | 'created_at' | 'updated_at'>): Promise<StudySession> {
    // Format the date for Supabase
    const supabaseSession = {
      ...session,
      date: formatDateForSupabase(session.date)
    };
    
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(supabaseSession)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating study session:', error);
      throw error;
    }
    
    // Convert date back to Date object
    return {
      ...data,
      date: parseDateFromSupabase(data.date)
    };
  },
  
  async updateStudySession(session: Partial<StudySession> & { id: string }): Promise<StudySession> {
    // Format the date for Supabase if it exists
    const supabaseSession = {
      ...session,
      date: session.date ? formatDateForSupabase(session.date) : undefined
    };
    
    const { data, error } = await supabase
      .from('study_sessions')
      .update(supabaseSession)
      .eq('id', session.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating study session:', error);
      throw error;
    }
    
    // Convert date back to Date object
    return {
      ...data,
      date: parseDateFromSupabase(data.date)
    };
  },
  
  async deleteStudySession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId);
      
    if (error) {
      console.error('Error deleting study session:', error);
      throw error;
    }
  }
};
