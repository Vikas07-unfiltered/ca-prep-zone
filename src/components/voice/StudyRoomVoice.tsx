import React from "react";
import { DailyProvider, useDaily, useDailyEvent, useLocalParticipant, useParticipantIds, DailyAudio } from "@daily-co/daily-react";

interface StudyRoomVoiceProps {
  roomUrl: string;
  isVoiceEnabled: boolean;
  isAdmin: boolean;
  onToggleVoice: (enabled: boolean) => void;
}

export const StudyRoomVoice: React.FC<StudyRoomVoiceProps> = ({ roomUrl, isVoiceEnabled, isAdmin, onToggleVoice }) => {
  if (!isVoiceEnabled) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Voice chat is disabled for this room.
        {isAdmin && (
          <button className="ml-2 underline" onClick={() => onToggleVoice(true)}>Enable Voice Chat</button>
        )}
      </div>
    );
  }
  return (
    <DailyProvider url={roomUrl}>
      <VoiceChatUI isAdmin={isAdmin} onToggleVoice={onToggleVoice} />
    </DailyProvider>
  );
};

const VoiceChatUI: React.FC<{ isAdmin: boolean; onToggleVoice: (enabled: boolean) => void }> = ({ isAdmin, onToggleVoice }) => {
  const callObject = useDaily();
  const local = useLocalParticipant();
  const participantIds = useParticipantIds();

  useDailyEvent("joined-meeting", () => {
    // Optionally notify user
  });

  return (
    <div className="p-4 border-t flex flex-col gap-2">
      <DailyAudio />
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          onClick={() => callObject?.setLocalAudio(!local.audio)}
        >
          {local.audio ? "Mute" : "Unmute"}
        </button>
        <button
          className="px-3 py-1 rounded bg-red-500 text-white"
          onClick={() => callObject?.leave()}
        >
          Leave Voice
        </button>
        {isAdmin && (
          <button
            className="px-3 py-1 rounded bg-yellow-500 text-white ml-2"
            onClick={() => onToggleVoice(false)}
          >
            Disable Voice For Room
          </button>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Participants: {participantIds.length}
      </div>
    </div>
  );
};
