
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StudySession = {
  id: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
};

interface StudyBarChartProps {
  studySessions: StudySession[];
}

const StudyBarChart: React.FC<StudyBarChartProps> = ({ studySessions }) => {
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

  if (data.length === 0) return <div className="text-muted-foreground">No data for bar chart</div>;
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="subject" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StudyBarChart;
