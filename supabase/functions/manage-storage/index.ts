
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

    const { action, storage_plan, allocation_name, size_gb } = await req.json()

    if (action === 'create_allocation') {
      // Get storage plan details
      const { data: plan, error: planError } = await supabaseClient
        .from('storage_plans')
        .select('*')
        .eq('name', storage_plan)
        .eq('is_active', true)
        .single()

      if (planError || !plan) {
        return new Response('Storage plan not found', { status: 404, headers: corsHeaders })
      }

      // Validate size within plan limits
      if (size_gb < plan.min_size_gb || size_gb > plan.max_size_gb) {
        return new Response(`Size must be between ${plan.min_size_gb} and ${plan.max_size_gb} GB`, { 
          status: 400, headers: corsHeaders 
        })
      }

      // Calculate monthly rate
      const monthlyRate = size_gb * plan.monthly_rate_per_gb

      // Generate S3 credentials (simulated)
      const accessKey = `V3C${crypto.randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase()}`
      const secretKey = crypto.randomUUID() + crypto.randomUUID()
      const endpointUrl = `https://s3.${plan.storage_type}.v3cloud.io`

      // Create storage allocation
      const { data: allocation, error: allocError } = await supabaseClient
        .from('storage_allocations')
        .insert({
          user_id: user.id,
          allocation_name,
          storage_type: plan.storage_type,
          size_gb,
          monthly_rate: monthlyRate,
          access_key: accessKey,
          secret_key: secretKey,
          endpoint_url: endpointUrl,
          status: 'active'
        })
        .select()
        .single()

      if (allocError) {
        console.error('Allocation creation error:', allocError)
        return new Response('Failed to create storage allocation', { status: 500, headers: corsHeaders })
      }

      return new Response(JSON.stringify({
        success: true,
        allocation,
        credentials: {
          access_key: accessKey,
          secret_key: secretKey,
          endpoint_url: endpointUrl,
          bucket_name: `v3c-${user.id}-${allocation.id}`.toLowerCase()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'terminate_allocation') {
      const { allocation_id } = await req.json()

      // Update allocation status
      const { error: updateError } = await supabaseClient
        .from('storage_allocations')
        .update({ 
          status: 'terminated',
          terminated_at: new Date().toISOString()
        })
        .eq('id', allocation_id)
        .eq('user_id', user.id)

      if (updateError) {
        return new Response('Failed to terminate allocation', { status: 500, headers: corsHeaders })
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Storage allocation terminated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'get_usage_stats') {
      const { allocation_id } = await req.json()

      // Get latest usage data
      const { data: usageData, error: usageError } = await supabaseClient
        .from('storage_usage_logs')
        .select('*')
        .eq('storage_allocation_id', allocation_id)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (usageError) {
        return new Response('Failed to fetch usage data', { status: 500, headers: corsHeaders })
      }

      return new Response(JSON.stringify({
        success: true,
        usage_data: usageData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Invalid action', { status: 400, headers: corsHeaders })

  } catch (error) {
    console.error('Storage management error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
