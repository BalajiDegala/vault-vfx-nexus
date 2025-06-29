
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const hasRequiredRole = userRoles?.some(r => 
      ['producer', 'admin'].includes(r.role)
    )

    if (!hasRequiredRole) {
      throw new Error('Insufficient permissions')
    }

    const { machine } = await req.json()

    // Insert the machine into the database
    const { data, error } = await supabase
      .from('discovered_machines')
      .insert({
        ip_address: machine.ip_address,
        hostname: machine.hostname,
        name: machine.name,
        status: machine.status || 'online',
        capabilities: machine.capabilities,
        location: machine.location,
        last_seen: new Date().toISOString(),
        utilization: machine.utilization
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to register machine: ${error.message}`)
    }

    console.log(`Machine registered: ${machine.name} (${machine.ip_address})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        machine: data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Machine registration error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
