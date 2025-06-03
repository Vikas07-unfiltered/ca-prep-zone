
import React, { useEffect, useState } from "react";
import { DailyProvider, useDaily, useDailyEvent, useLocalParticipant, useParticipantIds, DailyAudio } from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Volume2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudyRoomVoiceProps {
  roomUrl: string;
  isVoiceEnabled: boolean;
  isAdmin: boolean;
  onToggleVoice: (enabled: boolean) => void;
}

// Isolated wrapper component that strips all props except the ones we need
const IsolatedDailyProvider: React.FC<{ 
  roomUrl: string; 
  children: React.ReactNode 
}> = ({ roomUrl, children }) => {
  return (
    <div>
      <DailyProvider url={roomUrl}>
        {children}
      </DailyProvider>
    </div>
  );
};

// Isolated audio component
const IsolatedDailyAudio: React.FC = () => {
  return (
    <div>
      <DailyAudio />
    </div>
  );
};

// Helper function to validate Daily.co room URL
const isValidDailyUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('daily.co');
  } catch {
    return false;
  }
};

export const StudyRoomVoice: React.FC<StudyRoomVoiceProps> = ({ 
  roomUrl, 
  isVoiceEnabled, 
  isAdmin, 
  onToggleVoice 
}) => {
  console.log('StudyRoomVoice props:', { roomUrl, isVoiceEnabled, isAdmin });

  // Check if voice is disabled
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

  // Check if room URL is valid
  if (!isValidDailyUrl(roomUrl)) {
    return (
      <div className="p-4 text-center text-muted-foreground border-t">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
        <p className="mb-2">Voice chat is not available for this room.</p>
        <p className="text-sm text-muted-foreground">
          Invalid or missing voice chat configuration.
        </p>
        {isAdmin && (
          <Button variant="outline" onClick={() => onToggleVoice(false)} className="mt-2">
            Disable Voice Chat
          </Button>
        )}
      </div>
    );
  }

  return (
    <IsolatedDailyProvider roomUrl={roomUrl}>
      <VoiceChatUI isAdmin={isAdmin} onToggleVoice={onToggleVoice} />
    </IsolatedDailyProvider>
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
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // Check microphone permissions on mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicrophonePermission(permission.state);
          console.log('Microphone permission:', permission.state);
        }
      } catch (error) {
        console.warn('Could not check microphone permission:', error);
        setMicrophonePermission('unknown');
      }
    };

    checkMicrophonePermission();
  }, []);

  useDailyEvent("joined-meeting", () => {
    console.log('Successfully joined Daily.co meeting');
    setIsConnected(true);
    setIsJoining(false);
    toast({
      title: "Voice Chat Joined",
      description: "You've successfully joined the voice chat!",
    });
  });

  useDailyEvent("left-meeting", () => {
    console.log('Left Daily.co meeting');
    setIsConnected(false);
    setIsJoining(false);
  });

  useDailyEvent("error", (event) => {
    console.error('Daily.co error:', event);
    setIsJoining(false);
    toast({
      title: "Voice Chat Error",
      description: "Failed to connect to voice chat. Please check your microphone permissions and try again.",
      variant: "destructive",
    });
  });

  useDailyEvent("camera-error", (event) => {
    console.error('Daily.co camera error:', event);
    toast({
      title: "Camera Error",
      description: "There was an issue with camera access, but voice chat should still work.",
      variant: "destructive",
    });
  });

  useDailyEvent("mic-error", (event) => {
    console.error('Daily.co microphone error:', event);
    toast({
      title: "Microphone Error",
      description: "Please check your microphone permissions and try again.",
      variant: "destructive",
    });
  });

  const handleJoinCall = async () => {
    if (!callObject) {
      console.error('Daily call object not available');
      return;
    }

    // Check microphone permission before joining
    if (microphonePermission === 'denied') {
      toast({
        title: "Microphone Permission Required",
        description: "Please enable microphone access in your browser settings to join voice chat.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    console.log('Attempting to join Daily.co call');
    
    try {
      await callObject.join();
      console.log('Join call request sent');
    } catch (error) {
      console.error('Error joining call:', error);
      setIsJoining(false);
      toast({
        title: "Connection Failed",
        description: "Could not join voice chat. Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCall = () => {
    if (callObject) {
      console.log('Leaving Daily.co call');
      callObject.leave();
    }
  };

  const toggleMute = () => {
    if (callObject && local) {
      const newAudioState = !local.audio;
      console.log('Toggling microphone:', newAudioState ? 'unmuted' : 'muted');
      callObject.setLocalAudio(newAudioState);
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
          {microphonePermission === 'denied' && (
            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-orange-800 text-xs">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Microphone access required for voice chat
            </div>
          )}
          <Button 
            onClick={handleJoinCall}
            disabled={isJoining || microphonePermission === 'denied'}
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
      <IsolatedDailyAudio />
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
