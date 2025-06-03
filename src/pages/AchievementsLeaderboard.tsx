import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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

function formatHours(hours: number) {
  return `${hours.toFixed(1)} hrs`;
}

type StudySession = {
  id: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
};

const AchievementsLeaderboard = () => {
  const { user } = useAuth();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [todayHours, setTodayHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quote, setQuote] = useState(getRandomQuote());
  const [leaderboard, setLeaderboard] = useState<Array<{ username: string; streak: number; avatar: string }>>([
    { username: "You", streak: 0, avatar: "🧑" }
  ]);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
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
      });
  }, [user]);

  useEffect(() => {
    // Calculate today's and week's hours
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

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
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

    // Streak calculation
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
    setLeaderboard([{ username: "You", streak: streakCount, avatar: "🧑" }]);
  }, [studySessions]);

  return (
    <div className="container mx-auto py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Achievements & Leaderboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <CardTitle className="mb-2 text-center">Today's Progress</CardTitle>
            <span className="text-2xl font-bold">{formatHours(todayHours)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <CardTitle className="mb-2 text-center">This Week</CardTitle>
            <span className="text-2xl font-bold">{formatHours(weekHours)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <CardTitle className="mb-2 text-center">Streak</CardTitle>
            <span className="text-2xl font-bold text-green-600">🔥 {streak} days</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <CardTitle className="mb-2 text-center">Motivation</CardTitle>
            <span className="italic text-muted-foreground text-center">“{quote}”</span>
          </CardContent>
        </Card>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-border rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Rank</th>
                <th className="px-4 py-2 border-b">User</th>
                <th className="px-4 py-2 border-b">Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={entry.username} className={idx === 0 ? "bg-gray-100" : ""}>
                  <td className="px-4 py-2 text-center">{idx + 1}</td>
                  <td className="px-4 py-2 flex items-center gap-2 text-center justify-center">{entry.avatar} {entry.username}</td>
                  <td className="px-4 py-2 text-center">{entry.streak} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AchievementsLeaderboard;
