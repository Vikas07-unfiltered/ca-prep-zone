// This function creates a Daily.co room using their REST API
// Docs: https://docs.daily.co/reference/rest-api/rooms/create-room

export async function createDailyRoom(roomName: string, apiKey: string): Promise<string | null> {
  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: roomName,
      properties: {
        enable_chat: true,
        enable_screenshare: false,
        start_audio_off: false,
        start_video_off: true,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 1 week expiry
      }
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url || null;
}
