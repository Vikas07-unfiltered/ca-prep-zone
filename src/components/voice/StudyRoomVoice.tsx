
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Volume2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudyRoomVoiceProps {
  roomUrl: string;
  isVoiceEnabled: boolean;
  isAdmin: boolean;
  onToggleVoice: (enabled: boolean) => void;
}

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
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('StudyRoomVoice props:', { roomUrl, isVoiceEnabled, isAdmin });

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

  // Initialize Daily.co when connected
  useEffect(() => {
    let callFrame: any = null;

    const initializeDaily = async () => {
      if (!isConnected || !isValidDailyUrl(roomUrl)) return;

      try {
        // Dynamically import Daily.co
        const DailyIframe = (await import('@daily-co/daily-js')).default;
        
        if (containerRef.current && !callFrameRef.current) {
          callFrame = DailyIframe.createFrame(containerRef.current, {
            showLeaveButton: false,
            showFullscreenButton: false,
            showLocalVideo: false,
            showParticipantsBar: false,
            iframeStyle: {
              width: '100%',
              height: '300px',
              border: 'none',
              borderRadius: '8px'
            }
          });

          callFrameRef.current = callFrame;

          // Set up event listeners
          callFrame.on('joined-meeting', () => {
            console.log('Successfully joined Daily.co meeting');
            toast({
              title: "Voice Chat Joined",
              description: "You've successfully joined the voice chat!",
            });
          });

          callFrame.on('left-meeting', () => {
            console.log('Left Daily.co meeting');
            setIsConnected(false);
            setIsJoining(false);
          });

          callFrame.on('participant-joined', () => {
            setParticipantCount(prev => prev + 1);
          });

          callFrame.on('participant-left', () => {
            setParticipantCount(prev => Math.max(1, prev - 1));
          });

          callFrame.on('error', (event: any) => {
            console.error('Daily.co error:', event);
            setIsJoining(false);
            toast({
              title: "Voice Chat Error",
              description: "Failed to connect to voice chat. Please try again.",
              variant: "destructive",
            });
          });

          // Join the call
          await callFrame.join({ url: roomUrl });
        }
      } catch (error) {
        console.error('Error initializing Daily.co:', error);
        setIsJoining(false);
        toast({
          title: "Voice Chat Error",
          description: "Failed to initialize voice chat. Please refresh and try again.",
          variant: "destructive",
        });
      }
    };

    if (isConnected) {
      initializeDaily();
    }

    return () => {
      if (callFrame) {
        callFrame.destroy();
        callFrameRef.current = null;
      }
    };
  }, [isConnected, roomUrl, toast]);

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

  const handleJoinCall = async () => {
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
    console.log('Attempting to join voice chat');
    
    try {
      setIsConnected(true);
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
    console.log('Leaving voice chat');
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
    setIsConnected(false);
  };

  const toggleMute = () => {
    if (callFrameRef.current) {
      const newMutedState = !isMuted;
      console.log('Toggling microphone:', newMutedState ? 'muted' : 'unmuted');
      callFrameRef.current.setLocalAudio(!newMutedState);
      setIsMuted(newMutedState);
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
      
      {/* Daily.co iframe container */}
      <div ref={containerRef} className="mb-3 rounded-lg overflow-hidden bg-gray-100" />
      
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant={isMuted ? "secondary" : "default"}
          size="sm"
          onClick={toggleMute}
          className="flex-1"
        >
          {isMuted ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Muted
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Unmuted
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
          {participantCount} participant{participantCount !== 1 ? 's' : ''} in voice chat
        </span>
      </div>
    </div>
  );
};
