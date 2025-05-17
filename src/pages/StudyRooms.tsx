
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, Video, Mic, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for study rooms
const initialStudyRooms = [
  {
    id: "room-1",
    name: "Taxation Study Group",
    description: "Discussing GST and Direct Tax provisions",
    participants: ["Rahul", "Priya", "Anjali"],
    createdBy: "Rahul",
    isActive: true,
    subject: "Taxation"
  },
  {
    id: "room-2",
    name: "Audit Standards Discussion",
    description: "Review of audit standards and procedures",
    participants: ["Arjun", "Nikita"],
    createdBy: "Arjun",
    isActive: true,
    subject: "Audit"
  },
  {
    id: "room-3",
    name: "Financial Reporting Group",
    description: "IFRS and Ind AS discussion",
    participants: ["Deepak", "Suman", "Kiran", "Neha"],
    createdBy: "Deepak",
    isActive: true,
    subject: "Financial Reporting"
  }
];

// Mock chat messages
const initialMessages = [
  {
    id: "msg-1",
    sender: "Priya",
    content: "Has anyone covered AS 15 yet?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
  },
  {
    id: "msg-2",
    sender: "Rahul",
    content: "Yes, I just finished that section. What specific parts are you looking at?",
    timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
  },
  {
    id: "msg-3",
    sender: "Priya",
    content: "I'm having trouble with the recognition criteria for defined benefit plans",
    timestamp: new Date(Date.now() - 1000 * 60 * 8) // 8 minutes ago
  },
  {
    id: "msg-4",
    sender: "Anjali",
    content: "Check out page 237 of the study materials, there's a good example there",
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  }
];

const StudyRooms = () => {
  const { toast } = useToast();
  const [studyRooms, setStudyRooms] = useState(initialStudyRooms);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    subject: ""
  });
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  // Mock current user
  const currentUser = "You";

  const handleCreateRoom = () => {
    if (!newRoom.name || !newRoom.subject) {
      toast({
        title: "Error",
        description: "Please provide a name and subject for the room",
        variant: "destructive",
      });
      return;
    }
    
    const roomId = `room-${Date.now()}`;
    const createdRoom = {
      id: roomId,
      name: newRoom.name,
      description: newRoom.description,
      participants: [currentUser],
      createdBy: currentUser,
      isActive: true,
      subject: newRoom.subject
    };
    
    setStudyRooms([...studyRooms, createdRoom]);
    setIsCreatingRoom(false);
    setActiveRoom(roomId);
    
    toast({
      title: "Room Created",
      description: `Study room "${newRoom.name}" has been created`,
    });
    
    // Reset form
    setNewRoom({
      name: "",
      description: "",
      subject: ""
    });
  };

  const handleJoinRoom = () => {
    const roomToJoin = studyRooms.find(room => room.id === roomIdToJoin);
    
    if (!roomToJoin) {
      toast({
        title: "Room Not Found",
        description: "Please enter a valid room ID",
        variant: "destructive",
      });
      return;
    }
    
    if (!roomToJoin.participants.includes(currentUser)) {
      const updatedRooms = studyRooms.map(room => {
        if (room.id === roomIdToJoin) {
          return {
            ...room,
            participants: [...room.participants, currentUser]
          };
        }
        return room;
      });
      
      setStudyRooms(updatedRooms);
    }
    
    setActiveRoom(roomIdToJoin);
    setIsJoiningRoom(false);
    setRoomIdToJoin("");
    
    toast({
      title: "Joined Room",
      description: `You have joined "${roomToJoin.name}"`,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
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

  const activeRoomData = activeRoom
    ? studyRooms.find(room => room.id === activeRoom)
    : null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Study Rooms</h1>
      
      {!activeRoom ? (
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
                      <Label htmlFor="room-subject">Subject</Label>
                      <Input
                        id="room-subject"
                        value={newRoom.subject}
                        onChange={(e) => setNewRoom({...newRoom, subject: e.target.value})}
                        placeholder="e.g., Taxation, Audit, Financial Reporting"
                      />
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
                      Enter a room ID to join an existing study room.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="room-id">Room ID</Label>
                      <Input
                        id="room-id"
                        value={roomIdToJoin}
                        onChange={(e) => setRoomIdToJoin(e.target.value)}
                        placeholder="e.g., room-1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleJoinRoom}>Join Room</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Study Rooms</CardTitle>
                <CardDescription>
                  Join an existing study room to collaborate with other students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studyRooms.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active study rooms. Create one to get started!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {studyRooms.map((room) => (
                      <div
                        key={room.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => setActiveRoom(room.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{room.name}</h3>
                            <p className="text-sm text-muted-foreground">{room.subject}</p>
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
                      </div>
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
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Voice Communication</h3>
                    <p className="text-sm text-muted-foreground">
                      Discuss concepts verbally for better understanding
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
                <Button className="w-full" onClick={() => setIsCreatingRoom(true)}>
                  Create a New Room
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeRoomData && (
            <Card className="border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{activeRoomData.name}</CardTitle>
                  <CardDescription>{activeRoomData.subject}</CardDescription>
                </div>
                <Button variant="outline" onClick={handleLeaveRoom}>
                  Leave Room
                </Button>
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
                      <span>Subject: {activeRoomData.subject}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">
                        Created by: {activeRoomData.createdBy}
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
                    <TabsTrigger value="voice">
                      <Mic className="h-4 w-4 mr-2" />
                      Voice
                    </TabsTrigger>
                    <TabsTrigger value="participants">
                      <Users className="h-4 w-4 mr-2" />
                      Participants
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat" className="space-y-4">
                    <Card className="border">
                      <ScrollArea className="h-[400px] p-4">
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.sender === currentUser ? "justify-end" : ""
                              }`}
                            >
                              {message.sender !== currentUser && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {message.sender.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`rounded-lg p-3 max-w-[80%] ${
                                  message.sender === currentUser
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <div className="flex justify-between gap-4 mb-1">
                                  <span className="font-medium text-sm">
                                    {message.sender === currentUser ? "You" : message.sender}
                                  </span>
                                  <span className="text-xs opacity-70">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
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
                  
                  <TabsContent value="voice">
                    <Card className="border">
                      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 p-4 rounded-full bg-secondary">
                          <Mic className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Voice Chat</h3>
                        <p className="text-muted-foreground mb-6">
                          Voice chat feature will be available in the future update.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" disabled>
                            <Mic className="h-4 w-4 mr-2" />
                            Unmute
                          </Button>
                          <Button variant="outline" disabled>
                            <Video className="h-4 w-4 mr-2" />
                            Enable Video
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
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
                                  {participant === currentUser ? "You" : participant}
                                </p>
                                {participant === activeRoomData.createdBy && (
                                  <p className="text-xs text-muted-foreground">Room Creator</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <p className="text-sm text-muted-foreground">
                          Room ID: {activeRoomData.id} (Share this ID to invite others)
                        </p>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyRooms;
