// ... (previous imports remain the same)

import { Doodle } from "@/components/ui/Doodle";
import Timer from "./Timer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

import * as React from "react";
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

const getPomodoroStats = () => {
  // Returns [{ date: 'YYYY-MM-DD', count: number }, ...] for last 7 days
  const stats = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = Number(localStorage.getItem(`pomodoro_${key}`) || 0);
    stats.push({ date: key.slice(5), count }); // show MM-DD
  }
  return stats;
};

const Planner = () => {
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
  const [quizSessions, setQuizSessions] = React.useState<QuizSession[]>([]);
  const { user } = useAuth();

  // --- Badge & leaderboard state ---
  const [quote, setQuote] = useState(getRandomQuote());
  const [streak, setStreak] = useState(0);
  const [todayHours, setTodayHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState<StudySession[]>([]);
  const [badges, setBadges] = useState<{ id: string; name: string; description: string; icon: string; }[]>([]);
  // Mock leaderboard data for demonstration
  const [leaderboard, setLeaderboard] = useState<Array<{ username: string; streak: number; avatar: string }>>([
    { username: "You", streak: streak, avatar: "🧑" },
    { username: "Priya", streak: 10, avatar: "👩" },
    { username: "Arjun", streak: 8, avatar: "👨" },
    { username: "Simran", streak: 6, avatar: "👩‍🎓" },
    { username: "Rahul", streak: 5, avatar: "👨‍🎓" }
  ]);


  // Calculate dashboard stats when studySessions change
  useEffect(() => {
    // Daily progress
    const today = new Date();
    const todaySessions = studySessions.filter(s =>
      s.date instanceof Date ? s.date.toDateString() === today.toDateString() : new Date(s.date).toDateString() === today.toDateString()
    );
    let todayTotal = 0;
    todaySessions.forEach(s => {
      const [startH, startM] = s.startTime.split(":").map(Number);
      const [endH, endM] = s.endTime.split(":").map(Number);
      todayTotal += (endH + endM / 60) - (startH + startM / 60);
    });
    setTodayHours(todayTotal);

    // Weekly progress
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    let weekTotal = 0;
    studySessions.forEach(s => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      if (d >= startOfWeek && d <= endOfWeek) {
        const [startH, startM] = s.startTime.split(":").map(Number);
        const [endH, endM] = s.endTime.split(":").map(Number);
        weekTotal += (endH + endM / 60) - (startH + startM / 60);
      }
    });
    setWeekHours(weekTotal);

    // Upcoming sessions (next 5, sorted by date/time)
    const now = new Date();
    const futureSessions = studySessions
      .filter(s => (s.date instanceof Date ? s.date : new Date(s.date)) >= now)
      .sort((a, b) => (a.date instanceof Date ? a.date : new Date(a.date)).getTime() - (b.date instanceof Date ? b.date : new Date(b.date)).getTime())
      .slice(0, 5);
    setUpcomingSessions(futureSessions);

    // Study streak calculation
    // Find unique days with at least one session, sorted descending
    const daysWithSessions = Array.from(new Set(
      studySessions.map(s => (s.date instanceof Date ? s.date.toDateString() : new Date(s.date).toDateString()))
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streakCount = 0;
    let streakDay = new Date();
    for (let i = 0; i < daysWithSessions.length; i++) {
      if (new Date(daysWithSessions[i]).toDateString() === streakDay.toDateString()) {
        streakCount++;
        streakDay.setDate(streakDay.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(streakCount);
    // Award badges
    const newBadges: { id: string; name: string; description: string; icon: string }[] = [];
    if (studySessions.length > 0) {
      newBadges.push({ id: 'first-session', name: 'First Session', description: 'Completed your first study session!', icon: '🎉' });
    }
    if (streakCount >= 7) {
      newBadges.push({ id: '7-day-streak', name: '7-Day Streak', description: 'Studied 7 days in a row!', icon: '🔥' });
    }
    if (studySessions.length >= 10) {
      newBadges.push({ id: '10-sessions', name: '10 Sessions', description: 'Completed 10 study sessions!', icon: '🏅' });
    }
    setBadges(newBadges);
    // Update leaderboard (mock: update "You" streak)
    setLeaderboard(prev => prev.map(entry => entry.username === "You" ? { ...entry, streak: streakCount } : entry));
  }, [studySessions]);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

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
      subject: (CA_LEVELS.find(l => l.level === selectedLevel)?.subjects[0] || ""),
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
      subject: (CA_LEVELS.find(l => l.level === selectedLevel)?.subjects[0] || ""),
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

  // ... (previous state and functions remain the same)

  return (
    <>
      {/* Dashboard Summary */}
      <div className="mb-8">
        {/* Badges & Achievements */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <span className="font-semibold">Achievements:</span>
          {badges.length === 0 ? (
            <span className="text-muted-foreground">No badges yet</span>
          ) : (
            badges.map(badge => (
              <span key={badge.id} title={badge.description} className="text-2xl" style={{ cursor: 'pointer' }}>{badge.icon}</span>
            ))
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="col-span-1 flex flex-col items-center justify-center p-4">
            <div className="text-lg font-semibold">Today's Progress</div>
            <div className="text-3xl font-bold text-primary">{todayHours.toFixed(1)} hrs</div>
          </Card>
          <Card className="col-span-1 flex flex-col items-center justify-center p-4">
            <div className="text-lg font-semibold">This Week</div>
            <div className="text-3xl font-bold text-primary">{weekHours.toFixed(1)} hrs</div>
          </Card>
          <Card className="col-span-1 flex flex-col items-center justify-center p-4">
            <div className="text-lg font-semibold">Streak</div>
            <div className="text-3xl font-bold text-green-600">🔥 {streak} days</div>
            {streak > 0 && <div className="text-xs text-muted-foreground">Keep it up!</div>}
          </Card>
          <Card className="col-span-1 flex flex-col items-center justify-center p-4">
            <div className="text-lg font-semibold">Motivation</div>
            <div className="italic text-center">“{quote}”</div>
          </Card>
        </div>
        <div className="mt-6">
          <Card className="p-4">
            <div className="font-semibold mb-2">Upcoming Study Sessions</div>
            {upcomingSessions.length === 0 ? (
              <div className="text-muted-foreground">No upcoming sessions scheduled.</div>
            ) : (
              <ul className="space-y-2">
                {upcomingSessions.map((s, idx) => (
                  <li key={s.id} className="flex items-center gap-4">
                    <span className="font-medium">{format(s.date instanceof Date ? s.date : new Date(s.date), 'EEE, MMM d')}</span>
                    <span className="text-sm text-muted-foreground">{s.startTime} - {s.endTime}</span>
                    <span className="text-sm">{s.subject}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[300px] w-full bg-background rounded shadow">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.sort((a, b) => b.streak - a.streak).map((entry, idx) => (
                <tr key={entry.username} className={entry.username === "You" ? "bg-primary/10" : ""}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2 flex items-center gap-2">{entry.avatar} {entry.username}</td>
                  <td className="px-4 py-2">{entry.streak} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              
              <ScrollReveal delay={0.2}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Study Analysis</CardTitle>
                        <CardDescription>Track your study progress and insights</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="font-medium mb-4">Hours per Subject</h3>
                        {Object.keys(subjectHours).length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            No study data available. Add sessions to see analysis.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {Object.entries(subjectHours).map(([subject, hours]) => (
                              <div key={subject} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span>{subject}</span>
                                  <span>{formatHours(hours)}</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2" 
                                    style={{ width: `${Math.min(100, (hours / 10) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-lg">This Week</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {formatHours(weeklyHours)}
                            </div>
                            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${Math.min(100, (weeklyHours / 20) * 100)}%` }}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {weeklyHours < 20 
                                ? `${(20 - weeklyHours).toFixed(1)} hours to reach weekly goal`
                                : 'Weekly goal achieved! 🎉'}
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="py-4">
                            <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {studySessions.filter(session => new Date(session.date) >= new Date()).length === 0 ? (
                              <p className="text-muted-foreground">No upcoming sessions</p>
                            ) : (
                              <div className="space-y-2">
                                {studySessions
                                  .filter(session => new Date(session.date) >= new Date())
                                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                                  .slice(0, 3)
                                  .map(session => (
                                    <div 
                                      key={session.id}
                                      className="flex items-center py-2 border-b last:border-0"
                                    >
                                      <div className="mr-4">
                                        <div className="text-sm font-medium">
                                          {format(session.date, "MMM d")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {session.startTime} - {session.endTime}
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">{session.subject}</div>
                                        {session.notes && (
                                          <div className="text-xs text-muted-foreground truncate">
                                            {session.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                            
                            <Button 
                              variant="outline" 
                              className="w-full mt-4" 
                              onClick={() => setIsAddingSession(true)}
                            >
                              Schedule New Session
                            </Button>
                          </CardContent>
                        </Card>
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
      {/* Pomodoro Timer and Stats */}
      <div className="my-8">
        <h2 className="text-xl font-bold mb-4">Pomodoro Timer</h2>
        <Timer onPomodoroComplete={() => {
          const today = new Date().toISOString().slice(0, 10);
          const key = `pomodoro_${today}`;
          const prev = Number(localStorage.getItem(key) || 0);
          localStorage.setItem(key, String(prev + 1));
        }} />
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Pomodoros Completed (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getPomodoroStats()} margin={{ top: 8, right: 24, left: 8, bottom: 24 }}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Book-light doodle in the corner, bulb turns on when session added */}
      <div className="fixed bottom-8 right-8 z-50">
        <Doodle name="book-light" className="w-36 h-36 drop-shadow-xl transition-all duration-500" on={bulbOn} />
      </div>

      {/* --- Study Analysis Table Section --- */}
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Study Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyAnalysisTable studySessions={studySessions} />
          </CardContent>
        </Card>
      </div>

      {/* --- Charts & Quiz Analysis Section --- */}
      <div className="max-w-4xl mx-auto mt-12 space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>Study Patterns (Hours per Subject)</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyBarChart studySessions={studySessions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Study Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyPieChart studySessions={studySessions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quiz Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizPerformanceTable quizSessions={quizSessions} />
          </CardContent>
        </Card>
      </div>
  </>
  );
};

// --- Study Analysis Table Component ---
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  ChartContainer,
  // ChartTooltip, ChartTooltipContent, // Not needed for simple charts
} from "@/components/ui/chart";


// --- StudyBarChart ---
const StudyBarChart: React.FC<{ studySessions: StudySession[] }> = ({ studySessions }) => {
  // Aggregate hours per subject
  const data = React.useMemo(() => {
    const map: Record<string, number> = {};
    studySessions.forEach(s => {
      const [startH, startM] = s.startTime.split(":").map(Number);
      const [endH, endM] = s.endTime.split(":").map(Number);
      const duration = (endH + endM / 60) - (startH + startM / 60);
      map[s.subject] = (map[s.subject] || 0) + (duration > 0 ? duration : 0);
    });
    return Object.entries(map).map(([subject, hours]) => ({ subject, hours }));
  }, [studySessions]);
  if (data.length === 0) return <div className="text-muted-foreground">No data</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 24 }}>
        <XAxis dataKey="subject" />
        <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- StudyPieChart ---
const COLORS = ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#a855f7", "#fbbf24"];
const StudyPieChart: React.FC<{ studySessions: StudySession[] }> = ({ studySessions }) => {
  const data = React.useMemo(() => {
    const map: Record<string, number> = {};
    studySessions.forEach(s => {
      const [startH, startM] = s.startTime.split(":").map(Number);
      const [endH, endM] = s.endTime.split(":").map(Number);
      const duration = (endH + endM / 60) - (startH + startM / 60);
      map[s.subject] = (map[s.subject] || 0) + (duration > 0 ? duration : 0);
    });
    return Object.entries(map).map(([subject, value]) => ({ subject, value }));
  }, [studySessions]);
  if (data.length === 0) return <div className="text-muted-foreground">No data</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="subject" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- QuizPerformanceTable ---
interface QuizSession {
  id: string;
  subject: string;
  score: number;
  timeTaken: number; // minutes
  date: string; // ISO
}
// TODO: Fetch quizSessions from Supabase or backend
// Example setup (empty by default, to be filled with real data)
// You can setQuizSessions from an API call in a useEffect
// (Moved inside Planner component below)

const QuizPerformanceTable: React.FC<{ quizSessions: QuizSession[] }> = ({ quizSessions }) => {
  if (!quizSessions.length) return <div className="text-muted-foreground">No quiz data yet.</div>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Time Taken (min)</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quizSessions.map(q => (
          <TableRow key={q.id}>
            <TableCell>{q.subject}</TableCell>
            <TableCell>{q.score}</TableCell>
            <TableCell>{q.timeTaken}</TableCell>
            <TableCell>{q.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface StudyAnalysisTableProps {
  studySessions: StudySession[];
}
const StudyAnalysisTable: React.FC<StudyAnalysisTableProps> = ({ studySessions }) => {
  // Group by subject
  const stats = React.useMemo(() => {
    const subjectMap: Record<string, { count: number; totalHours: number; totalDuration: number; } > = {};
    studySessions.forEach(s => {
      const [startH, startM] = s.startTime.split(":").map(Number);
      const [endH, endM] = s.endTime.split(":").map(Number);
      const duration = (endH + endM / 60) - (startH + startM / 60);
      if (!subjectMap[s.subject]) subjectMap[s.subject] = { count: 0, totalHours: 0, totalDuration: 0 };
      subjectMap[s.subject].count += 1;
      subjectMap[s.subject].totalHours += duration > 0 ? duration : 0;
      subjectMap[s.subject].totalDuration += duration > 0 ? duration : 0;
    });
    return Object.entries(subjectMap).map(([subject, { count, totalHours, totalDuration }]) => ({
      subject,
      count,
      totalHours,
      avgDuration: count > 0 ? totalDuration / count : 0
    }));
  }, [studySessions]);

  if (stats.length === 0) return <div className="text-muted-foreground">No study data yet.</div>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Sessions</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead>Avg. Session Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map(stat => (
          <TableRow key={stat.subject}>
            <TableCell>{stat.subject}</TableCell>
            <TableCell>{stat.count}</TableCell>
            <TableCell>{stat.totalHours.toFixed(1)}</TableCell>
            <TableCell>{stat.avgDuration.toFixed(2)} hrs</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Planner;
