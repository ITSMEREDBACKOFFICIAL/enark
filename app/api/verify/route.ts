import { NextResponse } from 'next/server';
import { Cashfree } from '@/lib/cashfree';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function finalizeOrder(orderId: string, paymentId: string, items?: any[], appliedPromoCode?: string) {
  // 1. Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      status: 'paid', 
      razorpay_payment_id: paymentId, // Using existing column name
      updated_at: new Date().toISOString()
    })
    .eq('razorpay_order_id', orderId);

  if (updateError) throw updateError;

  // 2. Inventory Deduction
  if (items && Array.isArray(items)) {
    for (const item of items) {
      if (!item.variantId) continue;
      const { data: variant } = await supabase.from('variants').select('stock_quantity').eq('id', item.variantId).single();
      if (variant) {
        await supabase.from('variants').update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) }).eq('id', item.variantId);
      }
    }
  }

  // 3. Burn Promo Code
  if (appliedPromoCode) {
    await supabase.from('operative_offers').update({ used: true }).eq('code', appliedPromoCode).eq('is_single_use', true);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });

    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    const payments = response.data;

    const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS');

    if (successfulPayment) {
      // Check if already paid in DB to avoid double processing
      const { data: order } = await supabase.from('orders').select('status').eq('razorpay_order_id', orderId).single();
      
      if (order && order.status !== 'paid') {
        await finalizeOrder(orderId, successfulPayment.cf_payment_id.toString());
      }
      
      return NextResponse.json({ success: true, status: 'PAID' });
    }

    return NextResponse.json({ success: false, status: 'PENDING' });
  } catch (error: any) {
    console.error('Verify GET error:', error.response?.data || error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Legacy Razorpay POST verify (can be removed if no longer needed)
  try {
    const { razorpay_order_id, razorpay_payment_id, dbOrderId, items, appliedPromoCode } = await req.json();
    await finalizeOrder(razorpay_order_id, razorpay_payment_id, items, appliedPromoCode);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
