// ... (previous imports remain the same)

import { Doodle } from "@/components/ui/Doodle";

import * as React from "react";

// Import charts and table from StudyAnalysis
import StudyBarChart from "./StudyAnalysis";
import StudyPieChart from "./StudyAnalysis";
import StudyAnalysisTable from "./StudyAnalysis";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Chat } from "@/components/Chat";
import { getTotalTimePerSubject, formatMinutes } from '@/services/StudyAnalysisService';

// Utility to format hours
function formatHours(hours: number) {
  return `${hours.toFixed(1)} hrs`;
}

// CA Levels and Subjects (centralized)
import { CA_LEVELS } from "@/data/caLevels";

// --- CA Level/Subject state for session form ---
// (Moved into Planner component below)

// Types for study sessions
// Updated to use string UUID for id
type StudySession = {
  id: string; // uuid
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
};

// No initial sessions; user starts with an empty planner
const initialStudySessions: StudySession[] = [];

const motivationalQuotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "Great things never come from comfort zones.",
  "Discipline is the bridge between goals and accomplishment.",
  "Push yourself, because no one else is going to do it for you.",
  "The secret of getting ahead is getting started."
];

function getRandomQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

const Planner = () => {
  // --- Aggregated subject totals from both study_sessions & pomodoro_sessions ---
  const { user } = useAuth();
  const [subjectTotals, setSubjectTotals] = useState<Record<string, number>>({});
  const [totalsLoading, setTotalsLoading] = useState(false);

  // Date filter state
  const [filterPreset, setFilterPreset] = useState<'all'|'week'|'month'|'custom'>('all');
  const [customRange, setCustomRange] = useState<{start: Date|null, end: Date|null}>({start: null, end: null});
  const [dateRange, setDateRange] = useState<{start: Date|null, end: Date|null}>({start: null, end: null});

  // Compute date range based on preset
  useEffect(() => {
    const now = new Date();
    let start: Date|null = null, end: Date|null = null;
    if (filterPreset === 'week') {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day + (day === 0 ? -6 : 1)); // Monday
      start.setHours(0,0,0,0);
      end = new Date(now);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);
    } else if (filterPreset === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filterPreset === 'custom' && customRange.start && customRange.end) {
      start = customRange.start;
      end = customRange.end;
    }
    setDateRange({ start, end });
  }, [filterPreset, customRange]);

  useEffect(() => {
    if (!user) return;
    setTotalsLoading(true);
    getTotalTimePerSubject(user.id, dateRange.start ?? undefined, dateRange.end ?? undefined)
      .then(setSubjectTotals)
      .finally(() => setTotalsLoading(false));
  }, [user, dateRange]);
  // Always scroll to top when Planner mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Dashboard Summary ---
  // (already in state/effects above)

  // --- CA Level/Subject state for session form ---
  const [selectedLevel, setSelectedLevel] = useState(CA_LEVELS[0].level);
  const subjectsForSelectedLevel = CA_LEVELS.find(l => l.level === selectedLevel)?.subjects || [];

  // State for study sessions
  // Study sessions synced with Supabase
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // Load sessions from Supabase on mount
  useEffect(() => {
    if (!user) return;
    setSessionsLoading(true);
    supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          setSessionsError('Failed to load sessions');
          setSessionsLoading(false);
          return;
        }
        if (data) {
          setStudySessions(
            data.map((s: any) => ({
              id: s.id,
              subject: s.subject,
              date: new Date(s.date),
              startTime: s.start_time || "09:00",
              endTime: s.end_time || "10:00",
              notes: s.description || ""
            }))
          );
        }
        setSessionsLoading(false);
      });
  }, [user]);

  // Sync sessions to Supabase on change
  useEffect(() => {
    if (!user) return;
    if (sessionsLoading) return;
    // Upsert all sessions for the user, mapping to Supabase fields
    const upserts = studySessions.map((s) => {
      // Compute duration in hours (rounded to nearest int for int4)
      const [startH, startM] = s.startTime.split(":").map(Number);
      const [endH, endM] = s.endTime.split(":").map(Number);
      const duration = Math.round(((endH + endM / 60) - (startH + startM / 60)));
      return {
        id: s.id, // uuid string
        user_id: user.id, // uuid string
        subject: s.subject,
        date: s.date instanceof Date ? s.date.toISOString() : s.date,
        description: s.notes || "",
        title: s.subject + " session",
        duration: duration > 0 ? duration : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
    if (upserts.length > 0) {
      supabase.from('study_sessions').upsert(upserts, { onConflict: 'id' })
        .then(({ error }) => {
          if (error) {
            alert('Failed to save to Supabase: ' + error.message);
            console.error('Supabase upsert error:', error);
          }
        });
    }
  }, [studySessions, user, sessionsLoading]);

  // State for new session dialog
  const [isAddingSession, setIsAddingSession] = useState(false);
  // State for new session form
  const [newSession, setNewSession] = useState<StudySession>(() => {
    const saved = localStorage.getItem('newSession');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, date: new Date(parsed.date) };
      } catch {
        // fallback
      }
    }
    return {
      id: Date.now(),
      subject: (CA_LEVELS.find(l => l.level === CA_LEVELS[0].level)?.subjects[0] || ""),
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      notes: ""
    };
  });
  // State for calendar date
  const [date, setDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem('plannerDate');
    if (saved) {
      try {
        return new Date(saved);
      } catch {}
    }
    return new Date();
  });

  // Filtered sessions for selected date
  const filteredSessions = studySessions.filter(
    session => date && session.date.toDateString() === date.toDateString()
  );

  // Persist studySessions, newSession, and date to localStorage
  React.useEffect(() => {
    localStorage.setItem('studySessions', JSON.stringify(studySessions));
  }, [studySessions]);
  React.useEffect(() => {
    localStorage.setItem('newSession', JSON.stringify(newSession));
  }, [newSession]);
  React.useEffect(() => {
    if (date) localStorage.setItem('plannerDate', date.toISOString());
  }, [date]);

  // Add a new session
  // Book-light doodle state: bulb on/off
  const [bulbOn, setBulbOn] = useState(false);

  const handleAddSession = () => {
    // Use crypto.randomUUID() for Supabase uuid
    setStudySessions([
      ...studySessions,
      { ...newSession, id: crypto.randomUUID() }
    ]);
    setIsAddingSession(false);
    setNewSession({
      id: crypto.randomUUID(),
      subject: (CA_LEVELS.find(l => l.level === CA_LEVELS[0].level)?.subjects[0] || ""),
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      notes: ""
    });
    setBulbOn(true);
    setTimeout(() => setBulbOn(false), 2000);
  };

  // Delete a session
  const handleDeleteSession = (id: string) => {
    setStudySessions(sessions => sessions.filter(session => session.id !== id));
  };

  // Calculate total study hours
  function getTotalStudyHours() {
    let total = 0;
    for (const session of studySessions) {
      const [startH, startM] = session.startTime.split(":").map(Number);
      const [endH, endM] = session.endTime.split(":").map(Number);
      let diff = (endH + endM / 60) - (startH + startM / 60);
      if (diff > 0) total += diff;
    }
    return total;
  }
  const totalStudyHours = getTotalStudyHours();

  // Calculate weekly study hours
  function getCurrentWeekStudyHours() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    let total = 0;
    for (const session of studySessions) {
      if (session.date >= startOfWeek && session.date <= now) {
        const [startH, startM] = session.startTime.split(":").map(Number);
        const [endH, endM] = session.endTime.split(":").map(Number);
        let diff = (endH + endM / 60) - (startH + startM / 60);
        if (diff > 0) total += diff;
      }
    }
    return total;
  }
  const weeklyHours = getCurrentWeekStudyHours();

  // Calculate most studied subject
  function getMostStudiedSubject() {
    const subjectTotals: Record<string, number> = {};
    for (const session of studySessions) {
      const [startH, startM] = session.startTime.split(":").map(Number);
      const [endH, endM] = session.endTime.split(":").map(Number);
      let diff = (endH + endM / 60) - (startH + startM / 60);
      if (diff > 0) {
        subjectTotals[session.subject] = (subjectTotals[session.subject] || 0) + diff;
      }
    }
    let maxSubject = "-";
    let maxHours = 0;
    for (const subject of Object.keys(subjectTotals)) {
      if (subjectTotals[subject] > maxHours) {
        maxSubject = subject;
        maxHours = subjectTotals[subject];
      }
    }
    return { subject: maxSubject, hours: maxHours };
  }
  const mostStudied = getMostStudiedSubject();

  // Calculate hours per subject
  function getHoursPerSubject() {
    const subjectTotals: Record<string, number> = {};
    for (const session of studySessions) {
      const [startH, startM] = session.startTime.split(":").map(Number);
      const [endH, endM] = session.endTime.split(":").map(Number);
      let diff = (endH + endM / 60) - (startH + startM / 60);
      if (diff > 0) {
        subjectTotals[session.subject] = (subjectTotals[session.subject] || 0) + diff;
      }
    }
    return subjectTotals;
  }
  const subjectHours = getHoursPerSubject();

  return (
    <div className="space-y-8">
      {/* Date Filter Controls */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <label>Date Range:</label>
        <Select value={filterPreset} onValueChange={v => setFilterPreset(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {filterPreset === 'custom' && (
          <>
            <Label>From:</Label>
            <Input type="date" value={customRange.start ? customRange.start.toISOString().slice(0,10) : ''} onChange={e => setCustomRange({ ...customRange, start: e.target.value ? new Date(e.target.value) : null })} />
            <Label>To:</Label>
            <Input type="date" value={customRange.end ? customRange.end.toISOString().slice(0,10) : ''} onChange={e => setCustomRange({ ...customRange, end: e.target.value ? new Date(e.target.value) : null })} />
          </>
        )}
      </div>

      {/* Study Bar Chart */}
      <div>
        <h3 className="font-semibold mb-2">Study Time by Subject</h3>
        <StudyBarChart studySessions={studySessions} />
      </div>

      {/* Study Pie Chart */}
      <div>
        <h3 className="font-semibold mb-2">Study Time Distribution</h3>
        <StudyPieChart studySessions={studySessions} />
      </div>

      {/* Study Analysis Table */}
      <div>
        <h3 className="font-semibold mb-2">Study Time Table</h3>
        <StudyAnalysisTable studySessions={studySessions} />
      </div>

      <div className="relative">
        <div className="container py-8 md:py-12">
          <ScrollReveal>
            <h1 className="text-3xl font-bold mb-8">Study Planner</h1>
          </ScrollReveal>
        </div>
        
        <div className="space-y-6">
          {/* Study Analysis Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Study Time</CardTitle>
                <CardDescription className="text-2xl font-bold">{formatHours(totalStudyHours)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Across {studySessions.length} sessions
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                <CardDescription className="text-2xl font-bold">{formatHours(weeklyHours)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {weeklyHours > 0 ? `Aiming for ~${Math.ceil(weeklyHours/7*30)}h this month` : 'No study sessions this week'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Subject</CardTitle>
                <CardDescription className="text-2xl font-bold">{mostStudied.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {mostStudied.hours > 0 ? `${formatHours(mostStudied.hours)} studied` : 'No data yet'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal delay={0.1}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Calendar</CardTitle>
                      <CardDescription>Plan your study sessions</CardDescription>
                    </div>
                    <Dialog open={isAddingSession} onOpenChange={setIsAddingSession}>
                      <DialogTrigger asChild>
                        <Button>Add Session</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add Study Session</DialogTitle>
                          <DialogDescription>Create a new study session for your calendar.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="level">CA Level</Label>
                            <Select
                              value={selectedLevel}
                              onValueChange={(level) => {
                                setSelectedLevel(level);
                                // Set subject to first subject of new level, or empty
                                const firstSubject = CA_LEVELS.find(l => l.level === level)?.subjects[0] || "";
                                setNewSession((prev) => ({ ...prev, subject: firstSubject }));
                              }}
                            >
                              <SelectTrigger id="level">
                                <SelectValue placeholder="Select CA Level" />
                              </SelectTrigger>
                              <SelectContent>
                                {CA_LEVELS.map((level) => (
                                  <SelectItem key={level.level} value={level.level}>
                                    {level.level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Select
                              value={newSession.subject}
                              onValueChange={(value) => setNewSession({ ...newSession, subject: value })}
                            >
                              <SelectTrigger id="subject">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjectsForSelectedLevel.map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="start-time">Start Time</Label>
                              <Input
                                id="start-time"
                                type="time"
                                value={newSession.startTime}
                                onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="end-time">End Time</Label>
                              <Input
                                id="end-time"
                                type="time"
                                value={newSession.endTime}
                                onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                              id="notes"
                              value={newSession.notes}
                              onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                              placeholder="Topics to cover, chapters to read, etc."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddSession}>Add Session</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border"
                          initialFocus
                        />
                      </div>
                      <div className="md:w-1/2 p-4 space-y-4">
                        <h3 className="font-medium">
                          {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                        </h3>
                        
                        {filteredSessions.length === 0 ? (
                          <p className="text-muted-foreground">No study sessions scheduled for this date.</p>
                        ) : (
                          <div className="space-y-3">
                            {filteredSessions.map((session) => (
                              <div key={session.id} className="p-3 border rounded-md">
                                <div className="flex justify-between mb-1">
                                  <h4 className="font-medium">{session.subject}</h4>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-5 text-xs"
                                    onClick={() => handleDeleteSession(session.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {session.startTime} - {session.endTime}
                                </p>
                                {session.notes && (
                                  <p className="text-sm mt-1">{session.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
            
            <div className="space-y-6">
              <ScrollReveal delay={0.4}>
                <Card>
                  <CardHeader>
                    <CardTitle>Study Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Effective CA Exam Preparation</h4>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li>Focus on understanding concepts rather than memorization</li>
                        <li>Practice previous year question papers</li>
                        <li>Maintain a separate notebook for formulas and key points</li>
                        <li>Use the Pomodoro technique for focused study sessions</li>
                        <li>Alternate between difficult and easier subjects</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-0 opacity-60 pointer-events-none select-none">

      </div>
      {/* Book-light doodle in the corner, bulb turns on when session added */}
      <div className="fixed bottom-8 right-8 z-50">
        <Doodle name="book-light" className="w-36 h-36 drop-shadow-xl transition-all duration-500" on={bulbOn} />
      </div>
    </div>
  );
};

// (Removed duplicate/incorrect rendering block at the bottom of the file)

export default Planner;
