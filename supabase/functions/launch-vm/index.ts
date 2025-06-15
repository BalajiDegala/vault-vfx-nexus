
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { vm_plan_name, vm_name } = await req.json()

    // Get VM plan details
    const { data: vmPlan, error: planError } = await supabaseClient
      .from('vm_plans')
      .select('*')
      .eq('name', vm_plan_name)
      .eq('is_active', true)
      .single()

    if (planError || !vmPlan) {
      return new Response('VM plan not found', { status: 404, headers: corsHeaders })
    }

    // Check user's V3 coin balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('v3_coins_balance')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response('User profile not found', { status: 404, headers: corsHeaders })
    }

    // Check if user has enough balance for at least 1 hour
    if (profile.v3_coins_balance < vmPlan.hourly_rate) {
      return new Response('Insufficient V3 coins balance', { status: 400, headers: corsHeaders })
    }

    // Find available physical machine with sufficient resources
    const { data: physicalMachines, error: machinesError } = await supabaseClient
      .from('physical_machines')
      .select('*')
      .eq('status', 'online')
      .gte('available_ram_gb', vmPlan.ram_gb)
      .gte('available_storage_gb', vmPlan.storage_gb)
      .order('available_ram_gb', { ascending: false })

    if (machinesError || !physicalMachines?.length) {
      return new Response('No available physical machines', { status: 503, headers: corsHeaders })
    }

    const selectedMachine = physicalMachines[0]

    // Generate DCV session ID and connection URL
    const dcvSessionId = `dcv-${user.id}-${Date.now()}`
    const dcvConnectionUrl = `https://${selectedMachine.ip_address}:8443/#${dcvSessionId}`

    // Create VM instance
    const { data: vmInstance, error: vmError } = await supabaseClient
      .from('vm_instances')
      .insert({
        user_id: user.id,
        physical_machine_id: selectedMachine.id,
        vm_plan_name: vmPlan.name,
        vm_name: vm_name || `vm-${user.id.substring(0, 8)}-${Date.now()}`,
        status: 'provisioning',
        cpu_cores: vmPlan.cpu_cores,
        ram_gb: vmPlan.ram_gb,
        storage_gb: vmPlan.storage_gb,
        gpu_allocated: vmPlan.gpu_included,
        dcv_session_id: dcvSessionId,
        dcv_connection_url: dcvConnectionUrl,
        hourly_rate: vmPlan.hourly_rate
      })
      .select()
      .single()

    if (vmError) {
      return new Response(`Failed to create VM: ${vmError.message}`, { status: 500, headers: corsHeaders })
    }

    // Update physical machine available resources
    await supabaseClient
      .from('physical_machines')
      .update({
        available_ram_gb: selectedMachine.available_ram_gb - vmPlan.ram_gb,
        available_storage_gb: selectedMachine.available_storage_gb - vmPlan.storage_gb
      })
      .eq('id', selectedMachine.id)

    // Start usage tracking
    await supabaseClient
      .from('vm_usage_logs')
      .insert({
        vm_instance_id: vmInstance.id,
        user_id: user.id,
        start_time: new Date().toISOString(),
        hourly_rate: vmPlan.hourly_rate,
        status: 'active'
      })

    // Simulate VM provisioning (in real implementation, this would trigger actual VM creation)
    setTimeout(async () => {
      await supabaseClient
        .from('vm_instances')
        .update({ status: 'running' })
        .eq('id', vmInstance.id)
    }, 5000)

    return new Response(JSON.stringify({
      success: true,
      vm_instance: vmInstance,
      message: 'VM is being provisioned. It will be ready in a few minutes.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
