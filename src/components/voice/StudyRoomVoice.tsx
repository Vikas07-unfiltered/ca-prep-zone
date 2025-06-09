
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAgoraVoice } from "@/hooks/useAgoraVoice";
import { useMicrophonePermission } from "@/hooks/useMicrophonePermission";
import { VoiceControls } from "./VoiceControls";
import { VoiceConnectionInterface } from "./VoiceConnectionInterface";
import { VoiceDisabledState } from "./VoiceDisabledState";
import { VoiceServiceUnavailable } from "./VoiceServiceUnavailable";

interface StudyRoomVoiceProps {
  roomUrl: string;
  isVoiceEnabled: boolean;
  isAdmin: boolean;
  onToggleVoice: (enabled: boolean) => void;
  onSwitchToTextChat?: () => void;
}

// Agora.io App ID - Updated with your App ID
const AGORA_APP_ID = "d997a2560ca7443fa3d656cd679e9d5d";

const extractChannelFromUrl = (url: string): string => {
  // Extract channel name from room URL or use room ID
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').pop() || 'default-channel';
  } catch {
    // If not a valid URL, use it as channel name directly
    return url.replace(/[^a-zA-Z0-9]/g, '') || 'default-channel';
  }
};

export const StudyRoomVoice: React.FC<StudyRoomVoiceProps> = ({ 
  roomUrl, 
  isVoiceEnabled, 
  isAdmin, 
  onToggleVoice,
  onSwitchToTextChat 
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const microphonePermission = useMicrophonePermission();
  
  const channel = extractChannelFromUrl(roomUrl);
  
  const { 
    isMuted, 
    participantCount, 
    toggleMute, 
    leaveCall,
    hasError,
    isJoining,
    errorMessage
  } = useAgoraVoice({ 
    appId: AGORA_APP_ID,
    channel: channel,
    isConnected 
  });

  console.log('StudyRoomVoice state:', { 
    roomUrl, 
    isVoiceEnabled, 
    isAdmin, 
    channel, 
    isConnected, 
    hasError, 
    isJoining,
    retryCount,
    errorMessage 
  });

  // Check if Agora App ID is configured (not empty and not the placeholder)
  const isValidConfig = AGORA_APP_ID && AGORA_APP_ID.length === 32;

  if (!isVoiceEnabled || !isValidConfig) {
    return (
      <VoiceDisabledState
        isAdmin={isAdmin}
        isValidUrl={isValidConfig}
        onToggleVoice={onToggleVoice}
      />
    );
  }

  // Show service unavailable message if there's an Agora error
  if (hasError && isConnected) {
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
        
        <div className="mb-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 text-center mb-2">
            ⚠️ Connection issue detected
          </p>
          <p className="text-xs text-orange-700 text-center mb-3">
            {errorMessage || "There was a problem with the voice chat connection."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Retrying voice chat connection...', retryCount + 1);
                setIsConnected(false);
                setRetryCount(prev => prev + 1);
                setTimeout(() => setIsConnected(true), 1000);
              }}
            >
              Retry Connection
            </Button>
            {onSwitchToTextChat && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onSwitchToTextChat}
              >
                Switch to Text Chat
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleJoinCall = async () => {
    if (microphonePermission === 'denied') {
      toast({
        title: "Microphone Permission Required",
        description: "Please enable microphone access in your browser settings to join voice chat.",
        variant: "destructive",
      });
      return;
    }

    console.log('Attempting to join voice chat with channel:', channel);
    setIsConnected(true);
  };

  const handleLeaveCall = async () => {
    await leaveCall();
    setIsConnected(false);
    setRetryCount(0);
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
        <VoiceConnectionInterface
          isJoining={isJoining}
          microphonePermission={microphonePermission}
          onJoinCall={handleJoinCall}
        />
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
      
      <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800 text-center">
          🎤 Connected to voice chat
        </p>
      </div>
      
      <VoiceControls
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onLeaveCall={handleLeaveCall}
        participantCount={participantCount}
      />
    </div>
  );
};
