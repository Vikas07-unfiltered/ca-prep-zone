import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Check, X } from "lucide-react";
import { Doodle } from "@/components/ui/Doodle";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState("0");
  const [editMinutes, setEditMinutes] = useState("");
  const [editSeconds, setEditSeconds] = useState("");
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

  const handleEditTime = () => {
    if (isActive) {
      setIsActive(false);
      clearInterval(interval.current);
    }
    setIsEditing(true);
    setEditHours(Math.floor(timeLeft / 3600).toString());
    setEditMinutes(Math.floor((timeLeft % 3600) / 60).toString());
    setEditSeconds((timeLeft % 60).toString().padStart(2, "0"));
  };

  const handleSaveEdit = () => {
    const hours = parseInt(editHours) || 0;
    const minutes = parseInt(editMinutes) || 0;
    const seconds = parseInt(editSeconds) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please enter a valid time greater than 0",
        variant: "destructive",
      });
      return;
    }
    setTimeLeft(totalSeconds);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative">
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
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full max-w-[400px]">
                  {isEditing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        className="w-20 text-center text-5xl font-mono h-20"
                        placeholder="00"
                      />
                      <span className="text-5xl font-mono">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(e.target.value)}
                        className="w-20 text-center text-5xl font-mono h-20"
                        placeholder="00"
                      />
                      <span className="text-5xl font-mono">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={editSeconds}
                        onChange={(e) => setEditSeconds(e.target.value.padStart(2, "0"))}
                        className="w-20 text-center text-5xl font-mono h-20"
                        placeholder="00"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <h2 className="text-7xl font-mono font-bold">{formatTime(timeLeft)}</h2>
                      <AnimatedButton
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 hover:bg-accent"
                        onClick={handleEditTime}
                        hoverScale={1.1}
                      >
                        <Pencil className="h-5 w-5" />
                        <span className="sr-only">Edit timer</span>
                      </AnimatedButton>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-4 mt-2">
                  {isEditing ? (
                    <>
                      <AnimatedButton 
                        onClick={handleSaveEdit}
                        variant="default"
                        size="lg"
                        hoverScale={1.05}
                        className="min-w-[120px]"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Save
                      </AnimatedButton>
                      <AnimatedButton 
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="lg"
                        hoverScale={1.05}
                        className="min-w-[120px]"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancel
                      </AnimatedButton>
                    </>
                  ) : (
                    <>
                      <AnimatedButton 
                        onClick={handleToggleTimer} 
                        variant={isActive ? "destructive" : "default"}
                        size="lg"
                        hoverScale={1.05}
                        className="min-w-[120px]"
                      >
                        {isActive ? "Pause" : timeLeft === 0 ? "Restart" : "Start"}
                      </AnimatedButton>
                      <AnimatedButton 
                        onClick={handleResetTimer} 
                        variant="outline" 
                        size="lg"
                        hoverScale={1.05}
                        className="min-w-[120px]"
                      >
                        Reset
                      </AnimatedButton>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-0 opacity-80 pointer-events-none select-none">
        <Doodle name="idea" className="w-40 h-40" on={isActive} />
      </div>
    </div>
  );
};

export default Timer;
