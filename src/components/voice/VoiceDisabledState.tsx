
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, AlertCircle } from "lucide-react";

interface VoiceDisabledStateProps {
  isAdmin: boolean;
  isValidUrl: boolean;
  onToggleVoice: (enabled: boolean) => void;
}

export const VoiceDisabledState: React.FC<VoiceDisabledStateProps> = ({
  isAdmin,
  isValidUrl,
  onToggleVoice
}) => {
  if (!isValidUrl) {
    return (
      <div className="p-4 text-center text-muted-foreground border-t">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
        <p className="mb-2">Voice chat is not configured.</p>
        <p className="text-sm text-muted-foreground mb-2">
          Please add your Agora.io App ID to enable voice chat.
        </p>
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border">
          <p>To configure voice chat:</p>
          <p>1. Sign up at agora.io</p>
          <p>2. Get your App ID from the console</p>
          <p>3. Replace 'your_agora_app_id_here' in StudyRoomVoice.tsx</p>
        </div>
        {isAdmin && (
          <Button variant="outline" onClick={() => onToggleVoice(false)} className="mt-2">
            Disable Voice Chat
          </Button>
        )}
      </div>
    );
  }

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
};
