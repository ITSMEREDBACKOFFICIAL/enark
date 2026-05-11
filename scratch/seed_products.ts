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

const sampleProducts = [
  {
    name: 'Neural Core Hoodie',
    slug: 'neural-core-hoodie',
    category: 'Streetwear',
    base_price: 12500,
    description: 'Constructed from heavy-duty 450GSM French Terry. Features an oversized fit with dropped shoulders and encrypted branding on the back.',
    is_active: true,
    metadata: {
      stock: 50,
      gsm: '450GSM',
      material: '100% French Terry Cotton',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
      size_chart: 'Oversized fit. Go true to size.'
    }
  },
  {
    name: 'Terminal Syntax Tee',
    slug: 'terminal-syntax-tee',
    category: 'Streetwear',
    base_price: 5500,
    description: 'A classic brutalist silhouette. Made from 240GSM cotton for structure and durability. Minimalist logo on chest.',
    is_active: true,
    metadata: {
      stock: 120,
      gsm: '240GSM',
      material: '100% Organic Cotton',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
      size_chart: 'Boxy fit.'
    }
  },
  {
    name: 'Alabaster Cargo Pants',
    slug: 'alabaster-cargo-pants',
    category: 'Streetwear',
    base_price: 14000,
    description: 'Tactical multi-pocket cargo pants featuring adjustable cuffs and reinforced knees. Pure clinical aesthetic.',
    is_active: true,
    metadata: {
      stock: 35,
      gsm: 'N/A',
      material: 'Ripstop Nylon Blend',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
      size_chart: 'Relaxed fit with adjustable waist.'
    }
  },
  {
    name: 'Cipher Balaclava',
    slug: 'cipher-balaclava',
    category: 'Streetwear',
    base_price: 3500,
    description: 'A finely knit tactical balaclava. Perfect for harsh weather or maintaining anonymity in the concrete jungle.',
    is_active: false,
    metadata: {
      stock: 200,
      gsm: 'N/A',
      material: 'Merino Wool Blend',
      image: 'https://images.unsplash.com/photo-1616428414986-7cbcf8b1cb35?q=80&w=800&auto=format&fit=crop',
      size_chart: 'One Size Fits All'
    }
  }
];

async function main() {
  console.log('Clearing existing products and variants...');
  await supabase.from('variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Seeding products...');
  
  for (const product of sampleProducts) {
    console.log(`Inserting ${product.name}...`);
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
      
    if (error) {
      console.error(`Failed to insert ${product.name}:`, error.message);
      continue;
    }
    
    console.log(`Created product ID: ${data.id}. Adding variant...`);
    
    // Create variants
    const sizes = ['S', 'M', 'L'];
    
    for (const size of sizes) {
      const { error: variantError } = await supabase.from('variants').insert({
        product_id: data.id,
        sku: `AK-${product.slug.substring(0, 3).toUpperCase()}-${size}-${Math.floor(Math.random() * 1000)}`,
        size: size,
        color: 'BLACK',
        stock_quantity: Math.floor(product.metadata.stock / sizes.length)
      });
      
      if (variantError) {
        console.error(`Failed to insert variant ${size} for ${product.name}:`, variantError.message);
      }
    }
  }
  
  console.log('Seeding complete.');
}

main();
