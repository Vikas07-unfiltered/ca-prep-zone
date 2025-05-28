import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudyRoomService, StudyRoom } from "@/services/StudyRoomService";

import { supabase } from "@/integrations/supabase/client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

// Empty initial data
const initialStudyRooms = [];
const initialMessages = [];


const StudyRooms = () => {
  const { toast } = useToast();
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    ca_level: ""
  });
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [roomCodeToJoin, setRoomCodeToJoin] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [creatorName, setCreatorName] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Place activeRoomData here so it's available for useEffect
  const activeRoomData = activeRoom
    ? studyRooms.find(room => room.id === activeRoom)
    : null;

  // Fetch authenticated user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch rooms on mount and subscribe to realtime
  useEffect(() => {
    StudyRoomService.getAll().then(setStudyRooms).catch((e) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    });
    const channel = supabase
      .channel('study_rooms_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_rooms' }, payload => {
        StudyRoomService.getAll().then(setStudyRooms);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Fetch creator's name when activeRoomData changes
  useEffect(() => {
    async function fetchCreatorName() {
      if (activeRoomData?.created_by) {
        const { data, error } = await (supabase as any).from('profiles').select('full_name').eq('id', activeRoomData.created_by).single();
        setCreatorName(data?.full_name || activeRoomData.created_by);
      }
    }
    fetchCreatorName();
  }, [activeRoomData?.created_by]);

  const handleCreateRoom = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create a room.", variant: "destructive" });
      return;
    }
    if (!newRoom.name || !newRoom.ca_level) {
      toast({
        title: "Error",
        description: "Please provide a name and CA level for the room",
        variant: "destructive",
      });
      return;
    }
    try {
      // Create Daily.co room via backend API
      let daily_room_url = null;
      try {
        const resp = await fetch('http://localhost:3001/api/create-daily-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: `studyroom-${Date.now()}` })
        });
        const data = await resp.json();
        daily_room_url = data.url || null;
      } catch (err) {
        daily_room_url = null;
      }
      const createdRoom = await StudyRoomService.create({
        name: newRoom.name,
        description: newRoom.description,
        ca_level: newRoom.ca_level,
        created_by: user.id,
        participants: [user.id],
        daily_room_url,
      });
      setStudyRooms((prev) => [createdRoom, ...prev]);
      setIsCreatingRoom(false);
      setActiveRoom(createdRoom.id!);
      toast({
        title: "Room Created",
        description: `Study room "${newRoom.name}" has been created`,
      });
      setNewRoom({ name: "", description: "", ca_level: "" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleJoinRoom = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to join a room.", variant: "destructive" });
      return;
    }
    try {
      const roomToJoin = await StudyRoomService.getRoomByCode(Number(roomCodeToJoin));
      if (!roomToJoin) {
        toast({
          title: "Room Not Found",
          description: "Please enter a valid room code",
          variant: "destructive",
        });
        return;
      }
      await StudyRoomService.joinRoom(Number(roomCodeToJoin), user.id);
      const updatedRooms = await StudyRoomService.getAll();
      setStudyRooms(updatedRooms);
      setActiveRoom(roomToJoin.id!);
      setIsJoiningRoom(false);
      setRoomCodeToJoin("");
      toast({
        title: "Joined Room",
        description: `You have joined "${roomToJoin.name}"`,
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const message = {
      id: `msg-${Date.now()}`,
      sender: user?.id,
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleLeaveRoom = () => {
    if (!activeRoom) return;
    
    setActiveRoom(null);
    
    toast({
      title: "Left Room",
      description: "You have left the study room",
    });
  };

  const handleDeleteRoom = async () => {
    if (!activeRoomData) return;
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    try {
      await StudyRoomService.deleteRoom(activeRoomData.id!);
      setActiveRoom(null);
      setStudyRooms((prev) => prev.filter(room => room.id !== activeRoomData.id));
      toast({
        title: 'Room Deleted',
        description: `Study room "${activeRoomData.name}" has been deleted.`,
      });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  console.log('activeRoomData:', activeRoomData);

  const filteredRooms = studyRooms.filter(room =>
    selectedLevel === "All" || room.ca_level === selectedLevel
  );

  return (
    <div className="container py-8 md:py-12">
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-8">Study Rooms</h1>
      </ScrollReveal>
      
      {!activeRoom ? (
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="flex gap-4">
                <Dialog open={isCreatingRoom} onOpenChange={setIsCreatingRoom}>
                  <DialogTrigger asChild>
                    <Button>Create Room</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Study Room</DialogTitle>
                      <DialogDescription>
                        Create a new virtual study room to collaborate with others.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="room-name">Room Name</Label>
                        <Input
                          id="room-name"
                          value={newRoom.name}
                          onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                          placeholder="e.g., Taxation Study Group"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="room-ca-level">CA Level</Label>
                        <Select
                          value={newRoom.ca_level}
                          onValueChange={(value) => setNewRoom({ ...newRoom, ca_level: value })}
                        >
                          <SelectTrigger id="room-ca-level">
                            <SelectValue placeholder="Select CA Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Foundation">Foundation</SelectItem>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Final">Final</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="room-description">Description (Optional)</Label>
                        <Input
                          id="room-description"
                          value={newRoom.description}
                          onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                          placeholder="Briefly describe the purpose of this room"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateRoom}>Create Room</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isJoiningRoom} onOpenChange={setIsJoiningRoom}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Join Room</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join Study Room</DialogTitle>
                      <DialogDescription>
                        Enter a room code to join an existing study room.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="room-code">Room Code</Label>
                        <Input
                          id="room-code"
                          value={roomCodeToJoin}
                          onChange={(e) => setRoomCodeToJoin(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="e.g., 123456"
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleJoinRoom}>Join Room</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mb-4 flex gap-4 items-center">
                <label className="font-medium">CA Level:</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select CA Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Study Rooms</CardTitle>
                  <CardDescription>
                    Join an existing study room to collaborate with other students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredRooms.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No active study rooms. Create one to get started!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filteredRooms.map((room, i) => (
                        <ScrollReveal delay={0.2 + i * 0.05}>
                          <motion.div
                            key={room.id}
                            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="border rounded-lg p-4 hover:border-primary transition-all duration-200 cursor-pointer"
                            onClick={() => setActiveRoom(room.id)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{room.name}</h3>
                                <p className="text-sm text-muted-foreground">{room.ca_level}</p>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{room.participants.length}</span>
                              </div>
                            </div>
                            {room.description && (
                              <p className="text-sm mb-3">{room.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {room.participants.slice(0, 3).map((participant, i) => (
                                <Avatar key={i} className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {participant.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {room.participants.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                                  +{room.participants.length - 3}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Study Room Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Text Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Exchange messages and share information with fellow students
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Study Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Track study sessions and collaborate on specific topics
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button className="w-full active:scale-95 transition-transform" onClick={() => setIsCreatingRoom(true)}>
                    Create a New Room
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeRoomData && (
            <ScrollReveal delay={0.1}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="border-2 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>{activeRoomData.name}</CardTitle>
                      <CardDescription>{activeRoomData.ca_level}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleLeaveRoom}>
                        Leave Room
                      </Button>
                      {user?.id === activeRoomData.created_by && (
                        <Button variant="destructive" onClick={handleDeleteRoom}>
                          Delete Room
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Room Info</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Participants: {activeRoomData.participants.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>CA Level: {activeRoomData.ca_level}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">
                            Room Code: {activeRoomData.room_code}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">
                            Created by: {creatorName}
                          </span>
                        </div>
                        {activeRoomData.description && (
                          <div className="sm:col-span-2 border-t pt-2 mt-1">
                            <span className="block text-muted-foreground">Description:</span>
                            <span>{activeRoomData.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Tabs defaultValue="chat">
                      <TabsList className="mb-4">
  <TabsTrigger value="chat">
    <MessageCircle className="h-4 w-4 mr-2" />
    Chat
  </TabsTrigger>
  <TabsTrigger value="participants">
    <Users className="h-4 w-4 mr-2" />
    Participants
  </TabsTrigger>
  {activeRoomData?.daily_room_url && (
    <TabsTrigger value="voice">
      <span role="img" aria-label="Voice Chat" className="h-4 w-4 mr-2">🔊</span>
      Voice Chat
    </TabsTrigger>
  )}
</TabsList>
                      
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <TabsContent value="chat" className="space-y-4">
                          <Card className="border">
                            <ScrollArea className="h-[400px] p-4">
                              {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-center">
                                  <div>
                                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">No messages yet</p>
                                    <p className="text-sm text-muted-foreground">
                                      Be the first to send a message in this room!
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {messages.map((message) => (
                                    <motion.div
                                      key={message.id}
                                      initial={{ opacity: 0, x: 30 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className={`flex gap-3 ${
                                        message.sender === user?.id ? "justify-end" : ""
                                      }`}
                                    >
                                      {message.sender !== user?.id && (
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="text-xs">
                                            {message.sender.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                      <div
                                        className={`rounded-lg p-3 max-w-[80%] ${
                                          message.sender === user?.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                        }`}
                                      >
                                        <div className="flex justify-between gap-4 mb-1">
                                          <span className="font-medium text-sm">
                                            {message.sender === user?.id ? "You" : message.sender}
                                          </span>
                                          <span className="text-xs opacity-70">
                                            {formatTime(message.timestamp)}
                                          </span>
                                        </div>
                                        <p className="text-sm">{message.content}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                            <div className="p-4 border-t">
                              <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  placeholder="Type your message..."
                                  className="flex-1"
                                />
                                <Button type="submit">Send</Button>
                              </form>
                            </div>
                          </Card>
                        </TabsContent>
                      </motion.div>



                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <TabsContent value="participants">
                          <Card className="border">
                            <CardContent className="py-4">
                              <h3 className="font-medium mb-4">Room Participants</h3>
                              <div className="space-y-2">
                                {activeRoomData.participants.map((participant, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                                  >
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                        {participant.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">
                                        {participant === user?.id ? "You" : participant}
                                      </p>
                                      {participant === activeRoomData.created_by && (
                                        <p className="text-xs text-muted-foreground">Room Creator</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <p className="text-sm text-muted-foreground">
                                Room Code: {activeRoomData.room_code} (Share this code to invite others)
                              </p>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </motion.div>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyRooms;
