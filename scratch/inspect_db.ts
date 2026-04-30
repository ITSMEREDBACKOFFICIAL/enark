import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function inspectSchema() {
  // We can't directly query pg_catalog with anon key, 
  // but we can try to fetch one row from tables we suspect exist.
  const tables = ['orders', 'order_items', 'inventory_logs', 'customers'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: NOT FOUND or ACCESS DENIED (${error.message})`);
    } else {
      console.log(`Table ${table}: FOUND. Columns: ${Object.keys(data[0] || {}).join(', ')}`);
    }
  }
}

inspectSchema();
