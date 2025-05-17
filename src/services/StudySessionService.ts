
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface StudySession {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  subject: string;
  date: Date;
  duration: number; // in minutes
}

export const StudySessionService = {
  async getStudySessions(user: User | null) {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error("Error fetching study sessions:", error);
      throw error;
    }
    
    return data;
  },
  
  async createStudySession(studySession: StudySession) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert([studySession])
      .select();
      
    if (error) {
      console.error("Error creating study session:", error);
      throw error;
    }
    
    return data[0];
  },
  
  async updateStudySession(id: string, updates: Partial<StudySession>) {
    const { data, error } = await supabase
      .from('study_sessions')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error("Error updating study session:", error);
      throw error;
    }
    
    return data[0];
  },
  
  async deleteStudySession(id: string) {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting study session:", error);
      throw error;
    }
    
    return true;
  }
};
