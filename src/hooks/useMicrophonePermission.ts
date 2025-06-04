
import { useEffect, useState } from "react";

export const useMicrophonePermission = () => {
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicrophonePermission(permission.state);
          console.log('Microphone permission:', permission.state);
        }
      } catch (error) {
        console.warn('Could not check microphone permission:', error);
        setMicrophonePermission('unknown');
      }
    };

    checkMicrophonePermission();
  }, []);

  return microphonePermission;
};
