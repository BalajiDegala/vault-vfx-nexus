
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

    const { name, description, machine_ids } = await req.json()

    // Create the machine pool
    const { data: pool, error: poolError } = await supabase
      .from('machine_pools')
      .insert({
        name,
        description,
        created_by: user.id,
        access_level: 'producer'
      })
      .select()
      .single()

    if (poolError) {
      throw new Error(`Failed to create pool: ${poolError.message}`)
    }

    // Add machines to the pool
    if (machine_ids && machine_ids.length > 0) {
      // Convert IP addresses to machine IDs if needed
      const machineRecords = []
      for (const machineId of machine_ids) {
        if (machineId.includes('.')) {
          // It's an IP address, find the machine ID
          const { data: machine } = await supabase
            .from('discovered_machines')
            .select('id')
            .eq('ip_address', machineId)
            .single()
          
          if (machine) {
            machineRecords.push({ pool_id: pool.id, machine_id: machine.id })
          }
        } else {
          machineRecords.push({ pool_id: pool.id, machine_id: machineId })
        }
      }

      if (machineRecords.length > 0) {
        const { error: assignmentError } = await supabase
          .from('machine_pool_assignments')
          .insert(machineRecords)

        if (assignmentError) {
          console.error('Pool assignment error:', assignmentError)
        }
      }
    }

    console.log(`Machine pool created: ${name} with ${machine_ids?.length || 0} machines`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        pool: {
          ...pool,
          machines: machine_ids || []
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Pool creation error:', error)
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
