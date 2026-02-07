import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Preference } from 'npm:mercadopago'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { productId } = await req.json()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Get Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    
    if (productError || !product) throw new Error('Product not found')

    // 3. Create Order First (to get ID)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: product.id,
        amount: product.price,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 4. Create MP Preference
    const client = new MercadoPagoConfig({ accessToken: Deno.env.get('MP_ACCESS_TOKEN')! });
    const preference = new Preference(client);
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: product.id,
            title: product.name,
            quantity: 1,
            unit_price: Number(product.price),
            currency_id: 'BRL',
            description: product.description?.substring(0, 250)
          }
        ],
        external_reference: order.id, // VINCULO FORTE: ID do pedido
        metadata: {
          order_id: order.id
        },
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
        back_urls: {
          success: `${origin}/escritorio/compras?status=success`,
          failure: `${origin}/escritorio/compras?status=failure`,
          pending: `${origin}/escritorio/compras?status=pending`
        },
        auto_return: 'approved',
      }
    })

    // 5. Update Order with Preference ID
    await supabase
      .from('orders')
      .update({ mp_preference_id: preferenceData.id })
      .eq('id', order.id)

    return new Response(
      JSON.stringify({ url: preferenceData.init_point, preferenceId: preferenceData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
