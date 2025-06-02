
import React, { useEffect, useState } from "react";
import { DailyProvider, useDaily, useDailyEvent, useLocalParticipant, useParticipantIds, DailyAudio } from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudyRoomVoiceProps {
  roomUrl: string;
  isVoiceEnabled: boolean;
  isAdmin: boolean;
  onToggleVoice: (enabled: boolean) => void;
}

export const StudyRoomVoice: React.FC<StudyRoomVoiceProps> = ({ 
  roomUrl, 
  isVoiceEnabled, 
  isAdmin, 
  onToggleVoice 
}) => {
  if (!isVoiceEnabled) {
    return (
      <div className="p-4 text-center text-muted-foreground border-t">
        <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="mb-2">Voice chat is disabled for this room.</p>
        {isAdmin && (
          <Button variant="outline" onClick={() => onToggleVoice(true)}>
            Enable Voice Chat
          </Button>
        )}
      </div>
    );
  }

  return (
    <DailyProvider url={roomUrl}>
      <VoiceChatUI isAdmin={isAdmin} onToggleVoice={onToggleVoice} />
    </DailyProvider>
  );
};

const VoiceChatUI: React.FC<{ isAdmin: boolean; onToggleVoice: (enabled: boolean) => void }> = ({ 
  isAdmin, 
  onToggleVoice 
}) => {
  const callObject = useDaily();
  const local = useLocalParticipant();
  const participantIds = useParticipantIds();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useDailyEvent("joined-meeting", () => {
    setIsConnected(true);
    setIsJoining(false);
    toast({
      title: "Voice Chat Joined",
      description: "You've successfully joined the voice chat!",
    });
  });

  useDailyEvent("left-meeting", () => {
    setIsConnected(false);
    setIsJoining(false);
  });

  useDailyEvent("error", (event) => {
    setIsJoining(false);
    toast({
      title: "Voice Chat Error",
      description: "Failed to connect to voice chat. Please try again.",
      variant: "destructive",
    });
  });

  const handleJoinCall = async () => {
    if (!callObject) return;
    setIsJoining(true);
    try {
      await callObject.join();
    } catch (error) {
      setIsJoining(false);
      toast({
        title: "Connection Failed",
        description: "Could not join voice chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCall = () => {
    if (callObject) {
      callObject.leave();
    }
  };

  const toggleMute = () => {
    if (callObject && local) {
      callObject.setLocalAudio(!local.audio);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Voice Chat</h3>
          {isAdmin && (
            <Button
              variant="outline" 
              size="sm"
              onClick={() => onToggleVoice(false)}
            >
              Disable Voice
            </Button>
          )}
        </div>
        <div className="text-center">
          <Volume2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Connect to voice chat to talk with other participants
          </p>
          <Button 
            onClick={handleJoinCall}
            disabled={isJoining}
            className="w-full"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Join Voice Chat
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t">
      <DailyAudio />
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Voice Chat</h3>
        {isAdmin && (
          <Button
            variant="outline" 
            size="sm"
            onClick={() => onToggleVoice(false)}
          >
            Disable Voice
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant={local?.audio ? "default" : "secondary"}
          size="sm"
          onClick={toggleMute}
          className="flex-1"
        >
          {local?.audio ? (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Unmuted
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Muted
            </>
          )}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLeaveCall}
          className="flex-1"
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          Leave
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        <span className="inline-flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {participantIds.length} participant{participantIds.length !== 1 ? 's' : ''} in voice chat
        </span>
      </div>
    </div>
  );
};
