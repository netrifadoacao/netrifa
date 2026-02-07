import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Payment } from 'npm:mercadopago'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // Webhook usually sends data in query params for type=payment or topic=payment
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    console.log(`Webhook received: topic=${topic}, id=${id}`);

    if (topic === 'payment' && id) {
      const client = new MercadoPagoConfig({ accessToken: Deno.env.get('MP_ACCESS_TOKEN')! });
      const payment = new Payment(client);
      
      // Valida o pagamento chamando a API do MP (Segurança: não confie apenas no payload)
      const paymentData = await payment.get({ id });
      console.log(`Payment Status: ${paymentData.status}, External Ref: ${paymentData.external_reference}`);

      if (paymentData.status === 'approved') {
        // Init Supabase Admin Client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const orderId = paymentData.external_reference;

        if (orderId) {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', orderId)
          
          if (error) {
            console.error('Error updating order:', error);
            throw error;
          }
          console.log(`Order ${orderId} marked as paid.`);
        } else {
            console.warn('No external_reference found in payment data.');
        }
      }
    }
    
    return new Response(JSON.stringify({ received: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
    })
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
    })
  }
})
