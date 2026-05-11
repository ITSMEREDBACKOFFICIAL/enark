
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local
if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Order columns:', Object.keys(data[0] || {}));
  }

  const { data: cartData, error: cartError } = await supabase.from('abandoned_carts').select('*').limit(1);
  if (cartError) {
    console.error('Error fetching abandoned_carts:', cartError);
  } else {
    console.log('Abandoned Cart columns:', Object.keys(cartData[0] || {}));
  }
}

checkSchema();
