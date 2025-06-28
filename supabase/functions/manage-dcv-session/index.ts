
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const logger = {
  log: (...args: unknown[]) => console.log(...args),
  error: (...args: unknown[]) => console.error(...args)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { action, vm_instance_id } = await req.json()

    if (action === 'validate_connection') {
      // Get VM instance
      const { data: vmInstance, error: vmError } = await supabaseClient
        .from('vm_instances')
        .select('*, physical_machines(*)')
        .eq('id', vm_instance_id)
        .eq('user_id', user.id)
        .single()

      if (vmError || !vmInstance) {
        return new Response('VM instance not found', { status: 404, headers: corsHeaders })
      }

      if (vmInstance.status !== 'running') {
        return new Response(JSON.stringify({
          success: false,
          error: 'VM is not running',
          status: vmInstance.status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Simulate DCV connection validation
      // In real implementation, this would ping the DCV server
      const dcvAvailable = vmInstance.dcv_connection_url && vmInstance.physical_machines?.dcv_enabled

      return new Response(JSON.stringify({
        success: true,
        dcv_available: dcvAvailable,
        connection_url: vmInstance.dcv_connection_url,
        vm_status: vmInstance.status,
        machine_location: vmInstance.physical_machines?.location
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'generate_session_token') {
      // Generate a temporary session token for secure DCV access
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store session token in database
      await supabaseClient
        .from('dcv_sessions')
        .insert({
          vm_instance_id,
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          status: 'active'
        })

      return new Response(JSON.stringify({
        success: true,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Invalid action', { status: 400, headers: corsHeaders })

  } catch (error) {
    logger.error('DCV session management error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
