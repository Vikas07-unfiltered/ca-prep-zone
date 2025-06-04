
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";

interface VoiceControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onLeaveCall: () => void;
  participantCount: number;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isMuted,
  onToggleMute,
  onLeaveCall,
  participantCount
}) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant={isMuted ? "secondary" : "default"}
          size="sm"
          onClick={onToggleMute}
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
          onClick={onLeaveCall}
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
    </>
  );
};
