
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StudySession = {
  id: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
};

interface StudyPieChartProps {
  studySessions: StudySession[];
}

const COLORS = ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#a855f7", "#fbbf24"];

const StudyPieChart: React.FC<StudyPieChartProps> = ({ studySessions }) => {
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

  if (data.length === 0) return <div className="text-muted-foreground">No data for pie chart</div>;
  
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

export default StudyPieChart;
