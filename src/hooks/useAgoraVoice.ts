
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack 
} from "agora-rtc-sdk-ng";

interface UseAgoraVoiceProps {
  appId: string;
  channel: string;
  token?: string;
  isConnected: boolean;
}

export const useAgoraVoice = ({ appId, channel, token, isConnected }: UseAgoraVoiceProps) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const remoteUsersRef = useRef<IAgoraRTCRemoteUser[]>([]);

  useEffect(() => {
    if (!isConnected || !appId || !channel) return;

    const initializeAgora = async () => {
      try {
        setIsJoining(true);
        setHasError(false);

        // Create Agora client
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Set up event listeners
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          console.log("Subscribe success");
          
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
          
          setParticipantCount(prev => prev + 1);
        });

        client.on("user-unpublished", (user) => {
          console.log("User unpublished:", user);
          setParticipantCount(prev => Math.max(1, prev - 1));
        });

        client.on("user-left", (user) => {
          console.log("User left:", user);
          setParticipantCount(prev => Math.max(1, prev - 1));
        });

        // Join channel
        const uid = await client.join(appId, channel, token || null);
        console.log("Joined Agora channel with UID:", uid);

        // Create and publish audio track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        audioTrackRef.current = audioTrack;
        
        await client.publish([audioTrack]);
        console.log("Published audio track");

        setIsJoining(false);
        toast({
          title: "Voice Chat Joined",
          description: "You've successfully joined the voice chat!",
        });

      } catch (error: any) {
        console.error("Error initializing Agora:", error);
        setHasError(true);
        setIsJoining(false);
        
        let errorMessage = "Failed to connect to voice chat.";
        if (error.code === "INVALID_PARAMS") {
          errorMessage = "Invalid voice chat configuration.";
        } else if (error.code === "CAN_NOT_GET_GATEWAY_SERVER") {
          errorMessage = "Network connection issue. Please check your internet.";
        }
        
        toast({
          title: "Voice Chat Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    initializeAgora();

    return () => {
      // Cleanup
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }
      if (audioTrackRef.current) {
        audioTrackRef.current.close();
      }
    };
  }, [isConnected, appId, channel, token, toast]);

  const toggleMute = async () => {
    if (audioTrackRef.current && !hasError) {
      const newMutedState = !isMuted;
      console.log('Toggling microphone:', newMutedState ? 'muted' : 'unmuted');
      
      try {
        await audioTrackRef.current.setEnabled(!newMutedState);
        setIsMuted(newMutedState);
      } catch (error) {
        console.error("Error toggling mute:", error);
        toast({
          title: "Error",
          description: "Failed to toggle microphone",
          variant: "destructive",
        });
      }
    }
  };

  const leaveCall = async () => {
    console.log('Leaving voice chat');
    
    try {
      if (audioTrackRef.current) {
        audioTrackRef.current.close();
        audioTrackRef.current = null;
      }
      
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
      
      setParticipantCount(1);
      setIsMuted(false);
      
    } catch (error) {
      console.error("Error leaving call:", error);
    }
  };

  return {
    isMuted,
    participantCount,
    toggleMute,
    leaveCall,
    hasError,
    isJoining
  };
};
