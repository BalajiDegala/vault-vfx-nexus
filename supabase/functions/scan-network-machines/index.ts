
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Check if user has required role
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

    const { network_range } = await req.json()

    // Simulate network scanning - in production, this would use actual network discovery
    console.log(`Scanning network range: ${network_range}`)
    
    // Mock discovered machines for demonstration
    const discoveredMachines = [
      {
        ip_address: '192.168.1.101',
        hostname: 'workstation-01',
        name: 'Workstation Alpha 01',
        status: 'online',
        capabilities: {
          cpu_cores: 16,
          total_ram_gb: 64,
          available_ram_gb: 48,
          gpu_model: 'RTX 4080',
          gpu_memory_gb: 16,
          software_installed: ['Maya 2024', 'Houdini', 'Nuke', 'Blender'],
          dcv_version: '2023.1'
        },
        location: 'Studio Floor 1',
        last_seen: new Date().toISOString(),
        utilization: {
          cpu_percent: 25,
          memory_percent: 60,
          gpu_percent: 15
        }
      },
      {
        ip_address: '192.168.1.102',
        hostname: 'render-node-01',
        name: 'Render Node 01',
        status: 'online',
        capabilities: {
          cpu_cores: 32,
          total_ram_gb: 128,
          available_ram_gb: 100,
          gpu_model: 'RTX 4090',
          gpu_memory_gb: 24,
          software_installed: ['Arnold', 'V-Ray', 'Octane', 'Redshift'],
          dcv_version: '2023.1'
        },
        location: 'Render Farm',
        last_seen: new Date().toISOString(),
        utilization: {
          cpu_percent: 80,
          memory_percent: 75,
          gpu_percent: 90
        }
      }
    ]

    return new Response(
      JSON.stringify({ 
        success: true, 
        machines: discoveredMachines,
        scan_info: {
          network_range,
          machines_found: discoveredMachines.length,
          scan_time: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Network scan error:', error)
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
