import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      dbOrderId,
      items, // Array of items from the cart
      appliedPromoCode
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
    }

    // 1. Update order status in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbOrderId);

    if (updateError) {
      throw updateError;
    }

    // 2. Inventory Deduction Logic
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (!item.variantId) continue;
        
        // Fetch current stock
        const { data: variant, error: fetchError } = await supabase
          .from('variants')
          .select('stock_quantity')
          .eq('id', item.variantId)
          .single();
          
        if (fetchError || !variant) {
          console.error(`Failed to fetch stock for variant ${item.variantId}:`, fetchError);
          continue;
        }
        
        // Calculate new stock (prevent negative stock)
        const newStock = Math.max(0, variant.stock_quantity - item.quantity);
        
        // Update stock
        const { error: stockUpdateError } = await supabase
          .from('variants')
          .update({ stock_quantity: newStock })
          .eq('id', item.variantId);
          
        if (stockUpdateError) {
          console.error(`Failed to update stock for variant ${item.variantId}:`, stockUpdateError);
        }
      }
    }

    // 3. Burn Promo Code Logic (Respect is_single_use setting)
    if (appliedPromoCode) {
      const { error: burnError } = await supabase
        .from('operative_offers')
        .update({ used: true })
        .eq('code', appliedPromoCode)
        .eq('is_single_use', true); // Only burn if it's explicitly a single-use code
        
      if (burnError) {
        console.error(`Failed to burn promo code ${appliedPromoCode}:`, burnError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
