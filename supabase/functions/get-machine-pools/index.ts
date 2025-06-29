
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

    // Get machine pools based on user permissions via RLS
    const { data: pools, error } = await supabase
      .from('machine_pools')
      .select(`
        *,
        machine_pool_assignments(
          machine_id,
          discovered_machines(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch pools: ${error.message}`)
    }

    // Transform the data to match the expected interface
    const transformedPools = pools?.map(pool => ({
      id: pool.id,
      name: pool.name,
      description: pool.description,
      created_by: pool.created_by,
      access_level: pool.access_level,
      machines: pool.machine_pool_assignments?.map((assignment: any) => ({
        id: assignment.discovered_machines.id,
        ip_address: assignment.discovered_machines.ip_address,
        hostname: assignment.discovered_machines.hostname,
        name: assignment.discovered_machines.name,
        status: assignment.discovered_machines.status,
        capabilities: assignment.discovered_machines.capabilities,
        location: assignment.discovered_machines.location,
        assigned_to: assignment.discovered_machines.assigned_to,
        assigned_by: assignment.discovered_machines.assigned_by,
        last_seen: assignment.discovered_machines.last_seen,
        utilization: assignment.discovered_machines.utilization
      })) || []
    })) || []

    return new Response(
      JSON.stringify({ 
        success: true, 
        pools: transformedPools 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Fetch pools error:', error)
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
