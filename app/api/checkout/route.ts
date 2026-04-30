import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { items, email, address, idempotencyKey, appliedPromoCode } = await req.json();

    // 1. Check idempotency (if order already exists for this key)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingOrder) {
      return NextResponse.json({ order: existingOrder }, { status: 200 });
    }

    // 2. Calculate total
    let total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    // 2.5 Apply Promo Code Server-Side
    if (appliedPromoCode) {
      const { data: promoData } = await supabase
        .from('operative_offers')
        .select('*')
        .eq('code', appliedPromoCode)
        .single();
        
      if (promoData && promoData.is_active && (!promoData.used || !promoData.is_single_use)) {
        if (promoData.assigned_email === 'GLOBAL' || promoData.assigned_email === email) {
          total = total * (1 - promoData.discount_percentage / 100);
        }
      }
    }

    // 3. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${idempotencyKey}`,
    });

    // 4. Store order in Supabase as 'pending'
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        email,
        total_amount: total,
        status: 'pending',
        shipping_address: address,
        razorpay_order_id: razorpayOrder.id,
        idempotency_key: idempotencyKey,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      orderId: razorpayOrder.id, 
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order.id
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
