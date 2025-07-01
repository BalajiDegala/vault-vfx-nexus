
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

    // Get machines based on user role and permissions via RLS
    const { data: machines, error } = await supabase
      .from('discovered_machines')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch machines: ${error.message}`)
    }

    // Get assigned user profiles separately if needed
    const machinesWithAssignedUsers = []
    
    for (const machine of machines || []) {
      let assignedUser = null
      
      if (machine.assigned_to) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, username')
          .eq('id', machine.assigned_to)
          .single()
        
        assignedUser = profile
      }

      machinesWithAssignedUsers.push({
        ...machine,
        assigned_user: assignedUser
      })
    }

    // Transform the data to match the expected interface
    const transformedMachines = machinesWithAssignedUsers.map(machine => ({
      id: machine.id,
      ip_address: machine.ip_address,
      hostname: machine.hostname,
      name: machine.name,
      status: machine.status,
      capabilities: machine.capabilities,
      location: machine.location,
      assigned_to: machine.assigned_to,
      assigned_by: machine.assigned_by,
      last_seen: machine.last_seen,
      utilization: machine.utilization,
      assigned_user: machine.assigned_user
    }))

    return new Response(
      JSON.stringify({ 
        success: true, 
        machines: transformedMachines 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Fetch machines error:', error)
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
