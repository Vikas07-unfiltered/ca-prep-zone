import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, isToday, isWithinInterval, addDays, startOfDay, addMinutes, isSameDay } from "date-fns";
import { Doodle } from "@/components/ui/Doodle";

// Empty initial study sessions
const initialStudySessions = [];

// Subjects
const subjects = [
  "Taxation",
  "Audit",
  "Financial Reporting",
  "Cost Accounting",
  "Corporate Law",
  "Financial Management",
  "Economics",
  "Statistics",
  "Business Management",
  "Other"
];

const Planner = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studySessions, setStudySessions] = useState(initialStudySessions);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: "",
    date: new Date(),
    startTime: "",
    endTime: "",
    notes: ""
  });
  
  // Filter sessions for selected date
  const filteredSessions = studySessions.filter(session => 
    date && isSameDay(session.date, date)
  );

  const handleAddSession = () => {
    const { subject, date, startTime, endTime, notes } = newSession;
    
    if (!subject || !date || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate time format and logic
    if (startTime >= endTime) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }
    
    const newStudySession = {
      id: `session-${Date.now()}`,
      subject,
      date,
      startTime,
      endTime,
      notes
    };
    
    setStudySessions([...studySessions, newStudySession]);
    setIsAddingSession(false);
    
    // Reset form
    setNewSession({
      subject: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      notes: ""
    });
    
    toast({
      title: "Session Added",
      description: `${subject} session scheduled for ${format(date, "MMM d")}`,
    });
  };

  const handleDeleteSession = (id: string) => {
    setStudySessions(studySessions.filter(session => session.id !== id));
    toast({
      title: "Session Deleted",
      description: "Study session has been removed",
    });
  };

  // Calculate study hours for the current week
  const getCurrentWeekStudyHours = () => {
    const today = new Date();
    const startOfWeek = startOfDay(addDays(today, -today.getDay())); // Sunday
    const endOfWeek = addDays(startOfWeek, 6); // Saturday
    
    return studySessions
      .filter(session => 
        isWithinInterval(session.date, { start: startOfWeek, end: endOfWeek })
      )
      .reduce((totalHours, session) => {
        const [startHour, startMinute] = session.startTime.split(":").map(Number);
        const [endHour, endMinute] = session.endTime.split(":").map(Number);
        
        const startDateTime = addMinutes(
          addMinutes(new Date(), startHour * 60), 
          startMinute
        );
        const endDateTime = addMinutes(
          addMinutes(new Date(), endHour * 60), 
          endMinute
        );
        
        const durationInHours = 
          (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
          
        return totalHours + durationInHours;
      }, 0);
  };
  
  // Helper to get hours and minutes from decimal hours
  const formatHours = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hr ${minutes} min`;
  };
  
  // Calculate hours per subject
  const getHoursPerSubject = () => {
    const subjectHours: Record<string, number> = {};
    
    studySessions.forEach(session => {
      const [startHour, startMinute] = session.startTime.split(":").map(Number);
      const [endHour, endMinute] = session.endTime.split(":").map(Number);
      
      const startDateTime = addMinutes(
        addMinutes(new Date(), startHour * 60), 
        startMinute
      );
      const endDateTime = addMinutes(
        addMinutes(new Date(), endHour * 60), 
        endMinute
      );
      
      const durationInHours = 
        (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      
      subjectHours[session.subject] = (subjectHours[session.subject] || 0) + durationInHours;
    });
    
    return subjectHours;
  };

  return (
    <div className="relative">
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">Study Planner</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>
                    Plan your study sessions
                  </CardDescription>
                </div>
                <Dialog open={isAddingSession} onOpenChange={setIsAddingSession}>
                  <DialogTrigger asChild>
                    <Button>Add Session</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Study Session</DialogTitle>
                      <DialogDescription>
                        Create a new study session for your calendar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select 
                          value={newSession.subject} 
                          onValueChange={(value) => 
                            setNewSession({...newSession, subject: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map(subject => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Date</Label>
                        <div className="border rounded-md p-2">
                          <Calendar
                            mode="single"
                            selected={newSession.date}
                            onSelect={(date) => 
                              setNewSession({...newSession, date: date || new Date()})
                            }
                            className="rounded-md border"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={newSession.startTime}
                            onChange={(e) => 
                              setNewSession({...newSession, startTime: e.target.value})
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={newSession.endTime}
                            onChange={(e) => 
                              setNewSession({...newSession, endTime: e.target.value})
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          value={newSession.notes}
                          onChange={(e) => 
                            setNewSession({...newSession, notes: e.target.value})
                          }
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
                      <p className="text-muted-foreground">
                        No study sessions scheduled for this date.
                      </p>
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
            
            <Card>
              <CardHeader>
                <CardTitle>Study Analysis</CardTitle>
                <CardDescription>
                  Insights into your study patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-medium mb-4">Hours per Subject</h3>
                    {Object.keys(getHoursPerSubject()).length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No study data available. Add sessions to see analysis.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(getHoursPerSubject()).map(([subject, hours]) => (
                          <div key={subject} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span>{subject}</span>
                              <span>{formatHours(hours)}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2" 
                                style={{ 
                                  width: `${Math.min(100, (hours / 10) * 100)}%` 
                                }}
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
                          {formatHours(getCurrentWeekStudyHours())}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total study time
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg">Sessions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {studySessions.length}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total planned sessions
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Goals</CardTitle>
                <CardDescription>Set and track your study targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Weekly Target</Label>
                    <span className="text-sm font-medium">
                      20 hours / week
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ 
                        width: `${Math.min(100, (getCurrentWeekStudyHours() / 20) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatHours(getCurrentWeekStudyHours())}</span>
                    <span>20 hours</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Upcoming Sessions</h4>
                  {studySessions
                    .filter(session => new Date(session.date) >= new Date())
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 3)
                    .length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No upcoming sessions. Schedule your first study session!
                    </p>
                  ) : (
                    studySessions
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
                      ))
                  )}
                </div>
                
                <Button variant="outline" className="w-full mt-4" onClick={() => setIsAddingSession(true)}>
                  Schedule New Session
                </Button>
              </CardContent>
            </Card>
            
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
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-0 opacity-60 pointer-events-none select-none">
        <Doodle name="finance" className="w-40 h-40" />
      </div>
    </div>
  );
};

export default Planner;
