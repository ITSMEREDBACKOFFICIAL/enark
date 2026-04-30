import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const { order_id, id: payment_id } = event.payload.payment.entity;

    // Update order status to 'paid' and store payment info
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        razorpay_payment_id: payment_id,
        razorpay_signature: signature 
      })
      .eq('razorpay_order_id', order_id);

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'ok' });
}
