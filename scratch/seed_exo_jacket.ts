import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  const product = {
    name: 'Obsidian Exo-Jacket',
    slug: 'obsidian-exo-jacket',
    description: 'High fashion tactical exo-jacket. Engineered for brutalist environments. Features waterproof matte black fabric, complex hardware, and structural panelling.',
    base_price: 35000,
    category: 'Streetwear',
    is_active: true,
    metadata: {
      material: '100% TACTICAL NYLON',
      gsm: '600',
      is_preorder: true,
      images: [
        '/Users/chinnu/.gemini/antigravity/brain/d0137d77-3d3c-43c4-bb43-4ac7e7d25219/exo_front_1778233430031.png',
        '/Users/chinnu/.gemini/antigravity/brain/d0137d77-3d3c-43c4-bb43-4ac7e7d25219/exo_detail_1778233445909.png',
        '/Users/chinnu/.gemini/antigravity/brain/d0137d77-3d3c-43c4-bb43-4ac7e7d25219/exo_back_1778233464004.png',
        '/Users/chinnu/.gemini/antigravity/brain/d0137d77-3d3c-43c4-bb43-4ac7e7d25219/exo_lifestyle_1778233481631.png'
      ],
      image: '/Users/chinnu/.gemini/antigravity/brain/d0137d77-3d3c-43c4-bb43-4ac7e7d25219/exo_front_1778233430031.png',
      image_alt: '/Users/chinnu/.gemini/antigravity/brain/d0137d77-3d3c-43c4-bb43-4ac7e7d25219/exo_back_1778233464004.png'
    }
  };

  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) { console.error('Error inserting product:', error); return; }

  const sizes = ['S', 'M', 'L'];
  for (const size of sizes) {
    await supabase.from('variants').insert({
      product_id: data.id,
      sku: `OBS-EXO-${size}`,
      size: size,
      stock_quantity: 10
    });
  }
  console.log('Seeded Obsidian Exo-Jacket');
}
seed();
