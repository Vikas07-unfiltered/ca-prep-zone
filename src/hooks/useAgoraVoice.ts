
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
  const [errorMessage, setErrorMessage] = useState("");
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const remoteUsersRef = useRef<IAgoraRTCRemoteUser[]>([]);

  useEffect(() => {
    if (!isConnected || !appId || !channel) {
      // Reset error state when not connected
      setHasError(false);
      setErrorMessage("");
      return;
    }

    const initializeAgora = async () => {
      try {
        setIsJoining(true);
        setHasError(false);
        setErrorMessage("");

        console.log('Initializing Agora with:', { appId, channel });

        // Validate App ID format
        if (!appId || appId.length !== 32) {
          throw new Error('Invalid Agora App ID format');
        }

        // Test network connectivity first
        try {
          const response = await fetch('https://api.agora.io/health', { 
            method: 'GET',
            mode: 'no-cors',
            signal: AbortSignal.timeout(5000)
          });
          console.log('Agora API health check completed');
        } catch (networkError) {
          console.warn('Network connectivity test failed:', networkError);
          // Continue anyway as no-cors mode might not give us proper response
        }

        // Create Agora client with better configuration
        const client = AgoraRTC.createClient({ 
          mode: "rtc", 
          codec: "vp8",
          role: "host" // Explicitly set role
        });
        clientRef.current = client;

        // Set up event listeners with better error handling
        client.on("user-published", async (user, mediaType) => {
          try {
            console.log("User published:", user.uid, mediaType);
            await client.subscribe(user, mediaType);
            console.log("Subscribe success for user:", user.uid);
            
            if (mediaType === "audio" && user.audioTrack) {
              user.audioTrack.play();
            }
            
            setParticipantCount(prev => prev + 1);
          } catch (error) {
            console.error("Error subscribing to user:", error);
          }
        });

        client.on("user-unpublished", (user) => {
          console.log("User unpublished:", user.uid);
          setParticipantCount(prev => Math.max(1, prev - 1));
        });

        client.on("user-left", (user) => {
          console.log("User left:", user.uid);
          setParticipantCount(prev => Math.max(1, prev - 1));
        });

        client.on("connection-state-change", (curState, revState) => {
          console.log("Connection state changed:", curState, "from:", revState);
          if (curState === "DISCONNECTED" || curState === "DISCONNECTING") {
            setHasError(true);
            setErrorMessage("Connection lost to voice chat server");
          } else if (curState === "CONNECTED") {
            setHasError(false);
            setErrorMessage("");
          }
        });

        client.on("exception", (evt) => {
          console.error("Agora exception:", evt);
          setHasError(true);
          setErrorMessage(`Voice chat error: ${evt.msg}`);
        });

        // Check microphone permissions first
        try {
          const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permissions.state === 'denied') {
            throw new Error('Microphone permission denied');
          }
        } catch (permError) {
          console.warn('Could not check microphone permission:', permError);
        }

        // Join channel with timeout
        console.log('Joining channel:', channel);
        let rtcToken = token;
        const uid = String(Math.floor(Math.random() * 1000000)); // Generate random UID for now
        if (!rtcToken) {
          try {
            const res = await fetch(`http://localhost:5000/rtc-token?channel=${encodeURIComponent(channel)}&uid=${uid}`);
            const data = await res.json();
            rtcToken = data.token;
            if (!rtcToken) throw new Error('Failed to fetch Agora RTC token');
          } catch (err) {
            throw new Error('Could not fetch Agora RTC token from server.');
          }
        }
        const joinPromise = client.join(appId, channel, rtcToken, uid);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        await Promise.race([joinPromise, timeoutPromise]);
        console.log("Joined Agora channel with UID:", uid);

        // Create and publish audio track
        console.log('Creating audio track...');
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
        });
        audioTrackRef.current = audioTrack;
        
        console.log('Publishing audio track...');
        await client.publish([audioTrack]);
        console.log("Published audio track successfully");

        setIsJoining(false);
        setHasError(false);
        setErrorMessage("");
        
        toast({
          title: "Voice Chat Connected",
          description: "Successfully joined the voice chat!",
        });

      } catch (error: any) {
        console.error("Error initializing Agora:", error);
        setHasError(true);
        setIsJoining(false);
        
        let errorMsg = "Failed to connect to voice chat.";
        
        if (error.code === "INVALID_PARAMS") {
          errorMsg = "Invalid voice chat configuration.";
        } else if (error.code === "CAN_NOT_GET_GATEWAY_SERVER") {
          errorMsg = "Cannot reach voice chat servers. Please check your internet connection.";
        } else if (error.code === "INVALID_VENDOR_KEY") {
          errorMsg = "Invalid Agora App ID. Voice chat is not properly configured.";
        } else if (error.message?.includes("Permission")) {
          errorMsg = "Microphone permission denied. Please allow microphone access.";
        } else if (error.message?.includes("timeout")) {
          errorMsg = "Connection timeout. Please check your internet connection.";
        } else if (error.message?.includes("Invalid Agora App ID")) {
          errorMsg = "Voice chat is not properly configured. Please contact support.";
        } else if (error.code) {
          errorMsg = `Voice chat error (${error.code}): ${error.message}`;
        }
        
        setErrorMessage(errorMsg);
        
        toast({
          title: "Voice Chat Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    };

    initializeAgora();

    return () => {
      // Cleanup
      console.log('Cleaning up Agora connection...');
      if (audioTrackRef.current) {
        audioTrackRef.current.close();
        audioTrackRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.leave().catch(console.error);
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
      setParticipantCount(1);
      setIsMuted(false);
      setHasError(false);
      setErrorMessage("");
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
      setHasError(false);
      setErrorMessage("");
      
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
    isJoining,
    errorMessage
  };
};
