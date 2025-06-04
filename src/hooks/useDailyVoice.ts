
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseDailyVoiceProps {
  roomUrl: string;
  isConnected: boolean;
}

export const useDailyVoice = ({ roomUrl, isConnected }: UseDailyVoiceProps) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [hasError, setHasError] = useState(false);
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let callFrame: any = null;

    const initializeDaily = async () => {
      if (!isConnected || !roomUrl) return;

      try {
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

          callFrame.on('joined-meeting', () => {
            console.log('Successfully joined Daily.co meeting');
            setHasError(false);
            toast({
              title: "Voice Chat Joined",
              description: "You've successfully joined the voice chat!",
            });
          });

          callFrame.on('left-meeting', () => {
            console.log('Left Daily.co meeting');
          });

          callFrame.on('participant-joined', () => {
            setParticipantCount(prev => prev + 1);
          });

          callFrame.on('participant-left', () => {
            setParticipantCount(prev => Math.max(1, prev - 1));
          });

          callFrame.on('error', (event: any) => {
            console.error('Daily.co error:', event);
            
            // Handle specific payment/account errors
            if (event.errorMsg === 'account-missing-payment-method' || 
                event.errorMsg === 'room-not-found' ||
                event.errorMsg === 'meeting-session-state-error') {
              setHasError(true);
              toast({
                title: "Voice Chat Service Unavailable",
                description: "Voice chat requires a paid Daily.co account. Please use text chat for now.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Voice Chat Error",
                description: "Failed to connect to voice chat. Please try again.",
                variant: "destructive",
              });
            }
          });

          await callFrame.join({ url: roomUrl });
        }
      } catch (error) {
        console.error('Error initializing Daily.co:', error);
        setHasError(true);
        toast({
          title: "Voice Chat Unavailable",
          description: "Voice chat service is currently unavailable. Please use text chat.",
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

  const toggleMute = () => {
    if (callFrameRef.current && !hasError) {
      const newMutedState = !isMuted;
      console.log('Toggling microphone:', newMutedState ? 'muted' : 'unmuted');
      callFrameRef.current.setLocalAudio(!newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const leaveCall = () => {
    console.log('Leaving voice chat');
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
  };

  return {
    isMuted,
    participantCount,
    containerRef,
    toggleMute,
    leaveCall,
    hasError
  };
};
