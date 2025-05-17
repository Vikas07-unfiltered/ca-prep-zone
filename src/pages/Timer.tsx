
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimerMode = "focus" | "short-break" | "long-break";

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_SHORT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;

const Timer = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [sessionCount, setSessionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [subject, setSubject] = useState("");
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(DEFAULT_SHORT_BREAK_MINUTES);
  const [longBreakMinutes, setLongBreakMinutes] = useState(DEFAULT_LONG_BREAK_MINUTES);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartFocus, setAutoStartFocus] = useState(false);
  const [sessions, setSessions] = useState<{ subject: string; duration: number; timestamp: Date }[]>([]);

  const timerRef = useRef<number | null>(null);

  // Initialize timer based on mode
  useEffect(() => {
    switch (mode) {
      case "focus":
        setTimeLeft(focusMinutes * 60);
        break;
      case "short-break":
        setTimeLeft(shortBreakMinutes * 60);
        break;
      case "long-break":
        setTimeLeft(longBreakMinutes * 60);
        break;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, focusMinutes, shortBreakMinutes, longBreakMinutes]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(true);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    
    switch (mode) {
      case "focus":
        setTimeLeft(focusMinutes * 60);
        break;
      case "short-break":
        setTimeLeft(shortBreakMinutes * 60);
        break;
      case "long-break":
        setTimeLeft(longBreakMinutes * 60);
        break;
    }
  };

  const handleTimerComplete = () => {
    pauseTimer();
    
    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.error("Failed to play sound:", err));

    if (mode === "focus") {
      // Save completed focus session
      const newSession = { 
        subject: subject || "Unnamed session",
        duration: focusMinutes, 
        timestamp: new Date() 
      };
      setSessions(prev => [...prev, newSession]);
      
      // Increment session count
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      // Determine next break type (short or long)
      const nextMode = newSessionCount % 4 === 0 ? "long-break" : "short-break";
      setMode(nextMode);
      
      toast({
        title: "Focus session completed!",
        description: `Great job! Time for a ${nextMode === "long-break" ? "long" : "short"} break.`,
      });
      
      // Auto start break if enabled
      if (autoStartBreaks) {
        setTimeout(startTimer, 500);
      }
    } else {
      // Break timer completed
      setMode("focus");
      
      toast({
        title: "Break completed!",
        description: "Ready to focus again?",
      });
      
      // Auto start focus if enabled
      if (autoStartFocus) {
        setTimeout(startTimer, 500);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    pauseTimer();
    setMode(newMode);
  };

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Pomodoro Timer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Study Timer</CardTitle>
              <CardDescription>
                Use the Pomodoro technique to improve your focus and productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="mb-4">
                  <TabsTrigger
                    value="focus"
                    onClick={() => handleModeChange("focus")}
                    className={mode === "focus" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Focus
                  </TabsTrigger>
                  <TabsTrigger
                    value="short-break"
                    onClick={() => handleModeChange("short-break")}
                    className={mode === "short-break" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Short Break
                  </TabsTrigger>
                  <TabsTrigger
                    value="long-break"
                    onClick={() => handleModeChange("long-break")}
                    className={mode === "long-break" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Long Break
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="text-center">
                <div className="text-7xl font-bold font-mono mb-6">
                  {formatTime(timeLeft)}
                </div>
                
                <div className="flex justify-center space-x-4">
                  {!isRunning ? (
                    <Button size="lg" onClick={startTimer}>Start</Button>
                  ) : (
                    <Button size="lg" variant="outline" onClick={pauseTimer}>Pause</Button>
                  )}
                  <Button size="lg" variant="outline" onClick={resetTimer}>Reset</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">What are you working on?</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g., Taxation, Audit, Financial Reporting"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Track your recent focus sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No sessions recorded yet. Complete a focus session to see it here.
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.slice().reverse().map((session, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{session.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-medium">{session.duration} minutes</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Total: {sessions.reduce((acc, session) => acc + session.duration, 0)} minutes
              </p>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
              <CardDescription>Customize your timer durations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="focus-time">Focus Duration: {focusMinutes} minutes</Label>
                  </div>
                  <Slider
                    id="focus-time"
                    min={5}
                    max={60}
                    step={5}
                    value={[focusMinutes]}
                    onValueChange={(value) => setFocusMinutes(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="short-break">Short Break: {shortBreakMinutes} minutes</Label>
                  </div>
                  <Slider
                    id="short-break"
                    min={1}
                    max={15}
                    step={1}
                    value={[shortBreakMinutes]}
                    onValueChange={(value) => setShortBreakMinutes(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="long-break">Long Break: {longBreakMinutes} minutes</Label>
                  </div>
                  <Slider
                    id="long-break"
                    min={5}
                    max={30}
                    step={5}
                    value={[longBreakMinutes]}
                    onValueChange={(value) => setLongBreakMinutes(value[0])}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-break">Auto-start breaks</Label>
                  <Switch 
                    id="auto-break" 
                    checked={autoStartBreaks}
                    onCheckedChange={setAutoStartBreaks}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-focus">Auto-start focus sessions</Label>
                  <Switch 
                    id="auto-focus"
                    checked={autoStartFocus}
                    onCheckedChange={setAutoStartFocus}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Study Insights</CardTitle>
              <CardDescription>Your focus statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions Completed</span>
                  <span className="font-medium">{sessionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Focus Time</span>
                  <span className="font-medium">
                    {Math.floor(sessions.reduce((acc, session) => acc + session.duration, 0) / 60)} hours{" "}
                    {sessions.reduce((acc, session) => acc + session.duration, 0) % 60} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Most Studied Subject</span>
                  <span className="font-medium">
                    {sessions.length > 0 
                      ? Object.entries(
                          sessions.reduce((acc, session) => {
                            acc[session.subject] = (acc[session.subject] || 0) + session.duration;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                        .sort((a, b) => b[1] - a[1])[0][0]
                      : "N/A"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Timer;
