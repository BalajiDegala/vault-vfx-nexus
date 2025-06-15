
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

    const { vm_instance_id } = await req.json()

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

    if (vmInstance.status === 'terminated') {
      return new Response('VM is already terminated', { status: 400, headers: corsHeaders })
    }

    // Calculate final usage and cost
    const { data: activeUsage, error: usageError } = await supabaseClient
      .from('vm_usage_logs')
      .select('*')
      .eq('vm_instance_id', vm_instance_id)
      .eq('status', 'active')
      .single()

    if (activeUsage) {
      const endTime = new Date()
      const startTime = new Date(activeUsage.start_time)
      const durationMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      const cost = (durationMinutes / 60) * activeUsage.hourly_rate

      // Update usage log
      await supabaseClient
        .from('vm_usage_logs')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
          cost: cost,
          status: 'completed'
        })
        .eq('id', activeUsage.id)

      // Charge user
      const chargeResult = await supabaseClient.rpc('process_v3c_transaction', {
        p_user_id: user.id,
        p_amount: cost,
        p_type: 'vm_usage',
        p_metadata: {
          vm_instance_id: vm_instance_id,
          duration_minutes: durationMinutes,
          hourly_rate: activeUsage.hourly_rate
        }
      })

      console.log('Charge result:', chargeResult)
    }

    // Update VM status to terminated
    await supabaseClient
      .from('vm_instances')
      .update({
        status: 'terminated',
        terminated_at: new Date().toISOString()
      })
      .eq('id', vm_instance_id)

    // Return resources to physical machine
    const physicalMachine = vmInstance.physical_machines
    await supabaseClient
      .from('physical_machines')
      .update({
        available_ram_gb: physicalMachine.available_ram_gb + vmInstance.ram_gb,
        available_storage_gb: physicalMachine.available_storage_gb + vmInstance.storage_gb
      })
      .eq('id', physicalMachine.id)

    return new Response(JSON.stringify({
      success: true,
      message: 'VM terminated successfully'
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
