import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Check, X, Users } from "lucide-react";
import { Doodle } from "@/components/ui/Doodle";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { logPomodoroSession } from "@/services/PomodoroSessionService";
import { StudyRoomService } from "@/services/StudyRoomService";
import { ALL_SUBJECTS } from "@/data/caLevels";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TimerProps {
  onPomodoroComplete?: () => void;
}

const Timer: React.FC<TimerProps> = ({ onPomodoroComplete }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentMode, setCurrentMode] = useState("focus");
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [subject, setSubject] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState("0");
  const [editMinutes, setEditMinutes] = useState("");
  const [editSeconds, setEditSeconds] = useState("");
  const interval = useRef(null);

  // Load available study rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const rooms = await StudyRoomService.getAll();
        setAvailableRooms(rooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    if (isActive) {
      interval.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval.current);
            setIsActive(false);
            handleSessionComplete();
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

  const handleSessionComplete = async () => {
    toast({
      title: "Timer Completed",
      description: `Your ${currentMode} session is complete!`,
    });

    // Log completed Pomodoro session
    if (currentMode === "focus" && sessionStartTime && user && subject) {
      try {
        await logPomodoroSession({
          user_id: user.id,
          subject: subject,
          start_time: sessionStartTime.toISOString(),
          end_time: new Date().toISOString(),
          room_id: currentRoomId
        });
        
        toast({
          title: "Session Logged",
          description: `Your ${subject} study session has been recorded!`,
        });
      } catch (error) {
        console.error('Error logging session:', error);
        toast({
          title: "Logging Error",
          description: "Failed to save your session data.",
          variant: "destructive"
        });
      }
    }

    if (currentMode === "focus" && typeof onPomodoroComplete === "function") {
      onPomodoroComplete();
    }

    setSessionStartTime(null);
  };

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
    
    if (!isActive) {
      // Starting timer
      if (currentMode === "focus" && !subject) {
        toast({
          title: "Subject Required",
          description: "Please select a subject before starting your focus session.",
          variant: "destructive"
        });
        return;
      }
      setSessionStartTime(new Date());
      console.log(`Started ${currentMode} session on: ${subject || "Break"}`);
    }
    
    setIsActive(!isActive);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setSessionStartTime(null);
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

  const joinStudyRoom = async (roomCode: number) => {
    if (!user) return;
    
    try {
      await StudyRoomService.joinRoom(roomCode, user.id);
      const room = await StudyRoomService.getRoomByCode(roomCode);
      if (room) {
        setCurrentRoomId(room.id);
        toast({
          title: "Joined Study Room",
          description: `You're now in ${room.name}`,
        });
      }
      setShowRoomDialog(false);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join study room",
        variant: "destructive"
      });
    }
  };

  const leaveStudyRoom = async () => {
    if (!user || !currentRoomId) return;
    
    try {
      const room = availableRooms.find(r => r.id === currentRoomId);
      if (room) {
        await StudyRoomService.leaveRoom(room.room_code, user.id);
        setCurrentRoomId(null);
        toast({
          title: "Left Study Room",
          description: "You've left the study room",
        });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: "Error",
        description: "Failed to leave study room",
        variant: "destructive"
      });
    }
  };

  const currentRoom = availableRooms.find(r => r.id === currentRoomId);

  return (
    <div className="relative">
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <h1 className="text-3xl font-bold mb-8">Pomodoro Timer</h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  {currentMode === "focus" ? "Focus Time" : 
                   currentMode === "shortBreak" ? "Short Break" : "Long Break"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Study Room Integration */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {currentRoom ? `In: ${currentRoom.name}` : "Not in any room"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!currentRoom ? (
                      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Join Room</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join Study Room</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {availableRooms.map((room) => (
                              <div key={room.id} className="flex items-center justify-between p-3 border rounded">
                                <div>
                                  <h4 className="font-medium">{room.name}</h4>
                                  <p className="text-sm text-muted-foreground">{room.description || 'Study room'}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => joinStudyRoom(room.room_code)}
                                >
                                  Join
                                </Button>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="outline" size="sm" onClick={leaveStudyRoom}>
                        Leave Room
                      </Button>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="focus" onValueChange={handleModeChange} className="w-full">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="focus">Focus</TabsTrigger>
                    <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
                    <TabsTrigger value="longBreak">Long Break</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="focus" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Study Subject</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_SUBJECTS.map((subj) => (
                            <SelectItem key={subj} value={subj}>
                              {subj}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  
                  {isActive && sessionStartTime && currentMode === "focus" && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Studying: <span className="font-medium">{subject}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {sessionStartTime.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  
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
          </ScrollReveal>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-0 opacity-80 pointer-events-none select-none">
        <Doodle name="idea" className="w-40 h-40" on={isActive} />
      </div>
    </div>
  );
};

export default Timer;
