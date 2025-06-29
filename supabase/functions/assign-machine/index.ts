
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
      ['producer', 'admin', 'studio'].includes(r.role)
    )

    if (!hasRequiredRole) {
      throw new Error('Insufficient permissions')
    }

    const { machine_id, user_id, assigned_by } = await req.json()

    // First, find the machine by IP address if machine_id is an IP
    let machineRecord
    if (machine_id.includes('.')) {
      const { data: machine } = await supabase
        .from('discovered_machines')
        .select('id')
        .eq('ip_address', machine_id)
        .single()
      
      if (!machine) {
        throw new Error('Machine not found')
      }
      machineRecord = machine
    } else {
      machineRecord = { id: machine_id }
    }

    // Update the machine assignment
    const { error: updateError } = await supabase
      .from('discovered_machines')
      .update({
        assigned_to: user_id,
        assigned_by: assigned_by || user.id,
        status: 'busy'
      })
      .eq('id', machineRecord.id)

    if (updateError) {
      throw new Error(`Failed to assign machine: ${updateError.message}`)
    }

    // Create assignment record
    const { error: assignmentError } = await supabase
      .from('machine_assignments')
      .insert({
        machine_id: machineRecord.id,
        assigned_to: user_id,
        assigned_by: assigned_by || user.id,
        assignment_type: 'artist',
        status: 'active'
      })

    if (assignmentError) {
      console.error('Assignment record error:', assignmentError)
    }

    console.log(`Machine ${machine_id} assigned to user ${user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Machine assigned successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Machine assignment error:', error)
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
