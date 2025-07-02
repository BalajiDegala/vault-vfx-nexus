
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
    console.log('Starting machine assignment process...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Authentication failed')
    }

    console.log('User authenticated:', user.id);

    // Check user roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (roleError) {
      console.error('Role fetch error:', roleError);
      throw new Error('Failed to fetch user roles')
    }

    console.log('User roles:', userRoles);

    const hasRequiredRole = userRoles?.some(r => 
      ['producer', 'admin', 'studio'].includes(r.role)
    )

    if (!hasRequiredRole) {
      console.error('User lacks required permissions. Roles:', userRoles);
      throw new Error('Insufficient permissions')
    }

    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { machine_id, user_id, assigned_by } = requestBody

    if (!machine_id || !user_id) {
      console.error('Missing required parameters:', { machine_id, user_id });
      throw new Error('Missing machine_id or user_id')
    }

    // Check if the target user exists and has appropriate role
    const { data: targetUser, error: targetUserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (targetUserError || !targetUser) {
      console.error('Target user not found:', targetUserError);
      throw new Error('Target user not found')
    }

    console.log('Target user found:', targetUser.id);

    // Find the machine - handle both IP addresses and direct IDs
    let machineRecord;
    if (machine_id.includes('.')) {
      console.log('Looking up machine by IP address:', machine_id);
      const { data: machine, error: machineError } = await supabase
        .from('discovered_machines')
        .select('*')
        .eq('ip_address', machine_id)
        .single()
      
      if (machineError || !machine) {
        console.error('Machine not found by IP:', machineError);
        throw new Error('Machine not found')
      }
      machineRecord = machine;
    } else {
      console.log('Looking up machine by ID:', machine_id);
      const { data: machine, error: machineError } = await supabase
        .from('discovered_machines')
        .select('*')
        .eq('id', machine_id)
        .single()
      
      if (machineError || !machine) {
        console.error('Machine not found by ID:', machineError);
        throw new Error('Machine not found')
      }
      machineRecord = machine;
    }

    console.log('Machine found:', machineRecord.name, machineRecord.id);

    // Check if machine is already assigned
    if (machineRecord.assigned_to && machineRecord.assigned_to !== user_id) {
      console.error('Machine already assigned to:', machineRecord.assigned_to);
      throw new Error('Machine is already assigned to another user')
    }

    // Update the machine assignment
    const { error: updateError } = await supabase
      .from('discovered_machines')
      .update({
        assigned_to: user_id,
        assigned_by: assigned_by || user.id,
        status: 'busy',
        updated_at: new Date().toISOString()
      })
      .eq('id', machineRecord.id)

    if (updateError) {
      console.error('Failed to update machine assignment:', updateError);
      throw new Error(`Failed to assign machine: ${updateError.message}`)
    }

    console.log('Machine assignment updated successfully');

    // Create assignment record for tracking
    const { error: assignmentError } = await supabase
      .from('machine_assignments')
      .insert({
        machine_id: machineRecord.id,
        assigned_to: user_id,
        assigned_by: assigned_by || user.id,
        assignment_type: 'studio', // Default to studio assignment
        status: 'active',
        created_at: new Date().toISOString()
      })

    if (assignmentError) {
      console.error('Assignment record creation error:', assignmentError);
      // Don't fail the whole operation for this
    }

    console.log(`Machine ${machineRecord.name} (${machine_id}) assigned to user ${user_id} successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Machine assigned successfully',
        machine: {
          id: machineRecord.id,
          name: machineRecord.name,
          ip_address: machineRecord.ip_address
        },
        assigned_to: user_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Machine assignment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
