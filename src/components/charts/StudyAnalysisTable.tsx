
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type StudySession = {
  id: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
};

interface StudyAnalysisTableProps {
  studySessions: StudySession[];
}

const StudyAnalysisTable: React.FC<StudyAnalysisTableProps> = ({ studySessions }) => {
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

export default StudyAnalysisTable;
