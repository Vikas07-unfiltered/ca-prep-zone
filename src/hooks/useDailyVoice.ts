
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
            toast({
              title: "Voice Chat Error",
              description: "Failed to connect to voice chat. Please try again.",
              variant: "destructive",
            });
          });

          await callFrame.join({ url: roomUrl });
        }
      } catch (error) {
        console.error('Error initializing Daily.co:', error);
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

  const toggleMute = () => {
    if (callFrameRef.current) {
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
    leaveCall
  };
};
