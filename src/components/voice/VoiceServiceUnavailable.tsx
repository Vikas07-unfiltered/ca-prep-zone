
import React from "react";
import { AlertCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceServiceUnavailableProps {
  onBackToChat: () => void;
}

export const VoiceServiceUnavailable: React.FC<VoiceServiceUnavailableProps> = ({
  onBackToChat
}) => {
  return (
    <div className="p-6 text-center">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
      <h3 className="text-lg font-semibold mb-2">Voice Chat Temporarily Unavailable</h3>
      <p className="text-sm text-muted-foreground mb-4">
        The voice chat service requires additional configuration. 
        Please use text chat to communicate with other participants.
      </p>
      <Button variant="outline" onClick={onBackToChat} className="w-full">
        <MessageCircle className="h-4 w-4 mr-2" />
        Switch to Text Chat
      </Button>
    </div>
  );
};
