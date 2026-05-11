import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Cashfree } from "cashfree-pg";

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseKey || supabaseKey === 'dummy_key') {
      return NextResponse.json({ error: 'DATABASE_AUTH_FAILURE: Please set valid SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { items, email, address, idempotencyKey, appliedPromoCode, paymentMethod, dispatchId } = body;

    // 1. Check idempotency
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({ 
        orderId: existingOrder.tracking_id || existingOrder.razorpay_order_id,
        dbOrderId: existingOrder.id,
        order: existingOrder 
      }, { status: 200 });
    }

    // 2. Calculate total
    let subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    let total = subtotal;

    // Apply Promo Code
    if (appliedPromoCode) {
      const { data: promoData } = await supabase
        .from('operative_offers')
        .select('*')
        .eq('code', appliedPromoCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
        
      if (promoData && (!promoData.used || !promoData.is_single_use)) {
        if (promoData.assigned_email === 'GLOBAL' || promoData.assigned_email === email.toLowerCase()) {
          total = subtotal * (1 - promoData.discount_percentage / 100);
        }
      }
    }

    // Add Shipping
    const { data: config } = await supabase.from('app_config').select('free_shipping_threshold').eq('id', 'main').maybeSingle();
    const threshold = config?.free_shipping_threshold || 5000;
    if (total < threshold) {
      total += 150;
    }

    const orderId = dispatchId || `ENRK-${Date.now()}`;
    let paymentSessionId = null;

    if (paymentMethod === 'ONLINE') {
      const cfAppId = process.env.CASHFREE_APP_ID;
      const cfSecret = process.env.CASHFREE_SECRET_KEY;

      if (!cfAppId || !cfSecret) {
         return NextResponse.json({ error: 'CASHFREE_KEYS_MISSING: Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY' }, { status: 500 });
      }

      // Initialize inside handler
      Cashfree.XClientId = cfAppId;
      Cashfree.XClientSecret = cfSecret;
      Cashfree.XEnvironment = process.env.NODE_ENV === "production" 
        ? Cashfree.Environment.PRODUCTION 
        : Cashfree.Environment.SANDBOX;

      try {
        const request = {
          order_amount: Math.round(total * 100) / 100,
          order_currency: "INR",
          order_id: orderId,
          customer_details: {
            customer_id: email.replace(/[^a-zA-Z0-9]/g, '_'),
            customer_email: email,
            customer_phone: "9999999999" 
          },
          order_meta: {
            return_url: `${req.headers.get('origin')}/success?id={order_id}`
          }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        paymentSessionId = response.data?.payment_session_id;
        if (!paymentSessionId) throw new Error('CASHFREE_SESSION_FAILED');
      } catch (cfError: any) {
        console.error('CASHFREE_API_FAILURE:', cfError.response?.data || cfError);
        return NextResponse.json({ error: 'PAYMENT_GATEWAY_FAILURE' }, { status: 500 });
      }
    }

    // 4. Store order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: email.toLowerCase(),
        total_amount: total,
        status: 'pending',
        shipping_address: { full_address: address }, 
        razorpay_order_id: orderId, 
        idempotency_key: idempotencyKey,
        tracking_id: orderId,
        payment_method: paymentMethod || 'ONLINE',
        fulfillment_status: 'pending'
      })
      .select()
      .maybeSingle();

    if (orderError || !order) {
      console.error('DATABASE_ORDER_INSERT_FAILURE:', orderError);
      return NextResponse.json({ 
        error: 'ORDER_PERSISTENCE_FAILED', 
        details: orderError?.message || 'No data returned from insert'
      }, { status: 500 });
    }

    // 5. Store order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      variant_id: item.variantId, 
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) console.error('ORDER_ITEMS_SYNC_FAILURE:', itemsError);

    return NextResponse.json({ 
      paymentSessionId,
      orderId,
      dbOrderId: order.id
    });
  } catch (error: any) {
    console.error('CHECKOUT_UNHANDLED_CRASH:', error);
    return NextResponse.json({ error: 'SYSTEM_STALL_DETECTED: ' + (error.message || 'UNKNOWN') }, { status: 500 });
  }
}
