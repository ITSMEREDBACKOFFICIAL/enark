import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function listTables() {
  // We can't query pg_catalog easily, but we can try common names
  // or check if there's a specific table we KNOW exists like 'products'
  const { data: products, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error fetching products:', error.message);
  } else {
    console.log('Products table exists.');
  }

  // Let's try some other common names
  const commonNames = ['orders', 'order', 'purchase', 'sales', 'transaction', 'profiles', 'users'];
  for (const name of commonNames) {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    if (!error) {
      console.log(`Table ${name} exists.`);
    }
  }
}

listTables();
