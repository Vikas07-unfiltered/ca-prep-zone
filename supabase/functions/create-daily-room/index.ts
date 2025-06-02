
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomName } = await req.json()
    
    if (!roomName) {
      return new Response(
        JSON.stringify({ error: 'Room name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const dailyApiKey = Deno.env.get('DAILY_API_KEY')
    if (!dailyApiKey) {
      console.error('DAILY_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Daily API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating Daily.co room with name:', roomName)

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
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
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Daily.co API error:', response.status, errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to create Daily.co room', details: errorData }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('Daily.co room created successfully:', data.url)

    return new Response(
      JSON.stringify({ url: data.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-daily-room function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
