import React, { useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const PomodoroPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pomodoroData = getPomodoroStats();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Pomodoro Hub</h1>
      
      {/* Pomodoros Completed Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pomodoros Completed (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {pomodoroData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pomodoroData} margin={{ top: 8, right: 24, left: 8, bottom: 24 }}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">No Pomodoro data recorded yet for the last 7 days.</p>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for the actual Pomodoro Timer component if it's to be moved here */}
      {/* <div className="my-8">
        <h2 className="text-xl font-bold mb-4">Pomodoro Timer</h2>
        <p className="text-muted-foreground">Timer component will go here.</p>
      </div> */}

    </div>
  );
};

export default PomodoroPage;