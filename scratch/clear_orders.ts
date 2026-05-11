import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase service role credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching all orders using Service Role...');
  const { data: orders, error: fetchError } = await supabase.from('orders').select('id');
  
  if (fetchError) {
    console.error('Failed to fetch orders:', fetchError);
    process.exit(1);
  }

  if (!orders || orders.length === 0) {
    console.log('No orders found.');
    return;
  }

  const ids = orders.map(o => o.id);
  console.log(`Found ${ids.length} orders. Deleting related items...`);

  const { error: itemsError } = await supabase.from('order_items').delete().in('order_id', ids);
  if (itemsError) {
    console.log('Warning when deleting order items:', itemsError.message);
  }

  console.log('Deleting orders...');
  const { error: deleteError } = await supabase.from('orders').delete().in('id', ids);
  
  if (deleteError) {
    console.error('Failed to delete orders:', deleteError);
    process.exit(1);
  }

  console.log('All orders successfully cleared.');
}

main();
