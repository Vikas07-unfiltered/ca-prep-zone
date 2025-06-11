
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

// Aggregates total study time per subject from both study_sessions and pomodoro_sessions
export async function getTotalTimePerSubject(user_id: string, startDate?: Date, endDate?: Date) {
  // Build filters for date range
  let studySessionsQuery = supabase
    .from('study_sessions')
    .select('subject, duration, date')
    .eq('user_id', user_id);
  let pomodorosQuery = supabase
    .from('pomodoro_sessions')
    .select('subject, start_time, end_time')
    .eq('user_id', user_id);

  if (startDate && endDate) {
    studySessionsQuery = studySessionsQuery.gte('date', startDate.toISOString()).lte('date', endDate.toISOString());
    pomodorosQuery = pomodorosQuery.gte('start_time', startDate.toISOString()).lte('end_time', endDate.toISOString());
  }

  const { data: studySessions, error: studyError } = await studySessionsQuery;
  const { data: pomodoros, error: pomoError } = await pomodorosQuery;

  if (studyError || pomoError) {
    throw studyError || pomoError;
  }

  // Aggregate time from study_sessions (duration is in minutes)
  const subjectTotals: Record<string, number> = {};
  (studySessions || []).forEach(session => {
    if (!session.subject) return;
    subjectTotals[session.subject] = (subjectTotals[session.subject] || 0) + (session.duration || 0);
  });

  // Aggregate time from pomodoro_sessions
  (pomodoros || []).forEach(pomo => {
    if (!pomo.subject || !pomo.start_time || !pomo.end_time) return;
    const start = new Date(pomo.start_time).getTime();
    const end = new Date(pomo.end_time).getTime();
    const duration = Math.max(0, Math.round((end - start) / 60000)); // minutes
    subjectTotals[pomo.subject] = (subjectTotals[pomo.subject] || 0) + duration;
  });

  return subjectTotals; // { subject: totalMinutes, ... }
}

// Format minutes as 'X hr Y min'
export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h !== 1 ? 's' : ''}`;
  return `${h} hr${h !== 1 ? 's' : ''} ${m} min`;
}

// Get comprehensive study analytics including both manual sessions and pomodoro sessions
export async function getStudyAnalytics(user_id: string, startDate?: Date, endDate?: Date) {
  // Get total time per subject
  const subjectTotals = await getTotalTimePerSubject(user_id, startDate, endDate);
  
  // Get session counts
  let studySessionsQuery = supabase
    .from('study_sessions')
    .select('subject, date')
    .eq('user_id', user_id);
  let pomodoroSessionsQuery = supabase
    .from('pomodoro_sessions')
    .select('subject, start_time')
    .eq('user_id', user_id);

  if (startDate && endDate) {
    studySessionsQuery = studySessionsQuery.gte('date', startDate.toISOString()).lte('date', endDate.toISOString());
    pomodoroSessionsQuery = pomodoroSessionsQuery.gte('start_time', startDate.toISOString()).lte('start_time', endDate.toISOString());
  }

  const { data: studySessions } = await studySessionsQuery;
  const { data: pomodoroSessions } = await pomodoroSessionsQuery;

  // Count sessions per subject
  const sessionCounts: Record<string, number> = {};
  (studySessions || []).forEach(session => {
    if (session.subject) {
      sessionCounts[session.subject] = (sessionCounts[session.subject] || 0) + 1;
    }
  });
  (pomodoroSessions || []).forEach(session => {
    if (session.subject) {
      sessionCounts[session.subject] = (sessionCounts[session.subject] || 0) + 1;
    }
  });

  return {
    subjectTotals,
    sessionCounts,
    totalMinutes: Object.values(subjectTotals).reduce((sum, minutes) => sum + minutes, 0),
    totalSessions: Object.values(sessionCounts).reduce((sum, count) => sum + count, 0)
  };
}
