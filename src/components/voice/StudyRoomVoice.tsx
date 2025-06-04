
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDailyVoice } from "@/hooks/useDailyVoice";
import { useMicrophonePermission } from "@/hooks/useMicrophonePermission";
import { VoiceControls } from "./VoiceControls";
import { VoiceConnectionInterface } from "./VoiceConnectionInterface";
import { VoiceDisabledState } from "./VoiceDisabledState";

interface StudyRoomVoiceProps {
  roomUrl: string;
  isVoiceEnabled: boolean;
  isAdmin: boolean;
  onToggleVoice: (enabled: boolean) => void;
}

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
  const microphonePermission = useMicrophonePermission();
  
  const { 
    isMuted, 
    participantCount, 
    containerRef, 
    toggleMute, 
    leaveCall 
  } = useDailyVoice({ 
    roomUrl, 
    isConnected 
  });

  console.log('StudyRoomVoice props:', { roomUrl, isVoiceEnabled, isAdmin });

  const isValidUrl = isValidDailyUrl(roomUrl);

  if (!isVoiceEnabled || !isValidUrl) {
    return (
      <VoiceDisabledState
        isAdmin={isAdmin}
        isValidUrl={isValidUrl}
        onToggleVoice={onToggleVoice}
      />
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
    leaveCall();
    setIsConnected(false);
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
      
      <div ref={containerRef} className="mb-3 rounded-lg overflow-hidden bg-gray-100" />
      
      <VoiceControls
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onLeaveCall={handleLeaveCall}
        participantCount={participantCount}
      />
    </div>
  );
};
