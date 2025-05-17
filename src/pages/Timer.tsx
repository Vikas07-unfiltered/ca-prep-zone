
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Timer = () => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [currentMode, setCurrentMode] = useState("focus");
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [subject, setSubject] = useState("");
  const [sessions, setSessions] = useState([]);
  const interval = useRef(null);

  useEffect(() => {
    if (isActive) {
      interval.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval.current);
            setIsActive(false);
            toast({
              title: "Timer Completed",
              description: `Your ${currentMode} session is complete!`,
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval.current);
    }

    return () => clearInterval(interval.current);
  }, [isActive, currentMode, toast]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    let duration;
    
    switch (mode) {
      case "focus":
        duration = focusDuration;
        break;
      case "shortBreak":
        duration = shortBreakDuration;
        break;
      case "longBreak":
        duration = longBreakDuration;
        break;
      default:
        duration = focusDuration;
    }
    
    setTimeLeft(duration * 60);
    setIsActive(false);
  };

  const handleToggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      // If timer completed, reset it based on current mode
      let duration;
      switch (currentMode) {
        case "focus":
          duration = focusDuration;
          break;
        case "shortBreak":
          duration = shortBreakDuration;
          break;
        case "longBreak":
          duration = longBreakDuration;
          break;
        default:
          duration = focusDuration;
      }
      setTimeLeft(duration * 60);
    }
    
    setIsActive(!isActive);
    
    if (!isActive && currentMode === "focus") {
      // Log session start
      console.log(`Started focus session on: ${subject || "Unnamed subject"}`);
    }
  };

  const handleResetTimer = () => {
    setIsActive(false);
    let duration;
    
    switch (currentMode) {
      case "focus":
        duration = focusDuration;
        break;
      case "shortBreak":
        duration = shortBreakDuration;
        break;
      case "longBreak":
        duration = longBreakDuration;
        break;
      default:
        duration = focusDuration;
    }
    
    setTimeLeft(duration * 60);
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Pomodoro Timer</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {currentMode === "focus" ? "Focus Time" : 
               currentMode === "shortBreak" ? "Short Break" : "Long Break"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Properly nested Tabs structure */}
            <Tabs defaultValue="focus" onValueChange={handleModeChange} className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="focus">Focus</TabsTrigger>
                <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
                <TabsTrigger value="longBreak">Long Break</TabsTrigger>
              </TabsList>
              
              <TabsContent value="focus" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Study Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What are you studying?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="text-center">
              <h2 className="text-5xl font-mono font-bold">{formatTime(timeLeft)}</h2>
            </div>
            
            <div className="flex justify-center gap-2">
              <Button 
                onClick={handleToggleTimer} 
                variant={isActive ? "destructive" : "default"}
                size="lg"
              >
                {isActive ? "Pause" : timeLeft === 0 ? "Restart" : "Start"}
              </Button>
              <Button 
                onClick={handleResetTimer} 
                variant="outline" 
                size="lg"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Timer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusTime">Focus Time (mins)</Label>
                <Input
                  id="focusTime"
                  type="number"
                  min="1"
                  max="60"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBreakTime">Short Break (mins)</Label>
                <Input
                  id="shortBreakTime"
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longBreakTime">Long Break (mins)</Label>
                <Input
                  id="longBreakTime"
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Timer;
