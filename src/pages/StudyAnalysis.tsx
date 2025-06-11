
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StudyBarChart from "@/components/charts/StudyBarChart";
import StudyPieChart from "@/components/charts/StudyPieChart";
import StudyAnalysisTable from "@/components/charts/StudyAnalysisTable";

// Types from Planner.tsx that might be needed
type StudySession = {
  id: string;
  subject: string;
  date: Date; // This will be the JS Date object
  title?: string; // Added based on inferred type from lint
  description?: string; // Added based on inferred type from lint
  duration?: number; // Added based on inferred type, assuming minutes
  startTime: string; // Derived HH:MM string
  endTime: string;   // Derived HH:MM string
  notes?: string;    // Make optional as it's not in fetched data
  user_id?: string;
  created_at?: string;
};

interface QuizSession {
  id: string;
  subject: string;
  score: number;
  timeTaken: number; // in minutes
  date: Date; // JS Date object
  user_id?: string;
  quiz_id?: string;
}

// --- QuizPerformanceTable ---
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
            <TableCell>{q.date.toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const StudyAnalysisPage = () => {
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        setError("Please log in to view study analysis.");
        return;
      }
      setLoading(true);
      try {
        // Fetch study sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("study_sessions")
          .select("*") // Fetch all columns to inspect the actual data structure
          .eq("user_id", user.id);

        // Log the raw data or error to the console for inspection
        console.log("Raw study_sessions data from Supabase:", sessionsData);
        console.error("Error fetching study_sessions (if any):", sessionsError);

        if (sessionsError) {
          console.error("Definite error fetching study sessions:", sessionsError);
          setError(sessionsError.message || "Failed to fetch study sessions.");
          setStudySessions([]);
          return;
        }

        setStudySessions(sessionsData ? sessionsData.map(s => {
          const startDate = new Date(s.date); // s.date is a string from DB
          // Assuming s.duration is in minutes. If not, this calculation needs adjustment.
          const durationInMinutes = s.duration || 0;
          const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);

          return {
            id: s.id,
            subject: s.subject,
            date: startDate, // Store the Date object
            title: s.title,
            description: s.description,
            duration: durationInMinutes,
            startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            // notes: s.notes, // 'notes' is not in the fetched data, so we don't map it from 's'
            user_id: s.user_id,
            created_at: s.created_at,
          };
        }) : []);

        // Fetch quiz sessions from 'quiz_sessions' table
        const { data: quizData, error: quizError } = await supabase
          .from("quiz_sessions") // Corrected table name based on database.types.ts
          .select("id, subject, score, time_taken, completed_at, user_id, quiz_id")
          .eq("user_id", user.id);

        // Log the raw quiz data or error for inspection
        console.log("Raw quiz_sessions data from Supabase:", quizData);
        console.error("Error fetching quiz_sessions (if any):", quizError);

        if (quizError) {
          console.error("Definite error fetching quiz results:", quizError);
          // Append to existing error or set new error message
          setError(prevError => prevError ? `${prevError}\n${quizError.message}` : quizError.message || "Failed to fetch quiz results.");
          // Do not return here if study sessions were fetched successfully, allow partial data display
        } else {
          setQuizSessions(quizData ? quizData.map(q => ({
            id: q.id,
            subject: q.subject,
            score: q.score,
            timeTaken: q.time_taken / 60, // Convert seconds to minutes
            date: new Date(q.completed_at),
            user_id: q.user_id,
            quiz_id: q.quiz_id
          })) : []);
        }

      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
        console.error("Error fetching analysis data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-4">Loading analysis...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Study Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle>Study Hours Distribution (Bar Chart)</CardTitle></CardHeader>
          <CardContent>
            <StudyBarChart studySessions={studySessions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Study Hours Distribution (Pie Chart)</CardTitle></CardHeader>
          <CardContent>
            <StudyPieChart studySessions={studySessions} />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>Detailed Study Log</CardTitle></CardHeader>
        <CardContent>
          <StudyAnalysisTable studySessions={studySessions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Quiz Performance</CardTitle></CardHeader>
        <CardContent>
          <QuizPerformanceTable quizSessions={quizSessions} />
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyAnalysisPage;
