
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

    // Get all user's VMs with current usage
    const { data: vmInstances, error: vmError } = await supabaseClient
      .from('vm_instances')
      .select(`
        *,
        physical_machines(*),
        vm_usage_logs!inner(*)
      `)
      .eq('user_id', user.id)
      .neq('status', 'terminated')

    if (vmError) {
      return new Response(`Failed to fetch VMs: ${vmError.message}`, { status: 500, headers: corsHeaders })
    }

    // Calculate current costs for running VMs
    const vmsWithCosts = vmInstances?.map(vm => {
      const activeUsage = vm.vm_usage_logs?.find((log: any) => log.status === 'active')
      let currentCost = 0
      let runtimeMinutes = 0

      if (activeUsage) {
        const startTime = new Date(activeUsage.start_time)
        const now = new Date()
        runtimeMinutes = Math.ceil((now.getTime() - startTime.getTime()) / (1000 * 60))
        currentCost = (runtimeMinutes / 60) * vm.hourly_rate
      }

      return {
        ...vm,
        current_runtime_minutes: runtimeMinutes,
        current_cost: Math.round(currentCost * 100) / 100,
        estimated_hourly_cost: vm.hourly_rate
      }
    }) || []

    return new Response(JSON.stringify({
      success: true,
      vm_instances: vmsWithCosts
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
