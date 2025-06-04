
import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Volume2, AlertCircle } from "lucide-react";

interface VoiceConnectionInterfaceProps {
  isJoining: boolean;
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  onJoinCall: () => void;
}

export const VoiceConnectionInterface: React.FC<VoiceConnectionInterfaceProps> = ({
  isJoining,
  microphonePermission,
  onJoinCall
}) => {
  return (
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
        onClick={onJoinCall}
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
  );
};
